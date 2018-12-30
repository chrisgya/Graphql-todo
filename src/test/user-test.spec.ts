import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import chaiHttp = require("chai-http");
import { suite, test } from "mocha-typescript";
import { model } from "mongoose";
import sinon = require("sinon");
import { Response } from "../models";
import { UserSchema } from "../schemas";
import { TodoApp } from "../server";
import { Config } from "../shared";
import { loginQueries } from "./loginUserQueries";
import { registerqueries } from "./registerUserQueries";

const User = model("User", UserSchema);
// starting the server
const server: TodoApp = new TodoApp(process.env.API_PORT || 3001);
server.startServer();

chai.use(chaiAsPromised);
chai.use(chaiHttp);

@suite("User Test class")
class UserTests {
  static user: any;

  static before() {
    this.testData = {
      input: {
        username: "knrt10",
        name: "Kautilya",
        password: "test",
      },
    };
  }

  static after() {
    // Delete User Created So that it does not provide error in next test
    User.findOneAndDelete({ username: UserTests.testData.input.username }, () => {
      process.exit(0);
    });
  }

  private static testData: any;
  private static token: string;

  @test("Testing Local Connection - try connection for Local mongodb")
  public localDb(done) {
    setTimeout(() => {
      Config.dbSettings.localDatabase = true;
      const mock = sinon.mock(new TodoApp(process.env.API_PORT || 3001), "constructor");
      chai.expect(mock.object.infoString).to.deep.equal("mongodb://" + Config.dbSettings.connectionString + "/" + Config.dbSettings.database);
      done();
    }, 100);
  }

  @test("Testing Docker Connection - try connection for docker mongodb")
  public dockerDb(done) {
    Config.dbSettings.localDatabase = false;
    const mock = sinon.mock(new TodoApp(process.env.API_PORT || 3001), "constructor");
    chai.expect(mock.object.infoString).to.deep.equal("mongodb://" + Config.dbSettings.dockerconnectionString + "/" + Config.dbSettings.database);
    done();
  }

  @test("Testing Online Connection - try connection for online mongodb")
  public OnlineDb(done) {
    Config.dbSettings.authEnabled = true;
    const mock = sinon.mock(new TodoApp(process.env.API_PORT || 3001), "constructor");
    chai.expect(mock.object.infoString).to.deep.equal("mongodb://" + Config.dbSettings.username + ":" + Config.dbSettings.password + "@"
      + Config.dbSettings.connectionString + "/" + Config.dbSettings.database);
    done();
  }

  @test("POST Register - try Register User Successfuly")
  public createUser(done) {
    chai.request("http://localhost:" + server.port)
      .post("/graphql")
      .send(registerqueries.registerSuccessfullyQuery)
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body.data.registerUser).to.deep.equal(new Response(200, "Successful response", {
          success: true,
          user: res.body.data.registerUser.data.user,
          token: res.body.data.registerUser.data.token,
        }));
        done();
      });
  }

  @test("POST Register - Don't register as user already registered")
  public dontRegisterUser(done) {
    chai.request("http://localhost:" + server.port)
      .post("/graphql")
      .send(registerqueries.registerSuccessfullyQuery)
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body.data.registerUser).to.deep.equal(new Response(200, "username already in use", {
          success: false,
          token: null,
          user: null,
        }));
        done();
      });
  }

  @test("POST Register - try No username field")
  public dontCreateUser(done) {
    chai.request("http://localhost:" + server.port)
      .post("/graphql")
      .send(registerqueries.registerFailNoUsernameQuery)
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body.data.registerUser).to.deep.equal(new Response(200, "Please fill both username and name", {
          success: false,
          token: null,
          user: null,
        }));
        done();
      });
  }

  @test("POST Register - try username of small length")
  public dontCreateUserLessLength(done) {
    chai.request("http://localhost:" + server.port)
      .post("/graphql")
      .send(registerqueries.registerFailSmallUsernameQuery)
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body.data.registerUser).to.deep.equal(new Response(200, "Username and name should be contain atleast 4 characters", {
          success: false,
          token: null,
          user: null,
        }));
        done();
      });
  }

  @test("POST Login - try Successful Login")
  public login(done) {
    chai.request("http://localhost:" + server.port)
      .post("/graphql")
      .send(loginQueries.loginSuccessfullyQuery)
      .end((err, res) => {
        UserTests.user = res.body.data.loginUser.data.user;
        UserTests.token = res.body.data.loginUser.data.token;
        chai.expect(res).to.have.status(200);
        chai.expect(res.body.data.loginUser).to.deep.equal(new Response(200, "Successful response", {
          success: true,
          user: res.body.data.loginUser.data.user,
          token: res.body.data.loginUser.data.token,
        }));
        done();
      });
  }

  @test("POST Login - try hit the login with incorrect credentials route")
  public loginWithIncorrect(done) {
    chai.request("http://localhost:" + server.port)
      .post("/graphql")
      .send(loginQueries.loginFailWrongPasswordQuery)
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body.data.loginUser).to.deep.equal(new Response(200, "Incorrect Password", {
          success: false,
          user: null,
          token: null,
        }));
        done();
      });
  }

  @test("POST Login - try hit the login no password")
  public wrongInputFields(done) {
    chai.request("http://localhost:" + server.port)
      .post("/graphql")
      .send(loginQueries.loginFailNopassWordorUsernameQuery)
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body.data.loginUser).to.deep.equal(new Response(200, "Please enter both field username and password", {
          success: false,
          user: null,
          token: null,
        }));
        done();
      });
  }

  @test("POST Login - try Posting wrong username")
  public NoUser(done) {
    chai.request("http://localhost:" + server.port)
      .post("/graphql")
      .send(loginQueries.loginFailwrongUsernamQuery)
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body.data.loginUser).to.deep.equal(new Response(200, "Sorry, No user found", {
          success: false,
          user: null,
          token: null,
        }));
        done();
      });
  }
}
