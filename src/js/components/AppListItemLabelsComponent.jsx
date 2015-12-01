var classNames = require("classnames");
var React = require("react/addons");

var OnClickOutsideMixin = require("react-onclickoutside");
var Util = require("../helpers/Util");

// Keep track of post-render initial margin value, on a per-reactid basis
var _initialTopMargins = [];
// Keep track of reversed dropdown state without modifying the DOM
var _reversedDropdowns = [];

var AppListItemLabelsComponent = React.createClass({
  displayName: "AppListItemLabelsComponent",

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

  componentDidMount: function () {
    var id = React.findDOMNode(this.refs.labelsDropdown)
      .attributes["data-reactid"].value;
    _initialTopMargins[id] = null;
    _reversedDropdowns[id] = false;
  },

  componentDidUpdate: function () {
    if (this.state.isDropdownVisible === true) {
      this.recalculateDropdownPosition();
    }
  },

  componentWillUnmount: function () {
    var id = React.findDOMNode(this.refs.labelsDropdown)
      .attributes["data-reactid"].value;
    delete _initialTopMargins[id];
    delete _reversedDropdowns[id];
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

    let id = dropdownNode.attributes["data-reactid"].value;

    // First time the dropdown becomes visible: get its initial top offset
    if (_initialTopMargins[id] == null) {
      _initialTopMargins[id] = Math.abs(dropdownNode.offsetTop);
    }

    let height = dropdownNode.offsetHeight;
    let viewportHeight = document.documentElement.clientHeight;
    let offsetTop = 0;

    if (_reversedDropdowns[id] === true) {
      offsetTop = dropdownNode.getBoundingClientRect().bottom + height;
    } else {
      offsetTop = dropdownNode.getBoundingClientRect().top + height;
    }

    if (offsetTop >= viewportHeight) {
      const marginTop = height - _initialTopMargins[id] * 2;
      dropdownNode.style.marginTop = `-${marginTop}px`;
      leftArrowNode.style.marginTop = `${marginTop}px`;
      _reversedDropdowns[id] = true;
    } else {
      const marginTop = _initialTopMargins[id];
      dropdownNode.style.marginTop = `-${marginTop}px`;
      leftArrowNode.style.marginTop = `${marginTop}px`;
      _reversedDropdowns[id] = false;
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
      if (key == null || Util.isStringAndEmpty(key)) {
        return null;
      }

      let labelText = key;
      if (!Util.isStringAndEmpty(labels[key])) {
        labelText = `${key}:${labels[key]}`;
      }

      let labelClassName = classNames("badge label", {
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
          <span className="badge label visible">{labelText}</span>
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
