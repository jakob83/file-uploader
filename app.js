const express = require('express');
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('./generated/prisma');
const loginRouter = require('./routes/loginRouter');
const signUpRouter = require('./routes/signUpRouter');
const userRouter = require('./routes/userRouter');
const path = require('path');
const passport = require('passport');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware to use ejs for rendering views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Setup Prisma Session Store
app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: 'a santa at nasa',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

// setup passport
app.use(passport.session());
require('./passport-config/passport-config');

// Routes
app.use('/login', loginRouter);
app.use('/sign-up', signUpRouter);
app.use('/', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
