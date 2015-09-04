var expect = require("chai").expect;

var expectAsync = require("./helpers/expectAsync");
var FormActions = require("../js/actions/FormActions");
var FormEvents = require("../js/events/FormEvents");
var AppFormStore = require("../js/stores/AppFormStore");

describe("App Form", function () {

  describe("on field update", function () {

    it("handles AppFormStore field validation errors", function (done) {
      AppFormStore.once(FormEvents.FIELD_VALIDATION_ERROR, function (data) {
        expectAsync(function () {
          expect(data.fieldId).to.equal("appId");
          expect(data.value).to.equal("");
          expect(data.index).to.equal(1);
        }, done);
      });

      FormActions.update("appId", "", 1);
    });

    describe("the model", function () {

      after(function () {
        AppFormStore.app = {};
        AppFormStore.fields = {};
      });

      it("updates correctly", function (done) {
        AppFormStore.once(FormEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppFormStore.app.id).to.equal("/app-1/transformed");
          }, done);
        });

        FormActions.update("appId", "/app-1");
      });

      describe("the env field", function () {

        it("inserts a key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.env.ENV_KEY_1).to.equal("ENV_VALUE_1");
            }, done);
          });

          FormActions.insert("env", {key: "ENV_KEY_1", value: "ENV_VALUE_1"});
        });

        it("inserts another key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.env.ENV_KEY_1).to.equal("ENV_VALUE_1");
              expect(AppFormStore.app.env.ENV_KEY_2).to.equal("ENV_VALUE_2");
            }, done);
          });

          FormActions.insert("env", {key: "ENV_KEY_2", value: "ENV_VALUE_2"});
        });

        it("updates a key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.env.ENV_KEY_1).to.equal("ENV_VALUE_1A");
            }, done);
          });

          FormActions.update("env",
            {key: "ENV_KEY_1", value: "ENV_VALUE_1A"},
            0
          );
        });

      });
    });

    describe("the form fields object", function () {

      it("updates correctly", function (done) {
        AppFormStore.once(FormEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppFormStore.fields.appId).to.equal("/app-1");
          }, done);
        });

        FormActions.update("appId", "/app-1");
      });

      describe("the env field", function () {

        it("inserts a key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.env[0]).to.deep.equal({
                key: "ENV_KEY_1",
                value: "ENV_VALUE_1"
              });
            }, done);
          });
          FormActions.insert("env", {key: "ENV_KEY_1", value: "ENV_VALUE_1"});
        });

        it("updates a key-value pair at index", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.env[0]).to.deep.equal({
                key: "ENV_KEY_2",
                value: "ENV_VALUE_1"
              });
            }, done);
          });
          FormActions.update("env",
            {key: "ENV_KEY_2", value: "ENV_VALUE_1"},
            0
          );
        });

        it("inserts a key-value pair at index", function (done) {

          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.env.length).to.equal(2);
              expect(AppFormStore.fields.env[0]).to.deep.equal({
                key: "ENV_KEY_3",
                value: "ENV_VALUE_3"
              });
              expect(AppFormStore.fields.env[1]).to.deep.equal({
                key: "ENV_KEY_2",
                value: "ENV_VALUE_1"
              });
            }, done);
          });

          FormActions.insert("env",
            {key: "ENV_KEY_3", value: "ENV_VALUE_3"},
            0
          );

        });

        it("deletes a key-value pair at index", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.env.length).to.equal(1);
              expect(AppFormStore.fields.env[0]).to.deep.equal({
                key: "ENV_KEY_2",
                value: "ENV_VALUE_1"
              });
            }, done);
          });

          FormActions.delete("env", 0);
        });
      });
    });

  });

});
