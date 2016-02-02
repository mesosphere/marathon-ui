const Messages = {
  UNAUTHORIZED: "Unauthorized access. Could not execute operation.",
  FORBIDDEN: "Access forbidden. Could not execute operation.",
  RETRY_REFRESH: "Refresh to try again.",
  MALFORMED: "Malformed response"
};

Messages[401] = Messages.UNAUTHORIZED;
Messages[403] = Messages.FORBIDDEN;

export default Object.freeze(Messages);
