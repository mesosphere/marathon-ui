import React from "react/addons";

import ContainerVolumesComponent
  from "../components/ContainerVolumesComponent";
import LocalVolumesComponent
  from "../components/LocalVolumesComponent";

var OptionalVolumesComponent = React.createClass({
  displayName: "OptionalVolumesComponent",

  propTypes: {
    errorIndices: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    getErrorMessage: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <div>
        <LocalVolumesComponent
          errorIndices={this.props.errorIndices}
          getErrorMessage={this.props.getErrorMessage}
          fields={this.props.fields} />
        <ContainerVolumesComponent
          errorIndices={this.props.errorIndices}
          getErrorMessage={this.props.getErrorMessage}
          fields={this.props.fields} />
      </div>
    );
  }
});

export default OptionalVolumesComponent;
