var GeminiScrollbar = require("react-gemini-scrollbar");
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

  componentDidMount: function () {
    React.findDOMNode(this.refs.confirmButton).focus();
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
          centered={true}
          dismissOnClickOutside={true}
          ref="modalComponent"
          size="sm"
          onDestroy={this.props.onDestroy}>
        <div className="modal-body reduced-padding">
          <GeminiScrollbar>
            {this.props.message}
          </GeminiScrollbar>
          <div className="modal-controls fixed-height">
            <button
                className="btn btn-sm  btn-success pull-right"
                ref="confirmButton"
                tabIndex="2"
                type="button"
                onClick={this.handleConfirm}>
              OK
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
