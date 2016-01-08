var expect = require("chai").expect;
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var DialogActions = require("../js/actions/DialogActions");
var DialogEvents = require("../js/events/DialogEvents");
var DialogStore = require("../js/stores/DialogStore");
var DialogTypes = require("../js/constants/DialogTypes");
var DialogStates = require("../js/constants/DialogStates");

var expectAsync = require("./helpers/expectAsync");

describe("Dialog store", function () {

  describe("alert", function () {

    describe("show dialog", function () {

      it("sends correct dialog type", function (done) {
        DialogActions.alert({message: "test alert"});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.type).to.equal(DialogTypes.ALERT);
          }, done);
        });
      });

      it("sends correct message", function (done) {
        DialogActions.alert({message: "test alert"});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.message).to.equal("test alert");
          }, done);
        });
      });

      it("sends correct message using the old action api",
        function (done) {
          DialogActions.alert("test alert");

          DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
            expectAsync(function () {
              expect(dialogData.message).to.equal("test alert");
            }, done);
          });
        }
      );

      it("sends correct default action button label",
        function (done) {
          DialogActions.alert({message: "test alert"});

          DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
            expectAsync(function () {
              expect(dialogData.actionButtonLabel).to.equal("OK");
            }, done);
          });
        }
      );

      it("sends correct default action button label using the old action api",
        function (done) {
          DialogActions.alert("test alert");

          DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
            expectAsync(function () {
              expect(dialogData.actionButtonLabel).to.equal("OK");
            }, done);
          });
        }
      );

      it("sends correct custom action button label", function (done) {
        DialogActions.alert({
          actionButtonLabel: "CUSTOM",
          message: "test alert"
        });

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.actionButtonLabel).to.equal("CUSTOM");
          }, done);
        });
      });

      it("sends correct custom action button label using the old action api",
        function (done) {
          DialogActions.alert("test alert", "CUSTOM");

          DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
            expectAsync(function () {
              expect(dialogData.actionButtonLabel).to.equal("CUSTOM");
            }, done);
          });
        }
      );

      it("sends correct dialog id", function (done) {
        var id = DialogActions.alert({
          actionButtonLabel: "CUSTOM",
          message: "test alert"
        });

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.id).to.equal(id);
          }, done);
        });
      });

      it("sends correct dialog id using the old action api", function (done) {
        var id = DialogActions.alert("test alert", "CUSTOM");

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.id).to.equal(id);
          }, done);
        });
      });

      it("sends default dialog state", function (done) {
        DialogActions.alert({message: "test"});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.state).to.equal(DialogStates.INFO);
          }, done);
        });
      });

      it("sends warning dialog state", function (done) {
        DialogActions.alert({message: "test", state:DialogStates.WARNING});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.state).to.equal(DialogStates.WARNING);
          }, done);
        });
      });

      it("sends warning danger state", function (done) {
        DialogActions.alert({message: "test", state:DialogStates.DANGER});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.state).to.equal(DialogStates.DANGER);
          }, done);
        });
      });

    });

    describe("accept dialog", function () {

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

    describe("dismiss dialog", function () {

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

  });

  describe("confirm", function () {

    describe("show dialog", function () {

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

      it("sends default dialog state", function (done) {
        DialogActions.confirm({message: "test"});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.state).to.equal(DialogStates.INFO);
          }, done);
        });
      });

      it("sends warning dialog state", function (done) {
        DialogActions.confirm({message: "test", state:DialogStates.WARNING});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.state).to.equal(DialogStates.WARNING);
          }, done);
        });
      });

      it("sends warning danger state", function (done) {
        DialogActions.confirm({message: "test", state:DialogStates.DANGER});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.state).to.equal(DialogStates.DANGER);
          }, done);
        });
      });

    });

    describe("accept dialog", function () {

      it("sends correct dialog id", function (done) {
        var id = DialogActions.confirm({
          actionButtonLabel: "CUSTOM",
          message: "test message"
        });

        DialogStore.once(DialogEvents.ACCEPT_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.id).to.equal(id);
          }, done);
        });
        DialogActions.acceptDialog({id: id});
      });

      it("sends correct dialog id using the old action api", function (done) {
        var id = DialogActions.confirm("test message", "CUSTOM");

        DialogStore.once(DialogEvents.ACCEPT_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.id).to.equal(id);
          }, done);
        });
        DialogActions.acceptDialog({id: id});
      });

      it("handles user response", function (done) {
        var id = DialogActions.confirm({
          message: "test message"
        });

        DialogStore.handleUserResponse(id, done);

        DialogActions.acceptDialog({id: id});
      });

    });

    describe("dismiss dialog", function () {

      it("sends correct dialog id", function (done) {
        var id = DialogActions.confirm({
          actionButtonLabel: "CUSTOM",
          message: "test message",
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

  });

  describe("prompt", function () {

    describe("show dialog", function () {

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

      it("sends default dialog state", function (done) {
        DialogActions.prompt({message: "test"});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.state).to.equal(DialogStates.INFO);
          }, done);
        });
      });

      it("sends warning dialog state", function (done) {
        DialogActions.prompt({message: "test", state:DialogStates.WARNING});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.state).to.equal(DialogStates.WARNING);
          }, done);
        });
      });

      it("sends warning danger state", function (done) {
        DialogActions.prompt({message: "test", state:DialogStates.DANGER});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.state).to.equal(DialogStates.DANGER);
          }, done);
        });
      });

    });

    describe("accept dialog", function () {

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

    describe("dismiss dialog", function () {

      it("sends correct dialog id", function (done) {
        var id = DialogActions.prompt({
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
        var id = DialogActions.prompt("test message", "CUSTOM");

        DialogStore.once(DialogEvents.DISMISS_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.id).to.equal(id);
          }, done);
        });
        DialogActions.dismissDialog({id: id});
      });

      it("handles user response", function (done) {
        var id = DialogActions.prompt({
          message: "test message"
        });

        DialogStore.handleUserResponse(id, function () {
          done(new Error("Accept-handler should not be called"));
        }, done);

        DialogActions.dismissDialog({id: id});
      });
    });

  });

});
