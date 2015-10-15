var ViewHelpers = {
  getRelativePath(id, currentGroup) {
    if (!currentGroup.endsWith("/")) {
      currentGroup += "/";
    }
    if (id.startsWith(currentGroup)) {
      return id.substring(currentGroup.length);
    }
    return id;
  },
  getGroupFromAppId(id) {
    return id.split("/").slice(0, -1).join("/") + "/";
  }
};

module.exports = ViewHelpers;
