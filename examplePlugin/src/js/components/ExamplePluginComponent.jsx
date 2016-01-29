import React from "react/addons";

var ExamplePluginComponent = React.createClass({

  render: function () {
    return (
      <div>
        <div className="flex-row">
          <h3 className="small-caps">Example Plugin</h3>
        </div>
        <ul className="list-group filters">
          <li>40 applications in total</li>
        </ul>
      </div>
    );
  }

});

export default ExamplePluginComponent;
