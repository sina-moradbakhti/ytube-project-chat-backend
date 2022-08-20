const mongoConnector = require('./../db/mongo-connector')
const jwt = require('jsonwebtoken')
const {
    ObjectId
} = require('mongodb')
const jwtKey = process.env.JWTT
const jwtExpirySeconds = process.env.JWTES

const tokenFresher = async (req, res) => {
    var token = req.headers.authorization
    const username = req.body.userName
    const userId = req.body.userId

    if (username == undefined || userId == undefined) {
        res.status(400).json({
            message: 'Please send a username and userId!',
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

    token = token.replace('Bearer ', '')

    // Refresh Token
    const newToken = jwt.sign({
        username
    }, jwtKey, {
        algorithm: 'HS256',
        expiresIn: jwtExpirySeconds
    })

    const database = await mongoConnector()
    const dbo = database.db(process.env.DB_NAME)
    dbo.collection("users").updateOne({
        userName: username,
        _id: ObjectId(userId),
        token: token
    }, {
        $set: {
            token: newToken
        }
    }, (err, result) => {
        if (err) console.log(err)
        if (result == null) {
            res.status(400).json({
                message: "Operation failed, try again later!",
                error_code: 'failed'
            })
        } else {
            res.status(200).json({
                message: '',
                error_code: 'success',
                data: {
                    token: newToken
                }
            })
        }
    })
}

module.exports = tokenFresher