import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import DialogSeverity from "../../js/constants/DialogSeverity";
import ConfirmDialoglComponent from "../../js/components/ConfirmDialoglComponent";

describe("ConfirmDialoglComponent", function () {

  var dialogData = {
    actionButtonLabel: "Test Button Label",
    message: "Test Message",
    severity: DialogSeverity.DANGER,
    title: "Test Title"
  };

  before(function () {
    this.component = shallow(<ConfirmDialoglComponent data={dialogData} />);
  });

  after(function () {
    this.component = null;
  });

  it("renders correct title", function () {
    var title = this.component
      .find(".modal-header").text();
    expect(title).to.equal("Test Title");
  });

  it("renders correct message", function () {
    var message = this.component
      .find(".modal-body").text();
    expect(message).to.equal("Test Message");
  });

  it("renders correct action button label", function () {
    var actionButtonLabel = this.component
      .find(".btn-success").text();
    expect(actionButtonLabel).to.equal("Test Button Label");
  });

  it("renders correct severity indicator", function () {
    expect(this.component.find(".dialog").hasClass("danger")).to.equal(true);
  });

  it("handles action button clicks", function (done) {
    this.component.setProps({
      data:dialogData,
      onAccept: function () {
        done();
      },
      onDismiss: function () {
        done(new Error("Dismiss handler shouldn't be called"));
      }
    });
    this.component.find(".btn-success").simulate("click");
  });

  it("handles dismiss button clicks", function (done) {
    this.component.setProps({
      data:dialogData,
      onAccept: function () {
        done(new Error("Accept handler shouldn't be called"));
      },
      onDismiss: function () {
        done();
      }
    });
    this.component.find(".btn-default").simulate("click");
  });

});
