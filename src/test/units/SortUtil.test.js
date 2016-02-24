import {expect} from "chai";
import SortUtil from "../../js/helpers/SortUtil";

describe("SortUtil", function () {

  describe("compareValues", function () {

    var testCases = [
      {inputValues: [1, 1], expectedResult: 0},
      {inputValues: [-1, 1], expectedResult: -1},
      {inputValues: [1, -1], expectedResult: 1},
      {inputValues: [0, 1], expectedResult: -1},
      {inputValues: [1, 0], expectedResult: 1},
      {inputValues: [0.5, 0.8], expectedResult: -1},
      {inputValues: [0.75, 0.7], expectedResult: 1},
      {inputValues: [null, 1], expectedResult: -1},
      {inputValues: [1, null], expectedResult: 1},
      {inputValues: ["a", "a"], expectedResult: 0},
      {inputValues: ["a", "b"], expectedResult: -1},
      {inputValues: ["b", "a"], expectedResult: 1},
      {inputValues: ["a", null], expectedResult: 1},
      {inputValues: [null, "b"], expectedResult: -1}
    ];

    testCases.forEach(testCase => {
      it(`correctly computes score for [${testCase.inputValues}]`, () => {
        expect(SortUtil.compareValues.apply(this,testCase.inputValues))
          .to.be.equal(testCase.expectedResult);
      });
    });

  });

});
