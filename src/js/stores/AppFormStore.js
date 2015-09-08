var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");
var Util = require("../helpers/Util");

var AppDispatcher = require("../AppDispatcher");
var AppFormTransforms = require("./AppFormTransforms");
var AppFormValidators = require("./AppFormValidators");
var FormEvents = require("../events/FormEvents");

const validationRules = {
  "appId": [
    AppFormValidators.appIdNotEmpty,
    AppFormValidators.appIdNoWhitespaces
  ],
  "env": [AppFormValidators.env]
};

const transformationRules = {
  "appId": AppFormTransforms.appId,
  "env": AppFormTransforms.env
};

const resolveMap = {
  appId: "id",
  env: "env"
};

function getValidationErrorIndex(fieldId, value) {
  return validationRules[fieldId].findIndex((isValid) =>!isValid(value));
}

function insertField(fields, fieldId, index = null, value) {
  if (fieldId === "env") {
    Util.initKeyValue(fields, "env", []);
    if (index == null) {
      fields.env.push(value);
    } else {
      fields.env.splice(index, 0, value);
    }
  }
}

function updateField(fields, fieldId, index = null, value) {
  if (fieldId === "env") {
    Util.initKeyValue(fields, "env", []);
    fields.env[index] = value;
  } else {
    fields[fieldId] = value;
  }
}

function deleteField(fields, fieldId, index) {
  if (fieldId === "env") {
    fields.env.splice(index, 1);
  }
}

function getTransformedField(fieldId, value) {
  const transform = transformationRules[fieldId];
  if (transform == null) {
    return value;
  }
  return transform(value);
}

function rebuildModelFromFields(app, fields, fieldId) {
  const key = resolveMap[fieldId];
  if (key) {
    let field = getTransformedField(fieldId, fields[fieldId]);
    app[key] = field;
  }
}

var AppFormStore = lazy(EventEmitter.prototype).extend({
  app: {},
  fields: {},
  validationErrorIndices: {}
}).value();

function executeAction(action, setFieldFunction) {
  const fieldId = action.fieldId;
  const value = action.value;
  const index = action.index;
  let errorIndex = -1;

  // This is not a delete-action
  if (value !== undefined || index == null) {
    errorIndex = getValidationErrorIndex(fieldId, value);

    if (errorIndex > -1) {
      if (index != null) {
        Util.initKeyValue(AppFormStore.validationErrorIndices, fieldId, []);
        AppFormStore.validationErrorIndices[fieldId][index] = errorIndex;
      } else {
        AppFormStore.validationErrorIndices[fieldId] = errorIndex;
      }
    } else {
      delete AppFormStore.validationErrorIndices[fieldId];
    }
  }

  setFieldFunction(AppFormStore.fields, fieldId, index, value);

  if (errorIndex === -1) {
    rebuildModelFromFields(AppFormStore.app, AppFormStore.fields, fieldId);
    AppFormStore.emit(FormEvents.CHANGE, fieldId);
  } else {
    AppFormStore.emit(FormEvents.FIELD_VALIDATION_ERROR);
  }
}

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case FormEvents.INSERT:
      executeAction(action, insertField);
      break;
    case FormEvents.UPDATE:
      executeAction(action, updateField);
      break;
    case FormEvents.DELETE:
      executeAction(action, deleteField);
      break;
  }
});

module.exports = AppFormStore;
