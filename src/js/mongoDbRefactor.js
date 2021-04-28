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
async function existKey(ID, uN, identityType, mongoDbConnection) {
    console.log("existKeyFunction")
    let user = await (getIdentity(identityType, mongoDbConnection))
    user.find({ID: ID}).toArray(function (err, result) {
        if (result.length !== 0) {
            console.log("existKey ID")
            existKeyReturnValue = true;
        } else {
            return user.find({userName: uN}).toArray(function (err, result2) {
                existKeyReturnValue = result2.length !== 0;
            })
        }
    })
    console.log("existKeyReturnValue : ", existKeyReturnValue)
    return existKeyReturnValue
}

//insert to the dataBase after validation - identityType {HR/Contractor/Employer} - return true if the data insert to DB
async function insertToDb(identityType, data, mongoDbConnection) {
    console.log("insertToDb connect mongo")
    if (data.password.length < 6 || await (existKey(data.ID, data.userName, identityType))) {
        console.log("insertToDbReturnValue = false")
        insertToDbReturnValue = false
    } else {
        console.log("insertToDbReturnValue = true")
        insertToDbReturnValue = true;
        let user = await (getIdentity(identityType, mongoDbConnection))
        user.insertOne(data)
    }
    console.log("return insertToDbReturnValue", insertToDbReturnValue)
    return insertToDbReturnValue
}

//function get identity type by string and return the db.collection
async function getIdentity(identityType, mongoDbConnection) {
    const db = mongoDbConnection
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

}


async function loginAuth(userName, password, identityType, mongoDbConnection) {
    await (getIdentity(identityType, mongoDbConnection)).then((user)=>{

        console.log(user)
        user = user.find({userName: userName}).toArray()
        if (user.length === 0) {
            console.log("validateLoginReturnValue = userNameNotExist")
            validateLoginReturnValue = validateLoginReturn.userNameNotExist
        } else {
            if (userName.localeCompare(user[0].userName) === 0 && password.localeCompare(user[0].password) !== 0) {
                console.log("validateLoginReturnValue = wrongPassword")
                validateLoginReturnValue = validateLoginReturn.wrongPassword
            } else if (userName.localeCompare(user[0].userName) === 0 && password.localeCompare(user[0].password) === 0) {
                console.log("validateLoginReturnValue = valid")
                validateLoginReturnValue = validateLoginReturnValue = validateLoginReturn.valid
            } else {
                console.log("validateLoginReturnValue = unexpectedToken")
                validateLoginReturnValue = validateLoginReturn.unexpectedToken
            }
        }
    })
    return validateLoginReturnValue

}


// .then(async client => {
//     console.log("existKeyFunction")
//     // eslint-disable-next-line no-undef
//
//      {
//         console.log(result.length, "result.length === 0", result.length === 0, result)
//
//     })
//     return validateLoginReturnValue
// })
// .catch(error => console.error(error))


exports.existKey = existKey;
exports.inserToDb = insertToDb;
exports.loginAuth = loginAuth;
//exports.pullFromDb = pullFromDbById;
