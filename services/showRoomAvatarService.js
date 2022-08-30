const path = require('path')
const showRoomAvatarService = async (req, res) => {
    const roomId = req.params.roomId
    const avatarPicPath = path.join(__dirname, `../${process.env.MULTER_ROOM_TARGET_PATH}/${roomId}.jpg`)
    res.sendFile(avatarPicPath)
}

module.exports = showRoomAvatarService;