const { create } = require("except-js");

const NotAnEventSourceMappingEventException = create(
  "NotAnEventSourceMappingEventException"
);

const EventHandlerNotFoundForTypeException = create(
  "EventHandlerNotFoundForTypeException"
);

module.exports = {
  createSQSConsumer(config = {}) {
    const { events = {} } = config;

    return function (lambdaEvent) {
      const { Records } = lambdaEvent;
      if (!Records)
        throw new NotAnEventSourceMappingEventException("'Records' is null.");

      for (let event of Records) {
        const eventHandlingManifest = events[event.type];
        if (!eventHandlingManifest)
          throw new EventHandlerNotFoundForTypeException(
            `${event.type} not found`
          );
        const { handler } = events[event.type];
        handler(event);
      }
    };
  },
  NotAnEventSourceMappingEventException,
  EventHandlerNotFoundForTypeException,
};
