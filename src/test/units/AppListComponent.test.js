import {expect} from "chai";
import {shallow, mount} from "enzyme";

import React from "react/addons";
import AppDispatcher from "../../js/AppDispatcher";
import AppsEvents from "../../js/events/AppsEvents";
import AppListComponent from "../../js/components/AppListComponent";
import AppListItemComponent from "../../js/components/AppListItemComponent";

describe("AppListComponent", function () {

  before(function () {
    var apps = [
      {
        id: "/app-alpha",
        instances: 1,
        mem: 16, cpus: 1},
      {
        id: "/app-beta",
        instances: 1,
        mem: 16,
        cpus: 1
      },
      {
        id: "/app-exact",
        instances: 1,
        mem: 16,
        cpus: 1
      },
      {
        id: "/group-alpha/app-1",
        instances: 1,
        mem: 16,
        cpus: 1
      },
      {
        id: "/group-alpha/app-2",
        instances: 1,
        mem: 16,
        cpus: 1
      },
      {
        id: "/group-alpha/group-beta/app-3",
        instances: 1,
        mem: 16,
        cpus: 1
      },
      {
        id: "/apps/sleep",
        instances: 1,
        mem: 16,
        cpus: 1
      },
      {
        id: "/fuzzy/apps/sleepz",
        instances: 1,
        mem: 16,
        cpus: 1
      },
      {
        id: "/group-with-long-name/group-with-long-name-/" +
        "group-with-long-name/group-with-long-name/" +
        "group-with-long-name/app-omega",
        instances: 1,
        mem: 16,
        cpus: 1
      }
    ];

    AppDispatcher.dispatch({
      actionType: AppsEvents.REQUEST_APPS,
      data: {body: {apps: apps}}
    });

    // Ideally we should mount(AppListComponent) once here
    // and use .setProps(), but we can't:
    // TODO https://github.com/airbnb/enzyme/issues/68
  });

  it("displays the right entries", function () {
    this.component = mount(<AppListComponent currentGroup="/" />);

    var appNames = this.component
      .find(AppListItemComponent)
      .map(appNode => appNode.find(".name-cell").text());

    expect(appNames).to.deep.equal([
      "apps",
      "fuzzy",
      "group-alpha",
      "group-with-long-name",
      "app-alpha",
      "app-beta",
      "app-exact"
    ]);
    this.component.instance().componentWillUnmount();
  });

  it("correctly renders in group context", function () {
    this.component = mount(<AppListComponent currentGroup="/group-alpha/" />);

    var appNames = this.component
      .find(AppListItemComponent)
      .map(appNode => appNode.find(".name-cell").text());

    expect(appNames).to.deep.equal([
      "group-beta", "app-1", "app-2"
    ]);
    this.component.instance().componentWillUnmount();
  });

  // The following cannot use mount() due to the BreadcrumbComponent's Link
  // (see Breadcrumb Component tests)
  describe("when the user enters a text filter", function () {

    it("displays the exact search result match", function () {
      var context = {
        router: {
          getCurrentQuery: function () {
            return {
              filterText: "app-exact"
            };
          }
        }
      };

      this.component = shallow(
        <AppListComponent currentGroup="/" />,
        {context}
      );

      var appNames = this.component
        .find(AppListItemComponent)
        .map(app => app.props().model.id);

      expect(appNames).to.deep.equal([
        "/app-exact"
      ]);
      this.component.instance().componentWillUnmount();
    });

    it("handles fuzzy search input", function () {
      var context = {
        router: {
          getCurrentQuery: function () {
            return {
              filterText: "appsleep"
            };
          }
        }
      };

      this.component = shallow(
        <AppListComponent currentGroup="/" />,
        {context}
      );

      var appNames = this.component
        .find(AppListItemComponent)
        .map(app => app.props().model.id);

      expect(appNames).to.deep.equal([
        "/apps/sleep",
        "/fuzzy/apps/sleepz"
      ]);
      this.component.instance().componentWillUnmount();
    });

    it("shows the right result for deeply nested paths", function () {
      var context = {
        router: {
          getCurrentQuery: function () {
            return {
              filterText: "app-omega"
            };
          }
        }
      };

      this.component = shallow(
        <AppListComponent currentGroup="/" />,
        {context}
      );

      var appNames = this.component
        .find(AppListItemComponent)
        .map(app => app.props().model.id);

      expect(appNames).to.deep.equal(["/group-with-long-name/" +
      "group-with-long-name-/group-with-long-name/group-with-long-name/" +
      "group-with-long-name/app-omega"]);
      this.component.instance().componentWillUnmount();
    });

    it("shows the best match first", function () {
      var context = {
        router: {
          getCurrentQuery: function () {
            return {
              filterText: "app"
            };
          }
        }
      };

      this.component = shallow(
        <AppListComponent currentGroup="/" />,
        {context}
      );

      var appNames = this.component
        .find(AppListItemComponent)
        .map(app => app.props().model.id);

      expect(appNames).to.deep.equal([
        "/app-beta",
        "/app-exact",
        "/app-alpha",
        "/group-alpha/app-2",
        "/group-alpha/app-1",
        "/group-alpha/group-beta/app-3",
        "/apps/sleep",
        "/fuzzy/apps/sleepz",
        "/group-with-long-name/group-with-long-name-/group-with-long-name/" +
          "group-with-long-name/group-with-long-name/app-omega"
      ]);
      this.component.instance().componentWillUnmount();
    });

    it("returns 0 results when no matches are found", function () {
      var context = {
        router: {
          getCurrentQuery: function () {
            return {
              filterText: "nope"
            };
          }
        }
      };

      this.component = shallow(
        <AppListComponent currentGroup="/" />,
        {context}
      );

      var appNames = this.component
        .find(AppListItemComponent)
        .map(app => app.props().model.id);

      expect(appNames).to.have.length(0);
      this.component.instance().componentWillUnmount();
    });
  });

});
