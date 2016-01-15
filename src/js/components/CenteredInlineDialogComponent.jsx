import classNames from "classnames";
import React from "react/addons";
import {Link} from "react-router";

var CenteredInlineDialogComponent = React.createClass({
  displayName: "CenteredInlineDialogComponent",

  propTypes: {
    additionalClasses: React.PropTypes.string,
    children: React.PropTypes.node,
    message: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired
  },

  render: function () {
    var props = this.props;

    var classSet = classNames("inline-dialog", props.additionalClasses);

    return (
      <div className="centered-content">
        <div className={classSet}>
          <h3 className="h3">{props.title}</h3>
          <p className="text-muted">{props.message}</p>
          {this.props.children}
        </div>
      </div>
    );
  }
});

export default CenteredInlineDialogComponent;
