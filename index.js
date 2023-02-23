const express = require("express");
const UserModel = require("./Model/user.model");
const Flight = require("./Model/flight.model");
const Booking = require("./Model/booking.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = express();
const blacklist = [
  " eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Bf4l71697do8L4ILvbhENHTVIQEoWT09z4r_4_Gd4zY",
];
app.use(express.json());
app.get("/", (req, res) => {
  res.send("hello");
});
app.get("/user/:userid", async (req, res) => {
  const id = req.params.userid;
  console.log(id);
  const token = req.headers["authorization"];
  if (!token) {
    return res.send("unauth");
  }
  if (blacklist.includes(token)) {
    return res.send("token is already expire");
  }
  try {
    const verification = jwt.verify(token, "MONISH123");

    if (verification) {
      const user = await UserModel.findOne({ _id: id });
      return res.send(user);
    }
  } catch (e) {
    if (e.message == "jwt expired") {
      blacklist.push(token);
    }
    return res.send(e.message);
  }
  const user = await UserModel.findOne({ _id: id });
  return res.send(user);
});
app.post("/api/login", async (req, res) => {
  const { email, pass } = req.body;
  const user = await UserModel.findOne({ email, pass });
  if (user) {
    return res.send({
      mess: "LOGIN SUCCESS",
    });
  } else res.status(401).send("Invalid credentails");
});
app.post("/api/resgister", async (req, res) => {
  const { name, email, pass } = req.body;

  try {
    const user = new UserModel({
      name,
      email,
      pass,
    });
    await user.save();
    return res
      .status(201)
      .send("User created SuccessesFully");
  } catch (e) {
    return res.send(e.message);
  }
});
app.get("/api/flights", (req, res) => {
  Flight.find({}, (err, flights) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .send("An error occurred while retrieving flights");
    } else {
      res.status(200).send(flights);
    }
  });
});
app.get("/api/flights/:id", (req, res) => {
  Flight.findById(req.params.id, (err, flight) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .send(
          "An error occurred while retrieving the flight"
        );
    } else if (!flight) {
      res.status(404).send("Flight not found");
    } else {
      res.status(200).send(flight);
    }
  });
});

app.post("/api/flights", (req, res) => {
  const {
    airline,
    flightNo,
    departure,
    arrival,
    departureTime,
    arrivalTime,
    seats,
    price,
  } = req.body;

  const flight = new Flight({
    airline,
    flightNo,
    departure,
    arrival,
    departureTime,
    arrivalTime,
    seats,
    price,
  });

  flight.save((err, flight) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .send(
          "An error occurred while creating the flight"
        );
    } else {
      res.status(201).send(flight);
    }
  });
});
app.put("/api/flights/:id", (req, res) => {
  Flight.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    (err, flight) => {
      if (err) {
        console.error(err);
        res
          .status(500)
          .send(
            "An error occurred while updating the flight"
          );
      } else if (!flight) {
        res.status(404).send("Flight not found");
      } else {
        res.sendStatus(204);
      }
    }
  );
});
app.delete("/api/flights/:id", (req, res) => {
  Flight.findByIdAndDelete(req.params.id, (err, flight) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .send(
          "An error occurred while deleting the flight"
        );
    } else if (!flight) {
      res.status(404).send("Flight not found");
    } else {
      res.sendStatus(202);
    }
  });
});
app.post("/api/booking", (req, res) => {
  const { userId, flightId } = req.body;

  Flight.findById(flightId, (err, flight) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .send("An error occurred while booking the flight");
    } else if (!flight) {
      res.status(404).send("Flight not found");
    } else if (flight.seats <= 0) {
      res.status(400).send("Flight is fully booked");
    } else {
      const booking = new Booking({
        user: userId,
        flight: flightId,
        price: flight.price,
      });

      booking.save((err, booking) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .send(
              "An error occurred while booking the flight"
            );
        } else {
          flight.seats--;
          flight.save((err) => {
            if (err) {
              console.error(err);
              res
                .status(500)
                .send(
                  "An error occurred while booking the flight"
                );
            } else {
              res.status(201).send(booking);
            }
          });
        }
      });
    }
  });
});
app.get("/dashboard", (req, res) => {
  Booking.find()
    .populate("user")
    .populate("flight")
    .exec((err, bookings) => {
      if (err) {
        console.error(err);
        res
          .status(500)
          .send(
            "An error occurred while getting the bookings"
          );
      } else {
        res.send(bookings);
      }
    });
});
mongoose
  .connect(
    "mongodb+srv://mohdmonish:123@cluster0.lm1amsh.mongodb.net/mock-10"
  )
  .then(() => {
    app.listen(8080, () => {
      console.log("server started on port 8080");
    });
  });
