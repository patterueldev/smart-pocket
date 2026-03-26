'use strict'

const { service } = require('./actual-service')

service.init()

// testing the session retention: store some data and update everytime the function is called
var sessionData = {
  count: 0,
  lastCalled: null,
  timestamp: new Date().toISOString(),
  state: service.state
}

module.exports = async (event, context) => {
  // Two things this function does:
  // - /draft - creates a draft syncables
  // - /sync - accepts draft syncable and updates records
  // both should be method POST; draft doesn't need body; sync only needs draftId

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

  if (event.method !== 'POST') {
    return context
      .status(405)
      .succeed({ error: 'Method not allowed', sessionData })
  }

  switch (event.path) {
    case '/draft':
      return context
        .status(501)
        .succeed({ message: 'Not implemented yet', sessionData })
    case '/sync':
      return context
        .status(501)
        .succeed({ message: 'Not implemented yet', sessionData })
    default:
      return context
        .status(404)
        .succeed({ error: 'Not found' })
  }
}
