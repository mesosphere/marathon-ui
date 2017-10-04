
import config from "../../../config/config";
import ajaxWrapper from "../../../helpers/ajaxWrapper";

export default class MarathonService {

  static request({resource, method="GET", data}) {

    if (resource) {
      resource.replace(/\/?(.*)/,"/$1");
    }

    return ajaxWrapper({
      url: `${config.apiURL}${resource}`,
      method: method,
      data: data
    });
  }

};
