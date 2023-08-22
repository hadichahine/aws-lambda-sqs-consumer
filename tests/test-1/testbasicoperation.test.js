const {
  createSQSConsumer,
  NotAnEventSourceMappingEventException,
  EventHandlerNotFoundForTypeException,
  InvalidConfigException,
} = require("./index");

test("test that consumer doesn't accept an event that doesn't have 'Records'", () => {
  const consumer = createSQSConsumer();

  expect(() => consumer({ SomethingButNotRecords: "SomeValue" })).toThrow(
    NotAnEventSourceMappingEventException
  );
});

test("test that consumer consumes one message with appropriate type", () => {
  const eventTypeAHandlerMock = jest.fn();

  const eventTypeBHandlerMock = jest.fn();

  const recordA = {
    type: "EVENT_TYPE_A",
    payload: {},
  };

  const recordB = {
    type: "EVENT_TYPE_B",
    payload: {},
  };

  const consumer = createSQSConsumer({
    events: {
      EVENT_TYPE_A: {
        handler: eventTypeAHandlerMock,
      },
      EVENT_TYPE_B: {
        handler: eventTypeBHandlerMock,
      },
    },
  });

  consumer({
    Records: [recordA, recordB],
  });

  expect(eventTypeAHandlerMock).toHaveBeenCalledWith(recordA);
  expect(eventTypeBHandlerMock).toHaveBeenCalledWith(recordB);
});

test("test that consumer throws exception when it doesn't have the message handler for type", () => {
  const consumer = createSQSConsumer({
    events: {
      SOME_TYPE: {
        handler() {},
      },
    },
  });

  expect(() =>
    consumer({
      Records: [
        {
          type: "SOME_OTHER_TYPE",
          payload: {},
        },
      ],
    })
  ).toThrow(EventHandlerNotFoundForTypeException);
});

test("test invalid config", () => {
  expect(() =>
    createSQSConsumer({
      events: {
        SOME_TYPE: {
          notHandler() {},
        },
      },
    })
  ).toThrow(InvalidConfigException);
});
