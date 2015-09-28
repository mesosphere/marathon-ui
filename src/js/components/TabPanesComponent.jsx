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
        <TabPaneComponent id={tabs[0].id} className="flex-container">
          <div className="wrapper">
            <nav className="sidebar">
              <Link to={path}
                query={{modal: "new-app"}}
                activeClassName={null}
                className="btn btn-success">
                Create
              </Link>
              <h3>Status</h3>
              <ul className="list-group checked-list-box filters">
                <li className="checkbox">
                  <input type="checkbox" id="filter-cb-1"/>
                  <label htmlFor="filter-cb-1">Running</label>
                </li>
                <li className="checkbox">
                  <input type="checkbox" checked id="filter-cb-2"/>
                  <label htmlFor="filter-cb-2">Deploying</label>
                </li>
                <li className="checkbox">
                  <input type="checkbox" id="filter-cb-3"/>
                  <label htmlFor="filter-cb-3">Inactive</label>
                </li>
                <li className="checkbox">
                  <input type="checkbox" id="filter-cb-4"/>
                  <label htmlFor="filter-cb-4">Waiting</label>
                </li>
                <li className="checkbox">
                  <input type="checkbox" id="filter-cb-5"/>
                  <label htmlFor="filter-cb-5">Delayed</label>
                </li>
              </ul>
              <h3>Application Type</h3>
              <ul className="list-group checked-list-box filters">
                <li className="checkbox">
                  <input type="checkbox" id="filter-cb-6"/>
                  <label htmlFor="filter-cb-6">Docker</label>
                </li>
                <li className="checkbox">
                  <input type="checkbox" checked id="filter-cb-7"/>
                  <label htmlFor="filter-cb-7">Rocket</label>
                </li>
                <li className="checkbox">
                  <input type="checkbox" id="filter-cb-8"/>
                  <label htmlFor="filter-cb-8">Cgroup</label>
                </li>
              </ul>
            </nav>
            <main>
              <div className="contextual-bar">
                <div className="breadcrumbs">
                  <h2>My Applications</h2>
                </div>
                <div className="app-list-controls">
                  <AppListFilterComponent onChange={this.updateFilterText}/>
                  <div className="btn-group toggle-list-view">
                    <button className="btn btn-default"
                      type="button">
                      <i className="icon ion-navicon" /> List
                    </button>
                    <button className="btn btn-default"
                      type="button">
                      <i className="icon ion-navicon" /> Tree
                    </button>
                  </div>
                </div>
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
