const AppStatus = {
  RUNNING: 0,
  DEPLOYING: 1,
  // App has 0 tasks
  SUSPENDED: 2,
  // App tasks execution is delayed due to an error
  DELAYED: 3,
  // App is waiting for a resource offer
  WAITING: 4,
  // App is waiting for user decision during migration
  WAITING_FOR_DECISION: 5,
};

export default Object.freeze(AppStatus);
