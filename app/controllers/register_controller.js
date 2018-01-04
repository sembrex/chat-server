let {logger, Hash, validate} = require('../utils')
let User = require('../models/User')

module.exports = {
    attempRegister(req, res, next) {
        if (req.method != 'POST')
            return next()

        let errors = validate(req.body, {
            username: 'required',
            password: 'required|confirmed|min:6',
        })

        console.log(req.files)

        if (Object.keys(errors).length)
            return res.status(422).json(errors)

        let data = {
            username: req.body.username,
            password: Hash.make(req.body.password)
        }

        if (req.files) {
            req.files.forEach(file => {
                if (file.fieldname == 'avatar')
                    data.avatar = file
            })
        }

        User.create(data, (user, err) => {
            if (err)
                return res.status(500).json(err)

            return res.json({message: 'Registration successful.'})
        })
    },
    registerPage(req, res) {
        res.render('register', {title: 'Register', route: 'register'})
    }
}
