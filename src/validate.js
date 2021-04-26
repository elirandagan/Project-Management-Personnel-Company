//const validator = require("validator")

let validateDic = {
    nameFieldMostContainChars: "nameFieldMostContainChars",
    invalidID: "invalidID",
    invalidPasswordLength: "invalidPasswordLength",
    emptyIdentity: "emptyIdentity",
    valid: "valid"
}



async function validateSignUp(data) {
    let returnValue
    if (!/[^a-zA-Z]/.test(data.firstName)){
        //if(!validator.isAlpha(data.firstName) || !validator.isAlpha(data.lastName)) {
        returnValue = validateDic.nameFieldMostContainChars
    } else if (!isValidIsraeliID(data.ID)) {
        returnValue = validateDic.invalidID
    } else if (data.password.length<6 ||data.password.length>12) {
        returnValue = validateDic.invalidPasswordLength
    } else {
        returnValue = validateDic.valid
    }
    return returnValue
}

function isValidIsraeliID(id) {
    var id = String(id).trim();
    if (id.length > 9 || id.length < 5 || isNaN(id)) return false;

    // Pad string with zeros up to 9 digits
    id = id.length < 9 ? ("00000000" + id).slice(-9) : id;

    return Array
        .from(id, Number)
        .reduce((counter, digit, i) => {
            const step = digit * ((i % 2) + 1);
            return counter + (step > 9 ? step - 9 : step);
        }) % 10 === 0;
}

function validateLogin(data) {
    let returnValue
    console.log(data)
    console.log("validator.isEmpty(data.identity) : " , data.identity)
    if ((typeof data.identity==="undefined")) {
        returnValue = validateDic.emptyIdentity
    } else if (data.userName.length<2) {
        returnValue = validateDic.invalidID
    } else if (data.password.length<6 ||data.password.length>12) {
        returnValue = validateDic.invalidPasswordLength
    } else {
        returnValue = validateDic.valid
    }
    console.log(returnValue)
    return returnValue
}

exports.validateSignUp = validateSignUp;
exports.validateLogin = validateLogin;
