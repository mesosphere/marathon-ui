var React = require("react/addons");
var Util = require("../../helpers/Util");

var ModalComponent = require("../ModalComponent");

var AlertModalComponent = React.createClass({
  displayName: "AlertModalComponent",

  propTypes: {
    dismissButtonLabel: React.PropTypes.string,
    message: React.PropTypes.string,
    onDestroy: React.PropTypes.func
  },

  componentDidMount: function () {
    React.findDOMNode(this.refs.button).focus();
  },

  getDefaultProps: function () {
    return {
      dismissButtonLabel: "OK",
      message: "",
      onDestroy: Util.noop
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
          dismissOnClickOutside={true}
          ref="modalComponent"
          size="sm"
          onDestroy={props.onDestroy}>
        <div className="modal-body reduced-padding">
          {props.message}
          <div className="modal-controls fixed-height">
            <button
                className="btn btn-sm btn-default pull-right"
                ref="button"
                type="button"
                onClick={this.handleDestroy}>
              {props.dismissButtonLabel}
            </button>
          </div>
        </div>
      </ModalComponent>
    );
  }
});

module.exports = AlertModalComponent;
