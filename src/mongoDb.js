const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb+srv://EliranDagan123:dagan123@cluster0.aszt8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";


let existKeyReturnValue
let insertToDbReturnValue
let validateLoginReturn = {
    empty: "empty",
    valid: "validate",
    userNameNotExist: "userNameNotExist",
    wrongPassword: "wrongPassword",
    unexpectedToken: "unexpectedToken"
}
let validateLoginReturnValue

//check if the id or the username (SK) are already exist in the DB - return TRUE for exist
async function existKey(ID, uN, identityType) {
    return MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(async client => {
            // console.log(client + "existKeyFunction")
            let user = await (getIdentity(identityType))
            user.find({ ID: ID }).toArray(function (err, result) {
                if (result.length !== 0) {
                    // console.log("existKey ID")
                    existKeyReturnValue = true;
                } else {
                    return user.find({ userName: uN }).toArray(function (err, result2) {
                        existKeyReturnValue = result2.length !== 0;
                    })
                }
            })
            // console.log("existKeyReturnValue : ", existKeyReturnValue)
            return existKeyReturnValue
        })
        .catch(error => console.error(error))
}

//insert to the dataBase after validation - identityType {HR/Contractor/Employer} - return true if the data insert to DB
async function insertToDb(identityType, data) {
    return MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(async client => {
            console.log(client + "insertToDb connect mongo")
            if (data.password.length < 6 || await (existKey(data.ID, data.userName, identityType))) {
                // console.log("insertToDbReturnValue = false")
                insertToDbReturnValue = false
            } else {
                // console.log("insertToDbReturnValue = true")
                insertToDbReturnValue = true;
                let user = await (getIdentity(identityType))
                user.insertOne(data).then().catch(error => console.log(error + "error not insert"))
            }
            // console.log("return insertToDbReturnValue", insertToDbReturnValue)
            return insertToDbReturnValue
        })
        .catch(error => console.error(error))
}

//function get identity type by string and return the db.collection
async function getIdentity(identityType) {
    return MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(async client => {
            const db = client.db("GLEM-TECH")
            let user = db.collection("Contractor_Users")
            if (identityType.toLowerCase().includes("hr")) {
                user = db.collection("HR_Users")
            } else if (identityType.toLowerCase().includes("emp")) {
                user = db.collection("Employer_Users")
            }
            return user
        })
        .catch(error => console.error(error))
}

async function loginAuth(userName, password, identityType) {
    // eslint-disable-next-line no-unused-vars
    return MongoClient.connect(uri, { useUnifiedTopology: true }).then(async client => {
        let user = await (getIdentity(identityType))
        user = await user.find({ userName: userName }).toArray()
        if (user.length === 0) {
            // console.log("validateLoginReturnValue = userNameNotExist")
            validateLoginReturnValue = validateLoginReturn.userNameNotExist
        } else {
            if (userName.localeCompare(user[0].userName) === 0 && password.localeCompare(user[0].password) !== 0) {
                // console.log("validateLoginReturnValue = wrongPassword")
                validateLoginReturnValue = validateLoginReturn.wrongPassword
            } else if (userName.localeCompare(user[0].userName) === 0 && password.localeCompare(user[0].password) === 0) {
                // console.log("validateLoginReturnValue = valid")
                validateLoginReturnValue = validateLoginReturnValue = validateLoginReturn.valid
            } else {
                // console.log("validateLoginReturnValue = unexpectedToken")
                validateLoginReturnValue = validateLoginReturn.unexpectedToken
            }
        }
        return validateLoginReturnValue
    }).catch(e => { console.error(e) })
}

async function findOneByIdentity(userName, password, identityType) {
    let user = await (getIdentity(identityType))
    query = { userName, password }
    try {
        let result = await user.findOne(query)
        if (result) {
            console.log("*** Successfully found document: ",result)
            console.log(".*** ");
        } else {
            console.log("*** No document matches the provided query.*** ");
        }
        return result;
    } catch (error) {
        console.error(error)
        throw error
    }
};


exports.existKey = existKey;
exports.inserToDb = insertToDb;
exports.loginAuth = loginAuth;
exports.getIdentity = getIdentity;
exports.findOneByIdentity = findOneByIdentity;
