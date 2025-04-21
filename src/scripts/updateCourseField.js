const mongoose = require('mongoose');
const Course = require('../app/models/Course');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.development') });

async function updateCoursesWithNewFields() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        // Tìm tất cả courses
        const courses = await Course.find({}).lean();
        console.log(`Found ${courses.length} courses to update`);
        
        // Cập nhật từng course
        let updatedCount = 0;
        
        for (const course of courses) {
            const updates = {};
            
            // Kiểm tra và thêm các trường mới nếu chúng không tồn tại
            if (course.isPremium === undefined) updates.isPremium = false;
            if (course.price === undefined) updates.price = 0;
            if (course.salePrice === undefined) updates.salePrice = 0;
            if (course.isActive === undefined) updates.isActive = true;
            
            // Chỉ cập nhật nếu có trường nào đó cần cập nhật
            if (Object.keys(updates).length > 0) {
                await Course.updateOne({ _id: course._id }, { $set: updates });
                updatedCount++;
                console.log(`Updated course: ${course.title}`);
            }
        }
        
        console.log(`Updated ${updatedCount} courses with new fields`);
    } catch (error) {
        console.error('Error updating courses:', error);
    } finally {
        // Đóng kết nối
        await mongoose.connection.close();
        console.log('Connection to MongoDB closed');
    }
}

// Chạy hàm
updateCoursesWithNewFields();