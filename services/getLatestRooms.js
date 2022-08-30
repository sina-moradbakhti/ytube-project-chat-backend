const {
    ObjectId
} = require('mongodb');
const mongoConnector = require('./../db/mongo-connector')

async function getLatestRooms(userId) {

    const database = await mongoConnector()
    const dbo = database.db(process.env.DB_NAME)

    try {
        const roomsCollection = await dbo.collection("rooms")
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
        return roomsCollection
    } catch (er) {
        console.log(er)
        return null
    }

}

module.exports = getLatestRooms