const { ObjectId } = require('mongodb')
const mongoConnector = require('./../db/mongo-connector')

async function saveMessagesInRoom(roomId, userId, message) {
    if ((userId == undefined || roomId == undefined || message == undefined) ||
        message == ''
    ) {
        return null
    }

    try {
        const database = await mongoConnector()
        const dbo = database.db(process.env.DB_NAME)
        const insertedMessage = await dbo.collection("room_" + roomId + "_messages").insertOne({
            roomId: ObjectId(roomId),
            fromId: userId,
            message: message,
            dateTime: new Date()
        })

        if (insertedMessage == null) {
            return {
                message: '',
                error_code: 'failed',
                data: {
                    status: false
                }
            }
        } else {
            return {
                message: 'message sent',
                error_code: 'success',
                data: {
                    status: true
                }
            }
        }

    } catch (err) {
        if (err) console.log(err)
        return {
            message: '',
            error_code: 'failed',
            data: {
                status: false
            }
        }
    }


}

module.exports = saveMessagesInRoom