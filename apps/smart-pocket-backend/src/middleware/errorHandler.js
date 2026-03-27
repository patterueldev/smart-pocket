const logger = require('../utils/logger');

class ErrorHandler {
  handle(err, req, res, next) {
    logger.error('Request error', err);

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
      success: false,
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
}

module.exports = new ErrorHandler();
