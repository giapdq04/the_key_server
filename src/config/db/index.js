const mongoose = require('mongoose');


async function connect() {
    try {
        await mongoose.connect('mongodb+srv://quanggiap04:hI2lG7JXlyevkz13@cluster0.erwyc.mongodb.net/TheKey_dev');
        console.log('Connect successfully');
    } catch (error) {
        console.log('Connect fail');
    }
} module.exports = { connect }