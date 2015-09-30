var Util = require("../../helpers/Util");

const deploymentScheme = {
  affectedApps: [],
  currentStep: null,
  currentActions: [],
  id: null,
  steps: {},
  totalSteps: null,
  version: null
};

module.exports = Util.deepFreeze(deploymentScheme);
