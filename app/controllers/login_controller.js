let {logger, Hash, validate} = require('../utils')
let User = require('../models/User')

module.exports = {
    attempLogin(req, res, next) {
        if (req.method != 'POST')
            return next()

        let errors = validate(req.body, {
            username: 'required',
            password: 'required',
        })

        if (Object.keys(errors).length)
            return res.status(422).json(errors)

        User.authenticate(req.body, (user, err) => {
            if (user) {
                delete user.password
                req.session.user = user
                return res.json({message: 'Logged in.'})
            }

            return res.status(500).json(err)
        })
    },
    loginPage(req, res) {
        if (req.session.user)
            return res.redirect('/home')
        res.render('login', {title: 'Login', route: 'login'})
    }
}
