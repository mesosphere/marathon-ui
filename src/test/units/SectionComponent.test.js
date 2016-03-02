import {expect} from "chai";
import {mount} from "enzyme";

import React from "react/addons";

import SectionComponent from "../../js/components/SectionComponent";

var sinon = require("sinon");

describe("SectionComponent", function () {

  it("should render if active", function () {
    var component = mount(
        <SectionComponent id="a" active={true}>Test Section</SectionComponent>
    );

    expect(component.text()).to.equal("Test Section");
  });

  it("should not render anything if inactive", function () {
    var component = mount(
      <SectionComponent id="a" active={false}>Test Section</SectionComponent>
    );

    expect(component.children().component).to.equal(null);
  });

  it("should trigger on active callback", function () {
    var onActiveSpy = sinon.spy();
    mount(
      <SectionComponent id="a" active={true} onActive={onActiveSpy}>
        Test Section
      </SectionComponent>
    );
    expect(onActiveSpy.calledOnce).to.be.true;
  });

});
