import classNames from "classnames";
var React = require("react/addons");

import AppFormValidators from "../../stores/validators/AppFormValidators";
import AppsActions from "../../actions/AppsActions";
import GroupsActions from "../../actions/GroupsActions";
import GroupsStore from "../../stores/GroupsStore";
import GroupsEvents from "../../events/GroupsEvents";

import ModalComponent from "../../components/ModalComponent";

var GroupModalComponent = React.createClass({
  displayName: "GroupModalComponent",

  propTypes: {
    onDestroy: React.PropTypes.func,
    parentGroupId: React.PropTypes.string
  },

  getInitialState: function () {
    return {
      groupId: "",
      isValidGroupId: true,
      generalError : null
    };
  },

  componentWillMount: function () {
    GroupsStore.on(GroupsEvents.CREATE_GROUP, this.onCreateGroup);
    GroupsStore.on(GroupsEvents.CREATE_GROUP_ERROR, this.onCreateGroupError);
  },

  componentWillUnmount: function () {
    GroupsStore.removeListener(GroupsEvents.CREATE_GROUP, this.onCreateGroup);
    GroupsStore.removeListener(GroupsEvents.CREATE_GROUP_ERROR,
      this.onCreateGroupError);
  },

  componentDidMount: function () {
    var input = React.findDOMNode(this.refs.input);
    var valueLength = input.value.length;
    input.focus();
    input.setSelectionRange(valueLength, valueLength);
  },

  destroy: function () {
    // This will also call `this.props.onDestroy` since it is passed as the
    // callback for the modal's `onDestroy` prop.
    this.refs.modalComponent.destroy();
  },

  getGroupPath: function () {
    var state = this.state;
    var props = this.props;
    return props.parentGroupId == null
      ? `/${state.groupId}`
      : `${props.parentGroupId}/${state.groupId}`;
  },

  handleAccept: function () {
    var state = this.state;
    if (state.isValidGroupId) {
      GroupsActions.createGroup({id: this.getGroupPath()});
    }
  },

  handleKeyUp: function (event) {
    if (event.keyCode === 13) {
      this.handleAccept();
      return;
    }

    let newState = {
      groupId: event.target.value,
      generalError: null
    };

    this.setState(newState, this.validateGroupId);
  },

  onCreateGroup: function () {
    AppsActions.requestApps();
    this.destroy();
  },

  onCreateGroupError: function (data, status) {
    // All status below 300 are actually not an error
    if (status < 300) {
      this.onCreateGroup();
    } else {
      let generalError = "Error creating group or invalid group name supplied";
      if (data != null && data.message != null) {
        generalError = data.message;
      }
      if (status === 409) {
        generalError = `Group ${this.getGroupPath()} is already created.`;
      }

      this.setState({generalError});
    }
  },

  validateGroupId: function () {
    var groupId = this.state.groupId;
    var isValidGroupId = AppFormValidators.appIdNotEmpty(groupId) &&
        AppFormValidators.appIdNoWhitespaces(groupId) &&
        AppFormValidators.appIdValidChars(groupId) &&
        AppFormValidators.appIdWellFormedPath(groupId);
    this.setState({isValidGroupId});
  },

  render: function () {
    var state = this.state;
    var props = this.props;

    var parentGroupId = props.parentGroupId != null
      ? `${props.parentGroupId}/`
      : "/";

    var modalBodyClasses = classNames("modal-body", {
      "has-error": !state.isValidGroupId
    });

    var modalFooterClasses = classNames("modal-footer", {
      "has-error": state.generalError != null
    });

    var createBtnClasses = classNames("btn btn-lg btn-success btn-inverse", {
      "disabled": !state.isValidGroupId || state.generalError != null
    });

    var validationError = null;
    if (!state.isValidGroupId) {
      let message = "Group name must be at least 1 character and may " +
        "only contain digits (0-9), dashes (-), dots (.), and lowercase " +
        "letters (a-z). The name may not begin or end with a dash.";
      validationError = (<span className="help-block">{message}</span>);
    }

    var generalError = null;
    if (state.generalError != null) {
      generalError = (
        <div className="col-sm-12 text-center">
          <span className="help-block">{state.generalError}</span>
        </div>
      );
    }

    return (
      <ModalComponent className="dialog info"
          centered={true}
          dismissOnClickOutside={false}
          ref="modalComponent"
          onDestroy={this.props.onDestroy}>
        <form method="post" role="form" onSubmit={this.handleSubmit}>
          <button onClick={event => event.preventDefault()}
            style={{display: "none"}} />
          <div className="modal-header">Create Group</div>
          <div className={modalBodyClasses}>
            <div className="overflow-ellipsis">
              <label>
                <span>Enter a path for the new group under: </span>
                <strong title={parentGroupId}>{parentGroupId}</strong>
              </label>
            </div>
            <input className="form-control form-control-inverse"
              ref="input"
              onKeyUp={this.handleKeyUp} />
            {validationError }
          </div>
          <div className={modalFooterClasses}>
            <div className="row">
              {generalError}
              <div className="col-sm-12 text-center">
                <button className={createBtnClasses}
                    type="button"
                    onClick={this.handleAccept}>
                  Create Group
                </button>
                <button className="btn btn-lg btn-default btn-inverse"
                    type="button"
                    onClick={this.destroy}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </ModalComponent>
    );
  }
});

module.exports = GroupModalComponent;
