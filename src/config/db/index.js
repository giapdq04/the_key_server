const mongoose = require('mongoose');


async function connect() {
    try {
        await mongoose.connect('mongodb+srv://giapdqph34273:sf7pdIYAvFqwDlje@testmongodb.3f1oxwh.mongodb.net/TheKey_dev');
        console.log('Connect successfully');
    } catch (error) {
        console.log('Connect fail');
    }
} module.exports = { connect }