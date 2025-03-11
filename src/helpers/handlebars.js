module.exports = {
    sum: (a, b) => a + b,

    isActive: function (path) {
        return path === this.req.originalUrl ? 'active' : '';
    },

    concat: function (...args) {
        args.pop(); // Remove handlebars options object
        return args.join('');
    },

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

        if (lesson.docLink !== '' && lesson.docLink !== null) {
            return '<i class="bi bi-file-earmark-text me-1"></i>'
        }

        return '<i class="bi bi-pencil-square me-1"></i>'
    }
};