import {expect} from "chai";
import {mount, shallow} from "enzyme";

import React from "react/addons";

import MenuComponent from "../../js/components/MenuComponent";
import MenuItemComponent from "../../js/components/MenuItemComponent";
var sinon = require("sinon");

describe("MenuComponent", function () {
  var mountComponent;
  var shallowComponent;

  const changeSpy = sinon.spy();

  before(function () {
    var component = (
      <MenuComponent selected="ports" onChange={changeSpy}>
        <MenuItemComponent value="general">General</MenuItemComponent>
        <MenuItemComponent value="container">
          Container
        </MenuItemComponent>
        <MenuItemComponent value="health">
          Health Checks
        </MenuItemComponent>
        <MenuItemComponent value="ports">Ports</MenuItemComponent>
      </MenuComponent>
    );
    mountComponent = mount(component);
    shallowComponent = shallow(component);
  });

  beforeEach(function () {
    changeSpy.reset();
  });

  it("should select correct menu item", function () {
    expect(shallowComponent.find("[value='ports']").prop("selected"))
      .to.be.true;
  });

  it("should trigger on change", function () {
    // We use the change event here due to jsdom problem with secondary events.
    // https://github.com/tmpvar/jsdom/issues/1079
    mountComponent.find(MenuItemComponent).first().find("input")
      .simulate("change");

    expect(changeSpy.calledWith("general")).to.be.true;
  });
});
