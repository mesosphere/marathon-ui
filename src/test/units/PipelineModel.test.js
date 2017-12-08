import {expect} from "chai";
import PipelineModel from "../../js/plugin/sdk/pipeline/PipelineModel"

import {PRE_AJAX_REQUEST} from "../../js/plugin/sdk/pipeline/PipelineNames"

const pipelineModel = new PipelineModel();

describe("PipelineModel tests", function () {

    beforeEach(function (){
      this.pipelineModel = new PipelineModel();
    });

    it("should call registered operators in the right order", function () {
      var firstOperator = function(data) {
        return Object.assign({}, data, {value: data.value + "_first_suffix"});
      };
      var secondOperaator = function(data) {
        return Object.assign({}, data, {value: data.value + "_second_suffix"});
      };

      this.pipelineModel.registerOperator(PRE_AJAX_REQUEST, firstOperator);
      this.pipelineModel.registerOperator(PRE_AJAX_REQUEST, secondOperaator);
      let filtered_data = this.pipelineModel.applyPipeline(PRE_AJAX_REQUEST, {value: "initial"});
      expect(filtered_data.value).to.be.equal("initial_first_suffix_second_suffix");
    });

    it("should register a new operator to the pipeline", function () {
      const operator = function(data) {return data;};

      this.pipelineModel.registerOperator(PRE_AJAX_REQUEST, operator);
      expect(this.pipelineModel.pipelines.get(PRE_AJAX_REQUEST)).to.have.lengthOf(1);
      expect(this.pipelineModel.pipelines.get(PRE_AJAX_REQUEST)[0]).to.be.equal(operator);
    });

    it("should register multiple operators to the pipeline", function () {
      var operator = function(data) {return data;};
      var operator2 = function(data) {return data;};

      this.pipelineModel.registerOperator(PRE_AJAX_REQUEST, operator);
      this.pipelineModel.registerOperator(PRE_AJAX_REQUEST, operator2);
      expect(this.pipelineModel.pipelines.get(PRE_AJAX_REQUEST)).to.have.lengthOf(2);
      expect(this.pipelineModel.pipelines.get(PRE_AJAX_REQUEST)[0]).to.be.equal(operator);
      expect(this.pipelineModel.pipelines.get(PRE_AJAX_REQUEST)[1]).to.be.equal(operator2);
    });

    it("should deregister operator from the pipeline", function () {
      var operator = function(data) {return data;};

      this.pipelineModel.registerOperator(PRE_AJAX_REQUEST, operator);
      expect(this.pipelineModel.pipelines.get(PRE_AJAX_REQUEST)).to.have.lengthOf(1);

      this.pipelineModel.deregisterOperator(PRE_AJAX_REQUEST, operator);
      expect(this.pipelineModel.pipelines.get(PRE_AJAX_REQUEST)).to.have.lengthOf(0);
    });

    it("should not error when removing the same operator twice", function () {
      var operator = function(data) {return data;};

      this.pipelineModel.registerOperator(PRE_AJAX_REQUEST, operator);

      this.pipelineModel.deregisterOperator(PRE_AJAX_REQUEST, operator);
      this.pipelineModel.deregisterOperator(PRE_AJAX_REQUEST, operator);
      expect(this.pipelineModel.pipelines.get(PRE_AJAX_REQUEST)).to.have.lengthOf(0);
    });

    it("should not register the same operator twice", function () {
      var operator = function(data) {return data;};

      this.pipelineModel.registerOperator(PRE_AJAX_REQUEST, operator);
      this.pipelineModel.registerOperator(PRE_AJAX_REQUEST, operator);
      expect(this.pipelineModel.pipelines.get(PRE_AJAX_REQUEST)).to.have.lengthOf(1);
      expect(this.pipelineModel.pipelines.get(PRE_AJAX_REQUEST)[0]).to.be.equal(operator);
    });

    it("should call all operators of the chosen pipeline", function () {
      var filter_one = function(data) {
        return Object.assign({}, data, {value: data.value + "_filter_one"});
      };
      var filter_two = function(data) {
        return Object.assign({}, data, {value: data.value + "_filter_two"});
      };

      this.pipelineModel.registerOperator(PRE_AJAX_REQUEST, filter_one);
      this.pipelineModel.registerOperator(PRE_AJAX_REQUEST, filter_two);
      let filtered_data = this.pipelineModel.applyPipeline(PRE_AJAX_REQUEST, {value: "initial"});
      expect(filtered_data.value).to.be.equal("initial_filter_one_filter_two");
    });

    it("should be able to run an empty pipeline", function () {
      const filtered_data = this.pipelineModel.applyPipeline(PRE_AJAX_REQUEST, {value: "initial"});
      expect(filtered_data.value).to.be.equal("initial");
    });

});

