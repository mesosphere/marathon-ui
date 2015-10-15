var ViewHelpers = {
  getRelativePath(id, currentGroup) {
    if (!currentGroup.endsWith("/")) {
      currentGroup += "/";
    }
    return id.substring(currentGroup.length);
  }
};

module.exports = ViewHelpers;
