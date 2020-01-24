const BASE_SCHEME_LABEL = "MARATHON_SCHEME_PORT";

var ServiceSchemeUtil = {
  /*
   * Returns service scheme of the n-th port.
   *
   * Given N a port index, if `MARATHON_SCHEME_PORT<N>` is
   * in the set of labels, then the function returns the value
   * of this label.
   *
   * Given N a port index, if `MARATHON_SCHEME_PORT0<N>` is
   * not in the set of labels, then the value associated with
   * `MARATHON_SCHEME_PORT` is returned.
   *
   * Given N a port index, if `MARATHON_SCHEME_PORT0<N>` and
   * `MARATHON_SCHEME_PORT` are not in the set of labels, the
   * function returns the `http` as the default scheme.
   */
  getServiceSchemeFromLabels(labels, n) {
    function getScheme(labelValue) {
      return (labelValue === "http" || labelValue === "https")
        ? labelValue
        : "";
    }

    const labelKey = BASE_SCHEME_LABEL + n;
    if (labels && labelKey in labels)
      return getScheme(labels[labelKey]);
    else if (labels && BASE_SCHEME_LABEL in labels)
      return getScheme(labels[BASE_SCHEME_LABEL]);

    return "";
  }
};

export default ServiceSchemeUtil;