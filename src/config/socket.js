const User = require('../app/models/User');

function configureSocket(io) {
    // Lưu trữ mapping giữa userId và socketId
    const userSocketMap = new Map();
    const socketUserMap = new Map();

    io.on('connection', async (socket) => {
        console.log('User connected:', socket.id);

        // Xử lý khi người dùng đăng nhập
        socket.on('user:login', async (userId) => {
            try {
                console.log('-------------------');

                console.log('user:login', userId);

                // Cập nhật trạng thái người dùng thành active
                await User.findByIdAndUpdate(userId, { status: 'active', lastLogin: new Date() }, { new: true });

                // Lưu mapping
                userSocketMap.set(userId, socket.id);
                socketUserMap.set(socket.id, userId);
            } catch (error) {
                console.error('Error updating user status:', error);
            }
        });

        // Xử lý khi người dùng ngắt kết nối
        socket.on('disconnect', async () => {
            try {
                console.log('User disconnected:', socket.id);

                const userId = socketUserMap.get(socket.id);
                if (userId) {
                    // Cập nhật trạng thái người dùng thành inactive
                    await User.findByIdAndUpdate(userId, { status: 'inactive' });

                    // Xóa mapping
                    userSocketMap.delete(userId);
                    socketUserMap.delete(socket.id);

                    console.log('Cập nhật trạng thái người dùng thành inactive:', userId);

                }
            } catch (error) {
                console.error('Error updating user status on disconnect:', error);
            }
        });
    });

    return {
        userSocketMap,
        socketUserMap
    };
}

module.exports = configureSocket;
