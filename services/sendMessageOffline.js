const mongoConnector = require('./../db/mongo-connector')
const jwt = require('jsonwebtoken')
const jwtKey = process.env.JWTT

async function sendMessageOffline(fromId, toId, message) {
    if (
        (fromId == undefined || toId == undefined || message == undefined) &&
        message == '') {
        return null
    }

    try {
        const database = await mongoConnector()
        const dbo = database.db(process.env.DB_NAME)
        const messages = await dbo.collection("messages").insertOne({
            message: message,
            fromId: fromId,
            toId: toId
        })

        if (messages == null) {
            return {
                message: 'Inserting message was failed',
                error_code: 'failed',
                data: {
                    status: false
                }
            }
        } else {
            return {
                message: 'offline message inserted',
                error_code: 'success',
                data: {
                    status: true
                }
            }
        }

    } catch (err) {
        if (err) console.log(err)
        return {
            message: err,
            error_code: 'failed',
            data: {
                status: false
            }
        }
    }


}

module.exports = sendMessageOffline