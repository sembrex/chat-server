let bodyParser = require('body-parser')
let upload = require('multer')()

module.exports = app => {
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    app.get('/', (req, res, next) => {
        res.render('index', {title: 'Hello World!'})
    })

    app.all('/user', upload.any(), Object.values(require('./controllers/user_controller')))
}
