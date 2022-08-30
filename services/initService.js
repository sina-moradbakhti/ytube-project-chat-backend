const getLatestOfflineMessages = require('./getLatestOfflineMessages')
// JWT
const jwt = require('jsonwebtoken')
const getLatestRooms = require('./getLatestRooms')
const jwtKey = process.env.JWTT

const initService = async (req, res) => {
    const token = req.headers.authorization
    const userId = req.body.userId

    if (userId == undefined) {
        res.status(400).json({
            message: 'Please send a userId!',
            error_code: 'failed',
            data: null
        })
        return
    }

    if (token == undefined) {
        res.status(400).json({
            message: 'Authentication not found!',
            error_code: 'failed',
            data: null
        })
        return
    }

    try {
        jwt.verify(token.replace('Bearer ', ''), jwtKey)
    } catch (er) {
        res.status(400).json({
            message: 'Authentication failed',
            error_code: 'failed',
            data: null
        })
        return
    }

    try {
        const messagesCollection = await getLatestOfflineMessages(userId)
        const roomsCollection = await getLatestRooms(userId)
        res.status(200).json({
            message: '',
            error_code: 'success',
            data: {
                latestOfflineMessages: messagesCollection,
                rooms: roomsCollection
            }
        })
    } catch (er) {
        console.log(er)
        res.status(400).json({
            message: er,
            error_code: 'failed',
            data: null
        })
    }

}

module.exports = initService