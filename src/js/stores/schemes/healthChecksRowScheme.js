import Util from "../../helpers/Util";

import HealthCheckProtocols from "../../constants/HealthCheckProtocols";
import HealthCheckPortTypes from "../../constants/HealthCheckPortTypes";

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

export default Util.deepFreeze(healthChecksRowScheme);
