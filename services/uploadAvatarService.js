const path = require('path')
const fs = require('fs')

const jwt = require('jsonwebtoken')
const jwtKey = process.env.JWTT


const uploadAvatarService = async (req, res) => {

    const token = req.headers.authorization
    const userId = req.headers.userid

    if (userId == undefined || userId == '') {
        res.status(400).json({
            message: 'Please send a userId!',
            error_code: 'failed',
            data: null
        })
        return
    }

    if (token == undefined || token == '') {
        res.status(400).json({
            message: 'Authentication not found!',
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

    const tempPath = req.file.path
    const targetPath = path.join(__dirname, `../${process.env.MULTER_TARGET_PATH}/${userId}.jpg`)

    fs.rename(tempPath, targetPath, (er) => {
        if (er) {
            console.log(er)
            res.status(400).json({
                message: er,
                error_code: 'upload_failed',
                data: null
            })
            return
        } else {
            fs.unlink(tempPath, () => {})
            res.status(200).json({
                message: 'File uploaded successfully',
                error_code: 'success',
                data: null
            })
            return
        }
    })
}

module.exports = uploadAvatarService