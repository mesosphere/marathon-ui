var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");
var objectPath = require("object-path");
var Util = require("../helpers/Util");

var AppDispatcher = require("../AppDispatcher");
var AppFormErrorMessages = require("../validators/AppFormErrorMessages");
var AppFormTransforms = require("./AppFormTransforms");
var AppFormValidators = require("./AppFormValidators");
var AppsStore = require("./AppsStore");
var AppsEvents = require("../events/AppsEvents");
var FormEvents = require("../events/FormEvents");

const defaultFieldValues = Object.freeze({
  cpus: 0.1,
  mem: 16,
  disk: 0,
  instances: 1
});

const validationRules = {
  "appId": [
    AppFormValidators.appIdNotEmpty,
    AppFormValidators.appIdNoWhitespaces
  ],
  "constraints": [AppFormValidators.constraints],
  "containerVolumes": [
    AppFormValidators.containerVolumesContainerPathIsValid,
    AppFormValidators.containerVolumesHostPathIsValid,
    AppFormValidators.containerVolumesModeNotEmpty
  ],
  "cpus": [AppFormValidators.cpus],
  "disk": [AppFormValidators.disk],
  "dockerImage": [AppFormValidators.dockerImageNoWhitespaces],
  "dockerParameters": [AppFormValidators.dockerParameters],
  "dockerPortMappings": [
    AppFormValidators.dockerPortMappingsContainerPortIsValid,
    AppFormValidators.dockerPortMappingsHostPortIsValid,
    AppFormValidators.dockerPortMappingsServicePortIsValid,
    AppFormValidators.dockerPortMappingsProtocolNotEmpty
  ],
  "env": [AppFormValidators.env],
  "executor": [AppFormValidators.executor],
  "instances": [AppFormValidators.instances],
  "mem": [AppFormValidators.mem],
  "ports": [AppFormValidators.ports]
};

const resolveFieldIdToAppKeyMap = {
  appId: "id",
  cmd: "cmd",
  constraints: "constraints",
  containerVolumes: "container.volumes",
  cpus: "cpus",
  disk: "disk",
  dockerImage: "container.docker.image",
  dockerNetwork: "container.docker.network",
  dockerParameters: "container.docker.parameters",
  dockerPortMappings: "container.docker.portMappings",
  dockerPrivileged: "container.docker.privileged",
  instances: "instances",
  env: "env",
  executor: "executor",
  mem: "mem",
  ports: "ports",
  uris: "uris"
};

const duplicableRowFields = [
  "env",
  "dockerPortMappings",
  "dockerParameters",
  "containerVolumes"
];

const responseAttributeNameToFieldIdMap = {
  "id": "appId",
  "/cmd": "cmd",
  "/cpus": "cpus",
  "/disk": "disk",
  "/env": "env",
  "/executor": "executor",
  "/instances": "instances",
  "/mem": "mem",
  "/ports": "ports",
  "/uris": "uris",
  "/constraints": "constraints"
};

function getValidationErrorIndex(fieldId, value) {
  if (validationRules[fieldId] == null) {
    return -1;
  }
  return validationRules[fieldId].findIndex((isValid) => !isValid(value));
}

function insertField(fields, fieldId, index = null, value) {
  if (duplicableRowFields.indexOf(fieldId) !== -1) {
    Util.initKeyValue(fields, fieldId, []);
    if (index == null) {
      fields[fieldId].push(value);
    } else {
      fields[fieldId].splice(index, 0, value);
    }
  }
}

function updateField(fields, fieldId, index = null, value) {
  if (duplicableRowFields.indexOf(fieldId) !== -1) {
    Util.initKeyValue(fields, fieldId, []);
    fields[fieldId][index] = value;
  } else {
    fields[fieldId] = value;
  }
}

function deleteField(fields, fieldId, index) {
  if (duplicableRowFields.indexOf(fieldId) !== -1) {
    fields[fieldId].splice(index, 1);
  }
}

function getTransformedField(fieldId, value) {
  const transform = AppFormTransforms[fieldId];
  if (transform == null) {
    return value;
  }
  return transform(value);
}

function rebuildModelFromFields(app, fields, fieldId) {
  const key = resolveFieldIdToAppKeyMap[fieldId];
  if (key) {
    let field = getTransformedField(fieldId, fields[fieldId]);
    if (field != null) {
      objectPath.set(app, key, field);
    }
  }
}

function processResponseErrors(responseErrors, response, statusCode) {
  if (statusCode >= 500) {
    responseErrors.general = AppFormErrorMessages.general[1];

  } else if (statusCode === 422 && response != null &&
      Util.isArray(response.errors)) {

    response.errors.forEach((error) => {
      var fieldId = error.attribute.length
        ? error.attribute
        : "general";
      fieldId = responseAttributeNameToFieldIdMap[fieldId] || fieldId;
      responseErrors[fieldId] = error.error;
    });

  } else if (statusCode === 409 && response != null &&
      response.message != null) {

    responseErrors.general =
      `${AppFormErrorMessages.general[2]} ${response.message}`;

  } else if (statusCode === 400 && response != null &&
      Util.isArray(response.details)) {

    response.details.forEach((detail) => {
      var fieldId = detail.path.length
        ? detail.path
        : "general";
      fieldId = responseAttributeNameToFieldIdMap[fieldId] || fieldId;
      responseErrors[fieldId] = detail.errors.join(", ");
    });

  } else if (statusCode >= 300) {
    responseErrors.general = AppFormErrorMessages.general[0];
  }
}

function populateFieldsByModel(app, fields) {
  Object.keys(app).forEach((appKey) => {
    var fieldId = resolveAppKeyToFieldIdMap[appKey];
    if (fieldId == null) {
      fieldId = appKey;
    }
    fields[fieldId] = app[appKey];
  });
  console.log("f", fields);
}

var AppFormStore = lazy(EventEmitter.prototype).extend({
  app: {},
  fields: {},
  responseErrors: {},
  validationErrorIndices: {},
  initAndReset: function () {
    this.app = {};
    this.fields = {};
    this.validationErrorIndices = {};

    Object.keys(defaultFieldValues).forEach((fieldId) => {
      this.fields[fieldId] = defaultFieldValues[fieldId];
      rebuildModelFromFields(this.app, this.fields, fieldId);
    });
  },
  populateFieldsFromAppDefinition: function (app) {
    this.app = app;
    populateFieldsByModel(app, this.fields);
  }
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

function onAppsErrorResponse(response, statusCode) {
  AppFormStore.responseErrors = {};
  processResponseErrors(AppFormStore.responseErrors, response, statusCode);
}

AppsStore.on(AppsEvents.CREATE_APP_ERROR, function (data, status) {
  onAppsErrorResponse(data, status);
});
AppsStore.on(AppsEvents.APPLY_APP_ERROR, function (data, isEditing, status) {
  onAppsErrorResponse(data, status);
});
AppsStore.on(AppsEvents.CREATE_APP, function () {
  AppFormStore.responseErrors = {};
});
AppsStore.on(AppsEvents.APPLY_APP, function () {
  AppFormStore.responseErrors = {};
});

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
