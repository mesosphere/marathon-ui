var classNames = require("classnames");
var OnClickOutsideMixin = require("react-onclickoutside");
var React = require("react/addons");

var AppHealthComponent = require("../components/AppHealthComponent");
var AppStatusComponent = require("../components/AppStatusComponent");
var Util = require("../helpers/Util");
var PathUtil = require("../helpers/PathUtil");
var DOMUtil = require("../helpers/DOMUtil");

var AppListItemComponent = React.createClass({
  displayName: "AppListItemComponent",

  mixins: [OnClickOutsideMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    currentGroup: React.PropTypes.string.isRequired,
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      numberOfVisibleLabels: -1,
      isLabelsDropdownShown: false
    };
  },

  componentDidMount: function () {
    // Avoid referencing window from Node context
    if (global.window != null) {
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("focus", this.handleResize);
    }
    this.updateNumberOfVisibleLabels();

  },

  componentDidUpdate: function (prevProps) {
    if (this.didPropsChange(prevProps)) {
      this.updateNumberOfVisibleLabels();
    }
  },

  componentWillUnmount: function () {
    if (global.window != null) {
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("focus", this.handleResize);
    }
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    var state = this.state;
    if (nextState.numberOfVisibleLabels === -1 && !this.props.model.isGroup) {
      this.updateNumberOfVisibleLabels();
      return false;
    }

    if (state.numberOfVisibleLabels !== nextState.numberOfVisibleLabels ||
      state.isLabelsDropdownShown !== nextState.isLabelsDropdownShown) {
      return true;
    }

    return this.didPropsChange(nextProps);
  },

  didPropsChange: function (newProps) {
    return !Util.compareProperties(this.props.model, newProps.model, "status",
      "tasksRunning", "health", "totalMem", "totalCpus", "instances", "labels");
  },

  handleClickOutside: function () {
    this.setState({
      isLabelsDropdownShown: false
    });
  },


  handleResize: function () {
    requestAnimationFrame(this.updateNumberOfVisibleLabels);
  },

  updateNumberOfVisibleLabels: function () {
    var labels = this.props.model.labels;

    if (labels == null || Object.keys(labels).length === 0) {
      return null;
    }

    let refs = this.refs;

    let cellNode = React.findDOMNode(refs.nameCell);
    let nameNode = React.findDOMNode(refs.nameNode);
    let moreNode = React.findDOMNode(refs.moreLabel);

    let availableWidth = DOMUtil.getInnerWidth(cellNode) -
      DOMUtil.getOuterWidth(nameNode) -
      DOMUtil.getOuterWidth(moreNode);

    let labelsWidth = 0;
    let numberOfVisibleLabels = 0;

    refs.labels.props.children[0].find((label) => {
      labelsWidth += DOMUtil.getOuterWidth(React.findDOMNode(refs[label.ref]));
      if (labelsWidth > availableWidth) {
        return true;
      }
      numberOfVisibleLabels++;
    });

    this.setState({numberOfVisibleLabels: numberOfVisibleLabels});
  },

  getIcon: function () {
    var model = this.props.model;
    if (model.isGroup) {
      return (<i className="icon icon-small group"></i>);
    }
    return (<i className="icon icon-small app" title="Application"></i>);
  },

  getLabels: function () {
    var labels = this.props.model.labels;

    if (labels == null || Object.keys(labels).length === 0) {
      return null;
    }

    let state = this.state;
    let numberOfVisibleLabels = state.numberOfVisibleLabels;

    let labelKeys = Object.keys(labels).filter(function (key) {
      return (key != null && !Util.isEmptyString(key));
    }).sort();

    let visibleNodes = labelKeys.map(function (key, i) {
      let labelText = key;
      if (!Util.isEmptyString(labels[key])) {
        labelText = `${key}:${labels[key]}`;
      }

      let labelClassName = classNames("label", {
        "visible": i < numberOfVisibleLabels
      });

      return (
        <span key={i} className={labelClassName} title={labelText}
            ref={`label${i}`}>
          {labelText}
        </span>
      );
    });

    let moreLabelClassName = classNames("more", {
      "visible": labelKeys.length > numberOfVisibleLabels
    });

    let labelsDropdownClassName = classNames("labels-dropdown", {
      "visible": state.isLabelsDropdownShown &&
        labelKeys.length > numberOfVisibleLabels
    });

    let allNodes = labelKeys.map(function (key, i) {
      let labelText = key;
      if (!Util.isEmptyString(labels[key])) {
        labelText = `${key}:${labels[key]}`;
      }

      return (
        <li key={i} title={labelText}>
          <span className="label visible">
            {labelText}
          </span>
        </li>
      );
    });

    let labelsDropdown = (
      <div className={labelsDropdownClassName}>
        <h5>All Labels</h5>
        <ul>
          {allNodes}
        </ul>
      </div>
    );

    return (
      <div className="labels" ref="labels">
        {visibleNodes}
        <span className={moreLabelClassName}
            onClick={this.handleMoreLabelClick}
            ref="moreLabel">
          &hellip;
        </span>
        {labelsDropdown}
      </div>
    );
  },

  handleMoreLabelClick: function (event) {
    event.stopPropagation();  // Prevent this.onClick being called
    this.setState({
      isLabelsDropdownShown: !this.state.isLabelsDropdownShown
    });
  },

  onClick: function () {
    var model = this.props.model;
    var router = this.context.router;
    if (model.isGroup) {
      let query = router.getCurrentQuery();
      let param = {
        groupId: encodeURIComponent(model.id)
      };
      router.transitionTo("group", param, query);
    } else {
      router.transitionTo("app", {appId: encodeURIComponent(model.id)});
    }
  },

  getHealthBar: function () {
    return (
      <td className="text-right health-bar-column">
        <AppHealthComponent model={this.props.model} />
      </td>
    );
  },

  getStatus: function () {
    return (
      <td className="text-right status">
        <AppStatusComponent model={this.props.model} />
      </td>
    );
  },

  render: function () {
    var model = this.props.model;

    var className = classNames({
      "group": model.isGroup,
      "app": !model.isGroup
    });

    var name = PathUtil.getRelativePath(model.id, this.props.currentGroup);

    return (
      // Set `title` on cells that potentially overflow so hovering on the
      // cells will reveal their full contents.
      <tr onClick={this.onClick} className={className}>
        <td className="icon-cell">
          {this.getIcon()}
        </td>
        <td className="name-cell" title={model.id}
            ref="nameCell">
          <span className="name" ref="nameNode">{name}</span>
          {this.getLabels()}
        </td>
        <td className="text-right total cpu-cell">
          {parseFloat(model.totalCpus).toFixed(1)}
        </td>
        <td className="text-right total ram">
          <span title={`${model.totalMem} MiB`}>
            {`${Util.filesize(model.totalMem * Math.pow(1024, 2), 0)}`}
          </span>
        </td>
        {this.getStatus()}
        <td className="text-right instances-cell" colSpan="2">
          <span>
            {model.tasksRunning}
          </span> of {model.instances}
        </td>
        {this.getHealthBar()}
      </tr>
    );
  }
});

module.exports = AppListItemComponent;
