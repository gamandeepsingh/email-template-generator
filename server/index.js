const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const port = process.env.PORT || 3000;

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/templates", require("./routes/route"));

app.get("/", (req, res) => {
  res.send("Welcome to the Emaily API!");
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
