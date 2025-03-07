const mongoose = require('mongoose');


async function connect() {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log('Connect successfully');
    } catch (error) {
        console.log('Connect fail');
    }
} module.exports = { connect }