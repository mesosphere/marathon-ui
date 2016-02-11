const URLUtil = {
  getAbsoluteURL: function (url) {
    // Use some browser magic to turn relative into absolute URLs
    var a = document.createElement("a");
    a.href = url;
    return a.href;
  }
};

export default URLUtil;
