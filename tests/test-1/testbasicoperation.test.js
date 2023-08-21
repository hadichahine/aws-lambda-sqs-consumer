const {
  createSQSConsumer,
  NotAnEventSourceMappingEventException,
} = require("./index");

test("test that consumer doesn't accept an event that doesn't have 'Records'", () => {
  const consumer = createSQSConsumer();

  expect(() => consumer({ SomethingButNotRecords: "SomeValue" })).toThrow(
    NotAnEventSourceMappingEventException
  );
});

test("test that consumer consumes one message with appropriate type", () => {
  const eventTypeAHandlerMock = jest.fn();

  const record = {
    type: "EVENT_TYPE_A",
    payload: {},
  };

  const consumer = createSQSConsumer({
    events: {
      EVENT_TYPE_A: {
        handler: eventTypeAHandlerMock,
      },
    },
  });

  consumer({
    Records: [record],
  });

  expect(eventTypeAHandlerMock).toHaveBeenCalledWith(record);
});
