var React = require("react/addons");

var MemoryFieldComponent = React.createClass({
  displayName: "MemoryFieldComponent",
  propTypes: {
    megabytes: React.PropTypes.number.isRequired
  },
  render() {
    // For a documentation of the different unit prefixes please refer to:
    // https://en.wikipedia.org/wiki/Template:Quantities_of_bytes
    const units = ["MB", "GB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    const factor = 1024;
    const megabytes = this.props.megabytes;
    let value = 0;
    let index = 0;
    if (megabytes > 0) {
      index = Math.floor(Math.log(megabytes) / Math.log(factor));
      value = Math.round(megabytes / Math.pow(factor, index));
    }
    return (
      <span title={`${megabytes}MB`}>{`${value}${units[index]}`}</span>
    );
  }
});

module.exports = MemoryFieldComponent;
