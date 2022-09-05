const {
    ObjectId
} = require('mongodb');
const mongoConnector = require('./../db/mongo-connector')

async function getLatestRooms(userId, latestDates) {

    const database = await mongoConnector()
    const dbo = database.db(process.env.DB_NAME)

    try {
        var roomsCollection = await dbo.collection("rooms")
            .aggregate([{
                    $match: {
                        'members.userId': ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'creatorId',
                        foreignField: '_id',
                        as: 'creatorUser'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'members.userId',
                        foreignField: '_id',
                        as: 'users'
                    }
                },
                {
                    $project: {
                        'name': 1,
                        'desc': 1,
                        'dateTime': 1,
                        'creatorUser._id': 1,
                        'creatorUser.fullName': 1,
                        'creatorUser.userName': 1,
                        'users._id': 1,
                        'users.fullName': 1,
                        'users.userName': 1,
                        'members.role': 1,
                        'members.userId': 1
                    }
                }
            ])
            .toArray();

        for (var index = 0; index < roomsCollection.length; index++) {
            var dateTimeRule = null
            latestDates.forEach((dateRule) => {
                if (dateRule.roomId == roomsCollection[index]._id.toString()) {
                    dateTimeRule = dateRule.dateTime
                }
            })

            var rules = [{
                    $lookup: {
                        from: 'users',
                        localField: 'fromId',
                        foreignField: '_id',
                        as: 'fromUser'
                    }
                },
                {
                    $project: {
                        'roomId': 1,
                        'fromId': 1,
                        'dateTime': 1,
                        'message': 1,
                        'fromUser._id': 1,
                        'fromUser.fullName': 1,
                        'fromUser.userName': 1
                    }
                }
            ]

            if (dateTimeRule !== null) {
                rules.push({
                    $match: {
                        'fromId': {
                            $ne: ObjectId(userId)
                        },
                        'dateTime': {
                            $gt: new Date(dateTimeRule)
                        }
                    }
                })
            } else {
                rules.push({
                    $match: {
                        'fromId': {
                            $ne: ObjectId(userId)
                        }
                    }
                })
            }

            const messages = await dbo.collection("room_" + roomsCollection[index]._id.toString() + "_messages")
                .aggregate(rules)
                .toArray();

            roomsCollection[index]['messages'] = messages
        }

        return roomsCollection
    } catch (er) {
        console.log(er)
        return null
    }

}

module.exports = getLatestRooms