var React = require("react/addons");

var MemoryFieldComponent = React.createClass({
  displayName: "MemoryFieldComponent",
  propTypes: {
    megabytes: React.PropTypes.number.isRequired
  },
  render() {
    const megabytes = this.props.megabytes;
    return (
      <span title={`${megabytes}MB`}>{`${megabytes}MB`}</span>
    );
  }
});

module.exports = MemoryFieldComponent;
