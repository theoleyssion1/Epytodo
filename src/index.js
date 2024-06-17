require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const authRoute = require("./routes/auth");
const todosRoute = require("./routes/todos");
const userRoute = require("./routes/user");

app.use(express.json());

app.use("/", authRoute);
app.use("/", todosRoute);
app.use("/", userRoute);

app.listen(process.env.PORT, () => {
  console.log("Server is online hihi :)");
});
