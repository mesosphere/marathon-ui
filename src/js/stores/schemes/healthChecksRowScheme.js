var Util = require("../../helpers/Util");

var HealthCheckProtocols = require("../../constants/HealthCheckProtocols");
var HealthCheckPortTypes = require("../../constants/HealthCheckPortTypes");

const healthChecksRowScheme = {
  protocol: HealthCheckProtocols.HTTP,
  command: null,
  path: null,
  port: 0,
  portIndex: 0,
  portType: HealthCheckPortTypes.PORT_INDEX,
  gracePeriodSeconds: 300,
  intervalSeconds: 60,
  timeoutSeconds: 20,
  maxConsecutiveFailures: 3,
  ignoreHttp1xx: false
};

module.exports = Util.deepFreeze(healthChecksRowScheme);
