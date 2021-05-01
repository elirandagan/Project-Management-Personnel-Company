const express = require("express");
const bodyParser = require("body-parser");
const app_port = process.env.PORT || 3000;
const app = express();
const router = express.Router();
// const Cookie = require("js-cookie")

const mongoDbFunction = require("./mongoDb");
const validateFunction = require("./validate");
const date = require("./date");
// const stats = require("./js/stats");

//const bcrypt = require("bcrypt")

let validateUser = false
let identity = { HR_Users: "HR_Users", Contractor_Users: "Contractor_Users", Employer_Users: "Employer_Users" }


const MongoClient = require("mongodb").MongoClient;
// eslint-disable-next-line no-unused-vars
const { Timestamp } = require("bson");
const { query } = require("express");
const { json } = require("body-parser");
const uri = "mongodb+srv://EliranDagan123:dagan123@cluster0.aszt8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

MongoClient.connect(uri, { useUnifiedTopology: true })
    .then(client => {
        console.log("Connected to Database")
        const db = client.db("GLEM-TECH")

        // CREATING THE DB COLLECTIONS

        const HR_Users_Collection = db.collection("HR_Users")
        const Contractor_Users_Collection = db.collection("Contractor_Users")
        const Employer_Users_Collection = db.collection("Employer_Users")
        const Absences_Collection = db.collection("Absences")

        app.set("view engine", "ejs");

        app.use(express.static("public"));
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json())

        // HOW TO "GET" FROM COLLECTION
        router.get("/", async function (req, res) {
            console.log("HOMEPAGE")
            res.status(200).render("login", { exist: 0 });
        });

        router.get("/login", function (req, res) {
            res.status(200).render("login", { exist: 0 });

        });

        router.get("/loaderLogin", function (req, res) {
            res.status(200).render("loaderLogin", { exist: 0 });

        });

        router.post("/login", async (req, res) => {
            const validateLogin = await validateFunction.validateLogin(req.body)
            console.log("validateLogin : ", validateLogin)
            if (validateLogin === "valid") {
                //res.status(200).render("loaderLogin");
                const returnValue = await mongoDbFunction.loginAuth(req.body.userName, req.body.password, req.body.identity)
                console.log("routerreturnValue", returnValue)
                if ("validate" === returnValue) {
                    validateUser = true
                    console.log("validateUser = true")

                    ///////// COOKIE /////////////
                    // Cookie.set('userInfo', JSON.stringify(req.body.identity));
                    res.cookie('userInfo', req.body.identity, { maxAge: 900000, httpOnly: false });

                    res.status(200).render("dashboard", { exist: 0 });
                    console.log("router Failed user - validate")
                } else if ("userNameNotExist" === returnValue) {
                    console.log("router Failed user - userNameNotExist")
                    res.status(200).render("login", { exist: 4 });
                } else if ("wrongPassword" === returnValue) {
                    console.log("router Failed user - wrongPassword")
                    res.status(200).render("login", { exist: 5 });
                } else {
                    console.log("router Failed user - unexpectedToken")
                    app.set("login")
                }

            } else {
                res.status(200).render("login", { exist: validateLogin });
            }
        })

        router.get("/signup", function (req, res) {
            console.log("signupGet")
            res.status(200).render("signup", { exist: 0 });
        });

        router.post("/signup", async (req, res) => {
            const validateSignUp = await validateFunction.validateSignUp(req.body)
            console.log(validateSignUp)
            switch (validateSignUp) {
                case "nameFieldMostContainChars":
                    res.status(200).render("signup", { exist: 2 });
                    console.log("router Failed user - nameFieldMostContainChars")
                    break;
                case "invalidID":
                    res.status(200).render("signup", { exist: 3 });
                    console.log("router Failed user - invalidID")
                    break;
                case "invalidPasswordLength":
                    res.status(200).render("signup", { exist: 4 });
                    console.log("router Failed user - invalidPasswordLength")
                    break;
                case "valid":
                    if (await (mongoDbFunction.inserToDb(identity.Employer_Users, req.body))) {
                        res.status(200).render("login", { exist: 5 });
                        console.log("router build user")
                    } else {
                        res.status(200).render("signup", { exist: 1 });
                        console.log("router Failed user - exist id or user name")
                    }
                    break;

            }
        });

        router.get("/privacyPolicy", function (req, res) {
            if (validateUser) {
                res.status(200).render("privacyPolicy");

            }

        });


        router.get("/template", function (req, res) {
            if (validateUser) {
                res.status(200).render("template");
            }
        });


        router.get("/workHistory", function (req, res) {
            if (validateUser) {
                res.status(200).render("workHistory");
            }
        });

        router.get("/shifts", function (req, res) {
            if (validateUser) {
                res.status(200).render("shifts");
            }
        });


        /////// ABSENCES - START //////////

        router.get("/absences", function (req, res) {
            if (validateUser) {
                res.status(200).render("absences", { arr: [], succeed: false });
            }
        });

        router.post("/absences", (req, res) => {
            if (validateUser) {
                Absences_Collection.insertOne({ ID: "208061580", from: req.body.from, to: req.body.to })
                    .then(result => {
                        res.status(200).render("absences", { arr: [], succeed: true })
                        console.log("SUCCEED TO INSERT SHIFT FOR ID 208061580", result)
                    })
            }
        })

        router.get("/loaderLogin", function (req, res) {
            if (validateUser) {
                res.status(200).render("loaderLogin");
            }
        });

        router.get("/recruit", function (req, res) {
            console.log("recruit")
            HR_Users_Collection.find({ firstName: "Lior" }).toArray(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                    res.status(200).render("recruit", { exist: 2, ID: 0 });
                }
            })
        });

        router.post("/recruit", (req, res) => {
            // eslint-disable-next-line no-undef
            // mongoDbFunction.inserToDb(identity.Contractor_Users, req.body).then(r => {
            //     const exist = r ? 0 : 1
            //     console.log("Server Exist answer: " + exist)
            //     res.status(200).render("recruit", {exist: exist, ID: req.body.ID});
            // })
            //

            Contractor_Users_Collection.find({ ID: req.body.ID }).toArray(function (err, result) {
                console.log("ID: " + JSON.stringify(req.body.ID))
                console.log("result: " + result.length)
                if (result.length != 0) {
                    console.log(req.body.ID + " 1 Failed")
                    res.status(200).render("recruit", { exist: 1, ID: req.body.ID });
                } else {
                    Contractor_Users_Collection.find({ userName: req.body.userName }).toArray(function (err, result2) {
                        console.log("userName: " + req.body.userName)
                        console.log("result: " + result2.length)
                        if (result2.length != 0) {
                            res.status(200).render("recruit", { exist: 1, ID: req.body.ID });
                            console.log(result2[0] + "2 Faileds")
                        } else {
                            console.log(res + " Succeed")
                            // req.body.createAt = new Date(date.getCurrentDate());
                            req.body.createAt = new Date();
                            Contractor_Users_Collection.insertOne(req.body)
                                .then(result => {
                                    res.status(200).render("recruit", { exist: 0, ID: req.body.ID });
                                })
                        }
                    })
                }
            })
        })

        // });


        router.get("/user", function (req, res) {
            // console.log(location.href, "*** the location href")
            // console.log(location, "*** the locatiom obj")

            console.log("user");
            Contractor_Users_Collection.find({ ID: "308032473" }).toArray(function (err, result) {
                if (err) {
                    console.log("***this is an error\n ***", err.body);
                } else {
                    console.log(result[0]);
                    res.status(200).render("user", { user: result[0], status: "Success" });
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
                    // eslint-disable-next-line no-undef
                    myquery = { ID: result[0]["ID"] };
                    // eslint-disable-next-line no-undef
                    newvalues = {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        partOfCompany: req.body.partOfCompany,
                        expertise: req.body.expertise,
                        area: req.body.area,
                        // lastUpdate: new Timestamp()
                    }
                    var status;
                    // eslint-disable-next-line no-undef,no-unused-vars
                    Contractor_Users_Collection.updateOne(myquery, { $set: newvalues }, function (err, res2) {
                        if (err) {
                            console.log(err.body + " ** Failed to update **");
                            status = "Failed";
                        } else {
                            console.log(result[0], "\n** Success to update **");
                            status = "Success";
                        }
                    });
                    res.status(200).render("user", { user: result[0], status: status });
                }
            });
        });

        router.get("/statistics", (req, res) => {
            let signedUps = new Array();

            const query = { createAt: { $gt: date.getFirstDateOfMonth(), $lt: new Date() } };
            const projection = { createAt: 1, _id: 0 }; //can be added to find()
            Contractor_Users_Collection.find(query).project(projection).toArray(function (err, result) {
                if (err) throw err;
                else if (Object.keys(result).length === 0) {
                    console.log("empty");
                    signedUps = new Array(date.getDaysInMonth).fill(undefined);
                } else {
                    signedUps = new Array(date.getDaysInMonth()).fill(0); //create array of zeros

                    for (let i = 0, d = date.getFirstDateOfMonth(); i < result.length; i++, d.setDate(d.getDate() + 1)) {
                        nextDate = new Date(d.getDate() + 1)
                        if (d <= result[i]['createAt'] <= nextDate) {
                            day = result[i]['createAt'].getDate() - 1;
                            ++signedUps[day];
                        }
                    }
                }
                console.log('^&^&^&^&');
                console.log('in index.js');
                console.log(signedUps);
                console.log(signedUps.length);
                console.log(typeof signedUps.length);
                console.log('^&^&^&^&');
            });

            res.status(200).render("statistics", { daysInMonth: date.getDaysInMonth() });
        });


        router.get("/trackingWorkers", function (req, res) {
            res.status(200).render("trackingWorkers");
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
            validateUser ? res.status(200).render("dashboard") : res.status(200).render("login");
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
console.log(`http://127.0.0.1:${app_port}`);
