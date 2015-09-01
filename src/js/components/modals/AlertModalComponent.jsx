var Mousetrap = require("mousetrap");
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
    let refs = this.refs;

    React.findDOMNode(refs.button).focus();
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
          {this.props.message}
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
