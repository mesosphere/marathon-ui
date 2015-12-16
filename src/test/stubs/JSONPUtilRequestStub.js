var JSONPUtilStub = function (executor) {
  return function (url) {
    var promise = new Promise(function (resolve, reject) {
      executor(url, resolve, reject);
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

module.exports = JSONPUtilStub;
