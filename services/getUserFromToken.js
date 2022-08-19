const mongoConnector = require('./../db/mongo-connector')
const jwt = require('jsonwebtoken')
const jwtKey = process.env.JWTT

async function getUserFromToken(token) {
    if (token == undefined || token == '') {
        return null
    }

    try {
        jwt.verify(token, jwtKey)
    } catch (er) {
        console.log(er)
        return null
    }

    try {
        const database = await mongoConnector()
        const dbo = database.db(process.env.DB_NAME)
        const user = await dbo.collection("users").findOne({
            token: token
        })

        if (user == null) {
            return {
                message: 'Invalid token!',
                error_code: 'invalid_token'
            }
        } else {
            return {
                message: 'Authenticated successfully',
                error_code: 'success',
                data: {
                    _id: user._id,
                    fullName: user.fullName,
                    userName: user.userName
                }
            }
        }

    } catch (err) {
        if (err) console.log(err)
    }


}

module.exports = getUserFromToken