var React = require("react/addons");

//var AppsStore = require("../stores/AppsStore");
//var ChaosActions = require("../actions/ChaosActions");
//var ChaosEvents = require("../events/ChaosEvents");
var ModalComponent = require("../ModalComponent");

var ChaosModalComponent = React.createClass({
  displayName: "ChaosModalComponent",

  mixins: [React.addons.LinkedStateMixin],

  propTypes: {
    isChaosInProgress: React.PropTypes.bool.isRequired,
    onDestroy: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      percentAmount: 10,
      confirmMessage: ""
    };
  },

  componentWillMount: function () {
    //AppsStore.on(ChaosEvents.STARTED, this.onChaosStart);
    //AppsStore.on(ChaosEvents.FINISHED, this.onChaosFinish);
  },

  componentWillUnmount: function () {
    //AppsStore.removeListener(ChaosEvents.STARTED, this.onChaosStart);
    //AppsStore.removeListener(ChaosEvents.FINISHED, this.onChaosFinish);
  },

  destroy: function () {
    // This will also call `this.props.onDestroy` since it is passed as the
    // callback for the modal's `onDestroy` prop.
    this.refs.modalComponent.destroy();
  },

  handleSubmit: function (e) {
    e.preventDefault();

  },

  isDisabled: function () {
    var state = this.state;
    return state.confirmMessage !== "CHAOS" || state.isChaosInProgres;
  },

  //onChaosStart: function () {
  //  this.setState({isChaosInProgress: true});
  //},
  //
  //onChaosFinish: function () {
  //  this.setState({isChaosInProgress: false});
  //},

  render: function () {
    var state = this.state;

    var infoMessage = "The Chaos function will randomly kill " +
      `${this.state.percentAmount}% of all your active tasks. We advise ` +
      "using this function in a development environment for testing purposes.";

    var labelClass = state.percentAmount === 0
      ? "text-muted"
      : "text-warning";
    if (state.percentAmount > 90) {
      labelClass = "text-danger";
    }
    var labelHTML = `Percent Amount: <span class="${labelClass}">` +
      `${this.state.percentAmount}%</span>`;

    var percentAmount = this.linkState("percentAmount");
    var handlePercentChange = function (e) {
      percentAmount.requestChange(parseInt(e.target.value));
    };

    return (
      <ModalComponent
        onDestroy={this.props.onDestroy}
        ref="modalComponent"
        size="md">
          <div className="modal-header">
            <button type="button" className="close"
                    aria-hidden="true" onClick={this.destroy}>&times;</button>
            <h3 className="modal-title">Chaos</h3>
          </div>
          <div className="modal-body">
            <p className="lead text-muted">Start Chaos function?</p>
            <p>{infoMessage}</p>
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label
                  htmlFor="percent-amount"
                  className="control-label"
                  dangerouslySetInnerHTML={{__html: labelHTML}} />
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  id="percent-amount"
                  value={percentAmount.value} onChange={handlePercentChange} />
                <div className="help-block">
                  Set the desired amount of tasks to be killed
                </div>
              </div>
              <div className="form-group">
                <label
                  htmlFor="confirm"
                  className="control-label">
                  Security Check
                </label>
                <input
                  className="form-control"
                  type="text"
                  id="confirm"
                  valueLink={this.linkState("confirmMessage")} />
                <div className="help-block">
                  Please confirm by typing the word CHAOS in the field above
                </div>
              </div>
              <div className="modal-controls">
                <input
                  type="submit"
                  disabled={this.isDisabled()}
                  className="btn btn-success"
                  value="Start Chaos"/>
                <button
                  className="btn btn-default"
                  type="button"
                  onClick={this.destroy}>
                  Cancel
                </button>
              </div>
            </form>
        </div>
      </ModalComponent>
    );
  }
});

module.exports = ChaosModalComponent;
