import {expect} from "chai";
import {mount} from "enzyme";
import expectAsync from "./../helpers/expectAsync";

import React from "react/addons";
import DialogSeverity from "../../js/constants/DialogSeverity";
import PromptDialogComponent from "../../js/components/PromptDialogComponent";

describe("PromptDialogComponent", function () {

  var dialogData = {
    actionButtonLabel: "Test Button Label",
    inputProperties: {
      defaultValue:10,
      type: "number"
    },
    message: "Test Message",
    severity: DialogSeverity.DANGER,
    title: "Test Title"
  };

  before(function () {
    this.component = mount(<PromptDialogComponent data={dialogData} />);
  });

  after(function () {
    React.unmountComponentAtNode(this.component.instance().getDOMNode());
  });

  it("renders correct title", function () {
    var title = this.component
      .find(".modal-header").text();
    expect(title).to.equal("Test Title");
  });

  it("renders correct message", function () {
    var message = this.component
      .find(".modal-body").find("label").text();
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

  it("has correct input type", function () {
    var inputType = this.component
      .find(".modal-body").find("input").props().type;
    expect(inputType).to.equal("number");
  });

  it("has correct input default value", function () {
    var inputDefaultValue = this.component
      .find(".modal-body").find("input").props().defaultValue;
    expect(inputDefaultValue).to.equal(10);
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

  it("passes correct input value along", function (done) {
    this.component.setProps({
      data:dialogData,
      onAccept: function (value) {
        expectAsync(function () {
          expect(value).to.equal("10");
        }, done);
      },
      onDismiss: ()=> {
        done(new Error("Dismiss handler shouldn't be called"));
      }
    });

    this.component.find(".btn-success").simulate("click");
  });

});
