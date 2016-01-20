import {Dispatcher} from "flux";

var dispatcher = new Dispatcher();
dispatcher.dispatchNext = function (obj) {
  setTimeout(function () {
    dispatcher.dispatch(obj);
  });
};

export default dispatcher;
