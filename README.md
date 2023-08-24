# lambda-sqs-consumer

## Overview

An [event source mapping](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html) compliant lambda consumer factory for Amazon Simple Queue Service (SQS). The consumer function processes messages by `type` which is present as a JSON string inside the message body.

## Example

Here's an example:

```js
const { createSQSConsumer } = require("aws-lambda-sqs-consumer");

exports.handler = createSQSConsumer({
  events: {
    EVENT_TYPE_A: {
      handler(message) {
        console.log("Processing type a:", message.messageId);
      },
    },
    EVENT_TYPE_B: {
      handler(message) {
        console.log("Processing type b:", message.messageId);
      },
    },
  },
});
```

This would process messages of the `type` `EVENT_TYPE_A` and `EVENT_TYPE_B`.

Here's a sample message body for `EVENT_TYPE_A`:

```json
{ "type": "EVENT_TYPE_A", "payload": { "someproperty": "somevalue" } }
```

## Reference

The reference can be found [here](https://github.com/hadichahine/aws-lambda-sqs-consumer/blob/main/reference.md).
