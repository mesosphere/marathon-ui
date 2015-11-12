var classNames = require("classnames");
var React = require("react/addons");

var OnClickOutsideMixin = require("react-onclickoutside");
var Util = require("../helpers/Util");

var AppListItemLabelsComponent = React.createClass({
  displayName: "AppListItemLabelsComponent",

  initialMarginTop: null,

  mixins: [OnClickOutsideMixin],

  propTypes: {
    children: React.PropTypes.node,
    labels: React.PropTypes.object,
    numberOfVisibleLabels: React.PropTypes.number
  },

  getInitialState: function () {
    return {
      isDropdownVisible: false
    };
  },

  componentDidUpdate: function () {
    if (this.state.isDropdownVisible === true) {
      this.recalculateDropdownPosition();
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.didPropsChange(nextProps, nextState);
  },

  didPropsChange: function (props, state) {
    let keys = ["labels", "numberOfVisibleLabels"];
    return !Util.compareProperties(this.props, props, ...keys) ||
      this.state.isDropdownVisible !== state.isDropdownVisible;
  },

  handleClickOutside: function () {
    this.setState({
      isDropdownVisible: false
    });
  },

  handleShowMoreClick: function (event) {
    event.stopPropagation();
    this.setState({
      isDropdownVisible: !this.state.isDropdownVisible
    });
  },

  recalculateDropdownPosition: function () {
    if (global.window == null) {
      return;
    }

    let dropdownNode = React.findDOMNode(this.refs.labelsDropdown);
    let leftArrowNode = React.findDOMNode(this.refs.leftArrow);

    // First time the dropdown becomes visible: get its initial top offset
    if (this.initialMarginTop == null) {
      this.initialMarginTop = Math.abs(dropdownNode.offsetTop);
    }

    let height = dropdownNode.offsetHeight;
    let vh = document.documentElement.clientHeight;
    let offsetTop = 0;

    if (dropdownNode.dataset.dropdownReversed != null) {
      offsetTop = dropdownNode.getBoundingClientRect().bottom + height;
    } else {
      offsetTop = dropdownNode.getBoundingClientRect().top + height;
    }

    if (offsetTop >= vh) {
      dropdownNode.style.marginTop = `-${height - this.initialMarginTop * 2}px`;
      leftArrowNode.style.marginTop = `${height - this.initialMarginTop * 2}px`;
      dropdownNode.dataset.dropdownReversed = 1;
    } else {
      dropdownNode.style.marginTop = `-${this.initialMarginTop}px`;
      leftArrowNode.style.marginTop = `${this.initialMarginTop}px`;
      dropdownNode.removeAttribute("data-dropdown-reversed");
    }
  },

  render: function () {
    var props = this.props;
    var labels = props.labels;

    if (labels == null || Object.keys(labels).length === 0) {
      return null;
    }

    let numberOfVisibleLabels = props.numberOfVisibleLabels;
    let labelNodes = [];
    let dropdownNodes = [];

    Object.keys(labels).sort().forEach(function (key, i) {
      if (key == null || Util.isEmptyString(key)) {
        return null;
      }

      let labelText = key;
      if (!Util.isEmptyString(labels[key])) {
        labelText = `${key}:${labels[key]}`;
      }

      let labelClassName = classNames("label", {
        "visible": i < numberOfVisibleLabels
      });

      labelNodes.push((
        <span key={i} className={labelClassName} title={labelText}
          ref={`label${i}`}>
          {labelText}
        </span>
      ));

      dropdownNodes.push((
        <li key={i} title={labelText}>
          <span className="label visible">{labelText}</span>
        </li>
      ));
    });

    let labelsDropdownClassName = classNames("labels-dropdown", {
      "visible": this.state.isDropdownVisible &&
        numberOfVisibleLabels < labelNodes.length
    });

    let labelsDropdown = (
      <div className={labelsDropdownClassName} ref="labelsDropdown">
        <span className="left-arrow" ref="leftArrow"></span>
        <h5>All Labels</h5>
        <ul>
          {dropdownNodes}
        </ul>
      </div>
    );

    // Keep the parent's ref for measurements, but handle events internally
    var showMore = React.Children.map(this.props.children, (child) =>
      React.cloneElement(child, {onClick: this.handleShowMoreClick})
    );

    return (
      <div className="labels">
        {labelNodes}
        {showMore}
        {labelsDropdown}
      </div>
    );
  }
});

module.exports = AppListItemLabelsComponent;
