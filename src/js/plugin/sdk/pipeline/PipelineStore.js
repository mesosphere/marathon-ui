import PipelineModel from "./PipelineModel";

class PipelineStore {

  constructor() {
    Object.defineProperty(this, "pipelines", {value: new PipelineModel()});
  };

  applyPipeline(operationName, filterParameters) {
    return this.pipelines.applyPipeline(operationName, filterParameters);
  };

  registerOperator(operationName, operator) {
    return this.pipelines.registerOperator(operationName, operator);
  };

  deregisterOperator(operationName, operator) {
    return this.pipelines.deregisterOperator(operationName, operator);
  };

};

export default new PipelineStore();
