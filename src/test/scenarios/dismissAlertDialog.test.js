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

describe("dismiss alert dialog", function () {

  describe("DialogStore", function () {

    it("sends correct dialog id", function (done) {
      var id = DialogActions.alert({
        actionButtonLabel: "CUSTOM",
        message: "test alert"
      });

      DialogStore.once(DialogEvents.DISMISS_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
      DialogActions.dismissDialog({id: id});
    });

    it("sends correct dialog id using the old action api", function (done) {
      var id = DialogActions.alert("test alert", "CUSTOM");

      DialogStore.once(DialogEvents.DISMISS_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
      DialogActions.dismissDialog({id: id});
    });

    it("handles user response", function (done) {
      var id = DialogActions.alert({
        message: "test message"
      });

      DialogStore.handleUserResponse(id, function () {
        done(new Error("Accept-handler should not be called"));
      }, done);

      DialogActions.dismissDialog({id: id});
    });

  });

  describe("DialogsComponent", function () {

    before(function (done) {
      this.component = mount(<DialogsComponent />);
      DialogStore.once(DialogEvents.SHOW_DIALOG,()=>done());
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
      DialogStore.once(DialogEvents.DISMISS_DIALOG, ()=>{
        expectAsync(()=>{
          expect(this.component.find(AlertDialogComponent).length).to.equal(0);
        }, done);
      });

      DialogActions.dismissDialog({id: this.dialogId});
    });

  });

});

