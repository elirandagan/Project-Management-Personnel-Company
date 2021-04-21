const express = require("express");
const bodyParser = require("body-parser");
const app_port = process.env.PORT || 3000;
const app = express();
const router = express.Router();

const HR_Users_Collection = require("./model/HR_users.js")

//const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose")
const uri = "mongodb+srv://EliranDagan123:dagan123@cluster0.aszt8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));



app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// HOW TO "GET" FROM COLLECTION
router.get("/", function (req, res) {
    console.log("Login")

    const lior = HR_Users_Collection.find({firstName:"Lior"})

    lior.then(function(res){
        console.log(res)
    })


    console.log("succed")

    res.status(200).render("login");
});

router.get("/template", function (req, res) {
    res.status(200).render("template");
});


router.get("/workHistory", function (req, res) {
    res.status(200).render("workHistory");
});

router.get("/shifts", function (req, res) {
    res.status(200).render("shifts");
});

router.get("/absences", function (req, res) {
    res.status(200).render("absences");
});

router.get("/recruit", function (req, res) {
    console.log("recruit")
    HR_Users_Collection.find({firstName: "Lior"}).toArray(function (err, result) {
        if (err) {
            console.log(err);
        } else {
            // console.log(JSON.stringify(result));
            console.log(result);
            res.status(200).render("recruit", {data: result});
        }
    })
    console.log("succed")
});

router.get("/trackingWorkers", function (req, res) {
    res.status(200).render("trackingWorkers");
});

router.get("/statistics", function (req, res) {
    res.status(200).render("statistics");
});

router.get("/searchWorker", function (req, res) {
    res.status(200).render("searchWorker");
});

router.get("/hiringHistory", function (req, res) {
    res.status(200).render("hiringHistory");
});

router.get("/user", function (req, res) {
    res.status(200).render("user");
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


module.exports = app.listen(app_port);
console.log(`app is running. port: ${app_port}`);
console.log(`http://127.0.0.1:${app_port}/`);
