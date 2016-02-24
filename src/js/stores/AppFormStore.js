import {EventEmitter} from "events";
import objectPath from "object-path";
import Util from "../helpers/Util";

import {AppConfigFormDefaultValues} from "../constants/AppConfigDefaults";
import AppDispatcher from "../AppDispatcher";
import AppFormErrorMessages from "../constants/AppFormErrorMessages";
import AppFormTransforms from "./transforms/AppFormTransforms";
import AppFormModelPostProcess from "./transforms/AppFormModelPostProcess";
import AppFormValidators from "./validators/AppFormValidators";
import AppsStore from "./AppsStore";
import ContainerConstants from "../constants/ContainerConstants";
import AppsEvents from "../events/AppsEvents";
import FormEvents from "../events/FormEvents";

const storeData = {
  app: {},
  fields: {},
  responseErrors: {},
  validationErrorIndices: {}
};

const duplicableRowFields = Object.freeze([
  "containerVolumes",
  "localVolumes",
  "dockerPortMappings",
  "dockerParameters",
  "env",
  "healthChecks",
  "labels"
]);

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
    AppFormValidators.containerVolumesModeNotEmpty,
    AppFormValidators.containerVolumesIsNotEmpty
  ],
  "localVolumes": [
    AppFormValidators.localVolumesSize,
    AppFormValidators.localVolumesPath,
    AppFormValidators.localVolumesIsNotEmpty
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
  "healthChecks": [
    AppFormValidators.healthChecksProtocol,
    AppFormValidators.healthChecksCommandNotEmpty,
    AppFormValidators.healthChecksPathNotEmpty,
    AppFormValidators.healthChecksPortIndex,
    AppFormValidators.healthChecksPort,
    AppFormValidators.healthChecksGracePeriod,
    AppFormValidators.healthChecksInterval,
    AppFormValidators.healthChecksTimeout,
    AppFormValidators.healthChecksMaxConsecutiveFailures
  ],
  "instances": [AppFormValidators.instances],
  "labels": [AppFormValidators.labels],
  "mem": [AppFormValidators.mem],
  // "portDefinitions": []
};

/**
 * Translation of fieldId to the application model key.
 *
 * fieldIds not listed here are not set in the model.
 */
const resolveFieldIdToAppKeyMap = {
  appId: "id",
  acceptedResourceRoles: "acceptedResourceRoles",
  cmd: "cmd",
  constraints: "constraints",
  containerVolumes: "container.volumes",
  localVolumes: "container.volumes",
  cpus: "cpus",
  disk: "disk",
  dockerForcePullImage: "container.docker.forcePullImage",
  dockerImage: "container.docker.image",
  dockerNetwork: "container.docker.network",
  dockerParameters: "container.docker.parameters",
  dockerPortMappings: "container.docker.portMappings",
  dockerPrivileged: "container.docker.privileged",
  healthChecks: "healthChecks",
  instances: "instances",
  env: "env",
  executor: "executor",
  labels: "labels",
  mem: "mem",
  portDefinitions: "portDefinitions",
  uris: "uris",
  user: "user"
};

/**
 * Translation map for server-side validation error responses.
 *
 * Resolves an attribute/path to the corresponding form fieldId.
 */
const responseAttributePathToFieldIdMap = {
  "id": "appId",
  "apps": "appId",
  "/id": "appId",
  "/acceptedResourceRoles": "acceptedResourceRoles",
  "/cmd": "cmd",
  "/constraints": "constraints",
  "/constraints({INDEX})": "constraints",
  "/container/docker/forcePullImage": "dockerForcePullImage",
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
  "/healthChecks({INDEX})/command/value":
    "healthChecks.{INDEX}.command",
  "/healthChecks({INDEX})/path":
    "healthChecks.{INDEX}.path",
  "/healthChecks({INDEX})/intervalSeconds":
    "healthChecks.{INDEX}.intervalSeconds",
  "/healthChecks({INDEX})/port":
    "healthChecks.{INDEX}.port",
  "/healthChecks({INDEX})/portIndex":
    "healthChecks.{INDEX}.portIndex",
  "/healthChecks({INDEX})/timeoutSeconds":
    "healthChecks.{INDEX}.timeoutSeconds",
  "/healthChecks({INDEX})/gracePeriodSeconds":
    "healthChecks.{INDEX}.gracePeriodSeconds",
  "/healthChecks({INDEX})/maxConsecutiveFailures":
    "healthChecks.{INDEX}.maxConsecutiveFailures",
  "/instances": "instances",
  "/mem": "mem",
  "/labels": "labels",
  "/uris": "uris",
  "/user": "user",
  "value": "general"
};

/**
 * Translation of a model key to fieldId.
 *
 * Not listed keys are taken as they are.
 */
const resolveAppKeyToFieldIdMap = {
  id: ["appId"],
  "container.docker.forcePullImage": ["dockerForcePullImage"],
  "container.docker.image": ["dockerImage"],
  "container.docker.network": ["dockerNetwork"],
  "container.docker.portMappings": ["portDefinitions"],
  "container.docker.parameters": ["dockerParameters"],
  "container.docker.privileged": ["dockerPrivileged"],
  "container.volumes": [
    "containerVolumes",
    "localVolumes"
  ],
  "healthChecks": ["healthChecks"]
};

// Validate all fields in form store and update validationErrorIndices.
// Return true if all checks passed, otherwise false.
function checkAllFieldsForValidity(fields) {
  return Object.keys(fields).reduce((memo, fieldId) => {
    var value = fields[fieldId];
    var isDuplicableRowField = duplicableRowFields.indexOf(fieldId) > -1;

    if (value != null) {
      if (isDuplicableRowField) {
        return checkDuplicableRowFieldForValidity(fieldId, value) && memo;
      }
      return checkFieldForValidity(fieldId, value) && memo;
    }
    return memo;
  }, true);
}

// Update validationErrorIndices, also return true if there was any error
function checkDuplicableRowFieldForValidity(fieldId, values) {
  return values.reduce((memo, value) => {
    return memo && checkFieldForValidity(fieldId, value);
  }, true);
}

// Update validationErrorIndices, also return true if there was an error
function checkFieldForValidity(fieldId, value) {
  return !updateErrorIndices(
    fieldId, value, AppFormStore.validationErrorIndices);
}

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

// Update validationErrorIndices for given field - insert error if one exists,
// delete any existent error if no error exists.
// Returns true if an error was found.
function updateErrorIndices(fieldId, value, errorIndices) {
  var errorIndex = getValidationErrorIndex(fieldId, value);
  if (errorIndex > -1) {
    if (value.consecutiveKey != null) {
      Util.initKeyValue(errorIndices, fieldId, []);
      errorIndices[fieldId][value.consecutiveKey] = errorIndex;
    } else {
      errorIndices[fieldId] = errorIndex;
    }
    return true;
  }
  deleteErrorIndices(errorIndices, fieldId, value.consecutiveKey);
  return false;
}

function getFieldValue(fields, fieldId) {
  var value = fields[fieldId];
  var transform = AppFormTransforms.FieldToModel[fieldId];

  if (transform == null || value == null) {
    return value;
  }

  return transform(value);
}

function rebuildModelFromFields(app, fields, fieldId) {
  const key = resolveFieldIdToAppKeyMap[fieldId];

  if (key) {
    let fieldIdsBySameModelKey = Object.keys(resolveFieldIdToAppKeyMap)
      .filter(mapKey => {
        return resolveFieldIdToAppKeyMap[mapKey] ===
          resolveFieldIdToAppKeyMap[fieldId];
      });

    let fieldValue;

    if (fieldIdsBySameModelKey.length <= 1) {
      fieldValue = getFieldValue(fields, fieldId);
    } else {
      fieldValue = fieldIdsBySameModelKey.reduce((memo, fieldId) => {
        var value = getFieldValue(fields, fieldId);

        if (value != null) {
          memo = memo.concat(value);
        }

        return memo;
      }, []);
    }

    Util.objectPathSet(app, key, fieldValue);
  }

  Object.keys(app).forEach(appKey => {
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
  // The env/labels-object should be treated as an object itself,
  // so it's excluded.
  var paths = Util.detectObjectPaths(app, null, ["env", "labels"]);

  var dockerNetwork =
    objectPath.get(app, "container.docker.network");

  if (dockerNetwork != null &&
      dockerNetwork === ContainerConstants.NETWORK.BRIDGE) {
    paths = paths.filter(appKey => appKey !== "portDefinitions");
  }

  paths.forEach(appKey => {
    var fieldIdArray = resolveAppKeyToFieldIdMap[appKey];
    if (fieldIdArray == null) {
      fieldIdArray = [appKey];
    }
    fieldIdArray.forEach(fieldId => {
      const transform = AppFormTransforms.ModelToField[fieldId];
      if (transform == null) {
        fields[fieldId] = objectPath.get(app, appKey);
      } else {
        fields[fieldId] = transform(objectPath.get(app, appKey));
      }
    });
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
  var responseHasMessage = response != null && response.message != null;
  var responseHasDeployments = response != null && response.deployments != null;
  if (statusCode >= 500) {
    responseErrors.general =
      AppFormErrorMessages.getGeneralMessage("unknownServerError");

  } else if (statusCode === 422 && response != null &&
      Util.isArray(response.details)) {
    response.details.forEach(detail => {
      var attributePath = detail.attribute.length
        ? detail.attribute
        : "general";
      var fieldId = resolveResponseAttributePathToFieldId(attributePath) ||
        attributePath;
      responseErrors[fieldId] =
        AppFormErrorMessages.lookupServerResponseMessage(detail.error);
    });

  } else if (statusCode === 409 && responseHasDeployments) {

    responseErrors.general =
      AppFormErrorMessages.getGeneralMessage("appLocked");

  } else if (statusCode === 409 && responseHasMessage) {

    responseErrors.general =
      AppFormErrorMessages.getGeneralMessage("errorPrefix") + " " +
      response.message;

  } else if (statusCode === 403) {

    responseErrors.general =
      AppFormErrorMessages.getGeneralMessage("forbiddenAccess");

    if (responseHasMessage) {
      responseErrors.general =
        AppFormErrorMessages.getGeneralMessage("errorPrefix") + " " +
        response.message;
    }

  } else if (statusCode === 401) {

    responseErrors.general =
      AppFormErrorMessages.getGeneralMessage("unauthorizedAccess");

    if (responseHasMessage) {
      responseErrors.general =
        AppFormErrorMessages.getGeneralMessage("errorPrefix") + " " +
        response.message;
    }

  } else if (statusCode === 400 && response != null &&
      Util.isArray(response.details)) {

    response.details.forEach(detail => {
      var attributePath = detail.path.length
        ? detail.path
        : "general";
      var fieldId = resolveResponseAttributePathToFieldId(attributePath) ||
        attributePath;
      responseErrors[fieldId] = detail.errors.map(error => {
        return AppFormErrorMessages.lookupServerResponseMessage(error);
      }).join(", ");
    });

  } else if (statusCode >= 300) {
    responseErrors.general =
      AppFormErrorMessages.getGeneralMessage("appCreation");
  }
}

var AppFormStore = Util.extendObject(EventEmitter.prototype, {
  get app() {
    var app = Util.deepCopy(storeData.app);

    Object.keys(app).forEach(appKey => {
      var postProcessor = AppFormModelPostProcess[appKey];
      if (postProcessor != null) {
        postProcessor(app);
      }
    });

    var dockerNetwork =
      objectPath.get(app, "container.docker.network");

    if (dockerNetwork != null &&
        dockerNetwork === ContainerConstants.NETWORK.BRIDGE) {
      delete app.portDefinitions;
    } else if (objectPath.get(app, "container.docker.portMappings") != null) {
      delete app.container.docker.portMappings;
    }

    return app;
  },
  get fields() {
    return Util.deepCopy(storeData.fields);
  },
  get responseErrors() {
    return Util.deepCopy(storeData.responseErrors);
  },
  get validationErrorIndices() {
    return Util.deepCopy(storeData.validationErrorIndices);
  },

  initAndReset: function () {
    storeData.app = {};
    storeData.fields = {};
    storeData.responseErrors = {};
    storeData.validationErrorIndices = {};

    Object.keys(AppConfigFormDefaultValues).forEach((fieldId) => {
      storeData.fields[fieldId] = AppConfigFormDefaultValues[fieldId];
      rebuildModelFromFields(storeData.app, storeData.fields, fieldId);
    });
  },
  populateFieldsFromAppDefinition: function (app) {
    storeData.app = app;
    populateFieldsFromModel(Util.deepCopy(storeData.app), storeData.fields);

    if (!checkAllFieldsForValidity(storeData.fields)) {
      AppFormStore.emit(FormEvents.FIELD_VALIDATION_ERROR);
    }
  }
});

function executeAction(action, setFieldFunction) {
  var actionType = action.actionType;
  var fieldId = action.fieldId;
  var value = action.value;
  var index = action.index;
  var errorIndices = storeData.validationErrorIndices;
  var errorOccurred = false;

  if (actionType === FormEvents.INSERT || actionType === FormEvents.UPDATE) {
    errorOccurred = updateErrorIndices(fieldId, value, errorIndices);
  } else if (actionType === FormEvents.DELETE ) {
    deleteErrorIndices(errorIndices, fieldId, value.consecutiveKey);
  }

  setFieldFunction(storeData.fields, fieldId, index, value);

  if (!errorOccurred) {
    rebuildModelFromFields(storeData.app, storeData.fields, fieldId);
    AppFormStore.emit(FormEvents.CHANGE, fieldId);
  } else {
    AppFormStore.emit(FormEvents.FIELD_VALIDATION_ERROR);
  }
}

function onAppsErrorResponse(response, statusCode) {
  storeData.responseErrors = {};
  processResponseErrors(storeData.responseErrors, response, statusCode);
}

AppsStore.on(AppsEvents.CREATE_APP_ERROR, function (data, status) {
  onAppsErrorResponse(data, status);
});
AppsStore.on(AppsEvents.APPLY_APP_ERROR, function (data, isEditing, status) {
  onAppsErrorResponse(data, status);
});
AppsStore.on(AppsEvents.CREATE_APP, function () {
  storeData.responseErrors = {};
});
AppsStore.on(AppsEvents.APPLY_APP, function () {
  storeData.responseErrors = {};
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

export default AppFormStore;
