var React = require("react/addons");

var MemoryFieldComponent = React.createClass({
  displayName: "MemoryFieldComponent",
  propTypes: {
    megabytes: React.PropTypes.number.isRequired
  },
  render() {
    // For a documentation of the different unit prefixes please refer to:
    // https://en.wikipedia.org/wiki/Template:Quantities_of_bytes
    var units = ["MB", "GB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    var factor = 1024;
    var megabytes = this.props.megabytes;
    var value = 0;
    var index = 0;
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
