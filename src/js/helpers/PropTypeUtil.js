import Util from "../helpers/Util";

var PropTypeUtil = {
  oneOrManyInstancesOf: function (component) {
    return function (props, propName, componentName) {
      var prop = props[propName];
      if (!Util.isComponentOf(prop, component)) {
        return new Error(
          `${propName} of ${componentName} should only be of type \
          ${component.displayName}.`
        );
      }
    };
  }
};

export default PropTypeUtil;
