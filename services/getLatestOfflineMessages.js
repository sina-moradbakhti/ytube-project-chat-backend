const mongoConnector = require('./../db/mongo-connector')
const jwt = require('jsonwebtoken')
const jwtKey = process.env.JWTT

const getLatestOfflineMessages = async (req, res) => {
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
        const messagesCollection = await dbo.collection("messages_" + userId)
            .aggregate([{
                    $lookup: {
                        from: 'users',
                        localField: 'fromId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $project: {
                        'message': 1,
                        'dateTime': 1,
                        'user._id': 1,
                        'user.fullName': 1,
                        'user.userName': 1
                    }
                }
            ])
            .toArray();
        res.status(200).json({
            message: '',
            error_code: 'success',
            data: messagesCollection
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

module.exports = getLatestOfflineMessages