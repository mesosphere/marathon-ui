const JSONPUtil = {
  /**
   * Request JSONP data
   *
   * @todo: write test to verify this util is working properly
   *
   * @param {string} url
   * @returns {Promise} promise
   */
  request: function (url) {
    return new Promise(function (resolve, reject) {
      var callback = `jsonp_${Date.now().toString(16)}`;
      var script = document.createElement("script");
      // Add jsonp callback
      window[callback] = function handleJSONPResponse(data) {
        if (data != null) {
          return resolve(data);
        }
        reject(new Error("Empty response"));
      };
      // Add clean up method
      script.cleanUp = function () {
        if (this.parentNode) {
          this.parentNode.removeChild(script);
        }
      };
      // Add handler
      script.onerror = function handleScriptError(error) {
        script.cleanUp();
        reject(error);
      };
      script.onload = function handleScriptLoad() {
        script.cleanUp();
      };
      // Load data
      script.src = `${url}${ /[?&]/.test(url) ? "&" : "?" }jsonp=${callback}`;
      document.head.appendChild(script);
    });
  }
};

export default JSONPUtil;
