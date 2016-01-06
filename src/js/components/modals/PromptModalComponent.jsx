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
    onDestroy: React.PropTypes.func,
    title: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      defaultValue: "",
      message: "",
      inputType: {type: "text"},
      onConfirm: Util.noop,
      onDestroy: Util.noop,
      title: ""
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
          <label>{props.message}</label>
          <input className="form-control form-control-inverse"
            {...props.inputProps}
            ref="textInput"
            onKeyUp={this.onKeyUp}
            defaultValue={props.defaultValue} />
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-lg btn-success btn-inverse"
            type="button"
            onClick={this.handleConfirm}>
            OK
          </button>
          <button
            className="btn btn-lg btn-default btn-inverse"
            type="button"
            onClick={this.handleDestroy}>
            Cancel
          </button>
        </div>
      </ModalComponent>
    );
  }
});

module.exports = PromptModalComponent;
