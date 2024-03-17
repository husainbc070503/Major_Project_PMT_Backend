const ErrorHandler = (err, req, res, next) => {
    const status = err.status || 400;
    const message = err.message || 'BACKEND ERROR';

    return res.status(status).json({ message });
}

module.exports = ErrorHandler;