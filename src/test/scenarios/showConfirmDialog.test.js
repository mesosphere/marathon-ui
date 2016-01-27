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
import ConfirmDialogComponent
  from "../../js/components/ConfirmDialoglComponent";

describe("show confirm dialog", function () {

  describe("DialogStore", function () {

    it("sends correct dialog type", function (done) {
      DialogActions.confirm({message: "test confirm"});

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.type).to.equal(DialogTypes.CONFIRM);
        }, done);
      });
    });

    it("sends correct message", function (done) {
      DialogActions.confirm({message: "test confirm"});

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.message).to.equal("test confirm");
        }, done);
      });
    });

    it("sends correct message using the old action api",
      function (done) {
        DialogActions.confirm("test confirm");

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.message).to.equal("test confirm");
          }, done);
        });
      }
    );

    it("sends correct default action button label",
      function (done) {
        DialogActions.confirm({message: "test confirm"});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.actionButtonLabel).to.equal("OK");
          }, done);
        });
      }
    );

    it("sends correct default action button label using the old action api",
      function (done) {
        DialogActions.confirm("test confirm");

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.actionButtonLabel).to.equal("OK");
          }, done);
        });
      }
    );

    it("sends correct custom action button label", function (done) {
      DialogActions.confirm({
        actionButtonLabel: "CUSTOM",
        message: "test confirm"
      });

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.actionButtonLabel).to.equal("CUSTOM");
        }, done);
      });
    });

    it("sends correct custom action button label using the old action api",
      function (done) {
        DialogActions.confirm("test confirm", "CUSTOM");

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.actionButtonLabel).to.equal("CUSTOM");
          }, done);
        });
      }
    );

    it("sends correct dialog id", function (done) {
      var id = DialogActions.confirm({
        actionButtonLabel: "CUSTOM",
        message: "test confirm"
      });

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
    });

    it("sends correct dialog id using the old action api", function (done) {
      var id = DialogActions.confirm("test confirm", "CUSTOM");

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
    });

    it("sends default dialog severity", function (done) {
      DialogActions.confirm({message: "test"});

      DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.severity).to.equal(DialogSeverity.INFO);
        }, done);
      });
    });

    it("sends warning dialog severity", function (done) {
      DialogActions.confirm({
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
      DialogActions.confirm({
        message: "test",
        severity:DialogSeverity.DANGER
      });

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
      this.dialogId = DialogActions.confirm({
        actionButtonLabel: "Test Button Label",
        message: "Test Message",
        severity: DialogSeverity.DANGER,
        title: "Test Title"
      });
    });

    after(function () {
      this.component.instance().componentWillUnmount();
    });

    it("renders confirm dialog", function () {
      var alertDialog = this.component.find(ConfirmDialogComponent);
      expect(alertDialog.length).to.equal(1);
    });

  });

  describe("ConfirmDialogComponent", function () {

    before(function (done) {
      this.component = mount(<DialogsComponent />);
      DialogStore.once(DialogEvents.SHOW_DIALOG,()=>done());
      this.dialogId = DialogActions.confirm({
        actionButtonLabel: "Test Button Label",
        message: "Test Message",
        severity: DialogSeverity.DANGER,
        title: "Test Title"
      });
    });

    after(function () {
      this.component.instance().componentWillUnmount();
    });

    it("renders correct title", function () {
      var title = this.component.find(ConfirmDialogComponent)
        .find(".modal-header").text();
      expect(title).to.equal("Test Title");
    });

    it("renders correct message", function () {
      var message = this.component.find(ConfirmDialogComponent)
        .find(".modal-body").text();
      expect(message).to.equal("Test Message");
    });

    it("renders correct action button label", function () {
      var actionButtonLabel = this.component.find(ConfirmDialogComponent)
        .find(".btn-success").text();
      expect(actionButtonLabel).to.equal("Test Button Label");
    });

    it("renders correct severity indicator", function () {
      expect(this.component.find(ConfirmDialogComponent)
        .find(".dialog").hasClass("danger")).to.equal(true);
    });

  });


});
