const ValidConstraints = require("./ValidConstraints");

const AppFormErrorMessages = {
  appId: [
    "ID must not be empty",
    "Path must not contain whitespace",
    "Path contains invalid characters " +
      "(allowed: lowercase letters, digits, hyphens, \".\", \"..\")",
    "Path is not well-formed"
  ],
  constraints: [
    "Invalid constraints format or operator. Supported operators are " +
    ValidConstraints.map((c) => `'${c}'`).join(", ") +
    ". See https://mesosphere.github.io/marathon/docs/constraints.html."
  ],
  containerVolumes: [
    "Container Path must be a valid path",
    "Host Path must be a valid path",
    "Mode must not be empty"
  ],
  cpus: ["CPUs must be a non-negative number"],
  disk: ["Disk Space must be a non-negative number"],
  dockerImage: ["Image cannot  contain whitespaces"],
  dockerParameters: ["Key cannot be blank"],
  dockerPortMappings: [
    "Container Port must be a valid port",
    "Host Port must be a valid port",
    "Service Port must be a valid port",
    "Protocol must be of type 'tcp' or 'udp'"
  ],
  env: ["Key cannot be blank"],
  executor: ["Invalid executor format"],
  healthChecks: [
    "Incorrect protocol given",
    "Command must not be emtpy",
    "Path must not be emtpy",
    "Port Index must be a non-negative number",
    "Grace Period must be a non-negative number",
    "Interval must be a non-negative number",
    "Timeout must be a non-negative number",
    "Maximal Consecutive Failures must be a non-negative number"
  ],
  general: [
    "App creation unsuccessful. Check your app settings and try again.",
    "Unknown server error, could not create or apply app.",
    "Error:",
    "App creation unsuccessful. Unauthorized access."
  ],
  instances: ["Instances must be a non-negative Number"],
  labels: ["Key cannot be blank"],
  mem: ["Memory must be a non-negative Number"],
  ports: ["Ports must be a comma-separated list of numbers"],

  // Those are mappings to server side error messages
  "error.path.missing": ["Please provide a path"],

  getMessage: function (fieldId, index = 0) {
    if (this[fieldId] != null && this[fieldId][index] != null) {
      return this[fieldId][index];
    }
    return "General error";
  },
  lookupServerResponseMessage: function (serverMessage) {
    if (this[serverMessage] != null && this[serverMessage][0] != null) {
      return this[serverMessage][0];
    }
    return serverMessage;
  }
};

module.exports = Object.freeze(AppFormErrorMessages);
