var ObjectId = require("mongodb").ObjectId;
const express = require("express");
const bodyParser = require("body-parser");
const app_port = process.env.PORT || 3000;
const app = express();
const router = express.Router();
const CookieParser = require("cookie-parser");
// const  ObjectId = require("mongodb").ObjectId;

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
        const Employer_Users_Collection = db.collection("Employer_Users")
        const Contractor_Users_Collection = db.collection("Contractor_Users")

        const Absences_Collection = db.collection("Absences")
        const Shifts_Collection = db.collection("Shifts")
        const Denied_Shifts_Collection = db.collection("Denied_Shifts")
        const AlreadyVoted_Collection = db.collection("AlreadyVoted")
            // const Employer_Users_Collection = db.collection("Employer_Users")

        app.set("view engine", "ejs");
        app.use(CookieParser())
        app.use(express.static("public"));
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json())


        // HOW TO "GET" FROM COLLECTION
        router.get("/", async function(_req, res) {
            console.log("HOMEPAGE")
            res.status(200).render("login", { exist: 0 });
        });

        router.get("/login", function(req, res) {
            console.log("*****");
            console.log("Cookies: ", req.cookies)
            console.log("*****");
            res.status(200).render("login", { exist: 0 });

        });

        router.get("/loaderLogin", function(req, res) {
            res.status(200).render("loaderLogin", { exist: 0 });

        });

        router.get("/firstTimeHere", function(req, res) {
            console.log("firstTimeHere GET")
            res.status(200).render("firstTimeHere", { exist: 0, userName: "empty", password: "empty" });
        });

        router.post("/firstTimeHere", function(req, res) {
            console.log("firstTimeHere POST")
            console.log("req.body.ID" + req.body.ID)
            Contractor_Users_Collection.find({ ID: req.body.ID }).toArray(function(err, result) {
                console.log("######################" + result)
                if (result.length > 0) {
                    console.log("FIND")
                    res.status(200).render("firstTimeHere", {
                        exist: "validID",
                        userName: result[0].userName,
                        password: result[0].password
                    });
                } else {
                    console.log("CANT FIND")
                    res.status(200).render("firstTimeHere", { exist: "invalidID", userName: "", password: "" });
                }
            })
        });

        router.post("/login", async(req, res) => {
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
                    console.log("*****");
                    console.log("user", user);
                    console.log("*****");
                    res.cookie("user", user, { maxAge: 9000000, httpOnly: false });
                    res.cookie("identity", req.body.identity, { maxAge: 9000000, httpOnly: false });
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

        router.get("/signup", function(req, res) {
            console.log("signupGet")
            res.status(200).render("signup", { exist: 0 });
        });

        router.post("/signup", async(req, res) => {
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

        router.get("/privacyPolicy", function(req, res) {
            console.log("router get privacy")
            res.status(200).render("privacyPolicy");
        });

        router.post("/privacyPolicy", function(req, res) {
            console.log("router POST privacy")
            res.status(200).render("privacyPolicy");
        });

        router.get("/template", function(req, res) {
            if (validateUser) {
                res.status(200).render("template");
            }
        });

        router.get("/workHistory", function(req, res) {
            if (validateUser) {
                const projection = { _id: 0, employerId: 1, startWork: 1, doneWork: 1 }
                Shifts_Collection.find({ cwId: req.cookies.user.ID, status: "approved" }).project(projection).toArray(function(err, result) {
                    if (result.length > 0) {
                        var arr = [];
                        var totalSalary = 0;
                        var totalHouers = 0;
                        var totalShifts = result.length;
                        for (let i = 0; i < result.length; ++i) {
                            Employer_Users_Collection.find({ ID: result[i].employerId }).toArray(function(_er, emp) {
                                if (emp) {
                                    // console.log("Employer first Name: " + JSON.stringify(emp))
                                    var emp_string = emp[0].firstName + " " + emp[0].lastName;
                                    var start = new Date(result[i].startWork)
                                    var done = new Date(result[i].doneWork)
                                    console.log(String(start.getDate()).padStart(2, "0"));
                                    var date = String(start.getDate()).padStart(2, "0") + "/" + (start.getUTCMonth() + 1) + "/" + start.getUTCFullYear();

                                    if (start.getUTCMinutes() < 10) {
                                        result[i].startWork = start.getUTCHours() + " : 0" + start.getUTCMinutes();
                                    } else {
                                        result[i].startWork = start.getUTCHours() + " : " + start.getUTCMinutes();
                                    }
                                    if (done.getUTCMinutes() < 10) {
                                        result[i].doneWork = done.getUTCHours() + " : 0" + done.getUTCMinutes();
                                    } else {
                                        result[i].doneWork = done.getUTCHours() + " : " + done.getUTCMinutes();
                                    }

                                    totalHouers += ((done.getTime() - start.getTime()) * 2.77777778 * 0.0000001);
                                    var salary = ((done.getTime() - start.getTime()) * 2.77777778 * 0.0000001) * req.cookies.user.hourlyPay;
                                    totalSalary += salary;
                                    var SHIFT = { employer: emp_string, date: date, start: result[i].startWork, done: result[i].doneWork, salary: salary.toFixed(2) + " NIS" }
                                    arr.push(SHIFT)

                                    if (i + 1 == result.length) {
                                        var bot_row = { employer: "Shifts: " + totalShifts, date: null, start: null, done: "Hours: " + totalHouers.toFixed(2), salary: "Salary: " + totalSalary.toFixed(2) + " NIS" }
                                        arr.push({ employer: null, date: null, start: null, done: null, salary: null })
                                        arr.push(bot_row)
                                        res.status(200).render("workHistory", { results: arr });
                                    }
                                }
                            })
                        }
                    } else {
                        console.log(err);
                        res.status(200).render("workHistory", { results: [] });
                    }
                })
            }
        });

        async function getShifts(id) {
            const query = { cwId: id };

            // get the shifts with the same cwId
            var shifts = Shifts_Collection.find(query).sort({ startWork: -1 });
            shifts = await shifts.toArray();

            // change expired shifts from status pending to status denied
            // console.log("new Date()).getTime() : ", new Date().getTime());
            for (let i = 0; i < shifts.length; i++) {
                // console.log("i: ", i, " shifts[i].startWork.getTime()  :", shifts[i].startWork.getTime(), (new Date()).getTime() > shifts[i].startWork.getTime())
                if (shifts[i].status == "pending" && (new Date()).getTime() > shifts[i].startWork.getTime()) {
                    await Shifts_Collection.updateOne({ _id: shifts[i]._id }, { $set: { status: "denied" } })
                        // console.log("*** inedx : " + i + ", updated shift status to denied, id : " + shifts[i]._id, shifts[i].status, shifts[i].startWork);
                }
            }

            var temp_shifts = [];

            // delete denied shifts
            for (let i = 0; i < shifts.length; i++) {
                if (shifts[i].status == "denied") { // delete denied shifts for the user
                    // console.log("shifts[i] : ", shifts[i]);
                    await Denied_Shifts_Collection.insertOne(shifts[i])
                    await Shifts_Collection.deleteOne({ _id: shifts[i]._id }, async err => {
                        if (err) throw err;
                        console.log("1 document deleted, 1 document iserted to denied shifts DB")
                    });
                } else { // save only non-denied shifts and re-assign
                    temp_shifts.push(shifts[i])
                }
            }

            // if temp_shifts is not empty - re-assign shifts
            if (temp_shifts.length > 0)
                shifts = temp_shifts

            //modify shifts' hours
            shifts = modifyShiftsHours(shifts)

            // add each employer's company to shifts
            for (let i = 0; i < shifts.length; i++) {
                const q = { ID: shifts[i].employerId };
                const p = { _id: 0, partOfCompany: 1 };
                const company = await Employer_Users_Collection.findOne(q, { projection: p });
                shifts[i].company = Object.values(company);
            }
            return shifts;
        }

        router.get("/shifts", async(req, res) => {
            try {
                var shifts = Shifts_Collection.find(query).project(projection).sort({ startWork: -1 })
                shifts = await shifts.toArray()
                for (let i = 0; i < shifts.length; ++i) {
                    var start = new Date(shifts[i].startWork)
                    var done = new Date(shifts[i].doneWork)
                    startMonth = start.getMonth() + 1;
                    doneMonth = done.getMonth() + 1;
                    if (startMonth < 10) {
                        startMonth = '0' + startMonth;
                    }
                    shifts[i].startWork = start.getUTCDate() + '/' + startMonth + '/' + start.getFullYear()
                    shifts[i].doneWork = start.getUTCDate() + '/' + doneMonth + '/' + start.getFullYear()

                    if (start.getUTCMinutes() < 10) {
                        shifts[i].startHour = start.getUTCHours() + ":0" + start.getUTCMinutes();
                    } else {
                        shifts[i].startHour = start.getUTCHours() + ":" + start.getUTCMinutes();
                    }
                    if (done.getUTCMinutes() < 10) {
                        shifts[i].doneHour = done.getUTCHours() + ":0" + done.getUTCMinutes();
                    } else {
                        shifts[i].doneHour = done.getUTCHours() + ":" + done.getUTCMinutes();
                    }
                }
                console.log("**Before***");
                console.log(shifts);
                console.log("*****");

                if (validateUser) {
                    res.status(200).render("shifts", { shifts: shifts });
                }
            } catch (error) {
                console.error(error)
                throw error
            }

        });

        router.get("/absences", function(req, res) {
            if (validateUser) {
                var project = { _id: 1, from: 1, to: 1 }
                Absences_Collection.find({ ID: req.cookies.user.ID }).project(project).toArray(function(err, absences) {
                    res.status(200).render("absences", { arr: absences, succeed: false })
                })
            }
        });

        router.post("/absences", (req, res) => {
            if (validateUser) {
                if (req.body.from != undefined) {
                    Absences_Collection.insertOne({ ID: req.cookies.user.ID, from: req.body.from, to: req.body.to })
                        .then(result => {
                            var project = { _id: 1, from: 1, to: 1 }
                            Absences_Collection.find({ ID: req.cookies.user.ID }).project(project).toArray(function(err, absences) {
                                res.status(200).render("absences", { arr: absences, succeed: true })
                                console.log("SUCCEED TO INSERT SHIFT")
                            })
                        })
                } else {
                    console.log(req.body.deleteId)
                    var stringVal = req.body.deleteId.toString()
                    console.log(stringVal.slice(1, -1))
                    Absences_Collection.deleteOne({ _id: new ObjectId(stringVal.slice(1, -1)) })
                        .then(result => {
                            var project = { _id: 1, from: 1, to: 1 }
                            Absences_Collection.find({ ID: req.cookies.user.ID }).project(project).toArray(function(err, absences) {
                                res.status(200).render("absences", { arr: absences, succeed: false })
                                console.log("SUCCEED TO DELETE SHIFT")
                            })
                        })
                }

            }
        })

        router.get("/loaderLogin", function(req, res) {
            if (validateUser) {
                res.status(200).render("loaderLogin");
            }
        });

        router.get("/recruit", function(req, res) {
            console.log("recruit")
            HR_Users_Collection.find({ firstName: "Lior" }).toArray(function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                    res.status(200).render("recruit", { exist: 2, ID: 0 });
                }
            })
        });

        router.post("/recruit", (req, res) => {

            Contractor_Users_Collection.find({ ID: req.body.ID }).toArray(function(err, result) {
                console.log("ID: " + JSON.stringify(req.body.ID))
                console.log("result: " + result.length)
                if (result.length != 0) {
                    console.log(req.body.ID + " 1 Failed")
                    res.status(200).render("recruit", { exist: 1, ID: req.body.ID });
                } else {
                    Contractor_Users_Collection.find({ userName: req.body.userName }).toArray(function(err, result2) {
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
            Contractor_Users_Collection.updateOne(query, { $set: newvalues }, function(err, res2) {
                if (err) {
                    console.log(err + " ** Failed to update **");
                } else {
                    console.log("\n** Success to update **");
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

        router.get("/statistics", async(req, res) => {
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

            res.status(200).render("statistics", {
                signUps: signUps,
                recruitments: recruitments,
                expertises: expertises
            });
        });

        router.get("/trackingWorkers", function(req, res) {
            res.status(200).render("trackingWorkers", {
                status: "init",
                worker: {},
                shifts: {},
                employers: {},
                totalHours: {}
            });
        });

        router.post("/trackingWorkers", async(req, res) => {
            console.log("$***$");
            console.log(req.body);
            console.log("$***$");

            try {
                var result = Contractor_Users_Collection.findOne({ ID: req.body["id-text"] })
                result = await result;
                console.log('*****');
                console.log(result);
                console.log('*****');

                if (result) {
                    var shifts = Shifts_Collection.find({ cwId: req.body["id-text"] }).sort({ startWork: -1 })
                    shifts = await shifts.toArray();

                    var employers = new Array(shifts.length)
                    const project = { userName: 0, password: 0 };

                    for (let i = 0; i < shifts.length; i++) { // creates employers
                        let employer = Employer_Users_Collection.findOne({ ID: shifts[i].employerId }, { projection: project });
                        employer = await employer;
                        if (employer) {
                            employers[i] = employer;
                        } else {
                            employers[i] = {
                                firstName: "undefined",
                                lastName: "undefined",
                                ID: shifts[i].employerId,
                                partOfCompany: "undefined"
                            }
                        }
                    }

                    var totalHours = new Array(shifts.length);
                    for (let i = 0; i < shifts.length; i++) { // create total hours array
                        const [date1, date2] = [shifts[i].doneWork, shifts[i].startWork];
                        totalHours[i] = Math.abs(date1 - date2) / 36e5;
                    }

                    for (let i = 0; i < shifts.length; ++i) { // modifies shifts
                        var start = new Date(shifts[i].startWork)
                        var done = new Date(shifts[i].doneWork)
                        startMonth = start.getMonth() + 1;
                        doneMonth = done.getMonth() + 1;
                        if (startMonth < 10) {
                            startMonth = "0" + startMonth;
                        }
                        shifts[i].startWork = start.getUTCDate() + '/' + startMonth + '/' + start.getFullYear()
                        shifts[i].doneWork = start.getUTCDate() + '/' + doneMonth + '/' + start.getFullYear()

                        if (start.getUTCMinutes() < 10) {
                            shifts[i].startHour = start.getUTCHours() + ":0" + start.getUTCMinutes();
                        } else {
                            shifts[i].startHour = start.getUTCHours() + ":" + start.getUTCMinutes();
                        }
                        if (done.getUTCMinutes() < 10) {
                            shifts[i].doneHour = done.getUTCHours() + ":0" + done.getUTCMinutes();
                        } else {
                            shifts[i].doneHour = done.getUTCHours() + ":" + done.getUTCMinutes();
                        }
                    }
                }
                console.log('$ $$$$');
                console.log(shifts);
                console.log('$$$$$');
                if (!result)
                    res.status(200).render("trackingWorkers", {
                        status: "Not Found",
                        worker: req.body["id-text"],
                        shifts: {}
                    });
                else
                    res.status(200).render("trackingWorkers", { status: "Success", worker: result, shifts: shifts });

            } catch (error) {
                console.error(error)
                throw error
            }
        });

        router.get("/searchWorker", function(req, res) {
            res.status(200).render("searchWorker");
        });

        router.get("/hiringHistory", function(req, res) {
            console.log(req.cookies.user.ID)
            Shifts_Collection.find({ employerId: req.cookies.user.ID }).toArray().then(async(shifts) => {
                let newShifts = await (updateShifts(shifts))

                newShifts.length > 0 ? res.status(200).render("hiringHistory", {
                    args: newShifts,
                    msg: 0
                }) : res.status(200).render("hiringHistory", { args: newShifts, msg: -1 })
            })
        });

        router.post("/hiringHistory", function(req, res) {
            console.log("router post")
            res.status(200).render("hiringHistory", { arguments: "router post" });
        });


        router.get("/dashboard", function(req, res) {
            Shifts_Collection.find({}).toArray().then(shift => {
                updateShifts(shift)
            })
            validateUser ? res.status(200).render("dashboard") : res.status(200).render("login");
        });


        router.get("/modify_rate_star", (req, res) => {
            let value = req.cookies.id.split("#")
            let userId = req.cookies.user._id
            let shiftId = value[0]
            let starAmount = value[1]
            AlreadyVoted_Collection.find({ userId: userId, shiftId: shiftId }).toArray().then((result) => {
                if (result.length === 0) {
                    const myQuery = { _id: new ObjectId(shiftId) }
                    Shifts_Collection.find(myQuery).toArray().then((shift) => {
                        Contractor_Users_Collection.find({ ID: shift[0].cwId }).toArray().then((user) => {
                            starAmount = parseInt(starAmount)
                            console.log(`typeof staramount ${starAmount}`, typeof starAmount)
                            console.log(`typeof user[0].rate ${user[0].rate}`, typeof user[0].rate)
                            if (user.length > 0) {
                                Contractor_Users_Collection.updateOne({ ID: shift[0].cwId }, {
                                    $set: {
                                        rate: user[0].rate + starAmount,
                                        vote: user[0].vote + 1
                                    }
                                })
                                AlreadyVoted_Collection.insertOne({ userId: userId, shiftId: shiftId })

                            } else {
                                console.log("ERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR")
                            }
                        }).then(() => {
                            renderToHiringHistory(req, res, 1)
                        })
                    })
                } else {
                    console.log("VOTED")
                    renderToHiringHistory(req, res, 2)
                }
            })
        });


        async function updateShifts(shifts) {
            for (let i = 0; i < shifts.length; i++) {
                Contractor_Users_Collection.find({ ID: shifts[i].cwId }).toArray().then((user) => {
                    Shifts_Collection.updateOne({ _id: shifts[i]._id }, { $set: { rating: avg(user[0].rate, user[0].vote).toFixed(2) } }, function(err, res) {
                        if (err) throw err;
                    });
                })
            }
            return shifts
        }

        function renderToHiringHistory(req, res, msg) {
            Shifts_Collection.find({ employerId: req.cookies.user.ID }).toArray().then((shift) => {
                updateShifts(shift).then(() => {
                    Shifts_Collection.find({ employerId: req.cookies.user.ID }).toArray().then(newShifts => {
                        newShifts.length > 0 ? res.status(200).render("hiringHistory", {
                            args: newShifts,
                            msg: msg
                        }) : res.status(200).render("hiringHistory", { args: newShifts, msg: -1 })
                    })
                })
            })
        }


        function avg(sum, amount) {
            if (amount === 0) {
                return 0
            }
            return sum / amount
        }

        //add the router


        app.use("/", router);
    })
    .catch(error => console.error(error))


// exports.insertVotedValue = insertVotedValue;
// exports.votedAlready = votedAlready;

module.exports = app.listen(app_port);
console.log(`app is running. port: ${app_port}`);
console.log(`http://127.0.0.1:${app_port}`);

// val is which time should be changed (from or to),
// the counetr_date is the date which should be checked against,
// new_date is the new date
function isInvalidTime(val, counter_date, new_date) {
    var val1, val2;
    if (val === "from") {
        val1 = ((counter_date.getUTCHours() >= new_date.getUTCHours()) &&
            (counter_date.getUTCMinutes() > new_date.getUTCMinutes()));

        val2 = ((counter_date.getUTCHours() > new_date.getUTCHours()) &&
            (counter_date.getUTCMinutes() >= new_date.getUTCMinutes()));

    } else if (val === "to") {
        val1 = ((counter_date.getUTCHours() <= new_date.getUTCHours()) &&
            (counter_date.getUTCMinutes() < new_date.getUTCMinutes()));

        val2 = ((counter_date.getUTCHours() < new_date.getUTCHours()) &&
            (counter_date.getUTCMinutes() <= new_date.getUTCMinutes()));
    }

    return !(val1 || val2);
}

function getNewDate(timeString, prev_date) {

    const time = timeString.split(":"); // convert to ["hh","mm"]
    const [hours, minutes] = [parseInt(time[0]), parseInt(time[1])]; // convert to [hh,mm]

    console.log("^%$^$% prev_date.getUTCHours :", prev_date.getUTCHours());

    if (prev_date.getUTCHours() >= 21)
        prev_date.setDate(prev_date.getDate() - 1)

    const new_date = new Date(new Date(prev_date).setHours(hours + 3, minutes)); //create new date

    console.log("&&& prev_date :", prev_date);
    console.log("&&& new_date :", new_date);

    return new_date;
}

function getHoursArray(shifts) {
    var totalHours = new Array(shifts.length);
    for (let i = 0; i < shifts.length; i++) { // create total hours array
        const [date1, date2] = [shifts[i].doneWork, shifts[i].startWork];
        totalHours[i] = (Math.abs(date1 - date2) / 36e5).toFixed(2);
    }
    return totalHours;
}

function modifyShiftsHours(shifts) {
    var temp_shifts = shifts;

    for (let i = 0; i < temp_shifts.length; ++i) { // modifies shifts hours
        var start = new Date(temp_shifts[i].startWork);
        var done = new Date(temp_shifts[i].doneWork);
        var startMonth = start.getMonth() + 1;
        var doneMonth = done.getMonth() + 1;
        if (startMonth < 10) {
            // eslint-disable-next-line no-undef,no-unused-vars
            startMonth = "0" + startMonth;
        }
        // eslint-disable-next-line no-undef,no-unused-vars
        temp_shifts[i].startWork = start.getUTCDate() + "/" + startMonth + "/" + start.getFullYear();
        // eslint-disable-next-line no-undef,no-unused-vars
        temp_shifts[i].doneWork = start.getUTCDate() + "/" + doneMonth + "/" + start.getFullYear();
        // eslint-disable-next-line no-undef,no-unused-vars
        if (start.getUTCMinutes() < 10) {
            temp_shifts[i].startHour = start.getUTCHours() + ":0" + start.getUTCMinutes();
        } else {
            temp_shifts[i].startHour = start.getUTCHours() + ":" + start.getUTCMinutes();
        }
        // eslint-disable-next-line no-undef,no-unused-vars
        if (done.getUTCMinutes() < 10) {
            temp_shifts[i].doneHour = done.getUTCHours() + ":0" + done.getUTCMinutes();
        } else {
            temp_shifts[i].doneHour = done.getUTCHours() + ":" + done.getUTCMinutes();
        }
        // eslint-disable-next-line no-undef,no-unused-vars
        if (start.getUTCHours() < 10) {
            temp_shifts[i].startHour = "0" + temp_shifts[i].startHour;
        }
        // eslint-disable-next-line no-undef,no-unused-vars
        if (done.getUTCHours() < 10) {
            temp_shifts[i].doneHour = "0" + temp_shifts[i].doneHour;
        }
    }
    return temp_shifts;
}