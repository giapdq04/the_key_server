module.exports = {
    // tính tổng
    sum: (a, b) => a + b,

    // sử dụng trong main layout để thêm class active cho menu
    isActive: function (path) {
        return path === this.req.originalUrl ? 'active' : '';
    },

    // nối chuỗi (minimal layout)
    concat: function (...args) {
        args.pop();
        return args.join('');
    },

    // so sánh 2 giá trị bằng nhau
    eq: function (a, b) {
        return a === b;
    },

    ne: function (a, b) {
        return a !== b;
    },

    gt: function (a, b) {
        return a > b;
    },

    or: function () {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },

    // Chuyển đổi định dạng ngày tháng
    formatDate: function (date) {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    },

    lessonTypeIcon: function (lesson) {
        if (lesson.ytbVideoID !== null) {
            return '<i class="bi bi-play-circle me-2"></i>';
        }

        if (lesson.docID !== null) {
            return '<i class="bi bi-file-earmark-text me-1"></i>'
        }

        return '<i class="bi bi-pencil-square me-1"></i>'
    },

    // Helper cho phân trang
    // phép trừ
    subtract: function (a, b) {
        return a - b;
    },

    // Tạo số thứ tự cho các phần tử trong danh sách (user.hbs)
    times: function (n, block) {
        let accum = '';
        for (let i = 1; i <= n; ++i)
            accum += block.fn(i);
        return accum;
    },

    // Chuyển đổi giá trị null thành 0
    checkNull: function (value) {
        return value !== null
    }
};