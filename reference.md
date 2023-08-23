## Functions

<dl>
<dt><a href="#createSQSConsumer">createSQSConsumer([config])</a> ⇒ <code><a href="#consumer">consumer</a></code></dt>
<dd><p>Creates a consumer function that processes messages from an AWS Lambda event,
following the provided configuration.</p>
</dd>
<dt><a href="#consumer">consumer(lambdaEvent)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>An async function that processes messages from an AWS Lambda event, based on the provided configuration.</p>
</dd>
</dl>

<a name="createSQSConsumer"></a>

## createSQSConsumer([config]) ⇒ [<code>consumer</code>](#consumer)
Creates a consumer function that processes messages from an AWS Lambda event,
following the provided configuration.

**Kind**: global function  
**Returns**: [<code>consumer</code>](#consumer) - An async function that processes messages from an AWS Lambda event.  
**Throws**:

- <code>InvalidConfigException</code> When the provided configuration fails schema validation.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [config] | <code>Object</code> | <code>{}</code> | The configuration object for the consumer. |
| config.events | <code>Object</code> |  | An object mapping event types to event handling manifests. |
| [config.persistence] | <code>Object</code> |  | An optional persistence object for storing message processing state. |

<a name="consumer"></a>

## consumer(lambdaEvent) ⇒ <code>Promise.&lt;void&gt;</code>
An async function that processes messages from an AWS Lambda event, based on the provided configuration.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - A promise that resolves after processing all messages.  
**Throws**:

- <code>NotAnEventSourceMappingEventException</code> When 'Records' is missing or null in the event.
- <code>EventHandlerNotFoundForTypeException</code> When an event handler is not found for a message type.
- <code>MessageProcessingFailedException</code> When message processing encounters an exception.


| Param | Type | Description |
| --- | --- | --- |
| lambdaEvent | <code>Object</code> | The Lambda event containing the messages to process. |
| lambdaEvent.Records | <code>Array</code> | An array of message records. |

