import MarathonService from "../services/MarathonService";

var service = new MarathonService();

export default class MarathonActions {

  getDeployments() {
    return service.request({
      resource: "/v2/deployments"
    });
  }

  getGroup(group) {
    /* ${group} already has the leading '/' */
    return service.request({
      resource: `/v2/groups${group}`
    });
  }

  getGroups() {
    return this.getGroup("/");
  }

  getApp(appId) {
    return service.request({
      resource: `/v2/apps${appId}`
    });
  }

};
