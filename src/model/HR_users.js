const mongoose = require("mogoose")

const HR_UserSchema = new mongoose.Schema({
    firstName:{type:String, required: true },
    lastName:{type:String, required: true },
    ID:{type:String, required: true },
    userName:{type:String, required: true },
    password:{type:String, required: true }
    },{collection: "HR_Users"}
)

const model = mongoose.model("HR_UserSchema",HR_UserSchema)

module.exports = model
