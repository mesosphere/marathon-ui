var oboe = require("oboe");

var OboeWrapper = function (req) {
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
  return api;
};

module.exports = OboeWrapper;
