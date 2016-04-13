import React from "react/addons";

import ContainerVolumesComponent
  from "../components/ContainerVolumesComponent";
import LocalVolumesComponent
  from "../components/LocalVolumesComponent";
import ExternalVolumesComponent
  from "../components/ExternalVolumesComponent";

var OptionalVolumesComponent = React.createClass({
  displayName: "OptionalVolumesComponent",

  propTypes: {
    errorIndices: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    getErrorMessage: React.PropTypes.func.isRequired,
    hasExternalVolumes: React.PropTypes.bool.isRequired
  },

  getExternalVolumesNode: function () {
    var props = this.props;

    if (!props.hasExternalVolumes) {
      return null;
    }

    return (
      <ExternalVolumesComponent
        errorIndices={props.errorIndices}
        getErrorMessage={props.getErrorMessage}
        fields={props.fields} />
    );
  },

  render: function () {
    return (
      <div>
        <LocalVolumesComponent
          errorIndices={this.props.errorIndices}
          getErrorMessage={this.props.getErrorMessage}
          fields={this.props.fields} />
        {this.getExternalVolumesNode()}
        <ContainerVolumesComponent
          errorIndices={this.props.errorIndices}
          getErrorMessage={this.props.getErrorMessage}
          fields={this.props.fields} />
      </div>
    );
  }
});

export default OptionalVolumesComponent;
