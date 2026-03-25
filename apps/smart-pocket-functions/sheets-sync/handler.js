'use strict'

// Instantiate Services

module.exports = async (event, context) => {
  const result = {
    'body': JSON.stringify(event.body),
    'content-type': event.headers["content-type"],
    'some': 'value'
  }

  return context
    .status(200)
    .succeed(result)
}
