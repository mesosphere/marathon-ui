var expect = require("chai").expect;

var AppFormValidators = require("../js/stores/AppFormValidators");

describe("App Form Validators", function () {

  describe("expects", function () {

    before(function() {
      this.v = AppFormValidators;
    })

    describe("app id", function () {
      it("is not an empty string", function () {
        expect(this.v.appIdNotEmpty("notempty")).to.be.true;
        expect(this.v.appIdNotEmpty("")).to.be.false;
      });

      it("has no white spaces", function () {
        expect(this.v.appIdNoWhitespaces("nowhitespace")).to.be.true;
        expect(this.v.appIdNoWhitespaces("has white spaces")).to.be.false;
      });
    });

    describe("cpus", function () {
      it("is not an empty string", function () {
        expect(this.v.cpus("")).to.be.false;
      });

      it("looks like a number", function () {
        expect(this.v.cpus("not a number 666")).to.be.false;
        expect(this.v.cpus(0.1)).to.be.true;
        expect(this.v.cpus(5)).to.be.true;
        expect(this.v.cpus("0.0001")).to.be.true;
        expect(this.v.cpus("2")).to.be.true;
      });
    });

    describe("disk", function () {
      it("is not an empty string", function () {
        expect(this.v.disk("")).to.be.false;
      });

      it("looks like a number", function () {
        expect(this.v.disk("")).to.be.false;
        expect(this.v.disk("not a number 666")).to.be.false;
        expect(this.v.disk(0.1)).to.be.true;
        expect(this.v.disk(5)).to.be.true;
        expect(this.v.disk("0.0001")).to.be.true;
        expect(this.v.disk("2")).to.be.true;
      });
    });

    describe("constraints", function () {
      it("treats empty string as valid", function () {
        expect(this.v.constraints("")).to.be.true;
      });

      it("detects invalid constraint name", function () {
        expect(this.v.constraints("hostname:INVALID_CONSTRAINT")).to.be.false;
      });

      it("detects invalid strings", function () {
        expect(this.v.constraints("abc:")).to.be.false;
        expect(this.v.constraints("h:UNIQUE; b:UNIQUE")).to.be.false;
      });

      it("list of valid constraints", function () {
        let constraints =
          "hostname:UNIQUE, atomic:LIKE:man, rackid:CLUSTER:rack-1";
        expect(this.v.constraints(constraints)).to.be.true;
        constraints =
          "rackid:GROUP_BY, atomic:UNLIKE:man";
        expect(this.v.constraints(constraints)).to.be.true;
      });
    });

    describe("env row (single)", function () {

      it("has correct object format", function () {
        expect(this.v.env({
          key: "key1",
          value: "value1"
        })).to.be.true;
      });

      it("doesn't care about additonal object keys", function () {
        expect(this.v.env({
          key: "key1",
          value: "value1",
          consecutiveKey: 2
        })).to.be.true;
      });

      it("detects incorrect object format", function () {
        expect(this.v.env({
          key: "key1",
          val: "value1"
        })).to.be.false;
      });

      it("detects empty key", function () {
        expect(this.v.env({
          key: "",
          value: "value1"
        })).to.be.false;
      });

      it("treats empty value as correct", function () {
        expect(this.v.env({
          key: "key1",
          value: ""
        })).to.be.true;
      });

    });

    describe("executor", function () {

      it("treats empty string as valid", function () {
        expect(this.v.executor("")).to.be.true;
      });

      it("detects correct strings", function () {
        expect(this.v.executor("//cmd")).to.be.true;
        expect(this.v.executor("/abc")).to.be.true;
        expect(this.v.executor("/abc/def")).to.be.true;
        expect(this.v.executor("xyz")).to.be.true;
        expect(this.v.executor("abc xyz")).to.be.true;
      });

      it("detects incorrect strings", function () {
        expect(this.v.executor("/")).to.be.false;
        expect(this.v.executor("//")).to.be.false;
        expect(this.v.executor("/abc/")).to.be.false;
        expect(this.v.executor("/abc//def")).to.be.false;
        expect(this.v.executor("xyz/")).to.be.false;
      });

    });

    describe("instances", function () {

      it("is not an empty string", function () {
        expect(this.v.instances("")).to.be.false;
      });

      it("looks like an integer", function () {
        expect(this.v.instances("not a number 666")).to.be.false;
        expect(this.v.instances(0.1)).to.be.false;
        expect(this.v.instances(5)).to.be.true;
        expect(this.v.instances("0.0001")).to.be.false;
        expect(this.v.instances("2")).to.be.true;
      });

    });

    describe("mem", function () {
      it("is not an empty string", function () {
        expect(this.v.mem("")).to.be.false;
      });

      it("looks like a number", function () {
        expect(this.v.mem("")).to.be.false;
        expect(this.v.mem("not a number 666")).to.be.false;
        expect(this.v.mem(0.1)).to.be.true;
        expect(this.v.mem(5)).to.be.true;
        expect(this.v.mem("0.0001")).to.be.true;
        expect(this.v.mem("2")).to.be.true;
      });
    });

    describe("ports", function () {
      it("treats empty string as valid", function () {
        expect(this.v.ports("")).to.be.true;
      });

      it("treats single port as valid", function () {
        expect(this.v.ports("123")).to.be.true;
      });

      it("treats list of ports as valid", function () {
        expect(this.v.ports("123, 495, 666")).to.be.true;
      });

      it("detects invalid characters", function () {
        expect(this.v.ports("123, 495xxx, 666")).to.be.false;
      });

      it("detects invalid format", function () {
        expect(this.v.ports("123, 495 666")).to.be.false;
      });
    });

  });

});
