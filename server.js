let app = require('express')()
let server = require('http').createServer(app)
let io = require('socket.io')(server)

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
    console.log(timestamp() + '  ' + type + '    ' + log)
}

server.listen(9090, () => {
    logger('Listening on port *:9090')
})

let chatRooms = {}

io.on('connection', (socket) => {
    logger('Client connected...')

    socket.on('join', (room, username) => {
        socket.join(room)
        logger(username + ' joined to room ' + room)

        if (!chatRooms[room]) {
            chatRooms[room] = {
                users: [username],
                messages: []
            }
        } else {
            if (chatRooms[room].users.indexOf(username) == -1)
                chatRooms[room].users.push(username)
            if (chatRooms[room].messages.length > 0) {
                logger('retrieving available messages in room ' + room)
                io.sockets.in(room).emit('chat_sync', chatRooms[room].messages)
            }
        }
    })

    socket.on('chat_server', (room, username, message) => {
        logger(username + ' send a message to room ' + room)

        if (!chatRooms[room]) {
            io.sockets.in(room).emit('chat_error', 'Room does not exists.')
            return
        } else if (chatRooms[room].users.indexOf(username) == -1) {
            io.sockets.in(room).emit('chat_error', 'Wrong room.')
            return
        }

        let data = {
            id: chatRooms[room].messages.length + 1,
            username,
            message,
            time: timestamp()
        }

        chatRooms[room].messages.push(data)
        io.sockets.in(room).emit('chat_client', data)
    })
})
