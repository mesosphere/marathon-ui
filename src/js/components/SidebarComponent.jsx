import React from "react/addons";

import FilterTypes from "../constants/FilterTypes";
import SidebarHealthFilterComponent
  from "../components/SidebarHealthFilterComponent";
import SidebarLabelsFilterComponent
  from "../components/SidebarLabelsFilterComponent";
import SidebarStatusFilterComponent
  from "../components/SidebarStatusFilterComponent";
import SidebarVolumesFilterComponent
  from "../components/SidebarVolumesFilterComponent";

import QueryParamsMixin from "../mixins/QueryParamsMixin";
import PluginMountPointComponent from "../components/PluginMountPointComponent";
import PluginMountPoints from "../plugin/shared/PluginMountPoints";

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
    return (
      <nav className="sidebar">
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
        <SidebarVolumesFilterComponent />
        <PluginMountPointComponent placeId={PluginMountPoints.SIDEBAR_BOTTOM} />
      </nav>
    );
  }
});

export default SidebarComponent;
