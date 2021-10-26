/**
 * Setting up the microservice server.
 * @author dassiorleando
 */
const dotenvResult = require("dotenv").config();
const app = require("./app");
const http = require("http");
const config = require("./config");

if (dotenvResult.error) {
  process.exit(1);
}

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Get port from environment and store in Express.
 */
const port = config.PORT;
app.set("port", port);
app.set("trust proxy", true);

/**
 * Listen on provided port, on all network interfaces.
 * @param {number} port the port to run the project on
 * @returns {void}
 */
server.listen(port, function () {
  console.log(`server is listening on PORT:${port}`);
});
