const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  name: String,
  dateOfArrival: String,
  dateOfDeparture: String,
  checkIn: String,
  checkOut: String,
  nightlyRate: Number,
  totalPrice: Number,
  deposit: Number,
  confirmationNumber: Number,
  user: Object,
  rooms: Number,
  people: Number,
  occupiedRooms: Array,
});

module.exports = mongoose.model("Reservation", reservationSchema);
