let path = require('path')
let crypto = require('crypto')

let timestamp = (date) => {
    date = date || new Date()

    let year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDay(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds()

    month = month > 9 ? month : '0' + month
    day = day > 9 ? day : '0' + day
    hour = hour > 9 ? hour : '0' + hour
    minute = minute > 9 ? minute : '0' + minute
    second = second > 9 ? second : '0' + second

    return [year, month, day].join('-') + ' ' + [hour, minute, second].join(':')
}

let logger = (log, type) => {
    type = type || 'I'
    cons = type == 'E' ? console.error : console.log
    let info = timestamp() + '  ' + type
    if (typeof log == 'object') {
        cons(info)
        cons(log)
    } else
        cons(info + '    ' + log)
}

let Hash = {
    make(text, salt) {
        salt = salt || crypto.randomBytes(4).toString('hex')
        return crypto.createHmac('sha512', salt).update(text).digest('hex') + salt
    },
    check(text, hashed) {
        let salt = hashed.substr(-8)
        return hashed === this.make(text, salt)
    }
}

let public_path = subpath => {
    return path.resolve(__dirname, '../public/', (subpath || ''))
}

module.exports = {
    timestamp,
    logger,
    Hash,
    public_path,
}
