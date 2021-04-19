const mongoose = require("mogoose")

const Employer_UsersSchema = new mongoose.Schema({
    firstName:{type:String, required: true },
    lastName:{type:String, required: true },
    ID:{type:String, required: true },
    partOfCompany:{type:String, required: true },
    userName:{type:String, required: true },
    password:{type:String, required: true },
    },{collection: "Employer_Users"}
)

const model = mongoose.model("Employer_UsersSchema",Employer_UsersSchema)

module.exports = model
