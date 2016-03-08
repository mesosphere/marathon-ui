import {expect} from "chai";
import {mount} from "enzyme";

import React from "react/addons";

import ContentComponent from "../../js/components/ContentComponent";
import SectionComponent from "../../js/components/SectionComponent";

describe("ContentComponent", function () {

  it("should render only correct section", function () {
    var component = mount(
      <ContentComponent active="c">
        <SectionComponent sectionId="a">Section A</SectionComponent>
        <SectionComponent sectionId="b">Section B</SectionComponent>
        <SectionComponent sectionId="c">Section C</SectionComponent>
      </ContentComponent>
    );

    expect(component.text()).to.equal("Section C");
  });


});
