require('dotenv').config();

const express = require('express')
const morgan = require('morgan')
const session = require('express-session')
const { engine } = require('express-handlebars');
const path = require("path");
const methodOverride = require('method-override')
const helmet = require('helmet')
const cors = require('cors') // Thêm dòng này
const hbsHelpers = require('./helpers/handlebars');
const app = express()
const port = 8080

const route = require('./routes')
const db = require('./config/db')

// Connect to DB
db.connect()

// Thêm middleware CORS
app.use(cors({
    origin: 'http://localhost:3000', // Chỉ cho phép từ nguồn này truy cập API của bạn
    credentials: true, // Cho phép gửi cookies qua CORS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Thêm middleware bảo mật helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://ajax.googleapis.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: [
                "'self'", 
                "data:", 
                "https://img.youtube.com", 
                "https://*.ytimg.com", 
                "https://res.cloudinary.com"
            ],
            frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com"],
            connectSrc: ["'self'"]
        }
    },
    xssFilter: true,
    noSniff: true
}));

// thêm session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: 'lax'
    }
}))

// Static file
app.use(express.static(path.join(__dirname, 'public')))

//body parser
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())

// Method override
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
    console.log(`Listening on port ${port}: http://localhost:${port}/`)
})