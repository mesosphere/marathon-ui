var React = require("react/addons");
var Util = require("../../helpers/Util");

var ModalComponent = require("../ModalComponent");

var PromptModalComponent = React.createClass({
  displayName: "PromptModalComponent",

  propTypes: {
    defaultValue: React.PropTypes.string,
    inputProps: React.PropTypes.object,
    message: React.PropTypes.string,
    onConfirm: React.PropTypes.func,
    onDestroy: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      defaultValue: "",
      message: "",
      inputType: {type: "text"},
      onConfirm: Util.noop,
      onDestroy: Util.noop
    };
  },

  componentDidMount: function () {
    let input = React.findDOMNode(this.refs.textInput);
    input.focus();
    input.select();
  },

  handleDestroy: function () {
    this.refs.modalComponent.destroy();
  },

  handleConfirm: function () {
    this.props.onConfirm(React.findDOMNode(this.refs.textInput).value);
  },

  onKeyUp: function (event) {
    if (event.keyCode === 13) {
      this.handleConfirm();
    }
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
          <label>{this.props.message}</label>
          <input className="form-control"
            {...this.props.inputProps}
            ref="textInput"
            onKeyUp={this.onKeyUp}
            defaultValue={this.props.defaultValue} />
          <div className="modal-controls fixed-height">
            <button
                className="btn btn-sm btn-success pull-right"
                type="button"
                onClick={this.handleConfirm}>
              OK
            </button>
            <button
                className="btn btn-sm btn-default pull-right"
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
