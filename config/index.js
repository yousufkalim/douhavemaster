/**
 * Config file depending on the env vars
 * @author dassiorleando
 */
module.exports = {
  ENV: process.env.NODE_ENV || "dev",
  PORT: process.env.PORT || "5000",

  APP_LINK:
    process.env.NODE_ENV !== "prod"
      ? "http://localhost:5000"
      : "https://www.douhave.co",

  // The JWT secret key
  JWT_KEY: process.env.JWT_KEY,

  // Google re-captcha secret key
  RECAPTCHA_SECRET: process.env.RECAPTCHA_SECRET,

  // AWS credentials
  AWS_ACCESS_KEY:
    process.env.DOUHAVE_AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY:
    process.env.DOUHAVE_AWS_SECRET_KEY || process.env.AWS_SECRET_KEY,

  // Redis credentials
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_AUTH: process.env.REDIS_AUTH,

  // Mailchimp API key for mailing list integration on registration.
  MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,

  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/dave_list",

  // Dynamo DB table name
  USER_SOCKETS_TABLE:
    process.env.NODE_ENV !== "prod"
      ? "DoUHaveSocketsUsersDev"
      : "DoUHaveSocketsUsersProd",
  USER_ROOMS_TABLE:
    process.env.NODE_ENV !== "prod" ? "DoUHaveRoomsDev" : "DoUHaveRoomsProd",
  USER_MESSAGES_TABLE:
    process.env.NODE_ENV !== "prod"
      ? "DoUHaveMessagesDev"
      : "DoUHaveMessagesProd",
  ROOM_LAST_MESSAGES_TABLE:
    process.env.NODE_ENV !== "prod"
      ? "DoUHaveLastMessagesDev"
      : "DoUHaveLastMessagesProd",
};
