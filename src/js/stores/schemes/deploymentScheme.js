import Util from "../../helpers/Util";

const deploymentScheme = {
  affectedApps: [],
  currentStep: null,
  currentActions: [],
  id: null,
  steps: {},
  totalSteps: null,
  version: null
};

export default Util.deepFreeze(deploymentScheme);
