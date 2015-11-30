const HealthStatus = {
  HEALTHY: "healthy",
  UNHEALTHY: "unhealthy",
  UNKNOWN: "unknown",
  STAGED: "staged",
  OVERCAPACITY: "over-capacity",
  UNSCHEDULED: "unscheduled"
};

module.exports = Object.freeze(HealthStatus);
