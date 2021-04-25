const validator = require("validator")

let validateSignUp = {
    nameFieldMostContainChars: "nameFieldMostContainChars",
    invalidID: "invalidID",
    invalidPasswordLength: "invalidPasswordLength",
    valid: "valid"
}

async function validate(data) {
    let returnValue
    console.log("Validate function")
    console.log("first name :", data.firstName, "!isAlpha(data.firstName) :",!validator.isAlpha(data.firstName), "last name :", data.lastName, "!isAlpha(data.lastName):", !validator.isAlpha(data.lastName))
    console.log("ID", data.ID,isValidIsraeliID(data.ID))
    if (!validator.isAlpha(data.firstName) || !validator.isAlpha(data.lastName)) {
        returnValue = validateSignUp.nameFieldMostContainChars
    } else if (!isValidIsraeliID(data.ID)) {
        returnValue = validateSignUp.invalidID
    } else if (data.password.length<6 ||data.password.length>12) {
        returnValue = validateSignUp.invalidPasswordLength
    } else {
        returnValue = validateSignUp.valid
    }
    console.log("returnValue valide:",  returnValue)
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

exports.validate = validate;
