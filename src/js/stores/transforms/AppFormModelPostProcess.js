var Util = require("../../helpers/Util");

const AppFormModelPostProcess = {
  container: (app) => {
    var container = app.container;

    var empty = Util.isArray(container.volumes) &&
      container.volumes.length === 0;

    empty = empty || Util.isObject(container.docker) &&
      Object.values(container.docker)
      .every((element) => {
        return element == null ||
          (Util.isArray(element) && element.length === 0) ||
          Util.isEmptyString(element);
      });

    if (empty) {
      app.container = {};
    }
  }
};

module.exports = Object.freeze(AppFormModelPostProcess);
