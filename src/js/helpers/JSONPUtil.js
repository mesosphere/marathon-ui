import Q from "q";

const JSONPUtil = {
  /**
   * Request JSONP data
   *
   * @param url {String}
   * @returns {Q.promise}
   */
  request(url) {
    var deferred = Q.defer();
    var callback = `jsonp_${Date.now().toString(16)}`;
    var script = document.createElement("script");
    // Add jsonp callback
    window[callback] = function handleJSONPResponce(data) {
      if (data != null) {
        return deferred.resolve(data);
      }
      deferred.reject(new Error("Empty response"));
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
      deferred.reject(error)
    };
    script.onload = function handleScriptLoad() {
      script.cleanUp();
    };
    // Load data
    script.src = `${url}${/[?&]/.test(url)? "&" : "?"}jsonp=${callback}`;
    document.head.appendChild(script);
    return deferred.promise;
  }
};

export default JSONPUtil;
