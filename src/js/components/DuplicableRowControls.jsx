var classNames = require("classnames");
var React = require("react/addons");

var DuplicableRowControls = React.createClass({
  displayName: "DuplicableRowControls",
  propTypes: {
    disableRemoveButton: React.PropTypes.bool,
    handleAddRow: React.PropTypes.func.isRequired,
    handleRemoveRow: React.PropTypes.func.isRequired
  },
  render: function () {
    var props = this.props;

    var removeButtonClassSet = classNames({
      "btn btn-link remove": true,
      "disabled": props.disableRemoveButton
    });

    return (
      <div className="controls">
        <button className={removeButtonClassSet}
            onClick={this.props.handleRemoveRow}>
          <i className="icon ion-ios-minus-outline"/>
          <i className="icon icon-hover ion-ios-minus"/>
        </button>
        <button className="btn btn-link add" onClick={this.props.handleAddRow}>
          <i className="icon ion-ios-plus-outline"/>
          <i className="icon icon-hover ion-ios-plus"/>
        </button>
      </div>
    );
  }
});

module.exports = DuplicableRowControls;
