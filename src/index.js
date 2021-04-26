const express = require("express");
const bodyParser = require("body-parser");
const app_port = process.env.PORT || 3000;
const app = express();
const router = express.Router();

const MongoClient = require("mongodb").MongoClient;
const { Timestamp } = require("bson");
const uri ="mongodb+srv://EliranDagan123:dagan123@cluster0.aszt8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

MongoClient.connect(uri, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to Database");
    const db = client.db("GLEM-TECH");

    // CREATING THE DB COLLECTIONS

    const HR_Users_Collection = db.collection("HR_Users");
    const Contractor_Users_Collection = db.collection("Contractor_Users");
    const Employer_Users_Collection = db.collection("Employer_Users");

    app.set("view engine", "ejs");

    app.use(express.static("public"));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // HOW TO "GET" FROM COLLECTION
    router.get("/", function (req, res) {
      console.log("Login");
      HR_Users_Collection.find({ firstName: "Lior" }).toArray(function (
        err,
        result
      ) {
        if (err) {
          console.log(err);
        } else {
          console.log(JSON.stringify(result));
        }
      });
      console.log("succed");

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

    router.get("/user", function (req, res) {
      // console.log(location.href, "*** the location href")
      // console.log(location, "*** the locatiom obj")
    
      console.log("user");
        Contractor_Users_Collection.find({ ID: "308032473" }).toArray(function (err,result) {
        if (err) {
          console.log("***this is an error\n ***",err.body);
        } else {
          console.log(result[0]);
          res.status(200).render("user", { user: result[0], status:'Success' });
        }
      });
    });

    router.post("/user", (req, res) => {
      console.log("post in user - request", req.body);
      Contractor_Users_Collection.find({ ID: "308032473" }).toArray(function (err, result) {
        if (err) {
          console.log(err.body + " ** Failed to get **");
        } else { //if user exists in db
          console.log(result[0], "\n** Success to get **");
          myquery = { ID: result[0]['ID'] };
          newvalues = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            partOfCompany: req.body.partOfCompany,
            expertise: req.body.expertise,
            area: req.body.area,
            // lastUpdate: new Timestamp()
          }
          var status;
          Contractor_Users_Collection.updateOne(myquery, { $set: newvalues}, function (err, res2) {
            if (err) {
              console.log(err.body + " ** Failed to update **");
              status = 'Failed';
            } else {
              console.log(result[0], "\n** Success to update **");
              status = 'Success';
            }
          });
          res.status(200).render("user", { user: result[0], status: status });
        }
      });
    });

    router.get("/recruit", function (req, res) {
      console.log("recruit");
      HR_Users_Collection.find({ firstName: "Lior" }).toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
          res.status(200).render("recruit", { exist: 2, ID: 0 });
        }
      });
    });

    router.post("/recruit", (req, res) => {
      Contractor_Users_Collection.find({ ID: req.body.ID }).toArray(function (err,result) {
        console.log("ID: " + JSON.stringify(req.body.ID));
        console.log("result: " + result.length);
        if (result.length != 0) {
          res.status(200).render("recruit", { exist: 1, ID: req.body.ID });
          console.log(req.body.ID + " 1 Failed");
        } else {
          Contractor_Users_Collection.find({
            userName: req.body.userName,
          }).toArray(function (err, result2) {
            console.log("userName: " + req.body.userName);
            console.log("result: " + result2.length);
            if (result2.length != 0) {
              res.status(200).render("r1ecruit", { exist: 1, ID: req.body.ID });
              console.log(result2[0] + "2 Failed");
            } else {
              console.log(res.body + " Succeed");
              Contractor_Users_Collection.insertOne(req.body).then((result) => {
                res.status(200).render("recruit", { exist: 0, ID: req.body.ID });
              });
            }
          });
        }
      });
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
  })
  .catch((error) => console.error(error));
module.exports = app.listen(app_port);
console.log(`app is running. port: ${app_port}`);
console.log(`http://127.0.0.1:${app_port}`);
