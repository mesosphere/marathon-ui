import {expect} from "chai";
import {mount} from "enzyme";
import expectAsync from "./../helpers/expectAsync";

import React from "react/addons";
import DialogActions from "../../js/actions/DialogActions";
import DialogEvents from "../../js/events/DialogEvents";
import DialogStore from "../../js/stores/DialogStore";
import DialogSeverity from "../../js/constants/DialogSeverity";
import DialogsComponent from "../../js/components/DialogsComponent";
import AlertDialogComponent from "../../js/components/AlertDialogComponent";

describe("accept alert dialog", function () {

  describe("DialogStore", function () {

    it("sends correct dialog id", function (done) {
      var id = DialogActions.alert({
        actionButtonLabel: "CUSTOM",
        message: "test alert"
      });

      DialogStore.once(DialogEvents.ACCEPT_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
      DialogActions.acceptDialog({id: id});
    });

    it("sends correct dialog id using the old action api", function (done) {
      var id = DialogActions.alert("test alert", "CUSTOM");

      DialogStore.once(DialogEvents.ACCEPT_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
      DialogActions.acceptDialog({id: id});
    });

    it("handles user response", function (done) {
      var id = DialogActions.alert({
        message: "test message"
      });

      DialogStore.handleUserResponse(id, done);
      DialogActions.acceptDialog({id: id});
    });

  });

  describe("DialogsComponent", function () {

    before(function (done) {
      this.component = mount(<DialogsComponent />);
      DialogStore.once(DialogEvents.SHOW_DIALOG, ()=>done());
      this.dialogId = DialogActions.alert({
        actionButtonLabel: "Test Button Label",
        message: "Test Message",
        severity: DialogSeverity.DANGER,
        title: "Test Title"
      });
    });

    after(function () {
      this.component.instance().componentWillUnmount();
    });

    it("removes alert dialog", function (done) {
      DialogStore.once(DialogEvents.ACCEPT_DIALOG, ()=> {
        expectAsync(()=> {
          expect(this.component.find(AlertDialogComponent).length).to.equal(0);
        }, done);
      });

      DialogActions.acceptDialog({id: this.dialogId});
    });

  });

  describe("AlertDialogComponent", function () {

    before(function (done) {
      this.component = mount(<DialogsComponent />);
      DialogStore.once(DialogEvents.SHOW_DIALOG, ()=>done());
      this.dialogId = DialogActions.alert({
        actionButtonLabel: "Test Button Label",
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

      this.component.find(AlertDialogComponent)
        .find(".btn-success").simulate("click");
    });

  });

});

