import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";

import MenuComponent from "../../js/components/MenuComponent";
import MenuItemComponent from "../../js/components/MenuItemComponent";
var sinon = require("sinon");

describe("MenuComponent", function () {
  var consoleStub;
  beforeEach(function () {
    consoleStub = sinon.spy(console, "warn");
  });

  afterEach(function () {
    console.warn.restore();
  });

  it("should accept only MenuItemComponent", function () {
    // can't be tested with more then one children because of strange
    // react sinon behaviour.
    var component = shallow(
      <MenuComponent>
        <li>test</li>
        <li>test</li>
      </MenuComponent>
    );
    expect(consoleStub.called).to.be.true;
  });

  it("should accept MenuItemComponent", function () {
    var component = shallow(
      <MenuComponent>
        <MenuItemComponent>test item</MenuItemComponent>
        <MenuItemComponent>test item</MenuItemComponent>
      </MenuComponent>
    );
    expect(consoleStub.called).to.be.false;
  });
});
