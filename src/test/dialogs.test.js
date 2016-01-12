var describeWithDOM = require("enzyme").describeWithDOM;
var mount = require("enzyme").mount;
var shallow = require("enzyme").shallow;
var expect = require("chai").expect;
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var DialogActions = require("../js/actions/DialogActions");
var DialogEvents = require("../js/events/DialogEvents");
var DialogStore = require("../js/stores/DialogStore");
var DialogTypes = require("../js/constants/DialogTypes");
var DialogSeverity = require("../js/constants/DialogSeverity");

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

      it("sends default dialog severity", function (done) {
        DialogActions.alert({message: "test"});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.severity).to.equal(DialogSeverity.INFO);
          }, done);
        });
      });

      it("sends warning dialog severity", function (done) {
        DialogActions.alert({message: "test", severity:DialogSeverity.WARNING});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.severity).to.equal(DialogSeverity.WARNING);
          }, done);
        });
      });

      it("sends warning danger severity", function (done) {
        DialogActions.alert({message: "test", severity:DialogSeverity.DANGER});

        DialogStore.once(DialogEvents.SHOW_DIALOG, function (dialogData) {
          expectAsync(function () {
            expect(dialogData.severity).to.equal(DialogSeverity.DANGER);
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

describe("Dialog components", function () {

  describe("alert", function () {
    var AlertDialogComponent = require("../js/components/AlertDialogComponent");

    var dialogData = {
      actionButtonLabel: "Test Button Label",
      message: "Test Message",
      severity: DialogSeverity.DANGER,
      title: "Test Title"
    };

    before(function () {
      this.component = shallow(<AlertDialogComponent data={dialogData} />);
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

  });

  describe("confirm", function () {
    var ConfirmDialoglComponent =
      require("../js/components/ConfirmDialoglComponent");

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

  describeWithDOM("prompt", function () {
    var PromptDialogComponent =
      require("../js/components/PromptDialogComponent");

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

});
