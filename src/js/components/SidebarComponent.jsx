import {Link} from "react-router";
import React from "react/addons";

import FilterTypes from "../constants/FilterTypes";
import SidebarHealthFilterComponent
  from "../components/SidebarHealthFilterComponent";
import SidebarLabelsFilterComponent
  from "../components/SidebarLabelsFilterComponent";
import SidebarStatusFilterComponent
  from "../components/SidebarStatusFilterComponent";

import QueryParamsMixin from "../mixins/QueryParamsMixin";
import PluginMountPointComponent from "../components/PluginMountPointComponent";
import PluginMountPoints from "../plugin/external/PluginMountPoints";

var SidebarComponent = React.createClass({
  displayName: "SidebarComponent",

  mixins: [QueryParamsMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    groupId: React.PropTypes.string.isRequired
  },

  render: function () {
    var path = this.context.router.getCurrentPathname();
    var props = this.props;

    var newAppModalQuery = {
      modal: "new-app"
    };

    if (props.groupId != null && props.groupId !== "/") {
      newAppModalQuery.groupId = props.groupId;
    }

    return (
      <nav className="sidebar">
        <Link to={path}
            query={newAppModalQuery}
            className="btn btn-success create-app"
            activeClassName="create-app-active">
          Create
        </Link>
        <div className="flex-row">
          <h3 className="small-caps">Status</h3>
          {this.getClearLinkForFilter(FilterTypes.STATUS)}
        </div>
        <SidebarStatusFilterComponent />
        <div className="flex-row">
          <h3 className="small-caps">Health</h3>
          {this.getClearLinkForFilter(FilterTypes.HEALTH)}
        </div>
        <SidebarHealthFilterComponent />
        <SidebarLabelsFilterComponent />
        <PluginMountPointComponent placeId={PluginMountPoints.SIDEBAR_BOTTOM} />
      </nav>
    );
  }
});

export default SidebarComponent;
