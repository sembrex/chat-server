let config = require('../configs')

module.exports = (req, res, next) => {
    res.locals.app_name = config.app_name
    res.locals.user = req.session.user
    next()
}
