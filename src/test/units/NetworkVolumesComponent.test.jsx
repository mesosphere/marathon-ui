import {expect} from "chai";
import {render, shallow} from "enzyme";

import React from "react/addons";
import NetworkVolumesComponent
  from "../../js/components/NetworkVolumesComponent.jsx";

describe("Network Volumes Component", function () {
  describe("(no volume)", () => {
    var component = shallow(
      <NetworkVolumesComponent errorIndices={{}}
                               fields={{"networkVolumes": null}}
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
      <NetworkVolumesComponent
        errorIndices={{}}
        fields={{"networkVolumes": [{
          consecutiveKey: "0",
          containerPath: "/tmp/home",
          networkName: "name-test"
        }]}}
        getErrorMessage={()=>{}} />
    );

    it("should have the right Volume Name", () => {
      expect(component.find("input").get(0).attribs.id)
        .to.equal("networkVolumes.external.name.0");
    });

    it("should have the right size value", () => {
      expect(component.find("input").get(0).attribs.value)
        .to.equal("name-test");
    });

    it("should have the right path id", () => {
      expect(component.find("input").get(1).attribs.id)
        .to.equal("networkVolumes.containerPath.0");
    });

    it("should have the right path value", () => {
      expect(component.find("input").get(1).attribs.value)
        .to.equal("/tmp/home");
    });
  });

});
