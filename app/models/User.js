let knex = require('knex')(require('../../knexfile'))
let utils = require('../utils')
let Jimp = require('jimp')
let fs = require('fs')

module.exports = class User {
    static get table() {
        return "users"
    }

    constructor(data, callback) {
        for (let key in data)
            this[key] = data[key]

        if (this.avatar_id) {
            return knex('file_managers')
                .first('path')
                .where('id', this.avatar_id)
                .then((avatar) => {
                    this.avatar = avatar.path
                    if (typeof callback == 'function')
                        callback(this)

                    return this
                })
        }

        if (typeof callback == 'function')
            callback(this)
    }

    static get(columns, callback) {
        knex(this.table)
            .select(...columns || [])
            .map(data => {
                return new User(data)
            })
            .asCallback((err, users) => {
                if (typeof callback == 'function')
                    callback(users, err)
            })
    }

    static find(id, callback) {
        knex(this.table)
            .first()
            .where('id', id)
            .then(user => {
                new User(user, callback)
            })
            .catch(err => {
                utils.logger(err, 'E')
                if (typeof callback == 'function')
                    callback(null, err)
            })
    }

    static create(data, callback) {
        let user = {
            username: data.username,
            password: data.password,
        }

        knex.transaction(trx => {
            let createUser = data => {
                return trx.insert(data)
                    .into(this.table)
            }

            if (data.avatar) {
                return this.processAvatar(data.avatar, data.username, (avatar, err) => {
                    if (err) {
                        utils.logger(err, 'E')
                        return createUser(user)
                    }

                    return trx.insert(avatar, 'id')
                        .into('file_managers')
                        .then((ids) => {
                            user.avatar_id = ids[0]
                            return createUser(user)
                        })
                        .catch(() => {
                            return createUser(user)
                        })
                })
            } else
                return createUser(user)
        })
        .then(() => {
            new User(user, callback)
        })
        .catch(err => {
            if (typeof callback == 'function')
                callback(null, err)
        })
    }

    update(data, callback) {
        let user = {
            username: this.username
        }

        for (let key in data) {
            if (key != 'avatar')
                user[key] = data[key]
        }

        knex.transaction(trx => {
            let updateUser = data => {
                return trx(User.table)
                    .update(data)
                    .where('id', this.id)
            }

            if (data.avatar) {
                return User.processAvatar(data.avatar, this.username, (avatar, err) => {
                    if (err) {
                        utils.logger(err, 'E')
                        return updateUser(user)
                    }

                    if (this.avatar_id) {
                        return trx('file_managers')
                            .update(avatar)
                            .where('id', this.avatar_id)
                            .then(() => {
                                this.avatar = avatar.path
                                return updateUser(user)
                            })
                            .catch(err => {
                                return updateUser(user)
                            })
                    } else {
                        return trx.insert(avatar, 'id')
                            .into('file_managers')
                            .then((ids) => {
                                user.avatar_id = ids[0]
                                this.avatar_id = ids[0]
                                this.avatar = avatar.path
                                return updateUser(user)
                            })
                            .catch(err => {
                                return updateUser(user)
                            })
                    }
                })
            } else
                return updateUser(user)
        })
        .asCallback((err) => {
            if (!err) {
                for (let key in user)
                    this[key] = user[key]
            }

            if (typeof callback == 'function')
                callback(err)
        })
    }

    delete(callback) {
        knex.transaction(trx => {
            return trx.delete()
                .from(User.table)
                .where('id', this.id)
                .then(() => {
                    if (this.avatar_id && this.avatar) {
                        return trx.delete()
                            .from('file_managers')
                            .where('id', this.avatar_id)
                            .then(() => {
                                fs.unlinkSync(utils.public_path(this.avatar.substring(1)))
                            })
                    }
                })
        })
        .asCallback(err => {
            if (typeof callback == 'function')
                callback(err)
        })
    }

    static processAvatar(file, username, callback) {
        return Jimp.read(file.buffer).then(img => {
            if (img.bitmap.width >= img.bitmap.height) {
                img.resize(Jimp.AUTO, 250)
                let x = Math.round((img.bitmap.width - 250) / 2)
                img.crop(x, 0, 250, 250)
            } else {
                img.resize(250, Jimp.AUTO)
                let y = Math.round((img.bitmap.height - 250) / 2)
                img.crop(0, y, 250, 250)
            }

            let img_path = 'images/avatar/' + username + '.' + img.getExtension()
            let save_path = utils.public_path(img_path)
            if (fs.existsSync(save_path))
                fs.unlinkSync(save_path)
            img.write(save_path)

            if (typeof callback == 'function') {
                return callback({
                    mime: file.mimetype,
                    path: '/' + img_path
                })
            }
        }).catch(err => {
            if (typeof callback == 'function')
                return callback(null, err)
        })
    }
}
