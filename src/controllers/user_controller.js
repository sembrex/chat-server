const knex = require('knex')(require('../../knexfile'))
let utils = require('../utils')
let Jimp = require('jimp')
let fs = require('fs')
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

let createOrUpdateUser = (data, callback, err_callback) => {

}

module.exports = {
    store(req, res, next) {
        if (req.method != 'POST')
            return next()

        let errors = validate(req.body, {
            username: 'required',
            password: 'required',
        })

        if (Object.keys(errors).length) {
            return res.status(422).json(errors)
        }

        let data = {
            username: req.body.username,
            password: utils.Hash.make(req.body.password)
        }

        if (req.files) {
            req.files.forEach(file => {
                if (file.fieldname == 'avatar') {
                    data.avatar = file
                }
            })
        }

        User.create(data, (err, user) => {
            if (err)
                return res.status(500).json(err)

            return res.json(user)
        })
    },
    update(req, res, next) {
        if (['PUT', 'PATCH'].indexOf(req.method) == -1)
            return next()

        res.send('User put patch')
    },
    destroy(req, res, next) {
        if (req.method != 'DELETE')
            return next()

        res.send('User delete')
    },
    index(req, res) {
        User.get()
            .then(users => {
                utils.logger(users)
                res.json(users)
            })
            .catch(err => {
                res.json(err)
            })
    }
}
