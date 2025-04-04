const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 20000, // Tăng thời gian chờ lên 20 giây
            socketTimeoutMS: 45000, // Tăng thời gian chờ socket
        });

        // Drop the existing slug index from sections collection
        const collections = await mongoose.connection.db.listCollections().toArray();
        const sectionsExists = collections.some(col => col.name === 'sections');

        if (sectionsExists) {
            await mongoose.connection.db.collection('sections').dropIndex('slug_1')
                .catch(() => {
                    console.log('No slug index to drop');
                });
        }

        console.log('Connect successfully');
    } catch (error) {
        console.log('Connect fail:', error.message);
        // Thử kết nối lại sau một khoảng thời gian
        setTimeout(() => connect(), 5000);
    }
}

module.exports = { connect };