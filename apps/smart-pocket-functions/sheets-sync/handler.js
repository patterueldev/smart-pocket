'use strict'

const { service } = require('./actual-service')

service.init()

// Session retention: store data and update on each function call
var sessionData = {
  count: 0,
  lastCalled: null,
  timestamp: new Date().toISOString(),
  state: service.state
}

module.exports = async (event, context) => {
  /*
  Event Ref: 

  class FunctionEvent {
      constructor(req) {
          this.body = req.body;
          this.headers = req.headers;
          this.method = req.method;
          this.query = req.query;
          this.path = req.path;
      }
  }
  */

  sessionData.count += 1
  sessionData.lastCalled = event.timestamp
  sessionData.timestamp = new Date().toISOString()

  try {
    switch (event.method) {
      case 'GET':
        return await handleGet(event, context)

      case 'POST':
        return await handlePost(event, context)

      default:
        return context
          .status(405)
          .succeed({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Handler error:', error)
    return context
      .status(500)
      .succeed({
        error: 'Internal server error',
        message: error.message
      })
  }
}

/**
 * Handle GET requests
 * Root path (/) - Returns account balances from Actual Budget
 */
async function handleGet(event, context) {
  const { repository } = service

  try {
    // Fetch account balances from Actual Budget
    const balances = await repository.getAccountBalances()

    return context
      .status(200)
      .succeed({
        success: true,
        data: balances,
        meta: {
          count: balances.length,
          timestamp: new Date().toISOString(),
          sessionCount: sessionData.count
        }
      })
  } catch (error) {
    console.error('Error fetching account balances:', error)
    return context
      .status(500)
      .succeed({
        success: false,
        error: 'Failed to fetch account balances',
        message: error.message
      })
  }
}

/**
 * Handle POST requests
 * /draft - Create a draft syncable
 * /sync - Apply draft syncable and update records
 */
async function handlePost(event, context) {
  switch (event.path) {
    case '/':
    case '':
      // POST to root path not supported
      return context
        .status(400)
        .succeed({ error: 'POST to root requires path (/draft or /sync)' })

    case '/draft':
      return context
        .status(501)
        .succeed({ message: 'Not implemented yet' })

    case '/sync':
      return context
        .status(501)
        .succeed({ message: 'Not implemented yet' })

    default:
      return context
        .status(404)
        .succeed({ error: 'Not found' })
  }
}
