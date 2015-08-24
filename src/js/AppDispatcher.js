var dispatcher = new (require("flux").Dispatcher)();

dispatcher.dispatchNext = function (obj) {
  setTimeout(function () {
    dispatcher.dispatch(obj);
  }, 1);
};

module.exports = dispatcher;
