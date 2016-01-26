import {expect} from "chai";
import {mount} from "enzyme";
import expectAsync from "./../helpers/expectAsync";

import React from "react/addons";
import DialogActions from "../../js/actions/DialogActions";
import DialogEvents from "../../js/events/DialogEvents";
import DialogStore from "../../js/stores/DialogStore";
import DialogSeverity from "../../js/constants/DialogSeverity";
import DialogsComponent from "../../js/components/DialogsComponent";
import PromptDialogComponent
  from "../../js/components/PromptDialogComponent";

describe("accept prompt dialog", function () {

  describe("DialogStore", function () {

    it("sends correct value", function (done) {
      var id = DialogActions.prompt({
        message: "test message"
      });

      DialogStore.once(DialogEvents.ACCEPT_DIALOG,
        function (dialogData, value) {
          expectAsync(function () {
            expect(value).to.equal("test");
          }, done);
        }
      );
      DialogActions.acceptDialog({id: id}, "test");
    });

    it("sends correct dialog id", function (done) {
      var id = DialogActions.prompt({
        actionButtonLabel: "CUSTOM",
        message: "test message"
      });

      DialogStore.once(DialogEvents.ACCEPT_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
      DialogActions.acceptDialog({id: id}, "test");
    });

    it("sends correct dialog id using the old action api", function (done) {
      var id = DialogActions.prompt("test alert", "CUSTOM");

      DialogStore.once(DialogEvents.ACCEPT_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
      DialogActions.acceptDialog({id: id});
    });

    it("handles user response", function (done) {
      var id = DialogActions.prompt({
        message: "test message"
      });

      DialogStore.handleUserResponse(id, function (value) {
        expectAsync(function () {
          expect(value).to.equal("test");
        }, done);
      });

      DialogActions.acceptDialog({id: id}, "test");
    });

  });

  describe("DialogsComponent", function () {

    before(function (done) {
      this.component = mount(<DialogsComponent />);
      DialogStore.once(DialogEvents.SHOW_DIALOG, ()=>done());
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

    it("removes prompt dialog", function (done) {
      DialogStore.once(DialogEvents.ACCEPT_DIALOG, ()=> {
        expectAsync(()=> {
          expect(this.component.find(PromptDialogComponent).length).to.equal(
            0);
        }, done);
      });

      DialogActions.acceptDialog({id: this.dialogId});
    });

  });

  describe("PromptDialogComponent", function () {

    before(function () {
      this.component = mount(<DialogsComponent />);

    });

    beforeEach(function (done) {
      DialogStore.once(DialogEvents.SHOW_DIALOG, ()=>done());
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

    it("handles action button clicks", function (done) {
      DialogStore.once(DialogEvents.ACCEPT_DIALOG, (dialogData) => {
        expectAsync(()=> {
          expect(dialogData.id).to.equal(this.dialogId);
        }, done);
      });

      this.component.find(PromptDialogComponent)
        .find(".btn-success").simulate("click");
    });

    it("passes correct input value along", function (done) {
      DialogStore.once(DialogEvents.ACCEPT_DIALOG, (dialogData, value) => {
        expectAsync(()=> {
          expect(value).to.equal("10");
        }, done);
      });

      this.component.find(PromptDialogComponent)
        .find(".btn-success").simulate("click");
    });

  });

});

