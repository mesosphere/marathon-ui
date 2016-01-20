import classNames from "classnames";
import React from "react/addons";
import {Link} from "react-router";

import Util from "../helpers/Util"

var CenteredInlineDialogComponent = React.createClass({
  displayName: "CenteredInlineDialogComponent",

  propTypes: {
    additionalClasses: React.PropTypes.string,
    children: React.PropTypes.node,
    message: React.PropTypes.string,
    title: React.PropTypes.string
  },

  render: function () {
    var props = this.props;

    var classSet = classNames("inline-dialog", props.additionalClasses);
    var message = !Util.isStringAndEmpty(props.message)
      ? <p className="text-muted">{props.message}</p>
      : null;

    var title = !Util.isStringAndEmpty(props.title)
      ? <h3 className="h3">{props.title}</h3>
      : null;

    return (
      <div className="centered-content">
        <div className={classSet}>
          {title}
          {message}
          {this.props.children}
        </div>
      </div>
    );
  }
});

export default CenteredInlineDialogComponent;
