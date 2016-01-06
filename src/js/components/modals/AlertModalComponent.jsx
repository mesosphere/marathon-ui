var React = require("react/addons");

var Util = require("../../helpers/Util");
var ModalComponent = require("../ModalComponent");

var AlertModalComponent = React.createClass({
  displayName: "AlertModalComponent",

  propTypes: {
    dismissButtonLabel: React.PropTypes.string,
    message: React.PropTypes.string,
    onDestroy: React.PropTypes.func,
    title: React.PropTypes.string
  },

  componentDidMount: function () {
    React.findDOMNode(this.refs.button).focus();
  },

  getDefaultProps: function () {
    return {
      dismissButtonLabel: "OK",
      message: "",
      onDestroy: Util.noop,
      title: ""
    };
  },

  handleDestroy: function () {
    this.refs.modalComponent.destroy();
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
            className="btn btn-lg btn-default btn-inverse"
            ref="button"
            type="button"
            onClick={this.handleDestroy}>
            {props.dismissButtonLabel}
          </button>
        </div>
      </ModalComponent>
    );
  }
});

module.exports = AlertModalComponent;
