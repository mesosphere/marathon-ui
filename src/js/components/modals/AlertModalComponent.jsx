var GeminiScrollbar = require("react-gemini-scrollbar");
var React = require("react/addons");
var Util = require("../../helpers/Util");

var ModalComponent = require("../ModalComponent");

var AlertModalComponent = React.createClass({
  displayName: "AlertModalComponent",

  propTypes: {
    message: React.PropTypes.string,
    onDestroy: React.PropTypes.func
  },

  componentDidMount: function () {
    React.findDOMNode(this.refs.button).focus();
  },

  getDefaultProps: function () {
    return {
      message: "",
      onDestroy: Util.noop
    };
  },

  handleDestroy: function () {
    this.refs.modalComponent.destroy();
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
                className="btn btn-sm btn-default pull-right"
                ref="button"
                type="button"
                onClick={this.handleDestroy}>
              OK
            </button>
          </div>
        </div>
      </ModalComponent>
    );
  }
});

module.exports = AlertModalComponent;
