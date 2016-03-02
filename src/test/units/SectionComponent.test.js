import {expect} from "chai";
import {mount} from "enzyme";

import React from "react/addons";

import SectionComponent from "../../js/components/SectionComponent";

describe("SectionComponent", function () {

  it("should render if active", function () {
    var component = mount(
        <SectionComponent id="a" active={true}>test</SectionComponent>
    );

    expect(component.text()).to.equal("test");
  });

  it("should not render anything if inactive", function () {
    var component = mount(
      <SectionComponent id="a" active={false}>test</SectionComponent>
    );

    expect(component.children().component).to.equal(null);
  });

});
