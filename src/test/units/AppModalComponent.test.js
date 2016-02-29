import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import AppModalComponent from "../../js/components/modals/AppModalComponent";

describe("App Modal", function () {

  describe("default mode", function () {

    before(function () {
      this.component = shallow(<AppModalComponent />);
      this.nodes = {
        title: this.component.find(".modal-title"),
        submitBtn: this.component.find(".btn-success")
      };
    });

    after(function () {
      this.component.instance().componentWillUnmount();
    });

    it("shows the creation title", function () {
      expect(this.nodes.title.text()).to.equal("New Application");
    });

    it("shows the creation button text", function () {
      expect(this.nodes.submitBtn.text()).to.equal("+ Create");
    });

  });

  describe("edit mode", function () {

    before(function () {
      this.component = shallow(
        <AppModalComponent
          app={{id: "/some-app", cmd: "sleep 100"}}
          editMode={true} />
      );
      this.nodes = {
        title: this.component.find(".modal-title"),
        submitBtn: this.component.find(".btn-success")
      };
    });

    after(function () {
      this.component.instance().componentWillUnmount();
    });

    it("shows the edit application title", function () {
      expect(this.nodes.title.text()).to.equal("Edit Application");
    });

    it("shows the change/deploy button text", function () {
      expect(this.nodes.submitBtn.text())
        .to.equal("Change and deploy configuration");
    });

  });

});
