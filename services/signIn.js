const mongoConnector = require('./../db/mongo-connector')
const jwt = require('jsonwebtoken')
const jwtKey = process.env.JWTT
const jwtExpirySeconds = process.env.JWTES
const bcryptjs = require('bcryptjs')

const signIn = async (req, res) => {
    const userName = req.body.username
    const password = req.body.password

    if (userName == undefined || password == undefined) {
        res.status(400).json({
            message: 'please send all the required values!',
            error_code: 'required_fields'
        })
        return
    }

    if (password.length < 6) {
        res.status(400).json({
            message: 'Password must be at least 6 characters',
            error_code: 'weak_password'
        })
        return
    }

    const db = await mongoConnector()
    const dbo = db.db(process.env.DB_NAME)
    const safePassword = await bcryptjs.hash(password, process.env.SALT)
    dbo.collection("users").findOne({
        userName: userName,
        password: safePassword
    }, (err, result) => {
        if (err) console.log(err)
        if (result == null) {
            res.status(400).json({
                message: 'Your username or password is invalid!',
                error_code: 'invalid_user_pass'
            })
        } else {
            // Refresh Token
            const token = jwt.sign({
                userName
            }, jwtKey, {
                algorithm: 'HS256',
                expiresIn: jwtExpirySeconds
            })

            dbo.collection("users").updateOne({
                userName: userName,
                password: safePassword
            }, {
                $set: {
                    token: token
                }
            }, function (err, _) {
                if (err) {
                    console.log(err)
                    res.status(400).json({
                        message: 'There is a problem while updating the token',
                        error_code: 'failed',
                        data: null
                    })
                } else {
                    res.status(200).json({
                        message: 'You are signed in now',
                        error_code: 'success',
                        data: {
                            _id: result._id,
                            fullName: result.fullName,
                            userName: result.userName,
                            token: token
                        }
                    })
                }
            })
        }
    })
}

module.exports = signIn