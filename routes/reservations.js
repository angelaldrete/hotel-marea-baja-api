const router = require("express").Router();

const Reservation = require("../models/Reservation");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.send(reservations);
  } catch (err) {
    console.error(err);
  }
});

router.get("/:month/:year", authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.params;
    let reservations = await Reservation.find();

    reservations = reservations.filter(
      (reservation) =>
        new Date(reservation.dateOfArrival).getMonth() + 1 ===
          parseInt(month) &&
        new Date(reservation.dateOfArrival).getFullYear() === parseInt(year) &&
        new Date(reservation.dateOfDeparture).getMonth() + 1 ===
          parseInt(month) &&
        new Date(reservation.dateOfDeparture).getFullYear() === parseInt(year)
    );

    console.log(reservations);
    res.send(reservations);
  } catch (err) {
    console.error(err);
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    res.send(reservation);
  } catch (err) {
    console.error(err);
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    // see if reservation doesn't exist
    const reservationExists = await Reservation.findOne({
      name: req.body.name,
    });

    if (reservationExists) {
      return res.send({
        success: false,
        message: "Reservation already exists",
      });
    }

    console.log(req.body.occupiedRooms);

    const reservation = new Reservation({
      name: req.body.name,
      rooms: req.body.rooms,
      dateOfArrival: req.body.dateOfArrival,
      dateOfDeparture: req.body.dateOfDeparture,
      occupiedRooms: req.body.occupiedRooms,
      people: req.body.peopleQty,
      checkIn: req.body.checkInTime,
      checkOut: req.body.checkOutTime,
      nightlyRate: req.body.nightlyRate,
      totalPrice: req.body.totalPrice,
      deposit: req.body.deposit,
      confirmationNumber: req.body.confirmationNumber,
      user: req.user,
    });

    await reservation.save();
    res.send(reservation);
  } catch (err) {
    console.error(err);
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.send(reservation);
  } catch (err) {
    console.error(err);
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    res.send(reservation);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
