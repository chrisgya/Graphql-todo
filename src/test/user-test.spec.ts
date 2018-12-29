import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import chaiHttp = require("chai-http");
import { suite, test } from "mocha-typescript";
import sinon = require("sinon");
import { TodoApp } from "../server";
import { Config } from "../shared";

// starting the server
const server: TodoApp = new TodoApp(process.env.API_PORT || 3001);
server.startServer();

chai.use(chaiAsPromised);
chai.use(chaiHttp);

@suite("User Test class")
class UserTests {

  static after() {
    process.exit(0);
  }

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
}
