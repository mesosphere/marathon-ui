var React = require("react/addons");
var Util = require("../../helpers/Util");

var ModalComponent = require("../ModalComponent");

var ConfirmModalComponent = React.createClass({
  displayName: "ConfirmModalComponent",

  propTypes: {
    message: React.PropTypes.string,
    onConfirm: React.PropTypes.func,
    onDestroy: React.PropTypes.func,
    successButtonLabel: React.PropTypes.string
  },

  componentDidMount: function () {
    React.findDOMNode(this.refs.confirmButton).focus();
  },

  getDefaultProps: function () {
    return {
      message: "",
      onConfirm: Util.noop,
      onDestroy: Util.noop,
      successButtonLabel: "OK"
    };
  },

  handleDestroy: function () {
    this.refs.modalComponent.destroy();
  },

  handleConfirm: function () {
    this.props.onConfirm();
  },

  render: function () {
    var props = this.props;

    return (
      <ModalComponent
          centered={true}
          dismissOnClickOutside={true}
          ref="modalComponent"
          size="sm"
          onDestroy={props.onDestroy}>
        <div className="modal-body reduced-padding">
          {props.message}
          <div className="modal-controls fixed-height">
            <button
                className="btn btn-sm  btn-success pull-right"
                ref="confirmButton"
                tabIndex="2"
                type="button"
                onClick={this.handleConfirm}>
              {props.successButtonLabel}
            </button>
            <button
                className="btn btn-sm btn-default pull-right"
                tabIndex="1"
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
