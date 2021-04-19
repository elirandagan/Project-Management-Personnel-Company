const mongoose = require("mogoose")

const Contractor_UsersSchema = new mongoose.Schema({
    firstName:{type:String, required: true },
    lastName:{type:String, required: true },
    ID:{type:String, required: true },
    partOfCompany:{type:String, required: true },
    expertise:{type:String, required: true },
    hourlyPay:{type:Number, required: true },
    userName:{type:String, required: true },
    password:{type:String, required: true },
    area:{type:String, required: true }
    },{collection: "Contractor_Users"}
)

const model = mongoose.model("Contractor_UsersSchema",Contractor_UsersSchema)

module.exports = model
