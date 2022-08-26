const path = require('path')
const showAvatarService = async (req, res) => {
    const userId = req.params.userId
    const avatarPicPath = path.join(__dirname, `../${process.env.MULTER_TARGET_PATH}/${userId}.jpg`)
    res.sendFile(avatarPicPath)
}

module.exports = showAvatarService;

