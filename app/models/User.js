let knex = require('knex')(require('../../knexfile'))
let utils = require('../utils')
let Jimp = require('jimp')
let fs = require('fs')

module.exports = class User {
    static get table() {
        return "users"
    }

    constructor(data, callback) {
        for (let key in data) {
            this[key] = data[key]
        }

        if (this.avatar_id) {
            return knex.first('path')
                .from('file_managers')
                .where('id', this.avatar_id)
                .then((row) => {
                    this.avatar = row.path
                    if (typeof callback == 'function')
                        callback(this)

                    return this
                })
        }

        if (typeof callback == 'function')
            callback(this)
    }

    static get() {
        return knex.select(...arguments)
                .table(this.table)
                .map(data => {
                    return new this(data)
                })
    }

    static create(data, callback) {
        let user = {
            username: data.username,
            password: data.password,
        }

        knex.transaction(trx => {
            let createUser = data => {
                knex(this.table).insert(data)
                    .transacting(trx)
                    .asCallback((err) => {
                        if (err) {
                            utils.logger(err, 'E')
                            trx.rollback()
                            return callback(err)
                        }

                        trx.commit()
                        new this(data, user => {
                            callback(err, user)
                        })
                    })
            }

            if (data.avatar) {
                let file = data.avatar

                Jimp.read(file.buffer).then(img => {
                    if (img.bitmap.width >= img.bitmap.height) {
                        img.resize(Jimp.AUTO, 250)
                        let x = Math.round((img.bitmap.width - 250) / 2)
                        img.crop(x, 0, 250, 250)
                    } else {
                        img.resize(250, Jimp.AUTO)
                        let y = Math.round((img.bitmap.height - 250) / 2)
                        img.crop(0, y, 250, 250)
                    }

                    let img_path = 'images/avatar/' + user.username + '.' + img.getExtension()
                    let save_path = utils.public_path(img_path)
                    if (fs.existsSync(save_path))
                        fs.unlinkSync(save_path)
                    img.write(save_path)

                    knex('file_managers')
                        .transacting(trx)
                        .returning('id')
                        .insert({
                            mime: file.mimetype,
                            path: '/' + img_path
                        })
                        .asCallback((err, ids) => {
                            if (!err)
                                user.avatar_id = ids[0]
                            createUser(user)
                        })
                }).catch(err => {
                    createUser(user)
                })
            } else {
                createUser(user)
            }
        })
    }
}
