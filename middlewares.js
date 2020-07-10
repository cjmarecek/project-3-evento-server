const jwt = require('jsonwebtoken');

const checkAuth = (req,  res, next) => {
  try {
    let token ;
    if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found');
    return res.status(403).json({ error: 'Unauthorized.' });
  }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    console.log(decodedToken)
    req.user = decodedToken;
    next();
} catch (error) {
    return res.status(401).json({
        message: 'Auth failed'
    });
}
}

// not found, general one middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// error middleware, for any other error there
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? 'developement' : error.stack,
  });
};



module.exports = {
  notFound,
  errorHandler,
  checkAuth
};
