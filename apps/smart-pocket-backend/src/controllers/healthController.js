class HealthController {
  constructor() {
    this.name = 'HealthController';
  }

  check(req, res) {
    res.status(200).json({
      success: true,
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = HealthController;
