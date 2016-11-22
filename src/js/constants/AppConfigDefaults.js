import Util from "../helpers/Util";

// Default values for the config form editor
export const AppConfigFormDefaultValues = Util.deepFreeze({
  id: "",
  cmd: "",
  cpus: 1,
  mem: 128,
  disk: 0,
  instances: 1
});

// Default values for an 'empty' app config, or the JSON editor
export const AppConfigDefaultValues = Util.deepFreeze({
  id: null,
  cmd: null,
  cpus: 1,
  mem: 128,
  disk: 0,
  instances: 1
});

// Complete app configuration with default values
export const AllAppConfigDefaultValues = Util.deepFreeze(
  Object.assign({}, AppConfigDefaultValues, {
    args: null,
    env: {},
    executor: "",
    constraints: [],
    uris: [],
    fetch: [],
    storeUrls: [],
    requirePorts: false,
    backoffSeconds: 1,
    backoffFactor: 1.15,
    maxLaunchDelaySeconds: 3600,
    container: null,
    healthChecks: [],
    dependencies: [],
    upgradeStrategy: {
      minimumHealthCapacity: 1,
      maximumOverCapacity: 1
    },
    labels: {},
    acceptedResourceRoles: null,
    portDefinitions: [{
      "labels": {},
      "port": 0,
      "protocol": "tcp"
    }],
    readinessChecks: [],
    user: ""
  })
);
