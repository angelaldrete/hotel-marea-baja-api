if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

require("./config/db");

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

// Setup
const PORT = process.env.PORT || 3000;
const UI_URI = process.env.UI_URI || "http://localhost:8080";

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: UI_URI, credentials: true }));

const userRoutes = require("./routes/users");
const reservationRoutes = require("./routes/reservations");

const Reservation = require("./models/Reservation");
const authMiddleware = require("./middleware/authMiddleware");

// Routes
app.get("/", (req, res) => res.send("Ok!"));
app.use("/api/users", userRoutes);
app.use("/api/reservations", reservationRoutes);
app.get("/api/confirmation", authMiddleware, async (req, res) => {
  try {
    let confirmationNumber = Math.floor(Math.random() * 10000000);

    const existingConfirmationNumber = await Reservation.findOne({
      confirmationNumber,
    });

    if (existingConfirmationNumber) {
      while (confirmationNumber == existingConfirmationNumber) {
        confirmationNumber = Math.floor(Math.random() * 10000000);
      }
    }

    res.send({ confirmationNumber });
  } catch (err) {
    console.error(err.stack);
  }
});
app.get(
  "/api/available_rooms/:dateOfArrival/:dateOfDeparture",
  authMiddleware,
  async (req, res) => {
    try {
      const dateOfArrival = req.params.dateOfArrival;
      const dateOfDeparture = req.params.dateOfDeparture;

      // Find reservations that overlap with the dates of arrival and departure
      const reservations = await Reservation.find({
        $and: [
          { dateOfArrival: { $lte: dateOfArrival } },
          { dateOfDeparture: { $gte: dateOfDeparture } },
        ],
      });

      const occupiedRooms = reservations.map((reservation) => {
        return reservation.occupiedRooms;
      });

      console.log(occupiedRooms);

      res.send(occupiedRooms);
    } catch (err) {
      console.error(err.stack);
    }
  }
);

// Health Check
app.get("/", (req, res) => res.sendStatus(200));

// Entry point
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));