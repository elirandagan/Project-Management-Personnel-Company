const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb+srv://EliranDagan123:dagan123@cluster0.aszt8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

let existKeyReturnValue = true
let insertToDbReturnValue = true
let validateLoginReturnValue = {valid :"validate" , userNameNotExist:"userNameNotExist" , wrongPassword:"wrongPassword"}

//check if the id or the username (SK) are already exist in the DB - return TRUE for exist
async function existKey(ID, uN, identityType) {
    return MongoClient.connect(uri, {useUnifiedTopology: true})
        .then(async client => {
            console.log("existKeyFunction")
            const db = client.db("GLEM-TECH")
            let user = await(getIdentity(identityType))
            user.find({ID: ID}).toArray(function (err, result) {
                if (result.length !== 0) {
                    console.log("existKey ID")
                    existKeyReturnValue = true;
                } else {
                    return user.find({userName: uN}).toArray(function (err, result2) {
                        existKeyReturnValue = result.length !== 0;
                    })
                }
            })
            console.log("existKeyReturnValue : ", existKeyReturnValue)
            return existKeyReturnValue
        })
        .catch(error => console.error(error))
}

//insert to the dataBase after validation - identityType {HR/Contractor/Employer} - return true if the data insert to DB
async function insertToDb(identityType, data) {
    return MongoClient.connect(uri, {useUnifiedTopology: true})
        .then(async client => {
            const db = client.db("GLEM-TECH")
            console.log("insertToDb connect mongo")
            if (data.password.length < 6 || await (existKey(data.ID, data.userName, identityType))) {
                console.log("insertToDbReturnValue = false")
                insertToDbReturnValue = false
            } else {
                console.log("insertToDbReturnValue = true")
                insertToDbReturnValue = true;
                let user = await(getIdentity(identityType))
                user.insertOne(data).then(res => {
                }).catch(error => console.log("error not insert"))
            }
            console.log("return insertToDbReturnValue", insertToDbReturnValue)
            return insertToDbReturnValue
        })
        .catch(error => console.error(error))
}

//function get identity type by string and return the db.collection
async function getIdentity(identityType) {
    return MongoClient.connect(uri, {useUnifiedTopology: true})
        .then(async client => {
            const db = client.db("GLEM-TECH")
            let user = db.collection("Contractor_Users")
            console.log("getIdentityContractor_Users - default")
            if (identityType.toLowerCase().includes("hr")) {
                console.log("getIdentityHR_Users")
                user = db.collection("HR_Users")
            } else if (identityType.toLowerCase().includes("emp")) {
                console.log("getIdentityEmployer_Users")
                user = db.collection("Employer_Users")
            }
            return user
        })
        .catch(error => console.error(error))
}

async function validateLogin(userName, passwrod , identityType) {
    return MongoClient.connect(uri, {useUnifiedTopology: true})
        .then(async client => {
            console.log("existKeyFunction")
            const db = client.db("GLEM-TECH")
            let user = await(getIdentity(identityType))
            user.find({userName: userName}).toArray(function (err, result) {
                if(result.length===0){
                    validateLoginReturnValue = validateLoginReturnValue.userNameNotExist
                }else if (userName === result.userName && passwrod!==result.password){
                    validateLoginReturnValue = validateLoginReturnValue.wrongPassword
                }else if (userName === result.userName && passwrod===result.password){
                    validateLoginReturnValue = validateLoginReturnValue.valid
                }
            })
            console.log("validateLoginReturnValue : ", validateLoginReturnValue)
            return validateLoginReturnValue
        })
        .catch(error => console.error(error))
}


//query that return user by key (id)
//TODO fix this function
async function pullFromDbById(identityType, keyId) {
    return MongoClient.connect(uri, {useUnifiedTopology: true})
        .then(async client => {
            const user = await(getIdentity(identityType))
            return user.find({ID: keyId}).toArray(function (err, result){
                pullFromDbByIdReturnValue = result.length !== 0 ? result : "Empty"
            })
            return pullFromDbByIdReturnValue
        })
        .catch(error => console.error(error))
}


exports.existKey = existKey;
exports.inserToDb = insertToDb;
exports.validateLogin = validateLogin;
//exports.pullFromDb = pullFromDbById;
