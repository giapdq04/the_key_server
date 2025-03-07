const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.DATABASE);

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
        console.log('Connect fail');
    }
}

module.exports = { connect };