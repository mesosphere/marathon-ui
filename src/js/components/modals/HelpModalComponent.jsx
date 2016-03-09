import React from "react/addons";

import ModalComponent from "../ModalComponent";

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
      <ModalComponent onDestroy={this.props.onDestroy} ref="modalComponent">
        <div className="modal-header">
          <h2 className="modal-title">Keyboard shortcuts</h2>
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
            <dt>[cmd | ctrl] + enter</dt>
            <dd>Submit the Create/Edit application dialog</dd>
            <dt>[cmd | ctrl] + e</dt>
            <dd>
              Show the Edit application dialog
              (only when inside an application page)
            </dd>
            <dt>?</dt>
            <dd>Go to Help modal</dd>
          </dl>
        </div>
      </ModalComponent>
    );
  }
});

export default HelpModalComponent;
