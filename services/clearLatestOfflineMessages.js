const mongoConnector = require('./../db/mongo-connector')
const jwt = require('jsonwebtoken')
const {
    ObjectId
} = require('mongodb')
const jwtKey = process.env.JWTT

const clearLatestOfflineMessages = async (req, res) => {
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

    const database = await mongoConnector()
    const dbo = database.db(process.env.DB_NAME)

    try {
        await dbo.collection("messages_" + userId).drop()
        res.status(200).json({
            message: 'Latest offline messages are droped.',
            error_code: 'success',
            data: null
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

module.exports = clearLatestOfflineMessages