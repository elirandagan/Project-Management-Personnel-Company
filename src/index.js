var ObjectId = require("mongodb").ObjectId;
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
        const Employer_Users_Collection = db.collection("Employer_Users")
        const Contractor_Users_Collection = db.collection("Contractor_Users")

        const Absences_Collection = db.collection("Absences")
        const Shifts_Collection = db.collection("Shifts")
        const AlreadyVoted_Collection = db.collection("AlreadyVoted")

        app.set("view engine", "ejs");
        app.use(CookieParser())
        app.use(express.static("public"));
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())


        // HOW TO "GET" FROM COLLECTION
        router.get("/", async function (req, res) {
            console.log("HOMEPAGE")
            res.status(200).render("login", {exist: 0});
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

        router.get("/shifts", async (req, res) => {
            const query = { cwId: req.cookies.user.ID };
            const projection = { _id: 0, cwId: 0, rating: 0 }
            console.log(query);
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
            res.status(200).render("trackingWorkers", { status: "init", worker: {}, shifts: {}, employers: {}, totalHours: {} });
        });

        async function getEmployers(shifts) {
            var employers = new Array(shifts.length);
            const project = { userName: 0, password: 0 };

            for (let i = 0; i < shifts.length; i++) { // creates employers
                let employer = Employer_Users_Collection.findOne({ ID: shifts[i].employerId }, { projection: project });
                employer = await employer;
                if (employer) {
                    employers[i] = employer;
                } else {
                    employers[i] =
                        Employer_Users_Collection.insertOne({
                            firstName: "undefined", lastName: "undefined", ID: shifts[i].employerId, partOfCompany: "GLEM", password: "123456",
                            userName: "user" + String(Math.floor(Math.random() * 999) + 1) + Math.random().toString(36).substring(2)
                        });
                }
            }
            return employers;
        };

        async function getTrackWorkersInitData(id) {
            var shifts = Shifts_Collection.find({ cwId: id }).sort({ startWork: -1 }); // get all shifts for given id
            shifts = await shifts.toArray();

            var employers = await getEmployers(shifts); // get all employers that match each shift

            var totalHours = getHoursArray(shifts); // get manipulated hours array
            console.log("##$$$1 shifts", shifts);
            shifts = modifyShiftsHours(shifts); // modify shifts' hours to match hh:mm
            console.log("##$$$2 shifts", shifts);
            // console.log("*** shifts: ", shifts);
            // console.log("*** totalHours: ", totalHours);
            // console.log("*** employers: ", employers);
            return { shifts, employers, totalHours };
        };

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

                    if (!worker) { // user not found.
                        if (!req.cookies.track_emp) { // not cookie found
                            console.log("$$ Im in a very bad place ... $$");
                            return res.status(200).render("trackingWorkers",
                                { status: "Not Found", worker: {}, shifts: {}, employers: {}, totalHours: {} });
                        } else {
                            console.log("!@%$#%$ no worker but we have a COOKIE ! !@%$#%$");
                            console.log("!@%$#%$ the Cookie ladie and gents : ", req.cookies.track_emp);
                            worker = req.cookies.track_emp;
                            worker._id = ObjectId(worker._id)
                            worker.createAt = new Date(w.createAt);
                            console.log("!@%$#%$ the Cookie ladie and gents : ", worker);
                        }
                    }
                    const { shifts, employers, totalHours } = await getTrackWorkersInitData(worker.ID); // get data for search success

                    res.cookie("track_emp", worker, { maxAge: 900000, httpOnly: false }); // create cookie.

                    return res.status(200).render("trackingWorkers",
                        { status: "Search Success", worker: worker, shifts: shifts, employers: employers, totalHours: totalHours });
                }
                // else type is not search (from or to)
                else {
                    var w = req.cookies.track_emp;
                    [w._id, w.createAt] = [ObjectId(w._id), new Date(w.createAt)];
                    const worker = w;
                    // console.log("worker : ", worker);

                    const id = req.body.id.split("_")[0]; // req.body.id is "<id_value>_from" or "<id_value>_to"
                    console.log("id : ", id);

                    // if the type is startWork or doneWork, then different projection
                    const project = { _id: 0, startWork: 1, doneWork: 1 };

                    // get the shifts that requierd to be updated
                    var shift = await Shifts_Collection.findOne({ _id: ObjectId(id) }, { projection: project });

                    // console.log("shift :", shift);

                    if (!shift || shift === null) {// if the shifts has not been found
                        console.log("!@%$#%$  no shift !@%$#%$");
                        return res.status(200).render("trackingWorkers",
                            { status: "Not Found", worker: id, shifts: {}, employers: {}, totalHours: {} });
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
                    res.status(200).render("trackingWorkers", {status: "Success", worker: result, shifts: shifts});

            } catch (error) {
                console.error(error)
                throw error
            }
        });

        router.get("/searchWorker", function (req, res) {
            res.status(200).render("searchWorker");
        });

        router.get("/hiringHistory", function (req, res) {
            console.log(req.cookies.user.ID)
            Shifts_Collection.find({employerId: req.cookies.user.ID}).toArray().then(async (shifts) => {
                let newsShifts = await (updateShifts(shifts))

                newsShifts.length > 0 ? res.status(200).render("hiringHistory", {
                    args: newsShifts,
                    msg: 0
                }) : res.status(200).render("hiringHistory", {args: newsShifts, msg: -1})


            })
        });

        router.post("/hiringHistory", function (req, res) {
            console.log("router post")
            res.status(200).render("hiringHistory", {arguments: "router post"});
        });

        router.get("/dashboard", function (req, res) {
            validateUser ? res.status(200).render("dashboard") : res.status(200).render("login");
        });


        router.get("/modify_rate_star", (req, res) => {
            let value = req.cookies.id.split("#")
            let user = req.cookies.user._id
            let shiftId = value[0]
            let starAmount = value[1]
            parseInt(starAmount)
            console.log("shiftId : ", shiftId)
            console.log("starAmount : ", starAmount)

            AlreadyVoted_Collection.find({userId: user, shiftId: shiftId}).toArray().then((result) => {
                // if (result.length === 0) {
                const myQuery = {_id: new ObjectId(shiftId)}

                Shifts_Collection.find(myQuery).toArray().then((shift) => {
                    console.log("shift[0].cwId : ", shift[0].cwId)
                    Contractor_Users_Collection.updateOne(
                        {ID: shift[0].cwId},
                        {$push: {vote: starAmount}}
                    )
                    AlreadyVoted_Collection.insertOne({userId: user, shiftId: shiftId})
                    Shifts_Collection.find({employerId: req.cookies.user.ID}).toArray().then((schema) => {
                        schema.length > 0 ? res.status(200).render("hiringHistory", {
                            args: schema,
                            msg: 1
                        }) : res.status(200).render("hiringHistory", {args: schema, msg: -1})
                    });
                })
                // } else {
                //     console.log("already voted")
                //     Shifts_Collection.find({employerId: req.cookies.user.ID}).toArray().then((schema) => {
                //         schema.length > 0 ? res.status(200).render("hiringHistory", {
                //             args: schema,
                //             msg: 2
                //         }) : res.status(200).render("hiringHistory", {args: schema, msg: -1})
                //     })
                // }
            })
        });


        async function updateShifts(shifts) {
            console.log(shifts.cwId)
            for (let i = 0;i<shifts.length;i++) {

                Contractor_Users_Collection.find({ID: shifts[i].cwId}).toArray().then((user) => {
                    console.log(user)
                    console.log(user[0].voteRate)
                    Shifts_Collection.updateOne({_id: shifts[i]._id}, {$set: {rating: parseInt(user[0].voteRate)}}, function (err, res) {
                        if (err) throw err;
                        console.log("1 document updated" + shifts[i]._id);
                    });
                })
            }
            return shifts
        }


        router.get("/push", function (req, res) {
            Contractor_Users_Collection.updateOne(
                {"_id": "100000000"},
                {
                    $push: {
                        vote: 1
                    }
                }
            )
            Contractor_Users_Collection.find({ID: "100000000"}).toArray().then((a) => {
                console.log(a)
            })

            });


            //add the router


            app.use("/", router);
        })
            .catch(error => console.error(error))


// exports.insertVotedValue = insertVotedValue;
// exports.votedAlready = votedAlready;

        module.exports = app.listen(app_port);
        console.log(`app is running. port: ${app_port}`);
        console.log(`http://127.0.0.1:${app_port}`);
