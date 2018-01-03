const knex = require('knex')(require('../../knexfile'))
let {logger, Hash} = require('../utils')
let User = require('../models/User')

let validate = (params, rules) => {
    let errors = {}

    let addError = (field, error) => {
        if (errors[field])
            errors[field].push(error)
        else
            errors[field] = [error]
    }

    for (let field in rules) {
        let field_rules = rules[field].split('|')
        for (let i in field_rules) {
            let [k, v] = field_rules[i].split(':')
            switch (k) {
                case 'required':
                    if (!params[field] || !params[field].length)
                        addError(field, field + ' is required.')
                    break
                case 'max':
                    if (v && params[field] && params[field].length > parseInt(v))
                        addError(field, field + ' maximum ' + v)
                    break
                default:
                break
            }
        }
    }

    return errors
}

module.exports = {
    store(req, res, next) {
        if (req.method != 'POST')
            return next()

        let errors = validate(req.body, {
            username: 'required',
            password: 'required',
        })

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

            return res.json(user)
        })
    },
    update(req, res, next) {
        if (['PUT', 'PATCH'].indexOf(req.method) == -1)
            return next()

        let errors = validate(req.body, {
            id: 'required',
        })

        if (Object.keys(errors).length)
            return res.status(422).json(errors)

        utis.logger('bocor')

        User.find(req.body.id, (user, err) => {
            if (err)
                return res.status(500).json(err)

            let data = {}

            if (req.body.username)
                data.username = req.body.username

            if (req.body.password)
                data.password = Hash.make(req.body.password)

            if (req.files) {
                req.files.forEach(file => {
                    if (file.fieldname == 'avatar')
                        data.avatar = file
                })
            }

            if (Object.keys(data).length < 1)
                return res.status(422).json('Invalid data.')

            user.update(data, (err) => {
                if (err)
                    return res.status(500).json(err)

                return res.json(user)
            })
        })
    },
    destroy(req, res, next) {
        if (req.method != 'DELETE')
            return next()

        let errors = validate(req.body, {
            id: 'required',
        })

        if (Object.keys(errors).length)
            return res.status(422).json(errors)

        User.find(req.body.id, (user, err) => {
            if (err)
                return res.status(500).json(err)

            user.delete((err) => {
                if (err)
                    return res.status(500).json(err)

                return res.json('deleted')
            })
        })
    },
    index(req, res) {
        User.get(null, (users, err) => {
            if (err)
                return res.status(500).json(err)

            return res.json(users)
        })
    }
}
