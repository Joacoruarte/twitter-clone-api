const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  let token = req.header('Authorization');

  if (token === undefined || token.substring(0, 7) !== 'Bearer ' || token.length < 7) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  token = token.substring(7);

  jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    req.context = { user_id: decodedToken.user_id }
    
    next();
  });

};

module.exports = authenticateToken;
