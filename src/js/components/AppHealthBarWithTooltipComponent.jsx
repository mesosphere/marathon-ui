var React = require("react/addons");

var TooltipMixin = require("../mixins/TooltipMixin");
var AppHealthBarComponent = require("./AppHealthBarComponent");
var AppHealthDetailComponent = require("./AppHealthDetailComponent");
var Util = require("../helpers/Util");
var HealthStatus = require("../constants/HealthStatus");

var AppHealthBarWithTooltipComponent = React.createClass({
  displayName: "AppHealthBarWithTooltipComponent",

  mixins: [TooltipMixin],

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      tipContent: this.getAppHealthBreakdown(this.props.model)
    };
  },

  shouldComponentUpdate: function (nextProps) {
    var shouldUpdate =
      !Util.compareArrays(this.props.model.health, nextProps.model.health);
    if (shouldUpdate) {
      this.setState({
        tipContent: this.getAppHealthBreakdown(nextProps.model)
      });
    }
    return shouldUpdate;
  },

  handleMouseOverHealthBar: function () {
    var el = this.refs.healthBar.getDOMNode();
    this.tip_showTip(el);
  },

  handleMouseOutHealthBar: function () {
    var el = this.refs.healthBar.getDOMNode();
    this.tip_hideTip(el);
  },

  getAppHealthBreakdown: function (model) {
    let component = (
      <AppHealthDetailComponent
        className="list-unstyled"
        fields={[
          HealthStatus.HEALTHY,
          HealthStatus.UNHEALTHY,
          HealthStatus.UNKNOWN
          ]}
        model={model} />
    );
    return React.renderToString(component);
  },

  render: function () {
    // Extra <div> nesting is necessary here because of the way the TooltipMixin
    // searches for elements - it finds children
    return (
      <div>
        <div ref="healthBar"
          data-behavior="show-tip"
          data-tip-type-class="default"
          data-tip-place="top"
          data-tip-content={this.state.tipContent}
          onMouseOver={this.handleMouseOverHealthBar}
          onMouseOut={this.handleMouseOutHealthBar}>
          <AppHealthBarComponent
            model={this.props.model}/>
        </div>
      </div>
    );
  }
});

module.exports = AppHealthBarWithTooltipComponent;
