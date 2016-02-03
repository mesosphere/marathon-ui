var PluginLoaderLoadStub = function (executor) {
  return function (id, url) {
    return new Promise(function (resolve, reject) {
      executor(url, resolve, reject);
    });
  };
};

export default PluginLoaderLoadStub;
