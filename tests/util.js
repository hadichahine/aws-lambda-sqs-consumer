const { v4: uuidv4 } = require("uuid");

module.exports = {
  sqsMessage({ messageId, body }) {
    return {
      messageId: messageId ?? uuidv4(),
      body: JSON.stringify(body),
    };
  },
};
