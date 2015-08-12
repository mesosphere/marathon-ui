var classNames = require("classnames");
var React = require("react/addons");

var TooltipMixin = require("../mixins/TooltipMixin");

function roundWorkaround(x) {
  return Math.floor(x * 1000) / 1000;
}

var AppHealthComponent = React.createClass({
  displayName: "AppHealthComponent",

  mixins: [TooltipMixin],

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  handleMouseOverHealthBar: function (ref) {
    var el = this.refs[ref].getDOMNode();
    this.tip_showTip(el);
  },

  handleMouseOutHealthBar: function (ref) {
    var el = this.refs[ref].getDOMNode();
    this.tip_hideTip(el);
  },

  getHealthBar: function () {
    var health = this.props.model.health;

    console.log(this.props.model);

    // normalize quantities to add up to 100%. Cut off digits at
    // third decimal to work around rounding error leading to more than 100%.
    var dataSum = health.reduce(function (a, x) {
      return a + x.quantity;
    }, 0);

    var allZeroWidthBefore = true;
    return health.map(function (d, i) {
      var width = roundWorkaround(d.quantity * 100 / dataSum);
      var classSet = {
        // set health-bar-inner class for bars in the stack which have a
        // non-zero-width left neightbar
        "health-bar-inner": width !== 0 && !allZeroWidthBefore,
        "progress-bar": true
      };
      // add health bar name
      classSet["health-bar-" + d.name] = true;

      if (width !== 0) {
        allZeroWidthBefore = false;
      }

      let attributes = {};
      if (d.quantity > 0) {
        let ref = "healthBar-" + i;
        attributes = {
          "ref": ref,
          "data-behavior": "show-tip",
          "data-tip-type-class": "default",
          "data-tip-place": "top",
          "data-tip-content": d.name,
          "onMouseOver": this.handleMouseOverHealthBar.bind(null, ref),
          "onMouseOut": this.handleMouseOutHealthBar.bind(null, ref)
        };
      }

      return (
        <div
          className={classNames(classSet)}
          style={{width: width + "%"}}
          {...attributes}
          key={i} />
      );
    }.bind(this));
  },

  render: function () {
    return (
      <div className="progress health-bar">
        {this.getHealthBar()}
      </div>
    );
  }
});

module.exports = AppHealthComponent;
