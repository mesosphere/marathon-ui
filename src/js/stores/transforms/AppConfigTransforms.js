import {AllAppConfigDefaultValues} from "../../constants/AppConfigDefaults";
import Util from "../../helpers/Util";

const AllAppConfigKeys = Object.keys(AllAppConfigDefaultValues);

const AppConfigTransforms = {
  // Returns an intelligent diff of two configs, stripping out unchanged and
  // added default values
  diff: function (oldConfig, newConfig) {
    return AllAppConfigKeys.reduce(function (config, key) {
      var oldValue = oldConfig[key];
      var newValue = newConfig[key];
      var defaultValue = AllAppConfigDefaultValues[key];

      if (!Util.isEgal(oldValue, newValue) &&
          (typeof newValue !== "undefined") &&
          !(oldValue == null && Util.isEgal(newValue, defaultValue))) {
        config[key] = newValue;
      }

      return config;
    }, {});
  }
};

export default AppConfigTransforms;
