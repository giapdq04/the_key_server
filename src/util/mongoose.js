
const multipleMongooseObject = (mongooses) => {
    return mongooses.map(mongoose => mongoose.toObject());
}

const mongooseToObject = (mongoose) => {
    return mongoose ? mongoose.toObject() : mongoose
}

module.exports = {
    multipleMongooseObject,
    mongooseToObject
}