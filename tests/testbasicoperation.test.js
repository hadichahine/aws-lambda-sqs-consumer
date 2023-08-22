const {
  createSQSConsumer,
  NotAnEventSourceMappingEventException,
  EventHandlerNotFoundForTypeException,
  InvalidConfigException,
} = require("lambda-event-source-mapping-consumer");

test("test that consumer doesn't accept an event that doesn't have 'Records'", async () => {
  const consumer = createSQSConsumer();

  await expect(() =>
    consumer({ SomethingButNotRecords: "SomeValue" })
  ).rejects.toBeInstanceOf(NotAnEventSourceMappingEventException);
});

test("test that consumer consumes one message with appropriate type", async () => {
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

  await consumer({
    Records: [recordA, recordB],
  });

  expect(eventTypeAHandlerMock).toHaveBeenCalledWith(recordA);
  expect(eventTypeBHandlerMock).toHaveBeenCalledWith(recordB);
});

test("test that consumer throws exception when it doesn't have the message handler for type", async () => {
  const consumer = createSQSConsumer({
    events: {
      SOME_TYPE: {
        handler() {},
      },
    },
  });

  await expect(
    consumer({
      Records: [
        {
          type: "SOME_OTHER_TYPE",
          payload: {},
        },
      ],
    })
  ).rejects.toBeInstanceOf(EventHandlerNotFoundForTypeException);
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

async function awaitFunction(asyncFn) {
  const result = await asyncFn();
  return result;
}

test("test that consumer awaits on async handlers before exiting", async () => {
  const eventTypeAHandlerMock = jest.fn(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  const recordA = {
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

  const startTimestamp = Date.now();

  await consumer({
    Records: [recordA],
  });

  const endTimestamp = Date.now();

  expect(eventTypeAHandlerMock).toHaveBeenCalledWith(recordA);
  expect(endTimestamp - startTimestamp).toBeGreaterThanOrEqual(100);
});
