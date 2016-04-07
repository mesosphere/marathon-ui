import {expect} from "chai";
import {render, shallow} from "enzyme";

import React from "react/addons";
import ExternalVolumesComponent
  from "../../js/components/ExternalVolumesComponent.jsx";

describe("External Volumes Component", function () {
  describe("(no volume)", () => {
    var component = shallow(
      <ExternalVolumesComponent errorIndices={{}}
        fields={{"externalVolumes": null}}
        getErrorMessage={()=>{}}/>
    );

    it("should display a button", () => {
      expect(component.find("button")).to.have.length(1);
    });

    it("should have a button with type button", () => {
      expect(component.find("button").first().props().type).to.equal("button");
    });

    it("should have a button with the right text", () => {
      expect(component.find("button").first().props().children)
        .to.equal("Add a network volume");
    });

    it("should have the right title", () => {
      expect(component.find("h4").first().props().children[0])
        .to.equal("Network Volumes");
    });
  });

  describe("(one volume)", () => {
    var component = render(
      <ExternalVolumesComponent
        errorIndices={{}}
        fields={{"externalVolumes": [{
          consecutiveKey: "0",
          containerPath: "/tmp/home",
          externalName: "name-test"
        }]}}
        getErrorMessage={()=>{}} />
    );

    it("should have the right Volume Name", () => {
      expect(component.find("input").get(0).attribs.id)
        .to.equal("externalVolumes.external.name.0");
    });

    it("should have the right size value", () => {
      expect(component.find("input").get(0).attribs.value)
        .to.equal("name-test");
    });

    it("should have the right path id", () => {
      expect(component.find("input").get(1).attribs.id)
        .to.equal("externalVolumes.containerPath.0");
    });

    it("should have the right path value", () => {
      expect(component.find("input").get(1).attribs.value)
        .to.equal("/tmp/home");
    });
  });

});
