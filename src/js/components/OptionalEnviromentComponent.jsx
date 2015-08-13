var React = require("react/addons");

var appValidator = require("../validators/appValidator");
var FormGroupComponent = require("../components/FormGroupComponent");
var DuplicableRowControls = require("../components/DuplicableRowControls");

var OptionalSettingsComponent = React.createClass({
  displayName: "OptionalEnvironmentComponent",

  propTypes: {
    errors: React.PropTypes.array,
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    var state = {
      env: Object.keys(this.props.model.env).map(function (key) {
        return {
          key: key,
          value: this.props.model.env[key]
        };
      })
    };
    if (state.env.length === 0) {
      state.env = [true];
    }
    return state;
  },

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();
    var env = this.state.env.concat(true);
    this.setState({env: env});
  },

  handleRemoveRow: function (position, event) {
    event.target.blur();
    event.preventDefault();
    var env = this.state.env.slice();
    env = env.map(function (value, index) {
      return value && index !== position;
    });
    if (env.filter((exists) => exists).length === 0) {
      env.push(true);
    }
    this.setState({env: env});
  },

  render: function () {
    var enviromentRows = this.state.env
      .map(function (exists, index) {
        return exists
          ? this.getEnviromentRow(index)
          : null;
      }.bind(this));

    return (
      <div>
        <div className="duplicable-list">
            {enviromentRows}
        </div>
      </div>
    );
  },

  getEnviromentRow: function (i = 0) {
    return (
      <div key={`p-${i}`} className="row duplicable-row">
        <div className="col-sm-6 add-colon">
          <FormGroupComponent
            attribute={`env[${i}].key`}
            label="Key"
            model={this.state}
            errors={this.props.errors}
            validator={appValidator}>
            <input />
          </FormGroupComponent>
        </div>
        <div className="col-sm-6">
          <FormGroupComponent
            attribute={`env[${i}].value`}
            label="Value"
            model={this.state}
            errors={this.props.errors}
            validator={appValidator}>
            <input />
          </FormGroupComponent>
          <DuplicableRowControls
            handleAddRow={this.handleAddRow.bind(null, i)}
            handleRemoveRow={this.handleRemoveRow.bind(null, i)} />
        </div>
      </div>
    );
  }
});

module.exports = OptionalSettingsComponent;
