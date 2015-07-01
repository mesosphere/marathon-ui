var AppStatus = require("../constants/AppStatus");

var appScheme = {
  cmd: null,
  constraints: [],
  container: null,
  cpus: null,
  deployments: [],
  env: {},
  executor: "",
  healthChecks: [],
  id: null,
  instances: 0,
  status: AppStatus.SUSPENDED,
  mem: null,
  disk: null,
  ports: [0],
  uris: [],
  tasks: [],
  tasksRunning: 0
};

module.exports = appScheme;
