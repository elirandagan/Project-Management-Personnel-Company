const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb+srv://EliranDagan123:dagan123@cluster0.aszt8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

MongoClient.connect(uri, {useUnifiedTopology: true})
    .then(client => {
        const db = client.db("GLEM-TECH")
        //TODO build function that send user ID PASSWORD and IDENTITY from login.ejs
        const loginVar = getLoginVar();
        const user = db.collection(loginVar.identity)

        user.find({ userName: loginVar.userName }).toArray(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(JSON.stringify(result));
            }
        })


    })
    .catch(error => console.error(error))


const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login_btn");


loginButton.addEventListener("click",(e)=>{
    e.preventDefault();
    const username = loginForm.user.value;
    const password = loginForm.pass.value;
    console.log(password,username)

})
