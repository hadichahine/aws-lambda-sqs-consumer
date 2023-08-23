const { create } = require("except-js");
const yup = require("yup");

const exceptions = Object.fromEntries(
  [
    "NotAnEventSourceMappingEventException",
    "EventHandlerNotFoundForTypeException",
    "EventHandlerNotFoundForTypeException",
    "MessageProcessingFailedException",
    "InvalidConfigException",
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

/**
 * Creates a consumer function that processes messages from an SQS event source mapping,
 * following the provided configuration.
 *
 * @function
 * @param {Object} [config={}] - The configuration object for the consumer.
 * @param {Object} config.events - An object mapping event types to event handling manifests.
 * @param {Object} [config.persistence] - An optional persistence object for storing message processing state.
 * @throws {InvalidConfigException} When the provided configuration fails schema validation.
 * @returns {consumer} An async function that processes messages from an AWS Lambda event.
 */
function createSQSConsumer(config = {}) {
  try {
    configSchema.validateSync(config);
  } catch (error) {
    throw new exceptions.InvalidConfigException(error);
  }

  const { events = {}, persistence } = config;

  /**
   * An async function that processes messages from an AWS Lambda event, based on the provided configuration.
   *
   * @async
   * @function
   * @name consumer
   * @param {Object} lambdaEvent - The Lambda event containing the SQS messages to process.
   * @param {Array} lambdaEvent.Records - An array of message records.
   * @throws {NotAnEventSourceMappingEventException} When 'Records' is missing or null in the event.
   * @throws {EventHandlerNotFoundForTypeException} When an event handler is not found for a message type.
   * @throws {MessageProcessingFailedException} When message processing encounters an exception.
   * @returns {Promise<void>} A promise that resolves after processing all messages.
   */
  async function consumer(lambdaEvent) {
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
  }
  return consumer;
}

module.exports = {
  createSQSConsumer,
  ...exceptions,
};
