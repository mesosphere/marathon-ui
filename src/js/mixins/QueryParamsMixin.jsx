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

  setQueryParam: function (filterName, filterValue) {
    var router = this.context.router;
    var queryParams = router.getCurrentQuery();

    if (filterValue != null && filterValue.length !== 0) {
      let encodedFilter = encodeValuesToURIComponents(filterValue);

      Object.assign(queryParams, {
        [filterName]: encodedFilter
      });
    } else {
      delete queryParams[filterName];
    }

    router.transitionTo(router.getCurrentPathname(), {}, queryParams);
  }
};

module.exports = QueryParamsMixin;
