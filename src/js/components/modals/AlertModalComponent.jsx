var React = require("react/addons");

var Util = require("../../helpers/Util");
var ModalComponent = require("../ModalComponent");

var AlertModalComponent = React.createClass({
  displayName: "AlertModalComponent",

  propTypes: {
    data: React.PropTypes.shape({
      actionButtonLabel: React.PropTypes.string.isRequired,
      message: React.PropTypes.string.isRequired,
      title: React.PropTypes.string.isRequired
    }),
    onAccept: React.PropTypes.func,
    onDismiss: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      data: null,
      onAccept: Util.noop,
      onDismiss: Util.noop
    }
  },

  componentDidMount: function () {
    React.findDOMNode(this.refs.button).focus();
  },

  handleAccept: function () {
    this.props.onAccept();
  },

  handleDismiss: function () {
    this.props.onDismiss();
  },

  render: function () {
    var data = this.props.data;

    return (
      <ModalComponent
          centered={true}
          className="dialog"
          dismissOnClickOutside={true}
          ref="modalComponent"
          onDestroy={this.handleDismiss}>
        <div className="modal-header">
          {data.title}
        </div>
        <div className="modal-body">
          {data.message}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-lg btn-default btn-inverse"
            ref="button"
            type="button"
            onClick={this.handleAccept}>
            {data.actionButtonLabel}
          </button>
        </div>
      </ModalComponent>
    );
  }
});

module.exports = AlertModalComponent;
