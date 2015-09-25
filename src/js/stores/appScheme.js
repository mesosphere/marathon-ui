var AppStatus = require("../constants/AppStatus");

var appScheme = {
  cmd: null,
  constraints: [],
  acceptedResourceRoles: [],
  container: null,
  cpus: null,
  dependencies: [],
  deployments: [],
  env: {},
  executor: "",
  healthChecks: [],
  health: [],
  healthWeight: 0,
  id: null,
  instances: 0,
  labels: {},
  lastTaskFailure: null,
  status: AppStatus.SUSPENDED,
  mem: null,
  disk: null,
  ports: [0],
  uris: [],
  user: null,
  tasks: [],
  tasksRunning: 0,
  taskStats: {}
};

module.exports = appScheme;
