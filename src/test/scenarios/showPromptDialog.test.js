import {expect} from "chai";
import {mount} from "enzyme";
import expectAsync from "./../helpers/expectAsync";

import React from "react/addons";
import DialogActions from "../../js/actions/DialogActions";
import DialogEvents from "../../js/events/DialogEvents";
import DialogStore from "../../js/stores/DialogStore";
import DialogTypes from "../../js/constants/DialogTypes";
import DialogSeverity from "../../js/constants/DialogSeverity";
import DialogsComponent from "../../js/components/DialogsComponent";
import PromptDialogComponent
  from "../../js/components/PromptDialogComponent";

describe("show prompt dialog", function () {

  describe("DialogStore", function () {

    it("sends correct dialog type", function (done) {
      DialogActions.prompt({message: "test prompt"});

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.type).to.equal(DialogTypes.PROMPT);
        }, done);
      });
    });

    it("sends correct message", function (done) {
      DialogActions.prompt({
        message: "test message"
      });

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.message).to.equal("test message");
        }, done);
      });
    });

    it("sends correct message using the old action api",
      function (done) {
        DialogActions.prompt("test prompt");

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.message).to.equal("test prompt");
          }, done);
        });
      }
    );

    it("sends correct title", function (done) {
      DialogActions.prompt({message: "test message", title: "prompt"});

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.title).to.equal("prompt");
        }, done);
      });
    });

    it("sends correct default action button label",
      function (done) {
        DialogActions.prompt({message: "test message"});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.actionButtonLabel).to.equal("OK");
          }, done);
        });
      }
    );

    it("sends correct default action button label using the old action api",
      function (done) {
        DialogActions.prompt("test prompt");

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.actionButtonLabel).to.equal("OK");
          }, done);
        });
      }
    );

    it("sends correct custom action button label", function (done) {
      DialogActions.prompt({
        actionButtonLabel: "CUSTOM"
      });

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.actionButtonLabel).to.equal("CUSTOM");
        }, done);
      });
    });

    it("sends correct default value", function (done) {
      DialogActions.prompt({
        inputProperties: {
          defaultValue: "value",
          type: "text"
        },
        message: "test message",
        title: "prompt"
      });

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.inputProperties.defaultValue).to.equal("value");
        }, done);
      });
    });

    it("sends correct default value using the old action api",
      function (done) {
        DialogActions.prompt("test prompt", "test");

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.inputProperties.defaultValue).to.equal("test");
          }, done);
        });
      }
    );

    it("sends correct default type if input properties is undefined",
      function (done) {
        DialogActions.prompt({
          message: "test message",
          title: "prompt"
        });

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.inputProperties.type).to.equal("text");
          }, done);
        });
      }
    );

    it("sends correct default type using the old action api",
      function (done) {
        DialogActions.prompt("test prompt");

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.inputProperties.type).to.equal("text");
          }, done);
        });
      }
    );

    it("sends correct defined type", function (done) {
      DialogActions.prompt({
        inputProperties: {
          defaultValue: 0,
          type: "number"
        },
        message: "test message",
        title: "prompt"
      });

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.inputProperties.type).equal("number");
        }, done);
      });
    });

    it("sends correct defined type using the old api", function (done) {
      DialogActions.prompt("test prompt", "test value", {type: "number"});

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.inputProperties.type).equal("number");
        }, done);
      });
    });

    it("sends correct dialog id", function (done) {
      var id = DialogActions.prompt({
        actionButtonLabel: "CUSTOM",
        message: "test message"
      });

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
    });

    it("sends correct dialog id using the old action api", function (done) {
      var id = DialogActions.prompt("test message", "CUSTOM");

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
    });

    it("sends default dialog severity", function (done) {
      DialogActions.prompt({message: "test"});

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.severity).to.equal(DialogSeverity.INFO);
        }, done);
      });
    });

    it("sends warning dialog severity", function (done) {
      DialogActions.prompt({
        message: "test",
        severity:DialogSeverity.WARNING
      });

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.severity).to.equal(DialogSeverity.WARNING);
        }, done);
      });
    });

    it("sends warning danger severity", function (done) {
      DialogActions.prompt({message: "test", severity:DialogSeverity.DANGER});

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.severity).to.equal(DialogSeverity.DANGER);
        }, done);
      });
    });

  });

  describe("DialogsComponent", function () {

    before(function (done) {
      this.component = mount(<DialogsComponent />);
      DialogStore.once(DialogEvents.SHOW_DIALOG,()=>done());
      this.dialogId = DialogActions.prompt({
        actionButtonLabel: "Test Button Label",
        inputProperties: {
          defaultValue:10,
          type: "number"
        },
        message: "Test Message",
        severity: DialogSeverity.DANGER,
        title: "Test Title"
      });
    });

    after(function () {
      this.component.instance().componentWillUnmount();
    });

    it("renders prompt dialog", function () {
      var alertDialog = this.component.find(PromptDialogComponent);
      expect(alertDialog.length).to.equal(1);
    });

  });

  describe("PromptDialogComponent", function () {

    before(function (done) {
      this.component = mount(<DialogsComponent />);
      DialogStore.once(DialogEvents.SHOW_DIALOG,()=>done());
      this.dialogId = DialogActions.prompt({
        actionButtonLabel: "Test Button Label",
        inputProperties: {
          defaultValue:10,
          type: "number"
        },
        message: "Test Message",
        severity: DialogSeverity.DANGER,
        title: "Test Title"
      });
    });

    after(function () {
      this.component.instance().componentWillUnmount();
    });

    it("renders correct title", function () {
      var title = this.component.find(PromptDialogComponent)
        .find(".modal-header").text();
      expect(title).to.equal("Test Title");
    });

    it("renders correct message", function () {
      var message = this.component.find(PromptDialogComponent)
        .find(".modal-body").find("label").text();
      expect(message).to.equal("Test Message");
    });

    it("renders correct action button label", function () {
      var actionButtonLabel = this.component.find(PromptDialogComponent)
        .find(".btn-success").text();
      expect(actionButtonLabel).to.equal("Test Button Label");
    });

    it("renders correct severity indicator", function () {
      expect(this.component.find(PromptDialogComponent)
        .find(".dialog").hasClass("danger")).to.equal(true);
    });

    it("has correct input type", function () {
      var inputType = this.component.find(PromptDialogComponent)
        .find(".modal-body").find("input").props().type;
      expect(inputType).to.equal("number");
    });

    it("has correct input default value", function () {
      var inputDefaultValue = this.component.find(PromptDialogComponent)
        .find(".modal-body").find("input").props().defaultValue;
      expect(inputDefaultValue).to.equal(10);
    });

  });


});
