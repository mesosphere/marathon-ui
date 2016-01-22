import React from "react/addons";
import classNames from "classnames";

import Util from "../helpers/Util";
import ModalComponent from "../components/ModalComponent";

var PromptDialogComponent = React.createClass({
  displayName: "PromptDialogComponent",

  propTypes: {
    data: React.PropTypes.shape({
      actionButtonLabel: React.PropTypes.string.isRequired,
      inputProperties: React.PropTypes.object.isRequired,
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
    };
  },

  componentDidMount: function () {
    var input = React.findDOMNode(this.refs.input);
    input.focus();
    input.select();
  },

  handleAccept: function () {
    this.props.onAccept(React.findDOMNode(this.refs.input).value);
  },

  handleKeyUp: function (event) {
    if (event.keyCode === 13) {
      this.handleAccept();
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
          <label>{data.message}</label>
          <input className="form-control form-control-inverse"
            {...data.inputProperties}
            ref="input"
            onKeyUp={this.handleKeyUp} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-lg btn-success btn-inverse"
              type="button"
              onClick={this.handleAccept}>
            {data.actionButtonLabel}
          </button>
          <button className="btn btn-lg btn-default btn-inverse"
              type="button"
              onClick={props.onDismiss}>
            Cancel
          </button>
        </div>
      </ModalComponent>
    );
  }
});

export default PromptDialogComponent;
