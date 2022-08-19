class SocketUser {
    constructor({
        socketId,
        userId,
        username,
        token,
        fullname
    }) {
        this.socketId = socketId
        this.userId = userId
        this.username = username
        this.token = token
        this.fullname = fullname
    }
}

module.exports = SocketUser