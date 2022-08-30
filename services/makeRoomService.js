const path = require('path')
const fs = require('fs')

const mongoConnector = require('./../db/mongo-connector')
const jwt = require('jsonwebtoken')
const {
    ObjectId
} = require('mongodb')
const jwtKey = process.env.JWTT

const makeRoomService = async (req, res) => {
    const token = req.headers.authorization
    const userId = req.headers.userid
    const roomName = req.headers.roomname
    const roomDesc = req.headers.roomdesc
    const roomMembers = req.headers.roommembers

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

    if ((roomName == undefined || roomName == '') ||
        (roomMembers == undefined || roomMembers == '')
    ) {
        res.status(400).json({
            message: 'Room name and Room members cannot be empty!',
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

    var newRoomMembers = JSON.parse(roomMembers)
    for (var i = 0; i < newRoomMembers.length; i++) {
        newRoomMembers[i].userId = ObjectId(newRoomMembers[i].userId)
    }

    dbo.collection("rooms").insertOne({
        name: roomName,
        desc: roomDesc,
        members: newRoomMembers,
        creatorId: ObjectId(userId),
        dateTime: new Date()
    }, async (err, result) => {
        if (err) console.log(err)
        if (result == null) {
            res.status(400).json({
                message: "Operation failed, try again later!",
                error_code: 'failed'
            })
        } else {
            if (req.file != undefined) {
                const tempPath = req.file.path
                const targetPath = path.join(__dirname, `../${process.env.MULTER_ROOM_TARGET_PATH}/${result.insertedId.toString()}.jpg`)
                fs.rename(tempPath, targetPath, (_) => {})
            }

            const membersList = await _getMembersOfRoom(result.insertedId)
            res.status(200).json({
                message: 'Room has been made successfully.',
                error_code: 'success',
                data: {
                    _id: result.insertedId,
                    members: membersList
                }
            })
        }
    })
}

async function _getMembersOfRoom(roomId) {
    const database = await mongoConnector()
    const dbo = database.db(process.env.DB_NAME)
    return (dbo.collection("rooms").aggregate([{
                $match: {
                    '_id': roomId
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members.userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $project: {
                    '_id': 1,
                    'name': 1,
                    'desc': 1,
                    'members': 1,
                    'user': 1
                }
            }
        ])
        .toArray()) ?? [];
}

module.exports = makeRoomService