var responseStatus = {};

function OboeResponse () {

  var response = {
    done: function (fn) {
      this._done = fn;
      return this;
    },
    fail: function (fn) {
      this._fail = fn;
      return this;
    }
  };

  setTimeout(function () {
    if (responseStatus.hasOwnProperty("done")) {
      response._done(responseStatus.done);
    }
    if (responseStatus.hasOwnProperty("fail")) {
      response._fail(responseStatus.fail);
    }
  }, 1);

  return response;
}

function request () {
  var response = new OboeResponse();
  return response;
}

function reset () {
  responseStatus = {};
}

function respondWithDone (response) {
  responseStatus.done = response;
}

function respondWithFail (response) {
  responseStatus.fail = response;
}

module.exports = {
  request: request,
  reset: reset,
  respondWithDone: respondWithDone,
  respondWithFail: respondWithFail
};
