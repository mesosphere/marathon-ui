import Util from "../../helpers/Util";

import HealthStatus from "../../constants/HealthStatus";

const groupScheme = {
  totalCpus: 0,
  totalMem: 0,
  instances: 0,
  health: [
    {quantity: 0, state: HealthStatus.HEALTHY},
    {quantity: 0, state: HealthStatus.UNHEALTHY},
    {quantity: 0, state: HealthStatus.UNKNOWN},
    {quantity: 0, state: HealthStatus.STAGED},
    {quantity: 0, state: HealthStatus.OVERCAPACITY},
    {quantity: 0, state: HealthStatus.UNSCHEDULED}
  ],
  tasksStaged: 0,
  tasksRunning: 0,
  tasksHealthy: 0,
  tasksUnhealthy: 0,
  isGroup: true,
  id: null
};

export default Util.deepFreeze(groupScheme);
