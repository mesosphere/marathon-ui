const HealthStatus = {
  HEALTHY: 0,
  UNHEALTHY: 1,
  UNKNOWN: 2,
  STAGED: 3,
  OVERCAPACITY: 4,
  UNSCHEDULED: 5
};

module.exports = Object.freeze(HealthStatus);
