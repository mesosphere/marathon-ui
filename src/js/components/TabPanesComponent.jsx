var Link = require("react-router").Link;
var React = require("react/addons");

var AppListFilterComponent = require("../components/AppListFilterComponent");
var AppListComponent = require("../components/AppListComponent");
var DeploymentsListComponent =
  require("../components/DeploymentsListComponent");
var TabPaneComponent = require("../components/TabPaneComponent");
var TogglableTabsComponent = require("../components/TogglableTabsComponent");

var tabs = require("../constants/tabs");

var TabPanesComponent = React.createClass({
  displayName: "TabPanesComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      filterText: ""
    };
  },

  updateFilterText: function (filterText) {
    this.setState({
      filterText: filterText
    });

  },

  getTabId: function () {
    var path = this.context.router.getCurrentPathname();

    var hasTab = tabs.find(tab => tab.id === path);

    if (hasTab) {
      return path;
    }

    return tabs[0].id;
  },

  render: function () {
    var path = this.context.router.getCurrentPathname();

    return (
      <TogglableTabsComponent activeTabId={this.getTabId()}
          className="container-fluid content">
        <TabPaneComponent id={tabs[0].id} className={"flex-container"}>
          <div className="wrapper">
            <nav className="sidebar">
              <Link to={path}
                    query={{modal: "new-app"}}
                    activeClassName={null}
                    className="btn btn-success">
                Create
              </Link>
              <h2>Status</h2>
            </nav>
            <main>
              <div className="app-list-controls">
                <AppListFilterComponent onChange={this.updateFilterText}/>
              </div>
              <AppListComponent filterText={this.state.filterText} />
            </main>
          </div>
        </TabPaneComponent>
        <TabPaneComponent id={tabs[1].id}>
          <DeploymentsListComponent />
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  }
});

module.exports = TabPanesComponent;
