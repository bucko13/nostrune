import "websocket-polyfill";
import * as dotenv from "dotenv";
import { relayInit } from "nostr-tools";
import { generateQR, getPubkey } from "./utils";
import { Lsat } from "lsat-js"
import { createAuthorizeEvent, publishEvent } from "./events";

dotenv.config();

const local = "wss://nostream.localtest.me";
const remote = process.env.RELAY;

if (!remote) throw new Error("Must set target RELAY in .env file")

const relay = relayInit(remote);
relay.on("connect", () => {
  console.log(`connected to ${relay.url}`);
});

relay.on("error", () => {
  console.log(`failed to connect to ${relay.url}`);
});

relay.on("auth", async (challenge) => {
  console.log('authed:', challenge)
  const lsat = Lsat.fromChallenge(challenge)
  await generateQR(lsat.invoice)
  const authEvent = createAuthorizeEvent(challenge, remote)
  // lets delay the auth event to give the user some time to pay
  setTimeout(() => {
    publishEvent(relay, authEvent)
  }, 2000)
})

relay.sub([])

const pubkey = getPubkey();

// add some subscriptions
let sub = relay.sub([
  {
    kinds: [1],
    authors: [pubkey],
  },
]);

sub.on("event", (event) => {
  console.log("got event:", event.kind, event.content);
});

export { relay };
