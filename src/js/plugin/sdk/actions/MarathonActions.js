import MarathonService from "../services/MarathonService";

export default class MarathonActions {

  static getDeployments() {
    return MarathonService.request({
      resource: "/v2/deployments"
    });
  }

  static getGroup(group) {
    let groupName = group.replace(/\/?(.*)/,"/$1");
    return MarathonService.request({
      resource: `/v2/groups${groupName}`
    });
  }

  static getGroups() {
    return this.getGroup("/");
  }

  static getApp(appId) {
    return MarathonService.request({
      resource: `/v2/apps${appId}`
    });
  }

};
