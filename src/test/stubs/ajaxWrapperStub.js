var ajaxWrapperStub = function (executor) {
  return function (options) {
    var promise = new Promise(function (resolve, reject) {
      executor(options.url, resolve, reject);
    });

    promise.success = function (callback) {
      promise.then(callback);
      return promise;
    };

    promise.error = function (callback) {
      promise.catch(callback);
      return promise;
    };

    return promise;
  }
};
module.exports = ajaxWrapperStub;
