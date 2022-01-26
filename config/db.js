require('dotenv').config()

const mongoose = require('mongoose')

const DB_URI = process.env.DB_URI

const client = mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

module.exports = client