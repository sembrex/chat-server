let express = require('express')
let app = express()
let server = require('http').createServer(app)
let io = require('socket.io')(server)

let {logger, timestamp} = require('./app/utils')

server.listen(9090, () => {
    logger('NODE_ENV = ' + process.env.NODE_ENV)
    logger('Listening on port *:9090')
})

app.use(express.static('public'))
app.set('view engine', 'pug')
require('./app/routes')(app)

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
