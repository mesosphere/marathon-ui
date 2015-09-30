var Util = require("../../helpers/Util");

var HealthCheckProtocols = require("../../constants/HealthCheckProtocols");

const healthChecksRowScheme = {
  protocol: HealthCheckProtocols.HTTP,
  command: null,
  path: null,
  portIndex: 0,
  gracePeriodSeconds: 300,
  intervalSeconds: 60,
  timeoutSeconds: 20,
  maxConsecutiveFailures: 3,
  ignoreHttp1xx: false
};

module.exports = Util.deepFreeze(healthChecksRowScheme);
