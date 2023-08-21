const { create } = require("except-js");

const NotAnEventSourceMappingEventException = create(
  "NotAnEventSourceMappingEventException"
);

module.exports = {
  createSQSConsumer(config = {}) {
    const { events = {} } = config;

    return function (lambdaEvent) {
      const { Records } = lambdaEvent;
      if (!Records)
        throw new NotAnEventSourceMappingEventException("'Records' is null.");

      const record = Records[0];
      const { type } = Records[0];

      const { handler } = events[type];

      handler(record);
    };
  },
  NotAnEventSourceMappingEventException,
};
