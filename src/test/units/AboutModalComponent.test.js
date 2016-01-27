import {expect} from "chai";
import {shallow} from "enzyme";
import _ from "underscore";

import React from "react/addons";
import AboutModalComponent from "../../js/components/modals/AboutModalComponent";
import InfoStore from "../../js/stores/InfoStore";
import ObjectDlComponent from "../../js/components/ObjectDlComponent";

describe("About Modal", function () {

  before(function () {
    InfoStore.info = {
      "version": "1.2.3",
      "frameworkId": "framework1",
      "leader": "leader1.dcos.io",
      "marathon_config": {
        "marathon_field_1": "mf1",
        "marathon_field_2": "mf2"
      },
      "zookeeper_config": {
        "zookeeper_field_1": "zk1",
        "zookeeper_field_2": "zk2"
      }
    };

    this.component = shallow(<AboutModalComponent onDestroy={_.noop} />);
    this.nodes = {
      modalTitleText: this.component.find(".modal-title").text(),
      modalBodyText: this.component.find(".modal-body").text(),
      objectDlComponents: this.component.find(ObjectDlComponent)
    };
  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("displays the current Marathon version", function () {
    expect(this.nodes.modalTitleText).to.equal("Version 1.2.3");
  });

  it("displays the current framework id", function () {
    expect(this.nodes.modalBodyText).to.contain("framework1");
  });

  it("displays the current leader", function () {
    expect(this.nodes.modalBodyText).to.contain("leader1.dcos.io");
  });

  it("displays the fields in the marathon config", function () {
    var objectDlComponent = this.nodes.objectDlComponents.first();
    var props = objectDlComponent.first().props().object;
    expect(props).to.deep.equal({
      "marathon_field_1": "mf1",
      "marathon_field_2": "mf2"
    });
  });

  it("displays the fields in the zookeeper config", function () {
    var objectDlComponent = this.nodes.objectDlComponents.at(1);
    var props = objectDlComponent.first().props().object;
    expect(props).to.deep.equal({
      "zookeeper_field_1": "zk1",
      "zookeeper_field_2": "zk2"
    });
  });

});
