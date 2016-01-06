var React = require("react/addons");

var Util = require("../../helpers/Util");
var ModalComponent = require("../ModalComponent");

var ConfirmModalComponent = React.createClass({
  displayName: "ConfirmModalComponent",

  propTypes: {
    message: React.PropTypes.string,
    onConfirm: React.PropTypes.func,
    onDestroy: React.PropTypes.func,
    successButtonLabel: React.PropTypes.string,
    title: React.PropTypes.string
  },

  componentDidMount: function () {
    React.findDOMNode(this.refs.confirmButton).focus();
  },

  getDefaultProps: function () {
    return {
      message: "",
      onConfirm: Util.noop,
      onDestroy: Util.noop,
      successButtonLabel: "OK",
      title: ""
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
          className="dialog"
          dismissOnClickOutside={true}
          ref="modalComponent"
          onDestroy={props.onDestroy}>
        <div className="modal-header">
          {props.title}
        </div>
        <div className="modal-body">
          {props.message}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-lg btn-success btn-inverse"
            ref="confirmButton"
            tabIndex="2"
            type="button"
            onClick={this.handleConfirm}>
            {props.successButtonLabel}
          </button>
          <button
            className="btn btn-lg btn-default btn-inverse"
            tabIndex="1"
            type="button"
            onClick={this.handleDestroy}>
            Cancel
          </button>
        </div>
      </ModalComponent>
    );
  }
});

module.exports = ConfirmModalComponent;
