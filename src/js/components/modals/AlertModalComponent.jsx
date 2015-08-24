var React = require("react/addons");
var Util = require("../../helpers/Util");

var ModalComponent = require("../components/../ModalComponent");

var AppModalComponent = React.createClass({
  displayName: "AppModalComponent",

  propTypes: {
    message: React.PropTypes.string,
    onDestroy: React.PropTypes.func,
    title: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      message: "",
      onDestroy: Util.noop,
      title: ""
    };
  },

  destroy: function () {
    this.refs.modalComponent.destroy();
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
          <div className="modal-controls">
            <button
                className="btn btn-default"
                type="button"
                onClick={this.destroy}>
              OK
            </button>
          </div>
        </div>
      </ModalComponent>
    );
  }
});

module.exports = AppModalComponent;
