var Link = require("react-router").Link;
var React = require("react/addons");

var Util = require("../helpers/Util");

function encodeValuesToURIComponents(values) {
  if (Util.isArray(values)) {
    return values.map((param) => {
      var uriComponent = Util.isArray(param)
        ? param.join(":")
        : param.toString();

      return encodeURIComponent(uriComponent);
    });
  }

  return encodeURIComponent(values);
}

var QueryParamsMixin = {
  contextTypes: {
    router: React.PropTypes.func
  },

  getClearLinkForFilter:
      function (filterQueryParamKey, caption = "Clear", className = null) {
    var state = this.state;

    if (state.filters[filterQueryParamKey].length === 0) {
      return null;
    }

    let router = this.context.router;
    let currentPathname = router.getCurrentPathname();
    let query = Object.assign({}, router.getCurrentQuery());
    let params = router.getCurrentParams();

    if (query[filterQueryParamKey] != null) {
      delete query[filterQueryParamKey];
    }

    return (
      <Link className={className}
          to={currentPathname}
          query={query}
          params={params}>
        {caption}
      </Link>
    );
  },

  getQueryParamValue: function (paramKey) {
    var router = this.context.router;
    return router.getCurrentQuery()[paramKey];
  },

  setQueryParam: function (paramKey, paramValue) {
    var router = this.context.router;
    var queryParams = router.getCurrentQuery();

    if (paramValue != null && paramValue.length !== 0) {
      let encodedFilter = encodeValuesToURIComponents(paramValue);

      Object.assign(queryParams, {
        [paramKey]: encodedFilter
      });
    } else {
      delete queryParams[paramKey];
    }

    router.transitionTo(router.getCurrentPathname(), {}, queryParams);
  }
};

module.exports = QueryParamsMixin;
