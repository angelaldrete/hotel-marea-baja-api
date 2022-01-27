const router = require('express').Router()

const Reservation = require('../models/Reservation')

const authMiddleware = require('../middleware/authMiddleware')

router.get('/', authMiddleware, async (req, res) => {
  try {
    const reservations = await Reservation.find()
    res.send(reservations)
  } catch {
    console.error(err)
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
    res.send(reservation)
  } catch (err) {
    console.error(err)
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {

    // see if reservation doesn't exist
    const existingReservation = await Reservation.findOne({
      $and: [
        { dateOfArrival: { $lte: req.body.dateOfArrival } },
        { dateOfDeparture: { $gte: req.body.dateOfArrival } }
      ]

    })

    if (existingReservation) {
      return res.send({
        success: false,
        message: 'Reservation already exists'
      })
    }

    console.log(req.body)

    const reservation = new Reservation({
      name: req.body.name,
      dateOfArrival: req.body.dateOfArrival,
      dateOfDeparture: req.body.dateOfDeparture,
      checkIn: req.body.checkInTime,
      checkOut: req.body.checkOutTime,
      nightlyRate: req.body.nightlyRate,
      totalPrice: req.body.totalPrice,
      deposit: req.body.deposit,
      confirmationNumber: req.body.confirmationNumber,
      user: req.user,
      rooms: req.body.rooms,
      people: req.body.peopleQty,
      occupiedRooms: req.body.occupiedRooms
    })

    await reservation.save()
    res.send(reservation)

  } catch (err) {
    console.error(err)
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    })
    res.send(reservation)
  } catch {
    console.error(err)
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id)
    res.send(reservation)
  } catch {
    console.error(err)
  }
})

module.exports = router