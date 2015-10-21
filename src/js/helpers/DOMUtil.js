var DOMUtil = {
  getInnerWidth(node) {
    var computedStyle = window.getComputedStyle(node);
    var width = parseInt(node.clientWidth);
    width -= parseInt(computedStyle.paddingLeft);
    width -= parseInt(computedStyle.paddingRight);
    return width;
  },
  getOuterWidth(node) {
    var computedStyle = window.getComputedStyle(node);
    var width = parseInt(node.clientWidth);
    width += parseInt(computedStyle.marginLeft);
    width += parseInt(computedStyle.marginRight);
    width += parseInt(computedStyle.borderLeftWidth);
    width += parseInt(computedStyle.borderRightWidth);
    return width;
  }
};

module.exports = DOMUtil;
