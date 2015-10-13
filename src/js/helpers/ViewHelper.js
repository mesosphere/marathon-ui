var ViewHelpers = {
  convertMegabytesToString(megabytes) {
    // For a documentation of the different unit prefixes please refer to:
    // https://en.wikipedia.org/wiki/Template:Quantities_of_bytes
    var units = ["MB", "GB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    var factor = 1024;
    var value = 0;
    var index = 0;
    if (megabytes > 0) {
      index = Math.floor(Math.log(megabytes) / Math.log(factor));
      value = Math.round(megabytes / Math.pow(factor, index));
    }
    return `${value}${units[index]}`;
  },
  getRelativePath(id, currentGroup) {
    if (!currentGroup.endsWith("/")) {
      currentGroup += "/";
    }
    return id.substring(currentGroup.length);
  }
};

module.exports = ViewHelpers;
