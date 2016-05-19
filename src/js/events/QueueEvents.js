const QueueEvents = {
  CHANGE: "QUEUE_EVENTS_CHANGE",
  REQUEST: "QUEUE_EVENTS_REQUEST",
  REQUEST_ERROR: "QUEUE_EVENTS_REQUEST_ERROR",
  RESET_DELAY: "QUEUE_EVENTS_RESET_DELAY",
  RESET_DELAY_ERROR: "QUEUE_EVENTS_RESET_DELAY_ERROR",
  OFFER_STATS: "OFFER_STATS",
  OFFER_STATS_ERROR: "OFFER_STATS_ERROR"
};

export default Object.freeze(QueueEvents);
