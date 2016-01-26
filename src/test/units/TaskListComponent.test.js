import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import States from "../../js/constants/States";
import TaskListComponent from "../../js/components/TaskListComponent";
import TaskListItemComponent from "../../js/components/TaskListItemComponent";

describe("TaskListComponent", function () {

  before(function () {
    this.model = [{
      appId: "/app-1",
      id: "task-1"
    }, {
      appId: "/app-1",
      id: "task-2"
    }];

    this.component = shallow(
      <TaskListComponent currentPage={0}
                         fetchState={States.STATE_SUCCESS}
                         getTaskHealthMessage={() => {}}
                         hasHealth={false}
                         itemsPerPage={8}
                         onTaskToggle={() => {}}
                         selectedTasks={{}}
                         tasks={this.model}
                         toggleAllTasks={() => {}}/>
    );
  });

  it("has correct TaskListItemComponents keys", function () {
    var taskList = this.component.find(TaskListItemComponent);

    expect(taskList.at(0).props().task.id).to.equal("task-1");
    expect(taskList.at(1).props().task.id).to.equal("task-2");
  });

});

