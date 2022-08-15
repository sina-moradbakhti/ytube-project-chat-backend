const MongoClient = require('mongodb').MongoClient

const clear = (req, res) => {
    MongoClient.connect(process.env.MONGO_URL, function (err, db) {
        if (err) console.log(err)
        const dbo = db.db(process.env.DB_NAME)
        dbo.collection("users").drop()
        res.status(200).json({
            message: 'Users is clear now',
            error_code: 'success'
        })
    })
}

module.exports = clear