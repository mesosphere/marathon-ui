var React = require("react/addons");
var Util = require("../../helpers/Util");

var ModalComponent = require("../ModalComponent");

var ConfirmModalComponent = React.createClass({
  displayName: "ConfirmModalComponent",

  propTypes: {
    message: React.PropTypes.string,
    onConfirm: React.PropTypes.func,
    onDestroy: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      message: "",
      onConfirm: Util.noop,
      onDestroy: Util.noop
    };
  },

  handleDestroy: function () {
    this.refs.modalComponent.destroy();
  },

  handleConfirm: function () {
    this.props.onConfirm();
  },

  render: function () {
    return (
      <ModalComponent
          dismissOnClickOutside={true}
          ref="modalComponent"
          size="sm"
          onDestroy={this.props.onDestroy}>
        <div className="modal-body reduced-padding">
          {this.props.message}
          <div className="modal-controls">
            <button
                className="btn btn-success pull-right"
                type="button"
                onClick={this.handleConfirm}>
              OK
            </button>
            <button
                className="btn btn-default pull-right"
                type="button"
                onClick={this.handleDestroy}>
              Cancel
            </button>
          </div>
        </div>
      </ModalComponent>
    );
  }
});

module.exports = ConfirmModalComponent;
