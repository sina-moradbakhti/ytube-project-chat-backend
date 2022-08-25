const mongoConnector = require('./../db/mongo-connector')
const jwt = require('jsonwebtoken')
const {
    ObjectId
} = require('mongodb')
const jwtKey = process.env.JWTT

const getOfflineMessages = async (req, res) => {
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
    withoutBarearToken = token.replace('Bearer ', '')
    try {
        const userObject = await dbo.collection("users").findOne({
            _id: ObjectId(userId),
            token: withoutBarearToken
        });


        if (userObject != null) {
            const offlineMessagesList = await dbo.collection("messages").aggregate(
                [{
                    $lookup: {
                        from: 'users',
                        localField: 'fromId',
                        foreignField: '_id',
                        as: 'user'
                    }
                }, {
                    $match: {
                        toId: userId
                    }
                }]).toArray()

            if (offlineMessagesList != null) {
                res.status(200).json({
                    message: '',
                    error_code: 'success',
                    data: offlineMessagesList
                })
            } else {
                res.status(400).json({
                    message: '',
                    error_code: 'failed',
                    data: null
                })
            }

        }


    } catch (er) {
        console.log(er)
    }
}

module.exports = getOfflineMessages