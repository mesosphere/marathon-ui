var React = require("react/addons");
var Util = require("../../helpers/Util");

var ModalComponent = require("../ModalComponent");

var PromptModalComponent = React.createClass({
  displayName: "PromptModalComponent",

  propTypes: {
    defaultValue: React.PropTypes.string,
    message: React.PropTypes.string,
    onConfirm: React.PropTypes.func,
    onDestroy: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      defaultValue: "",
      message: "",
      onConfirm: Util.noop,
      onDestroy: Util.noop
    };
  },

  componentDidMount: function () {
    this.refs.textinput.getDOMNode().focus();
    this.refs.textinput.getDOMNode().select();
  },

  handleDestroy: function () {
    this.refs.modalComponent.destroy();
  },

  handleConfirm: function () {
    this.props.onConfirm(this.refs.textinput.getDOMNode().value);
  },

  onKeyUp: function (event) {
    if (event.keyCode === 13) {
      this.handleConfirm();
    }
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
          <input className="form-control"
            type="text"
            ref="textinput"
            onKeyUp={this.onKeyUp}
            defaultValue={this.props.defaultValue} />
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

module.exports = PromptModalComponent;
