const createError = require('http-errors');
const express = require('express');
const { join } = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connectDB = require('./db');
const handleErrors = require('./middleware/handleErrors');

const universityRouter = require('./routes/universities');
const userRouter = require('./routes/user');
const uploadRouter = require('./routes/upload');
const profileRouter = require('./routes/profile');
const authRouter = require('./routes/auth');
const forumRouter = require('./routes/forum');

const { json, urlencoded } = express;

var app = express();

//Connect to MongoDB
connectDB();

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, '../client/build')));

app.use('/auth', authRouter);
app.use('/universities', universityRouter);
app.use('/user', userRouter);
app.use('/profile', profileRouter);
app.use('/upload', uploadRouter);
app.use('/forum', forumRouter);

app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.use(handleErrors);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({ error: err });
});

module.exports = app;
