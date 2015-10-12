var React = require("react/addons");
var ViewHelper = require("../helpers/ViewHelper");
var MemoryFieldComponent = React.createClass({
  displayName: "MemoryFieldComponent",
  propTypes: {
    megabytes: React.PropTypes.number.isRequired
  },
  render() {
    var megabytes = this.props.megabytes;
    return (
      <span title={`${megabytes}MB`}>
        {`${ViewHelper.convertMegabytesToString(megabytes)}`}
      </span>
    );
  }
});

module.exports = MemoryFieldComponent;
