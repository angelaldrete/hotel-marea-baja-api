const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const authMiddleware = require('../middleware/authMiddleware')

router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find()
    res.send(users)
  } catch (err) {
    console.error(err)
  }
})

router.get('/me', authMiddleware, (req, res) => {
  if (req.user) {
    return res.send(req.user)
  } else {
    return res.sendStatus(401)
  }
})

router.post('/register', async (req, res) => {

  // Check if user already exists
  const userExists = await User.findOne({ email: req.body.email })

  if (userExists) {
    return res.send({
      success: false,
      message: 'User already exists'
    })
  }

  // Password hashing
  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(req.body.password, salt)

  // Geberating the user
  const user = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    password: hashPassword
  })

  try {

    // Creating the user
    const savedUser = await User.create(user)
    res.send(savedUser)
  } catch (err) {

    console.log(err)
    // Error creating the user
    res.status(400).send(err)
  }
})

router.post('/login', async (req, res) => {
  try {

    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.send({
        success: false,
        message: 'User does not exist'
      })
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password)

    if (!validPassword) {
      return res.send({
        success: false,
        message: 'Invalid password'
      })
    }

    const accessToken = jwt.sign(user.toJSON(), process.env.TOKEN_SECRET)

    res.send({
      success: true,
      accessToken
    })
  } catch (err) {
    console.error(err)
  }
})

router.put('/username/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id
    const username = req.body.username

    const user = await User.findByIdAndUpdate(id, { fullName: username }, { new: true })

    res.send(user)

  } catch (err) {
    console.error(err.stack)
  }
})

router.put('/password/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id
    const pass = req.body.password

    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(pass, salt)

    const user = await User.findByIdAndUpdate(id, { password: hashPassword }, { new: true })

    res.send(user)

  } catch (err) {
    console.error(err.stack)
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {

    const id = req.params.id
    const user = await User.findByIdAndDelete(id)

    res.send(user)

  } catch (err) {
    console.error(err.stack)
  }
})

router.get('/:name', authMiddleware, async (req, res) => {
  try {
    const name = req.params.name
    // find user like
    const user = await User.find({ fullName: { $regex: name, $options: 'i' } })

    res.send(user)
  } catch (err) {
    console.error(err)
  }
})

module.exports = router