import {expect} from "chai";
import sinon from "sinon";
import PipelineStore from "../../js/plugin/sdk/pipeline/PipelineStore";
import {default as TestPipelineStore} from  "../../js/plugin/sdk/pipeline/PipelineStore";
import pipelineModel from "../../js/plugin/sdk/pipeline/PipelineModel";
import * as PipelineNames from "../../js/plugin/sdk/pipeline/PipelineNames";

describe("PipelineStore tests", function () {

    it("shoult share the same pipeline model", function () {
      expect(TestPipelineStore.pipelines === PipelineStore.pipelines);
    });

    it("it should proxy applyPipeline calls to PipelineModel", function () {
      var pipelineSpy = sinon.spy(PipelineStore.pipelines, "applyPipeline");
      PipelineStore.applyPipeline(PipelineNames.PRE_AJAX_REQUEST, {});
      expect(pipelineSpy.called).to.be.true;
    });

    it("it should proxy registerOperator calls to PipelineModel", function () {
      var pipelineSpy = sinon.spy(PipelineStore.pipelines, "registerOperator");
      PipelineStore.registerOperator(PipelineNames.PRE_AJAX_REQUEST, (data) => {return data;});
      expect(pipelineSpy.called).to.be.true;
    });

    it("it should proxy deregisterOperator calls to PipelineModel", function () {
      var pipelineSpy = sinon.spy(PipelineStore.pipelines, "deregisterOperator");
      PipelineStore.deregisterOperator(PipelineNames.PRE_AJAX_REQUEST, (data) => {return data;});
      expect(pipelineSpy.called).to.be.true;
    });

});
