const { createSQSConsumer } = require("aws-lambda-sqs-consumer");
const { sqsMessage } = require("./util");

test("test that when message is sent twice it won't be processed again", async () => {
  const persistence = {
    save(data) {
      if (!this.messages) this.messages = {};
      const { messageId } = data;
      const presentMessageData = this.messages[messageId];

      if (presentMessageData)
        this.messages[messageId] = {
          ...presentMessageData,
          data,
        };
      else this.messages[messageId] = data;
    },
    get(id) {
      if (!this.messages) this.messages = [];
      return this.messages[id];
    },
    getAll(ids) {
      return ids.map((id) => this.get(id)).filter((data) => data);
    },
  };

  const eventHandler = jest.fn();

  const consumer = createSQSConsumer({
    events: {
      EVENT_TYPE: {
        handler: eventHandler,
      },
    },
    persistence,
  });

  const message = sqsMessage({
    body: {
      type: "EVENT_TYPE",
      payload: {},
    },
  });

  await consumer({
    Records: [message],
  });

  await consumer({
    Records: [message],
  });

  await expect(eventHandler).toHaveBeenCalledTimes(1);
});
