require('dotenv').config()
require('./config/db')

const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

// Setup
const PORT = process.env.PORT || 3000
const UI_URI = process.env.UI_URI || 'http://localhost:3000'

// Middleware
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: UI_URI, credentials: true }))

const userRoutes = require('./routes/users')
const reservationRoutes = require('./routes/reservations')

const Reservation = require('./models/reservation')
const authMiddleware = require('./middleware/authMiddleware')

// Routes
app.use('/api/users', userRoutes)
app.use('/api/reservations', reservationRoutes)
app.get('/api/confirmation', authMiddleware, async (req, res) => {
  try {
    let confirmationNumber = Math.floor(Math.random() * 10000000);

    const existingConfirmationNumber = await Reservation.findOne({ confirmationNumber })

    if (existingConfirmationNumber) {
      while (confirmationNumber == existingConfirmationNumber) {
        confirmationNumber = Math.floor(Math.random() * 10000000);
      }
    }

    res.send({ confirmationNumber })

  } catch (err) {
    console.error(err.stack)
  }
})
app.get('/api/available_rooms/:dateOfArrival/:dateOfDeparture', authMiddleware, async (req, res) => {
  try {
    const dateOfArrival = req.params.dateOfArrival
    const dateOfDeparture = req.params.dateOfDeparture

    const reservations = await Reservation.find({
      $or: [
        {
          $and: [
            { dateOfArrival: { $lte: dateOfArrival } },
            { dateOfDeparture: { $gte: dateOfArrival } }
          ]
        },
        {
          $and: [
            { dateOfArrival: { $lte: dateOfDeparture } },
            { dateOfDeparture: { $gte: dateOfDeparture } }
          ]
        }
      ]
    })

    const occupiedRooms = reservations.map(reservation => reservation.occupiedRooms)
    const availableRooms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

    const availableRoomsArray = availableRooms.filter(room => {
      return !occupiedRooms.includes(room)
    })

    res.send(availableRoomsArray)

  } catch (err) {
    console.error(err.stack)
  }
})

// Health Check
app.get('/', (req, res) => res.sendStatus(200))

// Entry point
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))