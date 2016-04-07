import Messages from "../constants/Messages";
import Util from "../helpers/Util";

import ValidConstraints from "./ValidConstraints";

const applicationFieldValidationErrors = Util.deepFreeze({
  appId: [
    "ID must not be empty",
    "Path must not contain whitespace",
    "Path contains invalid characters " +
      "(allowed: lowercase letters, digits, hyphens, \".\", \"..\")",
    "Path is not well-formed"
  ],
  constraints: [
    "Invalid constraints format or operator. Supported operators are " +
    ValidConstraints.map((c) => `'${c.toUpperCase()}'`).join(", ") +
    ". See https://mesosphere.github.io/marathon/docs/constraints.html"
  ],
  containerVolumes: [
    "Container Path must be a valid path",
    "Host Path must be a valid path",
    "Mode must not be empty",
    "Container Path and Host Path must be set."
  ],
  localVolumes: [
    "Size must be a non-negative number",
    "Container Path must be a valid path",
    "Container Path and Size must be set"
  ],
  cpus: ["CPUs must be a number greater than or equal to 0.01"],
  disk: ["Disk Space must be a non-negative number"],
  dockerImage: ["Image cannot contain whitespaces"],
  dockerParameters: ["Key cannot be blank"],
  env: ["Key cannot be blank"],
  executor: ["Invalid executor format"],
  healthChecks: [
    "Incorrect protocol given",
    "Command must not be emtpy",
    "Path must not be empty",
    "Port Index must be a non-negative number",
    "Port Number must be a valid port between 0 - 65535",
    "Grace Period must be a non-negative number",
    "Interval must be a non-negative number",
    "Timeout must be a non-negative number",
    "Maximal Consecutive Failures must be a non-negative number"
  ],
  instances: ["Instances must be a non-negative number"],
  labels: ["Key cannot be blank"],
  mem: ["Memory must be a number greater than or equal to 32"],
  portDefinitions: [
    "Port must be a valid port",
    "Protocol must be either 'tcp' or 'udp'"
  ],
});

const generalErrors = Util.deepFreeze({
  appCreation:
    "App creation unsuccessful. Check your app settings and try again.",
  appLocked: "App is currently locked by one or more deployments. " +
    "Press the button again to forcefully change and deploy " +
    "the new configuration.",
  unknownServerError: "Unknown server error. Could not create or apply app.",
  unauthorizedAccess: `App creation unsuccessful. ${Messages.UNAUTHORIZED}`,
  forbiddenAccess: `App creation unsuccessful. ${Messages.FORBIDDEN}`,
  errorPrefix: "Error:"
});

const serverResponseMappings = Util.deepFreeze({
  "error.path.missing": "Specify a path",
  "error.minLength": "Command may not be blank",
  "error.expected.jsnumber": "A number is expected",
  "error.expected.jsstring": "A string is expected"
});

const AppFormErrorMessages = {
  getFieldMessage: function (fieldId, index = 0) {
    if (applicationFieldValidationErrors[fieldId] != null &&
        applicationFieldValidationErrors[fieldId][index] != null) {
      return applicationFieldValidationErrors[fieldId][index];
    }
    return "Undefined error";
  },

  getGeneralMessage: function (key) {
    if (generalErrors[key] != null) {
      return generalErrors[key];
    }
    return "General error";
  },

  lookupServerResponseMessage: function (serverMessage) {
    if (serverResponseMappings[serverMessage] != null) {
      return serverResponseMappings[serverMessage];
    }
    return serverMessage;
  }
};

export default Util.deepFreeze(AppFormErrorMessages);
