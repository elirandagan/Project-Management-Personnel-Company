const express = require("express");
const app_port = process.env.PORT || 3000;
const app = express();
const router = express.Router();

app.set("view engine", "ejs");

app.use(express.static("public"));

router.get("/", function (req, res) {
  res.status(200).render("login");
});

router.get("/typography", function (req, res) {
  res.status(200).render("typography");
});

router.get("/notifications", function (req, res) {
  res.status(200).render("notifications");
});

router.get("/template", function (req, res) {
  res.status(200).render("template");
});

router.get("/icons", function (req, res) {
  res.status(200).render("icons");
});

router.get("/tables", function (req, res) {
  res.status(200).render("tables");
});

router.get("/user", function (req, res) {
  res.status(200).render("user");
});

router.get("/map", function (req, res) {
  res.status(200).render("map");
});

router.get("/dashboard", function (req, res) {
  res.status(200).render("dashboard");
});

//add the router
app.use("/", router);
module.exports = app.listen(app_port);

console.log(`app is running. port: ${app_port}`);
console.log(`http://127.0.0.1:${app_port}/`);
