const express = require("express");
const bodyParser = require("body-parser");
const app_port = process.env.PORT || 3000;
const app = express();
const router = express.Router();
const CookieParser = require("cookie-parser");

const mongoDbFunction = require("./mongoDb");
const validateFunction = require("./validate");
const date = require("./date");

let validateUser = false
let identity = { HR_Users: "HR_Users", Contractor_Users: "Contractor_Users", Employer_Users: "Employer_Users" }

const MongoClient = require("mongodb").MongoClient;

const uri = "mongodb+srv://EliranDagan123:dagan123@cluster0.aszt8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

MongoClient.connect(uri, { useUnifiedTopology: true })
    .then(client => {
        console.log("Connected to Database")
        const db = client.db("GLEM-TECH")

        // CREATING THE DB COLLECTIONS

        const HR_Users_Collection = db.collection("HR_Users")
        const Contractor_Users_Collection = db.collection("Contractor_Users")
        const Absences_Collection = db.collection("Absences")
        const Shifts_Collection = db.collection("Shifts")

        app.set("view engine", "ejs");
        app.use(CookieParser())
        app.use(express.static("public"));
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json())


        // HOW TO "GET" FROM COLLECTION
        router.get("/", async function (req, res) {
            console.log("HOMEPAGE")
            res.status(200).render("login", { exist: 0 });
        });

        router.get("/login", function (req, res) {
            console.log("*****");
            console.log("Cookies: ", req.cookies)
            console.log("*****");
            res.status(200).render("login", { exist: 0 });

        });

        router.get("/loaderLogin", function (req, res) {
            res.status(200).render("loaderLogin", { exist: 0 });

        });

        router.get("/firstTimeHere", function (req, res) {
            console.log("firstTimeHere GET")
            res.status(200).render("firstTimeHere", { exist: 0, userName: "empty", password: "empty" });
        });

        router.post("/firstTimeHere", function (req, res) {
            console.log("firstTimeHere POST")
            console.log("req.body.ID" + req.body.ID)
            Contractor_Users_Collection.find({ ID: req.body.ID }).toArray(function (err, result) {
                console.log("######################" + result)
                if (result.length > 0) {
                    console.log("FIND")
                    res.status(200).render("firstTimeHere", { exist: "validID", userName: result[0].userName, password: result[0].password });
                } else {
                    console.log("CANT FIND")
                    res.status(200).render("firstTimeHere", { exist: "invalidID", userName: "", password: "" });
                }
            })
        });

        router.post("/login", async (req, res) => {
            const validateLogin = await validateFunction.validateLogin(req.body)
            // console.log("validateLogin : ", validateLogin)

            if (validateLogin === "valid") {
                const returnValue = await mongoDbFunction.loginAuth(req.body.userName, req.body.password, req.body.identity)
                // console.log("routerReturnValue", returnValue)
                if ("validate" === returnValue) {
                    validateUser = true
                    // console.log("validateUser = true")
                    ///////// COOKIE /////////////

                    const user = await mongoDbFunction.findOneByIdentity(req.body.userName, req.body.password, req.body.identity)
                    // console.log("user", user);
                    // const userInfo = { identity: req.body.identity, user: user['ID']}
                    // console.log("*****");
                    // console.log("user", user);
                    // console.log("*****");
                    res.cookie("user", user, { maxAge: 900000, httpOnly: false });
                    res.cookie("identity", req.body.identity, { maxAge: 900000, httpOnly: false });
                    res.status(200).render("dashboard", { exist: "invalidID" });

                } else if ("userNameNotExist" === returnValue) {
                    // console.log("router Failed user - userNameNotExist")
                    res.status(200).render("login", { exist: "userNameNotExist" });
                } else if ("wrongPassword" === returnValue) {
                    // console.log("router Failed user - wrongPassword")
                    res.status(200).render("login", { exist: "wrongPassword" });
                } else {
                    // console.log("router Failed user - unexpectedToken")
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
            console.log("router get privacy")
            res.status(200).render("privacyPolicy");
        });

        router.post("/privacyPolicy", function (req, res) {
            console.log("router POST privacy")
            res.status(200).render("privacyPolicy");
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
                            req.body.createAt = new Date();
                            Contractor_Users_Collection.insertOne(req.body)
                                .then(result => {
                                    console.log(result)
                                    res.status(200).render("recruit", { exist: 0, ID: req.body.ID });
                                })
                        }
                    })
                }
            })
        })

        router.get("/user", (req, res) => {
            console.log("******");
            console.log("in user router");
            console.log(req.cookies.user);
            console.log(req.cookies.identity);
            console.log("******");
            res.status(200).render("user", { status: "init" });
        });

        router.post("/user", (req, res) => {
            const query = { _id: req.cookies.user.ID }
            // eslint-disable-next-line no-undef
            const newvalues = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                partOfCompany: req.body.partOfCompany,
                expertise: req.body.expertise,
                area: req.body.area,
                // lastUpdate: new Timestamp()
            }
            var status;
            // eslint-disable-next-line no-undef,no-unused-vars
            Contractor_Users_Collection.updateOne(query, { $set: newvalues }, function (err, res2) {
                if (err) {
                    console.log(err.body + " ** Failed to update **");
                    status = "Failed";
                } else {
                    console.log("\n** Success to update **");
                    status = "Success";
                }
            });
            res.status(200).render("user", { status: status });
        });

        async function getSignUps() {
            const query = { createAt: { $gt: date.getFirstDateOfMonth(), $lt: new Date() } };
            const projection = { createAt: 1, _id: 0 }; //can be added to find()
            var signUps = new Array(date.getDaysInMonth()).fill(0); //create empty array of days in current month
            try {
                let result = Contractor_Users_Collection.find(query).project(projection)
                result = await result.toArray()
                // manipulte data to create array that the index indicates the day of month
                // the value indicates the amount of signups per that day of the month
                for (let i = 0, d = date.getFirstDateOfMonth(); i < result.length; i++, d.setDate(d.getDate() + 1)) {
                    let nextDate = new Date(d.getDate() + 1);
                    if (d <= result[i]["createAt"] <= nextDate) {
                        let day = result[i]["createAt"].getDate() - 1;
                        ++signUps[day];
                    }
                }
                return signUps;
            } catch (error) {
                console.error(error)
                throw error
            }
        }

        async function getRecruitments() {
            const query = { startWork: { $gt: date.getFirstDateOfMonth(), $lt: new Date() } };
            const projection = { startWork: 1, _id: 0 }; //can be added to find()
            var reqs = new Array(date.getDaysInMonth()).fill(0); //create empty array of days in current month

            try {
                let result = Shifts_Collection.find(query).project(projection)
                result = await result.toArray()
                // manipulte data to create array that the index indicates the day of month
                // the value indicates the amount of recruitments per that day of the month
                for (let i = 0, d = date.getFirstDateOfMonth(); i < result.length; i++, d.setDate(d.getDate() + 1)) {
                    var nextDate = new Date(d.getDate() + 1);
                    if (d <= result[i]["startWork"] <= nextDate) {
                        var day = result[i]["startWork"].getDate() - 1;
                        ++reqs[day];
                    }
                }
                return reqs;
            } catch (error) {
                console.error(error)
                throw error
            }
        }

        async function getExpertises() {
            const query = { createAt: { $gt: date.getFirstDateOfMonth(), $lt: new Date() } };
            const projection = { expertise: 1, _id: 0 }; //can be added to find()
            let experts = new Array(6).fill(0); //create empty array that the index indicates the expeertises 

            try {
                let result = Contractor_Users_Collection.find(query).project(projection)
                result = await result.toArray()

                //{'Technician','Carpenter','Electrician','Gardener','Painter','Plumber'} 
                console.log("*****");
                console.log(result.length);
                console.log("*****");
                for (let i = 0; i < result.length; i++) {
                    if (result[i].expertise == "Technician")
                        ++experts[0];
                    else if (result[i].expertise == "Carpenter")
                        ++experts[1];
                    else if (result[i].expertise == "Electrician")
                        ++experts[2];
                    else if (result[i].expertise == "Gardener")
                        ++experts[3];
                    else if (result[i].expertise == "Painter")
                        ++experts[4];
                    else {
                        ++experts[5];
                    }
                }

            } catch (error) {
                console.error(error)
                throw error
            }
            return experts;
        }

        router.get("/statistics", async (req, res) => {
            const signUps = await getSignUps();
            console.log("*****");
            console.log("signUps :" + signUps);
            console.log("*****");

            const recruitments = await getRecruitments();
            console.log("*****");
            console.log("recruitments :" + recruitments);
            console.log("*****");

            const expertises = await getExpertises();
            console.log("*****");
            console.log("expertises :" + expertises);
            console.log("*****");


            res.status(200).render("statistics", { signUps: signUps, recruitments: recruitments, expertises: expertises });
        });

        router.get("/trackingWorkers", function (req, res) {
            res.status(200).render("trackingWorkers", { status: "init", worker: "" });
        });

        router.post("/trackingWorkers", async (req, res) => {
            console.log('********');
            console.log(" in trackingWorkers post ");
            console.log("ID", req.body["id-text"]);
            console.log('********');

            try {
                let result = Contractor_Users_Collection.findOne({ ID: req.body["id-text"] })
                result = await result;
                console.log('*****');
                console.log(result);
                console.log('*****');
                if (!result)
                    res.status(200).render("trackingWorkers", { status: "Not Found", worker: req.body["id-text"] });
                else
                    res.status(200).render("trackingWorkers", { status: "Success", worker: result });

            } catch (error) {
                console.error(error)
                throw error
            }
        });

        router.get("/searchWorker", function (req, res) {
            res.status(200).render("searchWorker");
        });

        router.get("/hiringHistory", function (req, res) {
            res.status(200).render("hiringHistory");
        });

        router.get("/dashboard", function (req, res) {
            validateUser ? res.status(200).render("dashboard") : res.status(200).render("login");
        });

        //add the router
        app.use("/", router);
    })
    .catch(error => console.error(error))
module.exports = app.listen(app_port);
console.log(`app is running. port: ${app_port}`);
console.log(`http://127.0.0.1:${app_port}`);
