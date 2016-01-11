var React = require("react/addons");
var classNames = require("classnames");

var Util = require("../helpers/Util");
var ModalComponent = require("../components/ModalComponent");

var ConfirmDialogComponent = React.createClass({
  displayName: "ConfirmDialogComponent",

  propTypes: {
    data: React.PropTypes.shape({
      actionButtonLabel: React.PropTypes.string.isRequired,
      message: React.PropTypes.string.isRequired,
      severity: React.PropTypes.string.isRequired,
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
    React.findDOMNode(this.refs.acceptButton).focus();
  },

  handleAccept: function () {
    this.props.onAccept();
  },

  handleDismiss: function () {
    this.props.onDismiss();
  },

  render: function () {
    var data = this.props.data;
    var className = classNames("dialog", data.severity);

    return (
      <ModalComponent
          centered={true}
          className={className}
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
            className="btn btn-lg btn-success btn-inverse"
            ref="acceptButton"
            tabIndex="2"
            type="button"
            onClick={this.handleAccept}>
            {data.actionButtonLabel}
          </button>
          <button
            className="btn btn-lg btn-default btn-inverse"
            tabIndex="1"
            type="button"
            onClick={this.handleDismiss}>
            Cancel
          </button>
        </div>
      </ModalComponent>
    );
  }
});

module.exports = ConfirmDialogComponent;
