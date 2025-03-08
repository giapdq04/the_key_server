require('dotenv').config();

const express = require('express')
const morgan = require('morgan')
const session = require('express-session')
const { engine } = require('express-handlebars');
const path = require("path");
const methodOverride = require('method-override')
const hbsHelpers = require('./helpers/handlebars');
const app = express()
const port = 3000

const route = require('./routes')
const db = require('./config/db')

// Connect to DB
db.connect()

// Add session middleware before routes
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}))

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

// Add user to response locals
app.use((req, res, next) => {
    res.locals.user = req.session?.user || null;
    next();
});

// HTTP logger
app.use(morgan('combined'))



// Template engine
app.engine('hbs', engine({
    extname: '.hbs',
    helpers: hbsHelpers
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

route(app)

app.listen(port, () => {
    console.log(`Listening on port ${port}: http://localhost:3000/`)
})