var DOMUtil = {
  getComputedStyle(node) {
    if (typeof window.getComputedStyle === "undefined") {
      return node.currentStyle;
    }
    return window.getComputedStyle(node);
  },
  getInnerWidth(node) {
    var computedStyle = this.getComputedStyle(node);
    var width = parseInt(node.clientWidth);
    width -= parseInt(computedStyle.paddingLeft);
    width -= parseInt(computedStyle.paddingRight);
    return width;
  },
  getOuterWidth(node) {
    var computedStyle = this.getComputedStyle(node);
    var width = parseInt(node.clientWidth);
    width += parseInt(computedStyle.marginLeft);
    width += parseInt(computedStyle.marginRight);
    width += parseInt(computedStyle.borderLeftWidth);
    width += parseInt(computedStyle.borderRightWidth);
    return width;
  }
};

module.exports = DOMUtil;
