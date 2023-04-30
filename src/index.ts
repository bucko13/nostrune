import "websocket-polyfill";
import { relay } from "./app";
import { createTextEvent, publishEvent } from "./events";
import prompt from 'prompt'

(async () => {
  try {
    await relay.connect();
    prompt.start()
    const result = await prompt.get({
      properties: {
        message: {
          description: "what would you like to send to the relay"
        }
      }
    })
    const event = createTextEvent(result.message);
    publishEvent(relay, event)

    let events = await relay.list([{ kinds: [0, 1] }]);
    console.log("events:", events.length);
  } catch (e) {
    console.error("couldn't connect", e);
  }
})();
