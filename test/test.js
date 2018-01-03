let assert = require('assert')
let expect = require('chai').expect
let knex = require('knex')(require('../knexfile'))
let utils = require('../src/utils')

describe('User', () => {
    it('should return user with avatar path', done => {
        let callback = (err, row) => {
            console.log(row)
            done()
        }

        knex.first().from('users').where('id', 1)
            .asCallback((err, user) => {
                if (user.avatar_id) {
                    knex.first().from('file_managers').where('id', user.avatar_id)
                        .asCallback((err, avatar) => {
                            user.avatar = avatar.path
                            callback(err, user)
                        })
                } else
                    callback(err, user)
            })
    })
})

describe('Logger', () => {
    it('should display log', () => {
        utils.logger('string')
        utils.logger({log: 'object'})
        utils.logger('error', 'E')
    })
})
