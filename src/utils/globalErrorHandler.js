import AppError from './AppError.js';
import { ERROR } from './reposnseStatus.js';

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicatedFieldDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = Object.values(err.keyValue)[0];
    const message = `Duplicated field: ${field} with value: ${value}. Please use another value!`;

    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    // Programming or other unkown error: don't leak error details
    else {
        //1) Log Error
        // eslint-disable-next-line no-console
        console.error('Error 🔥', err);

        //2) Send Error
        res.status(500).json({
            status: ERROR,
            message: 'Something went wrong',
        });
    }
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired. Please log in again!', 401);

export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || ERROR;
    console.log(err);
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        let error = { ...err, message: err.message };

        // There was a problem when i use error.name === 'CastError' it comes out that
        // err in mongoose doesn't have the property name but it inherits it from it's
        // prototype, so when we do (let error = {...err}) we got only the properties at err
        // you can do this too (let error = {...err, err.name})
        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (err.code === 11000) error = handleDuplicatedFieldDB(error);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(error, res);
    }
};
