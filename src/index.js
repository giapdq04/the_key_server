require('dotenv').config();

const express = require('express')
const morgan = require('morgan')
const { engine } = require('express-handlebars');
const path = require("path");
const methodOverride = require('method-override')
const app = express()
const port = 3000

const route = require('./routes')
const db = require('./config/db')

// Connect to DB
db.connect()

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())

app.use(methodOverride('_method'))

// Add request to response locals
app.use((req, res, next) => {
    res.locals.req = req;
    next();
});

// HTTP logger
app.use(morgan('combined'))

// Template engine
app.engine('hbs', engine({
    extname: '.hbs',
    helpers: {
        sum: (a, b) => a + b,
        isActive: function (path) {
            return path === this.req.originalUrl ? 'active' : '';
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

route(app)

app.listen(port, () => {
    console.log(`Listening on port ${port} http://localhost:3000/`)
})