var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");
var objectPath = require("object-path");
var Util = require("../helpers/Util");

var AppDispatcher = require("../AppDispatcher");
var AppFormErrorMessages = require("../constants/AppFormErrorMessages");
var AppFormTransforms = require("./transforms/AppFormTransforms");
var AppFormModelPostProcess = require("./transforms/AppFormModelPostProcess");
var AppFormValidators = require("./validators/AppFormValidators");
var AppsStore = require("./AppsStore");
var AppsEvents = require("../events/AppsEvents");
var FormEvents = require("../events/FormEvents");

const defaultFieldValues = Object.freeze({
  cpus: 0.1,
  mem: 16,
  disk: 0,
  instances: 1
});

const duplicableRowFields = [
  "env",
  "dockerPortMappings",
  "dockerParameters",
  "containerVolumes"
];

/**
 * Validation rules for individual fields and fieldsets (duplicable rows).
 * The array index of the rule is related to the error message index
 * in AppFormErrorMessages.
 *
 * fieldIds not listed here are considered valid by default.
 */
const validationRules = {
  "appId": [
    AppFormValidators.appIdNotEmpty,
    AppFormValidators.appIdNoWhitespaces,
    AppFormValidators.appIdValidChars,
    AppFormValidators.appIdWellFormedPath
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
    AppFormValidators.dockerPortMappingsProtocolValidType
  ],
  "env": [AppFormValidators.env],
  "executor": [AppFormValidators.executor],
  "instances": [AppFormValidators.instances],
  "mem": [AppFormValidators.mem],
  "ports": [AppFormValidators.ports]
};

/**
 * Translation of fieldId to the application model key.
 *
 * fieldIds not listed here are not set in the model.
 */
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

/**
 * Translation map for server-side validation error responses.
 *
 * Resolves an attribute/path to the corresponding form fieldId.
 */
const responseAttributePathToFieldIdMap = {
  "id": "appId",
  "/id": "appId",
  "/cmd": "cmd",
  "/constraints": "constraints",
  "/container/docker/image": "dockerImage",
  "/container/docker/network": "dockerNetwork",
  "/container/docker/privileged": "dockerPrivileged",
  "/container/docker/parameters({INDEX})/key":
    "dockerParameters.{INDEX}.key",
  "/container/docker/parameters({INDEX})/value":
    "dockerParameters.{INDEX}.value",
  "/container/docker/portMappings({INDEX})/containerPort":
    "dockerPortMappings.{INDEX}.containerPort",
  "/container/docker/portMappings({INDEX})/hostPort":
    "dockerPortMappings.{INDEX}.hostPort",
  "/container/docker/portMappings({INDEX})/servicePort":
    "dockerPortMappings.{INDEX}.servicePort",
  "/container/docker/portMappings({INDEX})/protocol":
    "dockerPortMappings.{INDEX}.protocol",
  "/container/volumes({INDEX})/containerPath":
    "containerVolumes.{INDEX}.containerPath",
  "/container/volumes({INDEX})/hostPath":
    "containerVolumes.{INDEX}.hostPath",
  "/container/volumes({INDEX})/mode":
    "containerVolumes.{INDEX}.mode",
  "/cpus": "cpus",
  "/disk": "disk",
  "/env": "env",
  "/executor": "executor",
  "/instances": "instances",
  "/mem": "mem",
  "/ports": "ports",
  "/uris": "uris"
};

/**
 * Translation of a model key to fieldId.
 *
 * Not listed keys are taken as they are.
 */
const resolveAppKeyToFieldIdMap = {
  id: "appId",
  "container.docker.image": "dockerImage",
  "container.docker.network": "dockerNetwork",
  "container.docker.portMappings": "dockerPortMappings",
  "container.docker.parameters": "dockerParameters",
  "container.docker.privileged": "dockerPrivileged",
  "container.volumes": "containerVolumes"
};

function getValidationErrorIndex(fieldId, value) {
  if (validationRules[fieldId] == null) {
    return -1;
  }
  return validationRules[fieldId].findIndex((isValid) => !isValid(value));
}

function deleteErrorIndices(errorIndices, fieldId, consecutiveKey) {
  if (errorIndices[fieldId] && consecutiveKey != null) {
    delete errorIndices[fieldId][consecutiveKey];
    if (Object.keys(errorIndices[fieldId]).length === 0) {
      delete errorIndices[fieldId];
    }
  } else {
    delete errorIndices[fieldId];
  }
}

function rebuildModelFromFields(app, fields, fieldId) {
  const key = resolveFieldIdToAppKeyMap[fieldId];
  if (key) {
    const transform = AppFormTransforms.FieldToModel[fieldId];
    if (transform == null) {
      objectPath.set(app, key, fields[fieldId]);
    } else {
      objectPath.set(app, key, transform(fields[fieldId]));
    }
  }

  Object.keys(app).forEach((appKey) => {
    var postProcessor = AppFormModelPostProcess[appKey];
    if (postProcessor != null) {
      postProcessor(app);
    }
  });
}

function resolveResponseAttributePathToFieldId(attributePath) {
  var fieldId;
  // Check if attributePath contains an index like path(0)/attribute
  // Matches as defined: [0] : "(0)", [1]: "0"
  var matches = attributePath.match(/\(([0-9]+)\)/);
  if (matches != null) {
    let resolvePath = responseAttributePathToFieldIdMap[
      attributePath.replace(matches[0], "({INDEX})")
    ];
    if (resolvePath != null) {
      fieldId = resolvePath.replace("{INDEX}", matches[1]);
    }
  } else {
    fieldId = responseAttributePathToFieldIdMap[attributePath];
  }
  return fieldId;
}

function populateFieldsFromModel(app, fields) {
  // The env-object should be treated as an object itself, so it's excluded.
  var paths = Util.detectObjectPaths(app, null, ["env"]);

  paths.forEach((appKey) => {
    var fieldId = resolveAppKeyToFieldIdMap[appKey];
    if (fieldId == null) {
      fieldId = appKey;
    }
    const transform = AppFormTransforms.ModelToField[fieldId];
    if (transform == null) {
      fields[fieldId] = objectPath.get(app, appKey);
    } else {
      fields[fieldId] = transform(objectPath.get(app, appKey));
    }
  });
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

function processResponseErrors(responseErrors, response, statusCode) {
  if (statusCode >= 500) {
    responseErrors.general = AppFormErrorMessages.general[1];

  } else if (statusCode === 422 && response != null &&
      Util.isArray(response.errors)) {

    response.errors.forEach((error) => {
      var attributePath = error.attribute.length
        ? error.attribute
        : "general";
      var fieldId = resolveResponseAttributePathToFieldId(attributePath) ||
        attributePath;
      responseErrors[fieldId] =
        AppFormErrorMessages.lookupServerResponseMessage(error.error);
    });

  } else if (statusCode === 409 && response != null &&
      response.message != null) {

    responseErrors.general =
      `${AppFormErrorMessages.general[2]} ${response.message}`;

  } else if (statusCode === 400 && response != null &&
      Util.isArray(response.details)) {

    response.details.forEach((detail) => {
      var attributePath = detail.path.length
        ? detail.path
        : "general";
      var fieldId = resolveResponseAttributePathToFieldId(attributePath) ||
        attributePath;
      responseErrors[fieldId] = detail.errors.map((error) => {
        return AppFormErrorMessages.lookupServerResponseMessage(error);
      }).join(", ");
    });

  } else if (statusCode >= 300) {
    responseErrors.general = AppFormErrorMessages.general[0];
  }
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
    populateFieldsFromModel(app, this.fields);
  }
}).value();

function executeAction(action, setFieldFunction) {
  var actionType = action.actionType;
  var fieldId = action.fieldId;
  var value = action.value;
  var index = action.index;
  var errorIndices = AppFormStore.validationErrorIndices;
  var errorIndex = -1;

  if (actionType === FormEvents.INSERT || actionType === FormEvents.UPDATE) {
    errorIndex = getValidationErrorIndex(fieldId, value);

    if (errorIndex > -1) {
      if (value.consecutiveKey != null) {
        Util.initKeyValue(errorIndices, fieldId, []);
        errorIndices[fieldId][value.consecutiveKey] = errorIndex;
      } else {
        errorIndices[fieldId] = errorIndex;
      }
    } else {
      deleteErrorIndices(errorIndices, fieldId, value.consecutiveKey);
    }
  } else if (actionType === FormEvents.DELETE ) {
    deleteErrorIndices(errorIndices, fieldId, value.consecutiveKey);
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
