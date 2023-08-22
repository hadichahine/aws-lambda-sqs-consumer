const { create } = require("except-js");
const yup = require("yup");

const NotAnEventSourceMappingEventException = create(
  "NotAnEventSourceMappingEventException"
);

const EventHandlerNotFoundForTypeException = create(
  "EventHandlerNotFoundForTypeException"
);

const InvalidConfigException = create("InvalidConfigException");

const configSchema = yup
  .object()
  .shape({
    events: yup
      .object()
      .default({})
      .test(
        "anypropertyname",
        "Invalid event manifest schema.",
        function (object) {
          return Object.entries(object).every(([, value]) =>
            yup
              .object()
              .shape({
                handler: yup.mixed().required("Handler function is required"),
              })
              .isValidSync(value)
          );
        }
      ),
  })
  .noUnknown();

module.exports = {
  createSQSConsumer(config = {}) {
    try {
      configSchema.validateSync(config);
    } catch (error) {
      throw new InvalidConfigException(error);
    }

    const { events = {} } = config;

    return async function (lambdaEvent) {
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
        await handler(event);
      }
    };
  },
  NotAnEventSourceMappingEventException,
  EventHandlerNotFoundForTypeException,
  InvalidConfigException,
};
