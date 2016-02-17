import {expect} from "chai";
import {mount} from "enzyme";

import React from "../../../node_modules/react/addons";
import AppVersionComponent
  from "../../js/components/AppVersionComponent.jsx";

describe("AppVersionComponent", function () {

  before(function () {
    this.model = {
      "id": "/sleep10",
      "cmd": "sleep 10",
      "args": null,
      "user": "testuser",
      "env": {},
      "instances": 14,
      "ipAddress": {
        "groups": ["dev"],
        "labels": {
          "pool": "127.0.0.1/24"
        },
        "discovery": {
          "ports": [
            {"number": 80, "name": "http", "protocol": "tcp"}
          ]
        }
      },
      "cpus": 0.1,
      "mem": 16.0,
      "disk": 0.0,
      "executor": "",
      "constraints": [],
      "uris": [],
      "storeUrls": [],
      "ports": [10000, 10001],
      "requirePorts": false,
      "backoffSeconds": 1,
      "backoffFactor": 1.15,
      "maxLaunchDelaySeconds": 3600,
      "container": null,
      "healthChecks": [{
        "path": "/",
        "protocol": "HTTP",
        "portIndex": 0,
        "gracePeriodSeconds": 30,
        "intervalSeconds": 30,
        "timeoutSeconds": 30,
        "maxConsecutiveFailures": 3,
        "ignoreHttp1xx": false
      }],
      "dependencies": [],
      "upgradeStrategy": {
        "minimumHealthCapacity": 1.0,
        "maximumOverCapacity": 1.0
      },
      "labels": {},
      "acceptedResourceRoles": [],
      "version": "2015-06-29T12:57:02.269Z"
    };

    this.component = mount(<AppVersionComponent appVersion={this.model} />);
    this.table = this.component.find("dl.dl-horizontal");
    this.rows = this.table.children();
  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("shows the app ID", function () {
    expect(this.rows.at(1).text().trim()).to.equal("/sleep10");
  });

  it("has correct command", function () {
    expect(this.rows.at(3).text().trim()).to.equal("sleep 10");
  });

  it("has correct constraints", function () {
    expect(this.rows.at(5).text().trim()).to.equal("Unspecified");
  });

  it("has correct dependencies", function () {
    expect(this.rows.at(7).text().trim()).to.equal("Unspecified");
  });

  it("has correct labels", function () {
    expect(this.rows.at(9).text().trim()).to.equal("Unspecified");
  });

  it("has correct accepted resource roles", function () {
    expect(this.rows.at(11).text().trim()).to.equal("Unspecified");
  });

  it("has correct container", function () {
    expect(this.rows.at(13).text().trim()).to.equal("Unspecified");
  });

  it("has correct cpus", function () {
    expect(this.rows.at(15).text().trim()).to.equal("0.1");
  });

  it("has correct environment", function () {
    expect(this.rows.at(17).text().trim()).to.equal("Unspecified");
  });

  it("has correct executor", function () {
    expect(this.rows.at(19).text().trim()).to.equal("Unspecified");
  });

  it("has correct health checks", function () {
    var healthChecks = this.rows.at(21).text().trim();
    expect(healthChecks).to.equal(
      JSON.stringify(this.model.healthChecks, null, 2)
    );
  });

  it("has correct number of instances", function () {
    expect(this.rows.at(23).text().trim()).to.equal("14");
  });

  it("has correct ip address", function () {
    var ipAddress = this.rows.at(25).text().trim();
    expect(ipAddress).to.equal(
      JSON.stringify(this.model.ipAddress, null, 2)
    );
  });

  it("has correct amount of memory", function () {
    var children = this.rows.at(27).props().children;
    expect(children[0]).to.equal(16.0);
    expect(children[2]).to.equal("MiB");
  });

  it("has correct amount of disk space", function () {
    var children = this.rows.at(29).props().children;
    expect(children[0]).to.equal(0.0);
    expect(children[2]).to.equal("MiB");
  });

  it("has correct ports", function () {
    var children = this.rows.at(31).props().children;
    expect(children).to.equal("10000, 10001");
  });

  it("has correct backoff factor", function () {
    var children = this.rows.at(33).props().children;
    expect(children[0]).to.equal(1.15);
  });

  it("has correct backoff", function () {
    var children = this.rows.at(35).props().children;
    expect(children[0]).to.equal(1);
    expect(children[2]).to.equal("seconds");
  });

  it("has correct max launch delay", function () {
    var children = this.rows.at(37).props().children;
    expect(children[0]).to.equal(3600);
    expect(children[2]).to.equal("seconds");
  });

  it("has correct URIs", function () {
    expect(this.rows.at(39).text().trim()).to.equal("Unspecified");
  });

  it("has correct User", function () {
    expect(this.rows.at(41).props().children[0]).to.equal("testuser");
  });

  it("has correct version", function () {
    expect(this.rows.at(43).props().children[0])
      .to.equal(new Date("2015-06-29T12:57:02.269Z").toLocaleString());
  });

});
