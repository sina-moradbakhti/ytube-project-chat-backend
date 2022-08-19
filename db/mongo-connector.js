const MongoClient = require('mongodb').MongoClient
async function mongoConnector() {
    try {
        return await MongoClient.connect(process.env.MONGO_URL)
    } catch (er) {
        console.log('\n:::::::::::::::: [ Mongo Connector ] ::::::::::::::::')
        console.log(er + '\n')
        return null
    }
}

module.exports = mongoConnector