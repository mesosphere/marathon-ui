import classNames from "classnames";
import React from "react/addons";

import PopoverComponent from "./PopoverComponent";

import OnClickOutsideMixin from "react-onclickoutside";
import Util from "../helpers/Util";

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

      let labelClassName = classNames("badge", {
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
          <span className="badge visible">{labelText}</span>
        </li>
      ));
    });

    let labelsDropdownVisible = this.state.isDropdownVisible &&
      numberOfVisibleLabels < labelNodes.length;

    let labelsDropdown = (
      <PopoverComponent className="labels-dropdown"
          ref="labelsDropdown"
          visible={labelsDropdownVisible}>
        <h5>All Labels</h5>
        <ul>
          {dropdownNodes}
        </ul>
      </PopoverComponent>
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

export default AppListItemLabelsComponent;
