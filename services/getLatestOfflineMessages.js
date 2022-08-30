const mongoConnector = require('./../db/mongo-connector')

async function getLatestOfflineMessages(userId) {

    const database = await mongoConnector()
    const dbo = database.db(process.env.DB_NAME)

    try {
        return await dbo.collection("messages_" + userId)
            .aggregate([{
                    $lookup: {
                        from: 'users',
                        localField: 'fromId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $project: {
                        'message': 1,
                        'dateTime': 1,
                        'user._id': 1,
                        'user.fullName': 1,
                        'user.userName': 1
                    }
                }
            ])
            .toArray();
    } catch (er) {
        console.log(er)
        return null
    }

}

module.exports = getLatestOfflineMessages