const jwt = require('jsonwebtoken')

module.exports = authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(401)
    const usr = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    }
    req.user = usr
    next()
  })
}