
export default class Utils {

  static addLeadingSlashIfNedded(value) {
    if (value && value[0] !== "/") {
      return "/" + value;
    }
    return value;
  };

};
