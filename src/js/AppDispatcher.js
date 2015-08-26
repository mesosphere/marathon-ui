var dispatcher = new (require("flux").Dispatcher)();

dispatcher.dispatchNext = function (obj) {
  setTimeout(function () {
    dispatcher.dispatch(obj);
  });
};

module.exports = dispatcher;
