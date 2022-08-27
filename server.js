const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
require("dotenv").config();

//SOCKET
const server = require("http").createServer(app);
const io = require("socket.io")(server);

io.on("connection", () => {
  console.log("An user is connected");
});

//DB
const mongoose = require("mongoose");
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const dbUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@ensa.v7ahg.mongodb.net/?retryWrites=true&w=majority`;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("Error:", err);
  });

//MODEL
const Message = mongoose.model("message", { name: String, message: String });

//ROUTE
app.get("/messages", (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});

app.post("/messages", (req, res) => {
  const message = new Message(req.body);
  console.log(message);
  message
    .save(message)
    .then((data) => {
      io.emit("message", req.body);
      res.send(data);
      console.log("Message saved!");
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Article.",
      });
    });
});

//STATIC FILE
app.use(express.static(__dirname));

//PORT
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
