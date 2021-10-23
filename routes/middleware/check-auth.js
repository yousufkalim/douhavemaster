/**
 * Security middleware built using JWT protocol
 * @author umair & dassiorleando
 */
const jwt = require('jsonwebtoken');
const Util = require('../../services/util');

/**
 * Checking the JWT token.
 * @param {boolean} force Force or not the JWT token check.
 */
module.exports.secure = (force = true) => {

  /**
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  const securing = (req, res, next) => {
    try {
      // Taking the last part (token string) of the authorization header in the form "Bearer token_string".
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (decoded) {
          req.user = decoded;
          next();
        } else {
          throw Error('Decoded token is invalid.');
        }
      } else {
        throw Error('No JWT token found.');
      }
    } catch (error) {
      if (!force) return next();

      // Returning back an error if the security is enforced
      Util.error(error);
      res.status(401).json({ success: false, message: 'Auth Failed.', error });
    }
  }

  return securing;
};
