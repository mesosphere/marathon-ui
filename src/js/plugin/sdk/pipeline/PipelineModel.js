
export default class PipelineModel {

  constructor() {
    this.pipelines = new Map();
  };

  applyPipeline(pipelineName, filterParameters) {
    if (!this.pipelines.has(pipelineName)) {
      return filterParameters;
    }
    return this.pipelines.get(pipelineName)
      .reduce((accumulator, operator) => {
        try {
          return operator(accumulator);
        } catch (error) {
          // We might want to log a proper error to help users debug
          return accumulator;
        }
      }, filterParameters);
  };

  registerOperator(pipelineName, operator) {
    if (!this.pipelines.has(pipelineName)) {
      this.pipelines.set(pipelineName, [operator]);
    } else {
      const operatorPipeline = this.pipelines.get(pipelineName);
      if (operatorPipeline.indexOf(operator) === -1) {
        operatorPipeline.push(operator);
      }
    }
  };

  deregisterOperator(pipelineName, operator) {
    if (this.pipelines.has(pipelineName)) {
      const operatorPipeline = this.pipelines.get(pipelineName);

      const operatorIndex = operatorPipeline.indexOf(operator);
      if (operatorIndex !== -1) {
        operatorPipeline.splice(operatorIndex, 1);
      }
    }
  };

};

