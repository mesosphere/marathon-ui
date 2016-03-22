import {expect} from "chai";
import {shallow, mount} from "enzyme";

import React from "react/addons";
import AppDispatcher from "../../js/AppDispatcher";
import AppsEvents from "../../js/events/AppsEvents";
import AppListComponent from "../../js/components/AppListComponent";
import AppListItemComponent from "../../js/components/AppListItemComponent";

class SyntheticContext {
  get router() {
    return {
      getCurrentQuery: () => this.currentQuery,
      getCurrentPathname: () => this.currentPathname
    };
  }
}

describe("AppListComponent", function () {
  var context = new SyntheticContext();

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
        id: "/group-alpha",
        isGroup: true
      },
      {
        id: "/group-alpha/group-beta",
        isGroup: true
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
        id: "/apps",
        isGroup: true
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
        id: "/fuzzy",
        isGroup: true
      },
      {
        id: "/fuzzy/apps",
        isGroup: true
      },
      {
        id: "/fuzzy/apps/app",
        instances: 1,
        mem: 16,
        cpus: 1
      },
      {
        id: "/group-with-long-name",
        isGroup: true
      },
      {
        id: "/group-with-long-name/group-with-long-name",
        isGroup: true
      },
      {
        id: "/group-with-long-name/group-with-long-name/" +
        "group-with-long-name",
        isGroup: true
      },
      {
        id: "/group-with-long-name/group-with-long-name/" +
        "group-with-long-name/group-with-long-name",
        isGroup: true
      },
      {
        id: "/group-with-long-name/group-with-long-name/" +
        "group-with-long-name/group-with-long-name/" +
        "group-with-long-name",
        isGroup: true
      },
      {
        id: "/group-with-long-name/group-with-long-name/" +
        "group-with-long-name/group-with-long-name/" +
        "group-with-long-name/app-omega",
        instances: 1,
        mem: 16,
        cpus: 1
      },
      {
        id: "/empty-group",
        instances: 0,
        mem: 0,
        cpus: 0,
        isGroup: true
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
      "empty-group",
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
  describe("when the user applies a text filter", function () {

    it("displays the exact matching app", function () {
      context.currentQuery = {
        filterText: "app-exact"
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

    it("handles fuzzy app search input", function () {
      context.currentQuery = {
        filterText: "appsleep"
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

    it("displays the exact matching group", function () {
      context.currentQuery = {
        filterText: "apps"
      };

      this.component = shallow(
        <AppListComponent currentGroup="/" />,
        {context}
      );

      var appNames = this.component
        .find(AppListItemComponent)
        .map(app => app.props().model.id);

      expect(appNames).to.deep.equal([
        "/apps",
        "/fuzzy/apps",
        "/apps/sleep",
        "/fuzzy/apps/app",
        "/fuzzy/apps/sleepz",
      ]);
      this.component.instance().componentWillUnmount();
    });

    it("handles fuzzy group search input", function () {
      context.currentQuery = {
        filterText: "fuzz"
      };
      this.component = shallow(
        <AppListComponent currentGroup="/" />,
        {context}
      );

      var appNames = this.component
        .find(AppListItemComponent)
        .map(app => app.props().model.id);

      expect(appNames).to.deep.equal([
        "/fuzzy",
        "/fuzzy/apps/app",
        "/fuzzy/apps/sleepz"
      ]);
      this.component.instance().componentWillUnmount();
    });

    it("shows the right result for deeply nested paths", function () {
      context.currentQuery = {
        filterText: "app-omega"
      };

      this.component = shallow(
        <AppListComponent currentGroup="/" />,
        {context}
      );

      var appNames = this.component
        .find(AppListItemComponent)
        .map(app => app.props().model.id);

      expect(appNames).to.deep.equal(["/group-with-long-name/" +
      "group-with-long-name/group-with-long-name/group-with-long-name/" +
      "group-with-long-name/app-omega"]);
      this.component.instance().componentWillUnmount();
    });

    it("shows the best match first", function () {
      context.currentQuery = {
        filterText: "app"
      };

      this.component = shallow(
        <AppListComponent currentGroup="/" />,
        {context}
      );

      var appNames = this.component
        .find(AppListItemComponent)
        .map(app => app.props().model.id);

      expect(appNames).to.deep.equal([
        // group, score: 0.134
        "/apps",
        // group, score:0.10579545454545455
        "/fuzzy/apps",
        // app, score:0.12
        "/fuzzy/apps/app",
        // app, score:0.10833333333333332
        "/app-beta",
        // app, score:0.10533333333333333
        "/app-exact",
        // app, score:0.10533333333333333
        "/app-alpha",
        // app, score:0.07369444444444445
        "/group-alpha/app-2",
        // app, score:0.07369444444444445
        "/group-alpha/app-1",
        // app, score:0.06234482758620689
        "/group-alpha/group-beta/app-3",
        // app, score:0.04454545454545455
        "/apps/sleep",
        // app, score:0.035
        "/fuzzy/apps/sleepz",
        // app, score:0.023078260869565215
        "/group-with-long-name/group-with-long-name/group-with-long-name/" +
          "group-with-long-name/group-with-long-name/app-omega"
      ]);
      this.component.instance().componentWillUnmount();
    });

    it("returns 0 results when no matches are found", function () {
      context.currentQuery = {
        filterText: "nope"
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

    it("shows no items for empty groups", function () {
      context.currentQuery = {
        filterText: "nope"
      };

      this.component = shallow(
        <AppListComponent currentGroup="/empty-group" />,
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
