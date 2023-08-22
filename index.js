const { create } = require("except-js");
const yup = require("yup");

const exceptions = Object.fromEntries(
  [
    "NotAnEventSourceMappingEventException",
    "EventHandlerNotFoundForTypeException",
    "EventHandlerNotFoundForTypeException",
    "MessageProcessingFailedException",
  ].map((name) => [name, create(name)])
);

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
    persistence: yup.object(),
  })
  .noUnknown();

module.exports = {
  createSQSConsumer(config = {}) {
    try {
      configSchema.validateSync(config);
    } catch (error) {
      throw new exceptions.InvalidConfigException(error);
    }

    const { events = {}, persistence } = config;

    return async function (lambdaEvent) {
      const { Records } = lambdaEvent;
      if (!Records)
        throw new exceptions.NotAnEventSourceMappingEventException(
          "'Records' is null."
        );

      const processedIds = persistence
        ? (await persistence.getAll(Records.map(({ messageId }) => messageId)))
            .filter(({ processed }) => processed)
            .map(({ messageId }) => messageId)
        : [];

      for (let message of Records) {
        const { messageId, body } = message;

        if (processedIds.includes(messageId)) continue;

        const { type } = JSON.parse(body);

        const eventHandlingManifest = events[type];
        if (!eventHandlingManifest)
          throw new exceptions.EventHandlerNotFoundForTypeException(
            `${type} not found`
          );
        const { handler } = events[type];
        try {
          await handler(message);
        } catch (exception) {
          throw new exceptions.MessageProcessingFailedException({
            messageId,
            exception,
          });
        }

        if (persistence)
          await persistence.save({
            messageId,
            message,
            processed: true,
          });
      }
    };
  },
  ...exceptions,
};
