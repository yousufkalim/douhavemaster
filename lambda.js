"use strict";

/**
 * AWS Lambda handler.
 * @author dassiorleando
 */
const app = require("./app");
const serverless = require("serverless-http");

const binary = [
  "application/octet-stream",
  "application/x-font-ttf",
  "font/eot",
  "font/opentype",
  "font/otf",
  "font/ttf",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
];

// Serverless handler
const handle = serverless(app, { binary });

/**
 * The Lambda handler is required to run the App on AWS Lambda
 * @param {Object} event the event starting the function (the request)
 * @param {Object} context the context
 * @returns {void}
 */
exports.handler = (event, context, callback) => {
  // Don't wait the event loop to be empty to return the callback: mongoose/redis pool
  context.callbackWaitsForEmptyEventLoop = false;

  const eventName = event.name + "";
  if (eventName.indexOf("LAMBDA_WARMER") !== -1) {
    context.succeed({ success: true });
  } else {
    return handle(event, context, callback);
  }
};
