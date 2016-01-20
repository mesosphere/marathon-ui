import _ from "underscore";

function getClassNames(component) {
  if (component.props == null || component.props.className == null) {
    return [];
  }
  return component.props.className
    .toLowerCase()
    .match(/\S+/g);
}

export function findAll(component, className) {
  return _.reduce(component.props.children, function (matches, child) {
    if (child != null && child.props != null) {
      var classes = getClassNames(child);
      if (_.contains(classes, className.toLowerCase())) {
        matches.push(child);
      }
      var childMatches = findAll(child, className);
      matches = matches.concat(childMatches);
    }
    return matches;
  }, []);
}

export function findOne(component, className) {
  return _.first(findAll(component, className));
}

export function getText(component) {
  if (typeof (component) === "string") {
    return component;
  }
  if (component.props != null) {
    return _.reduce(component.props.children, function (text, child) {
      return text + getText(child);
    }, "");
  }
}
