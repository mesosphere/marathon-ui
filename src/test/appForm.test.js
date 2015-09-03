var expect = require("chai").expect;

var expectAsync = require("./helpers/expectAsync");
var FormActions = require("../js/actions/FormActions");
var FormEvents = require("../js/events/FormEvents");
var AppFormStore = require("../js/stores/AppFormStore");

describe("App Form", function () {

  describe("on field update", function () {

    it("updates the AppFormStore app object", function (done) {
      AppFormStore.once(FormEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppFormStore.app.id).to.equal("/app-1/transformed");
        }, done);
      });

      FormActions.update("appId", "/app-1");
    });

    it("handles AppFormStore update errors", function (done) {
      AppFormStore.once(FormEvents.CHANGE_ERROR, function (data) {
        expectAsync(function () {
          expect(data.fieldId).to.equal("nonexistentField");
        }, done);
      });

      FormActions.update("nonexistentField", "");
    });

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

  });

});
