const express = require("express");
const path = require("path");
require("dotenv").config();

const xssRouter = require("./routes/xss");
const sensitiveInfoRouter = require("./routes/sensitive-info");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));

app.use("/ranjivosti/xss", xssRouter);
app.use("/ranjivosti/sensitive-info", sensitiveInfoRouter);

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aplikacija radi na portu ${PORT}`);
});
