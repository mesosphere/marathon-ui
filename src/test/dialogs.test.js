var expect = require("chai").expect;
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var DialogActions = require("../js/actions/DialogActions");
var DialogEvents = require("../js/events/DialogEvents");
var DialogStore = require("../js/stores/DialogStore");

var expectAsync = require("./helpers/expectAsync");

describe("Dialog store", function () {

  describe("alert", function () {

    it("show sends correct message", function (done) {
      DialogActions.alert("test alert");

      DialogStore.once(DialogEvents.ALERT_SHOW, function (message) {
        expectAsync(function () {
          expect(message).to.equal("test alert");
        }, done);
      });
    });

    it("show sends correct dialogId", function (done) {
      var id = DialogActions.alert("");

      DialogStore.once(DialogEvents.ALERT_SHOW, function (message, dialogId) {
        expectAsync(function () {
          expect(dialogId).to.equal(id);
        }, done);
      });
    });

    it("dismiss sends correct dialogId", function (done) {
      var id = DialogActions.alert("");

      DialogStore.once(DialogEvents.ALERT_DISMISS, function (dialogId) {
        expectAsync(function () {
          expect(dialogId).to.equal(id);
        }, done);
      });

      DialogActions.alertDismiss(id);
    });

  });

  describe("confirm", function () {

    it("show sends correct message", function (done) {
      DialogActions.confirm("test confirm");

      DialogStore.once(DialogEvents.CONFIRM_SHOW, function (message) {
        expectAsync(function () {
          expect(message).to.equal("test confirm");
        }, done);
      });
    });

    it("show sends correct successButtonLabel default value", function (done) {
      var id = DialogActions.confirm("");

      DialogStore.once(DialogEvents.CONFIRM_SHOW, function (message,
          dialogId,
          successButtonLabel) {
        expectAsync(function () {
          expect(successButtonLabel).to.equal("OK");
        }, done);
      });
    });

    it("show sends correct successButtonLabel not default value",
        function (done) {
      var id = DialogActions.confirm("", "TEST");

      DialogStore.once(DialogEvents.CONFIRM_SHOW, function (message,
          dialogId,
          successButtonLabel) {
        expectAsync(function () {
          expect(successButtonLabel).to.equal("TEST");
        }, done);
      });
    });

    it("show sends correct dialogId", function (done) {
      var id = DialogActions.confirm("");

      DialogStore.once(DialogEvents.CONFIRM_SHOW, function (message, dialogId) {
        expectAsync(function () {
          expect(dialogId).to.equal(id);
        }, done);
      });
    });

    it("dismiss sends correct dialogId", function (done) {
      var id = DialogActions.confirm("");

      DialogStore.once(DialogEvents.CONFIRM_DISMISS, function (dialogId) {
        expectAsync(function () {
          expect(dialogId).to.equal(id);
        }, done);
      });

      DialogActions.confirmDismiss(id);
    });

    it("accept sends correct dialogId", function (done) {
      var id = DialogActions.confirm("");

      DialogStore.once(DialogEvents.CONFIRM_ACCEPT, function (dialogId) {
        expectAsync(function () {
          expect(dialogId).to.equal(id);
        }, done);
      });

      DialogActions.confirmAccept(id);
    });

  });

  describe("prompt", function () {

    it("show sends correct message", function (done) {
      DialogActions.prompt("test prompt");

      DialogStore.once(DialogEvents.PROMPT_SHOW, function (message) {
        expectAsync(function () {
          expect(message).to.equal("test prompt");
        }, done);
      });
    });

    it("show sends correct default value", function (done) {
      DialogActions.prompt("test prompt", "test value");

      DialogStore.once(DialogEvents.PROMPT_SHOW, function (message, value) {
        expectAsync(function () {
          expect(value).to.equal("test value");
        }, done);
      });
    });

    it("show sends correct default type", function (done) {
      DialogActions.prompt("test prompt");

      DialogStore.once(DialogEvents.PROMPT_SHOW,
          function (message, value, id, inputProps) {
        expectAsync(function () {
          expect(inputProps).to.deep.equal({type: "text"});
        }, done);
      });
    });

    it("show sends correct defined type", function (done) {
      DialogActions.prompt("test prompt", "test value", {type: "number"});

      DialogStore.once(DialogEvents.PROMPT_SHOW,
          function (message, value, id, inputProps) {
        expectAsync(function () {
          expect(inputProps).to.deep.equal({type: "number"});
        }, done);
      });
    });

    it("show sends correct dialogId", function (done) {
      var id = DialogActions.prompt("");

      DialogStore.once(DialogEvents.PROMPT_SHOW,
          function (message, value, dialogId) {
        expectAsync(function () {
          expect(dialogId).to.equal(id);
        }, done);
      });
    });

    it("dismiss sends correct dialogId", function (done) {
      var id = DialogActions.prompt("");

      DialogStore.once(DialogEvents.PROMPT_DISMISS, function (dialogId) {
        expectAsync(function () {
          expect(dialogId).to.equal(id);
        }, done);
      });

      DialogActions.promptDismiss(id);
    });

    it("accept sends correct dialogId", function (done) {
      var id = DialogActions.prompt("");

      DialogStore.once(DialogEvents.PROMPT_ACCEPT, function (dialogId) {
        expectAsync(function () {
          expect(dialogId).to.equal(id);
        }, done);
      });

      DialogActions.promptAccept(id);
    });

    it("accept sends correct value", function (done) {
      var id = DialogActions.prompt("", "");

      DialogStore.once(DialogEvents.PROMPT_ACCEPT, function (dialogId, value) {
        expectAsync(function () {
          expect(value).to.equal("test value");
        }, done);
      });

      DialogActions.promptAccept(id, "test value");
    });

  });

  it("dismiss the latest dialog", function (done) {
    DialogActions.confirm("test alert 1");
    var id2 = DialogActions.alert("test alert 2");

    DialogStore.once(DialogEvents.ALERT_DISMISS, function (dialogId) {
      expectAsync(function () {
        expect(dialogId).to.equal(id2);
      }, done);
    });

    DialogActions.dismissLatest();
  });

  describe("handles user response correctly", function () {

    it("on accept", function (done) {
      var dialogId = DialogActions.prompt("prompt");

      DialogStore.handleUserResponse(dialogId, function (value) {
        expectAsync(function () {
          expect(value).to.equal("test value");
        }, done);
      });

      DialogActions.promptAccept(dialogId, "test value");
    });

    it("on dismiss", function (done) {
      var dialogId = DialogActions.prompt("prompt");

      DialogStore.handleUserResponse(dialogId, function () {
        done(new Error("Accept-handler should not be called"));
      }, function () {
        done();
      });

      DialogActions.promptDismiss(dialogId);
    });

  });

});
