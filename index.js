require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)

// Services
const registerService = require('./services/register')
const signInService = require('./services/signIn')
const clearUsersService = require('./services/clear')
const getUserIdFromToken = require('./services/getUserIdFromToken')

// Variables
const port = process.env.PORT || 3000
const users = []

// Socket.io
io.on('connection', async (socket) => {
    const socketId = socket.id;
    const token = socket.handshake.query.token;
    // Check token (Authentication)
    const checkedToken = await getUserIdFromToken(token)
    if (checkedToken == null) {
        socket.disconnect()
        return
    }

    const userId = checkedToken.data._id;
    users.push({
        userId: userId,
        socketId: socketId
    })
    console.log(`a new socket connection (${userId})`)

    // Join a person to a new room
    socket.on('join-room', (event) => {
        socket.join(`ROOMID::${event.roomId}`)
        console.log(`user ${userId} join to a room ${event.roomId}`)
    })

    // Leave a person from a room
    socket.on('leave-room', (event) => {
        socket.leave(`ROOMID::${event.roomId}`)
        console.log(`user ${userId} left the room ${event.roomId}`)
    })

    // Send message
    socket.on('send-message', (event) => {
        if (!!event.roomId) {
            // Multi persons
            io.to(`ROOMID::${event.roomId}`).emit('onMessage', {
                'message': event.message,
                'from': userId,
                'roomId': event.roomId
            });
        } else {
            // individually
            const filteredUsers = users.filter((elem) => elem.userId == event.to)
            if (filteredUsers.length > 0) {
                socket.broadcast.to(filteredUsers[0].socketId).emit('onMessage', {
                    'message': event.message,
                    'from': userId
                })
                console.log(`user ${userId} sent a message to ${event.to} > ${event.message}`)
            }
        }
    });

    // Disconnect
    socket.on('disconnect', (event) => {
        console.log(`user (${userId}) disconnected`)
        const index = users.indexOf((elem) => elem.userId == userId);
        users.slice(index, 1)
    });
})

// Restful APIs
app.get('/', (req, res) => {
    res.send('<h1>Hello WebSocket!</h1>')
})

app.post('/register', registerService)
app.post('/signin', signInService)
app.get('/clearUsers', clearUsersService)

// Server Listener
server.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
});