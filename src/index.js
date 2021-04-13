const express = require("express");
const bodyParser = require("body-parser");
const app_port = process.env.PORT || 3000;
const app = express();
const router = express.Router();

const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb+srv://EliranDagan123:dagan123@cluster0.aszt8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    console.log("Connected to Database")
    const db = client.db("GLEM-TECH")
    const HR_Users_Collection = db.collection("HR_Users")

    app.set("view engine", "ejs");

    app.use(express.static("public"));
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())

          // HOW TO "GET" FROM COLLECTION
    router.get("/", function (req, res) {
      console.log("Login")
      HR_Users_Collection.find({firstName:"Lior"}).toArray(function (err, result){
        if (err) {
          console.log(err);
      } else {
          console.log(JSON.stringify(result));
      }
      })
      console.log("succed")
      
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

    //DB Actions


              // HOW TO "POST" TO COLLECTION
    // router.post('/user', (req, res) => {
    //   UsersCollection.insertOne(req.body)
    //     .then(result => {
    //       // console.log(req.body)
    //       console.log(result)
    //       res.redirect('/dashboard')
    //     })
    //     .catch(error => console.error(error))
    // })

    // app.get('/', (req, res) => {
    //   const cursor = db.collection('Users').find().toArray()
    //   console.log(cursor)
    //   // console.log('succed')
    //   // 
    // })

    //add the router
    app.use("/", router);

  })
  .catch(error => console.error(error))

module.exports = app.listen(app_port);
console.log(`app is running. port: ${app_port}`);
console.log(`http://127.0.0.1:${app_port}/`);
