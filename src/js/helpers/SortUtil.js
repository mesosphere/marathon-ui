import Util from "./Util";

var SearchUtil = {
  compareValues: function (a, b) {

    if (a == null) {
      return -1;
    }

    if (b == null) {
      return 1;
    }

    if (Util.isNumber(a) && Util.isNumber(a)) {

      var delta = a - b;
      return delta / Math.abs(delta || 1);
    }

    if (Util.isString(a) && Util.isString(b)) {
      return a.localeCompare(b);
    }

    return 0;
  }
};

export default SearchUtil;
