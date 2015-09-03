var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var AppFormTransforms = require("./AppFormTransforms");
var AppFormValidators = require("./AppFormValidators");
var FormEvents = require("../events/FormEvents");

const validationRules = {
  "appId": AppFormValidators.appId,
  "env": AppFormValidators.env
};

const transformationRules = {
  "appId": AppFormTransforms.appId,
  "env": AppFormTransforms.env
};

const resolveMap = {
  appId: "id",
  env: "env"
};

function isValidField(fieldId, value) {
  const validate = validationRules[fieldId];
  return validate == null || validate(value);
}

function insertField(fields, fieldId, value, index = null) {
  if (fieldId === "env") {
    if (fields.env === undefined) {
      fields.env = [];
    }
    if (index == null) {
      fields.env.push(value);
    } else {
      fields.env.splice(index, 0, value);
    }
  }
}

function updateField(fields, fieldId, value, index = null) {
  if (fieldId === "env") {
    if (fields.env === undefined) {
      fields.env = [];
    }

    if (fields.env[index] !== undefined) {
      fields.env[index] = value;
    }
  } else {
    fields[fieldId] = value;
  }
}

function getTransformedField(fieldId, value) {
  const transform = transformationRules[fieldId];
  if (transform == null) {
    return value;
  }
  return transform(value);
}

function storeTransformedValueToModel(app, fieldId, value, index = null) {
  const key = resolveMap[fieldId];
  if (key) {
    let field = getTransformedField(fieldId, value);

    if (key === "env") {
      if (app.env === undefined) {
        app.env = {};
      }
      app.env[Object.keys(field)[0]] = field[Object.keys(field)[0]];
    } else {
      app[key] = field;
    }

    return true;
  }
  return false;
}

var AppFormStore = lazy(EventEmitter.prototype).extend({
  app: {},
  fields: {}
}).value();

AppDispatcher.register(function (action) {
  const fieldId = action.fieldId;
  const value = action.value;
  const index = action.index;

  switch (action.actionType) {
    case FormEvents.INSERT:
      {
        const isValid = isValidField(fieldId, value);
        if (!isValid) {
          AppFormStore.emit(FormEvents.FIELD_VALIDATION_ERROR, {
            fieldId: fieldId,
            value: value,
            index: index
          });
          break;
        }

        insertField(AppFormStore.fields, fieldId, value, index);

        const isStored = storeTransformedValueToModel(AppFormStore.app,
          fieldId,
          value,
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

        AppFormStore.emit(FormEvents.CHANGE, fieldId);
      }
      break;
    case FormEvents.UPDATE:
      {
        const isValid = isValidField(fieldId, value);
        if (!isValid) {
          AppFormStore.emit(FormEvents.FIELD_VALIDATION_ERROR, {
            fieldId: fieldId,
            value: value,
            index: index
          });
          break;
        }

        updateField(AppFormStore.fields, fieldId, value, index);

        const isStored = storeTransformedValueToModel(AppFormStore.app,
          fieldId,
          value,
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

        AppFormStore.emit(FormEvents.CHANGE, fieldId);
      }
      break;
    case FormEvents.DELETE:
      break;
  }
});

module.exports = AppFormStore;
