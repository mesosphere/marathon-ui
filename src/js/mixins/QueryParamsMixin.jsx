var Link = require("react-router").Link;
var React = require("react/addons");

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
  }
};

module.exports = QueryParamsMixin;
