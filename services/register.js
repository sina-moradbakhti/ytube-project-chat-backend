const jwt = require('jsonwebtoken')
const jwtKey = process.env.JWTT
const jwtExpirySeconds = process.env.JWTES

const MongoClient = require('mongodb').MongoClient
const bcryptjs = require('bcryptjs')

const register = async (req, res) => {
    const fullName = req.body.fullname
    const userName = req.body.username
    const password = req.body.password

    if (fullName == undefined || userName == undefined || password == undefined) {
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

    MongoClient.connect(process.env.MONGO_URL, async function (err, db) {
        if (err) console.log(err)
        const dbo = db.db(process.env.DB_NAME)

        const saltyPassword = await bcryptjs.hash(password, process.env.SALT)
        const user = {
            fullName: fullName,
            userName: userName,
            password: saltyPassword,
            token: ''
        }

        dbo.collection("users").findOne({
            userName: userName
        }, (err, result) => {
            if (err) console.log(err)
            if (result == null) {

                const token = jwt.sign({
                    userName
                }, jwtKey, {
                    algorithm: 'HS256',
                    expiresIn: jwtExpirySeconds
                })
                user.token = token

                dbo.collection("users").insertOne(user, function (err, result) {
                    if (err) console.log(err)
                    result['token'] = token
                    res.status(200).json({
                        message: 'user registered successfully',
                        error_code: 'success',
                        data: result
                    })
                    db.close()
                })
            } else {
                res.status(400).json({
                    message: 'this username is taken already!',
                    error_code: 'user_exist'
                })
            }
        })

    })
}

module.exports = register