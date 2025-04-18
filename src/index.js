require('dotenv').config({ path: '.env' })
const path = require("path");

const environment = process.env.NODE_ENV;
const envPath = path.resolve(process.cwd(), `.env.${environment}`);
require('dotenv').config({ path: envPath });

const express = require('express')
// const morgan = require('morgan')
const session = require('express-session')
const { engine } = require('express-handlebars');
const methodOverride = require('method-override')
const helmet = require('helmet')
const cors = require('cors')
const hbsHelpers = require('./helpers/handlebars');
const MongoStore = require('connect-mongo');
const app = express()
const port = process.env.PORT || 8080

const route = require('./routes')
const db = require('./config/db')
const configureSocket = require('./config/socket')

// Connect to DB
db.connect()

// Khởi tạo HTTP server
const server = require('http').createServer(app);

// Khởi tạo Socket.IO với CORS
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.WEB_CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Cấu hình Socket.IO
const socketMaps = configureSocket(io);

// Thêm middleware CORS
app.use(cors({
    origin: process.env.WEB_CLIENT_URL, // Chỉ cho phép từ nguồn này truy cập API của bạn
    credentials: true, // Cho phép gửi cookies qua CORS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Thêm middleware bảo mật helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://ajax.googleapis.com","https://static.cloudflareinsights.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: [
                "'self'", 
                "data:", 
                "https://img.youtube.com", 
                "https://*.ytimg.com", 
                "https://res.cloudinary.com",
                "https://lh3.googleusercontent.com"
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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // Sử dụng chuỗi kết nối MongoDB đang có
        ttl: 24 * 60 * 60, // Thời gian sống của phiên (giây)
        autoRemove: 'native',
        collectionName: 'sessions'
    }),
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000, // 24 giờ
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
// app.use(morgan('combined'))

// Template engine
app.engine('hbs', engine({
    extname: '.hbs',
    helpers: hbsHelpers
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

route(app)

// Thay đổi app.listen thành server.listen
server.listen(port, () => {
    console.log(`Listening on port ${port}: http://localhost:${port}/`)
})