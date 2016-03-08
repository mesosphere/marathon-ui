import {expect} from "chai";
import React from "react/addons";

import PropTypeUtil from "../../js/helpers/PropTypeUtil";

describe("PropTypeUtil", function () {

  describe("oneOrManyInstancesOf", function () {

    var TestComponentA = React.createClass({
      render: function () {
        return null;
      }
    });

    var TestComponentB = React.createClass({
      render: function () {
        return null;
      }
    });

    var propTypeValidator = PropTypeUtil.oneOrManyInstancesOf(TestComponentA);

    it("should return nothing for same component type", function () {
      expect(
        propTypeValidator({test:<TestComponentA />},"test", "PropTypeUtilTest")
      ).to.be.not.an.instanceof(Error);
    });

    it("should return Error if components are different", function () {
      expect(
        propTypeValidator({test:<TestComponentB />},"test", "PropTypeUtilTest")
      ).to.be.an.instanceof(Error);
    });

    it("should return nothing if all components are same", function () {
      expect(propTypeValidator({test:[
        <TestComponentA />,
        <TestComponentA />
      ]},"test", "PropTypeUtilTest")).to.be.not.an.instanceof(Error);
    });

    it("should return Error if not all components are same", function () {
      expect(propTypeValidator({test:[
        <TestComponentA />,
        <TestComponentB />
      ]},"test", "PropTypeUtilTest")).to.be.an.instanceof(Error);
    });

    it("should return Error if props are null", function () {
      expect(
        propTypeValidator({test:null},"test", "PropTypeUtilTest")
      ).to.be.an.instanceof(Error);
    });
  });

});
