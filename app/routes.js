let bodyParser = require('body-parser')
let upload = require('multer')()
let session = require('express-session')
let MySQLStore = require('express-mysql-session')(session)
let web = require('./middlewares/web_middleware')
let auth = require('./middlewares/auth_middleware')

module.exports = app => {
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(session({
        key: 'chat_server',
        secret: 'Hello World!',
        store: new MySQLStore(require('../knexfile').connection),
        resave: true,
        saveUninitialized: true,
    }))
    app.use(web)

    app.get('/', (req, res) => {
        res.render('index', {title: 'Home', route: 'home'})
    })

    app.get('/profile', auth, (req, res) => {
        res.render('profile', {title: 'Profile', route: 'profile'})
    })

    app.all('/login', Object.values(require('./controllers/login_controller')))

    app.get('/logout', (req, res) => {
        req.session.destroy(() => {
            res.redirect('/')
        })
    })

    app.all('/register', upload.any(), Object.values(require('./controllers/register_controller')))

    // app.all('/user', upload.any(), Object.values(require('./controllers/user_controller')))
}
