var ViewHelpers = {
  getRelativePath(id, currentGroup) {
    if (!currentGroup.endsWith("/")) {
      currentGroup += "/";
    }
    return id.substring(currentGroup.length);
  },
  getGroupFromAppId(id) {
    return id.split("/").slice(0, -1).join("/") + "/";
  }
};

module.exports = ViewHelpers;
