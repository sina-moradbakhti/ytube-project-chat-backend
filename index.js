require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

// Multer (uploading files dependency)
const multer = require('multer')
const uploadMiddleware = multer({
    dest: process.env.MULTER_TEMP_PATH
});

const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)

// Services
const registerService = require('./services/register')
const signInService = require('./services/signIn')
const clearUsersService = require('./services/clear')
const getUserFromToken = require('./services/getUserFromToken')
const newContact = require('./services/new-contact')
const tokenFresher = require('./services/token-fresher')
const sendMessageOffline = require('./services/sendMessageOffline')
const clearLatestOfflineMessages = require('./services/clearLatestOfflineMessages')
const uploadAvatarService = require('./services/uploadAvatarService')
const showAvatarService = require('./services/showAvatarService')
const makeRoomService = require('./services/makeRoomService')
const showRoomAvatarService = require('./services/showRoomAvatarService')
const initService = require('./services/initService')
// Models
const SocketUser = require('./models/user.socket')
const saveMessagesInRoom = require('./services/saveMessageInRoom')

// Variables
const port = process.env.PORT || 3000
const users = []

// Socket.io
io.on('connection', async (socket) => {
    const token = socket.handshake.query.token;
    // Check token (Authentication)
    const checkedTokenData = await getUserFromToken(token)
    if (checkedTokenData.data == null) {
        socket.disconnect()
        return
    }

    const user = new SocketUser({
        socketId: socket.id,
        userId: checkedTokenData.data._id,
        username: checkedTokenData.data.userName,
        fullname: checkedTokenData.data.fullName,
        token: token
    })
    // Push userdata inside "users" list
    users.push(user)
    console.log(`a new socket connection (${user.userId})`)

    // Join a person to a new room
    socket.on('join-room', (event) => {
        socket.join(`ROOMID::${event.roomId}`)
        console.log(`user ${user.userId} join to a room ${event.roomId}`)
    })

    // Leave a person from a room
    socket.on('leave-room', (event) => {
        socket.leave(`ROOMID::${event.roomId}`)
        console.log(`user ${user.userId} left the room ${event.roomId}`)
    })

    // Send message
    socket.on('send-message', (event) => {
        if (!!event.roomId) {
            // Multi persons
            io.to(`ROOMID::${event.roomId}`).emit('onMessage', {
                'message': event.message,
                'from': user,
                'roomId': event.roomId
            });
            saveMessagesInRoom(event.roomId, user.userId, event.message)
        } else {
            // individually
            const filteredUsers = users.filter((elem) => elem.userId == event.to)
            if (filteredUsers.length > 0) {
                filteredUsers.forEach((socketItem) => {
                    socket.broadcast.to(socketItem.socketId).emit('onMessage', {
                        'message': event.message,
                        'from': user
                    })
                    console.log(`user ${user.userId} sent a message to ${socketItem.socketId} > ${event.message}`)
                });
            } else {
                sendMessageOffline(user.userId, event.to, event.message).then(result => {
                    if (result.data.status) {
                        console.log(`user ${user.userId} sent a offline message to ${event.to} > ${event.message}`)
                    }
                })
            }
        }
    });

    // Disconnect
    socket.on('disconnect', (event) => {
        console.log(`user (${user.userId}) disconnected`)
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
app.post('/new-contact', newContact)
app.post('/token-fresher', tokenFresher)
app.post('/clear-latest-offline-messages', clearLatestOfflineMessages)
app.put('/upload-avatar', uploadMiddleware.single('avatar'), uploadAvatarService)
app.get('/avatar/:userId', showAvatarService)
app.get('/room-avatar/:roomId', showRoomAvatarService)
app.put('/new-room', uploadMiddleware.single('roomAvatar'), makeRoomService)
app.post('/init', initService)

app.get('/clearUsers', clearUsersService)

// Server Listener
server.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
});