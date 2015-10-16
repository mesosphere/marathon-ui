var React = require("react/addons");

var ModalComponent = require("../ModalComponent");

var HelpModalComponent = React.createClass({
  displayName: "HelpModalComponent",

  propTypes: {
    onDestroy: React.PropTypes.func.isRequired
  },

  destroy: function () {
    // This will also call `this.props.onDestroy` since it is passed as the
    // callback for the modal's `onDestroy` prop.
    this.refs.modalComponent.destroy();
  },

  render: function () {
    return (
      <ModalComponent
          onDestroy={this.props.onDestroy}
          ref="modalComponent">
        <div className="modal-header">
          <button type="button" className="close"
            aria-hidden="true" onClick={this.destroy}>&times;</button>
          <h3 className="modal-title">Keyboard shortcuts</h3>
        </div>
        <div className="modal-body">
          <dl className="dl-horizontal dl-horizontal-lg">
            <dt>esc</dt>
            <dd>Close any open modal or dialog</dd>
            <dt>c</dt>
            <dd>Create New Application</dd>
            <dt>g a</dt>
            <dd>Go to Applications list</dd>
            <dt>g d</dt>
            <dd>Go to Deployments list</dd>
            <dt>g v</dt>
            <dd>Go to UI Version dialog</dd>
            <dt>s</dt>
            <dd>Focus application search bar</dd>
            <dt>shift + ,</dt>
            <dd>Go to About modal</dd>
            <dt>?</dt>
            <dd>Go to Help modal</dd>
          </dl>
        </div>
      </ModalComponent>
    );
  }
});

module.exports = HelpModalComponent;
