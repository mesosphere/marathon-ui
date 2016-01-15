import React from "react/addons";
import classNames from "classnames";

import DialogSeverity from "../constants/DialogSeverity";
import Util from "../helpers/Util";
import ModalComponent from "../components/ModalComponent";

var AlertDialogComponent = React.createClass({
  displayName: "AlertDialogComponent",

  propTypes: {
    data: React.PropTypes.shape({
      actionButtonLabel: React.PropTypes.string.isRequired,
      message: React.PropTypes.string.isRequired,
      severity: React.PropTypes.string.isRequired,
      title: React.PropTypes.string.isRequired
    }).isRequired,
    onAccept: React.PropTypes.func,
    onDismiss: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      onAccept: Util.noop,
      onDismiss: Util.noop
    }
  },

  componentDidMount: function () {
    if (this.props.data.severity === DialogSeverity.INFO) {
      React.findDOMNode(this.refs.button).focus();
    }
  },

  render: function () {
    var props = this.props;
    var data = props.data;
    var className = classNames("dialog", data.severity);

    return (
      <ModalComponent
          centered={true}
          className={className}
          dismissOnClickOutside={false}
          ref="modalComponent"
          onDestroy={props.onDismiss}>
        <div className="modal-header">
          {data.title}
        </div>
        <div className="modal-body">
          {data.message}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-lg btn-success btn-inverse"
            ref="button"
            type="button"
            onClick={props.onAccept}>
            {data.actionButtonLabel}
          </button>
        </div>
      </ModalComponent>
    );
  }
});

export default AlertDialogComponent;
