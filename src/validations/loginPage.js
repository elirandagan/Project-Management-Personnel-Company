const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login_btn");


loginButton.addEventListener("click",(e)=>{
    e.preventDefault();
    const username = loginForm.user.value;
    const password = loginForm.pass.value;
    console.log(password,username)
    console.log("HERHEHEREE")

})
