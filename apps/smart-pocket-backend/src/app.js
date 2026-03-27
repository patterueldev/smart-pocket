const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const config = require('./config/env');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(requestLogger);
  }

  setupRoutes() {
    this.app.use('/health', healthRoutes);

    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
      });
    });

    this.app.use((err, req, res, next) => {
      errorHandler.handle(err, req, res, next);
    });
  }

  getApp() {
    return this.app;
  }

  start() {
    const PORT = config.port;
    this.app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, { environment: config.nodeEnv });
    });
  }
}

module.exports = App;
