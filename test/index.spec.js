// var chai = require("chai");
// var chaiHttp = require("chai-http");
// var server = require("../src/index.js");
// var should = chai.should();

// chai.use(chaiHttp);


// describe("Connect to server", function() {

//     it("Login dashbaord page", function(done) {
//       chai.request(server)
//       .get("/dashboard")
//       .end(function(err, res){
//         res.should.have.status(200);
//         done();
//       });
//   });
// });

var expect = require('chai').expect

describe('Login-Page', () => {
  describe('- Password validation', () => {
          it('true if email format is validate', () => {
              var validPassword = 'password123'
              expect(validatePassword(validPassword)).to.be.eql(true)
          })

          it('true if email format is validate', () => {
              var validPassword = 'A!12A!'
              expect(validatePassword(validPassword)).to.be.eql(true)
          })
  
          it('false if password format is not validate', () => {
              var invalidPassword = ''
              expect(validatePassword(invalidPassword)).to.be.eql(false)
          })
  })   
})



// javascript function that simulates the jQuery function from login-ver.js
function validatePassword (input) {
if (input.trim() == ''){
    return false;
}
return true;
}