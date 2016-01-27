import {expect} from "chai";
import {mount} from "enzyme";
import expectAsync from "./../helpers/expectAsync";

import React from "react/addons";
import DialogActions from "../../js/actions/DialogActions";
import DialogEvents from "../../js/events/DialogEvents";
import DialogStore from "../../js/stores/DialogStore";
import DialogSeverity from "../../js/constants/DialogSeverity";
import DialogsComponent from "../../js/components/DialogsComponent";
import ConfirmDialogComponent
  from "../../js/components/ConfirmDialoglComponent";

describe("dismiss confirm dialog", function () {

  describe("DialogStore", function () {

    it("sends correct dialog id", function (done) {
      var id = DialogActions.confirm({
        actionButtonLabel: "CUSTOM",
        message: "test message"
      });

      DialogStore.once(DialogEvents.DISMISS_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
      DialogActions.dismissDialog({id: id});
    });

    it("sends correct dialog id using the old action api", function (done) {
      var id = DialogActions.confirm("test message", "CUSTOM");

      DialogStore.once(DialogEvents.DISMISS_DIALOG, function (dialogData) {
        expectAsync(function () {
          expect(dialogData.id).to.equal(id);
        }, done);
      });
      DialogActions.dismissDialog({id: id});
    });

    it("handles user response", function (done) {
      var id = DialogActions.confirm({
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
      DialogStore.once(DialogEvents.SHOW_DIALOG, ()=>done());
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

    it("removes confirm dialog", function (done) {
      DialogStore.once(DialogEvents.DISMISS_DIALOG, ()=>{
        expectAsync(()=>{
          expect(this.component.find(ConfirmDialogComponent).length)
            .to.equal(0);
        }, done);
      });

      DialogActions.dismissDialog({id: this.dialogId});
    });

  });

  describe("ConfirmDialogComponent", function () {

    before(function (done) {
      this.component = mount(<DialogsComponent />);
      DialogStore.once(DialogEvents.SHOW_DIALOG, ()=>done());
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

    it("handles action button clicks", function (done) {
      DialogStore.once(DialogEvents.DISMISS_DIALOG, (dialogData) => {
        expectAsync(()=> {
          expect(dialogData.id).to.equal(this.dialogId);
        }, done);
      });

      this.component.find(ConfirmDialogComponent)
        .find(".btn-default").simulate("click");
    });

  });

});

