const mongoConnector = require('./../db/mongo-connector')
const jwt = require('jsonwebtoken')
const jwtKey = process.env.JWTT

const newContact = async (req, res) => {
    const token = req.headers.authorization
    const username = req.body.username

    if (username == undefined) {
        res.status(400).json({
            message: 'Please send a username!',
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
    dbo.collection("users").findOne({
        userName: username
    }, (err, result) => {
        if (err) console.log(err)
        if (result == null) {
            res.status(400).json({
                message: "This username isn't available!",
                error_code: 'user_not_found'
            })
        } else {
            res.status(200).json({
                message: '',
                error_code: 'success',
                data: {
                    _id: result._id,
                    fullName: result.fullName,
                    userName: result.userName
                }
            })
        }
    })
}

module.exports = newContact