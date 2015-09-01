var Mousetrap = require("mousetrap");
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
    let refs = this.refs;
    let input = React.findDOMNode(refs.textInput);
    input.focus();
    input.select();
    /*eslint-disable new-cap */
    Mousetrap(React.findDOMNode(refs.modalComponent))
      .bind("esc", this.handleDestroy);
    /*eslint-enable new-cap */
  },

  componentWillUnmount: function () {
    /*eslint-disable new-cap */
    Mousetrap(React.findDOMNode(this.refs.modalComponent)).unbind("esc");
    /*eslint-enable new-cap */
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
            type="text"
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
