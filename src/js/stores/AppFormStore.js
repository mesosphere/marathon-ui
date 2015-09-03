var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var AppFormTransforms = require("./AppFormTransforms");
var AppFormValidators = require("./AppFormValidators");
var FormEvents = require("../events/FormEvents");

const validationRules = {
  "appId": AppFormValidators.appId
};

const transformationRules = {
  "appId": AppFormTransforms.appId
};

const resolveMap = {
  appId: "id"
};

function validateField(fieldId, value) {
  const validate = validationRules[fieldId];
  return validate == null || validate(value);
}

function transformField(fieldId, value) {
  const transform = transformationRules[fieldId];
  if (transform == null) {
    return value;
  }
  return transform(value);
}

function storeTransformedValue(app, fieldId, value, index = null) {
  const field = resolveMap[fieldId];
  if (field) {
    // TODO deal with indices
    app[field] = value;
    return true;
  }
  return false;
}

var AppFormStore = lazy(EventEmitter.prototype).extend({
  app: {}
}).value();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case FormEvents.INSERT:
      // action.fieldId, ...
      break;
    case FormEvents.UPDATE:
      const fieldId = action.fieldId;
      const value = action.value;
      const index = action.index;

      const isValid = validateField(fieldId, value);
      if (!isValid) {
        AppFormStore.emit(FormEvents.FIELD_VALIDATION_ERROR, {
          fieldId: fieldId,
          value: value,
          index: index
        });
        break;
      }

      const transformedValue = transformField(fieldId, value);
      const isStored = storeTransformedValue(AppFormStore.app,
        fieldId,
        transformedValue,
        index
      );
      if (!isStored) {
        AppFormStore.emit(FormEvents.CHANGE_ERROR, {
          fieldId: fieldId,
          value: value,
          index: index
        });
        break;
      }

      AppFormStore.emit(FormEvents.CHANGE);
      break;
    case FormEvents.DELETE:
      break;
  }
});

module.exports = AppFormStore;
