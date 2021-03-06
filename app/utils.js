let path = require('path')
let crypto = require('crypto')
let fs = require('fs')

let timestamp = (date, notime) => {
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

    return [year, month, day].join('-') + (notime ? '' : ' ' + [hour, minute, second].join(':'))
}

let logger = (log, type) => {
    type = type || 'I'
    cons = type == 'E' ? console.error : console.log
    let info = timestamp() + '  ' + type
    let data
    if (typeof log == 'object') {
        cons(info)
        cons(log)
        data = Buffer.from([info, log, '\n'])
    } else {
        cons(info + '    ' + log)
        data = Buffer.from(info + '    ' + log + '\n')
    }
    let log_path = path.resolve(__dirname + '/../storage/logs/' + timestamp(null, true) + '.log')
    if (fs.existsSync(log_path))
        fs.appendFileSync(log_path, data)
    else
        fs.writeFileSync(log_path, data)
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
                case 'confirmed':
                    if (params[field] != params[field + '_confirmation'])
                        addError(field, field + ' confirmation mismatch.')
                    break
                case 'min':
                    if (v && params[field] && params[field].length < parseInt(v))
                        addError(field, field + ' minimum ' + v)
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

let public_path = subpath => {
    return path.resolve(__dirname, '../public/', (subpath || ''))
}

module.exports = {
    timestamp,
    logger,
    Hash,
    validate,
    public_path,
}
