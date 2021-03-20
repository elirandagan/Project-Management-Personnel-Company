var chai = require("chai");
var chaiHttp = require("chai-http");
var server = require("../src/index.js");
var should = chai.should();

chai.use(chaiHttp);


describe("Connect to server", function() {

  //   it("Login Page(first page) /get", function(done) {
  //     chai.request(server)
  //     .get("/")
  //     .end(function(err, res){
  //       res.should.have.status(200);
  //       done();
  //     });
  // });
});