import MarathonService from "../services/MarathonService";
import Utils from "../utils";

export default class MarathonActions {

  static getDeployments() {
    return MarathonService.request({
      resource: "/v2/deployments"
    });
  }

  static getGroup(group) {
    let groupName = Utils.addLeadingSlashIfNedded(group);
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
