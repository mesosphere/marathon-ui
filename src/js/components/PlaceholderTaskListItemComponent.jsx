var React = require("react/addons");

var PlaceholderTaskListItemComponent = React.createClass({
  displayName: "PlaceholderTaskListItemComponent",

  render: function () {

    return (
      <tr>
        <td width="1">
          <input type="checkbox" checked={false} disabled={true} />
        </td>
        <td>
          <div className="placeholder-top"/>
          <div className="placeholder-bottom"/>
        </td>
        <td className="text-center">
          &mdash;
        </td>
        <td className="text-center">
          &mdash;
        </td>
        <td className="text-center">
          &mdash;
        </td>
        <td className="text-center">
          &mdash;
        </td>
        <td className="text-center">
          &mdash;
        </td>
      </tr>
    );
  }
});

module.exports = PlaceholderTaskListItemComponent;
