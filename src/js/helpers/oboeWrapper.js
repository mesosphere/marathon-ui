var oboe = require("oboe");

var oboeWrapper = function (req) {
  var api = oboe(req)
    .start(function (status) {
      this.status = status;
    });

  api.success = function (callback) {
    this.done(function (payload) {
      if (!this.status.toString().match(/^2[0-9][0-9]$/)) {
        return;
      } else {
        callback(payload);
      }
    });
    return this;
  };

  api.error = function (callback) {
    this.fail(function (error) {
      if (error.thrown) {
        throw error.thrown;
      }
      callback(error);
      return this;
    });
  };

  return api;
};

module.exports = oboeWrapper;
