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

    lt: function (a, b) {
        return a < b;
    },

    gt: function (a, b) {
        return a > b;
    },

    and: function () {
        return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
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

    toString: function (value) {
        return value ? value.toString() : '';
    }
};