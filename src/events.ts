import {
  Event,
  EventTemplate,
  Kind,
  Relay,
  getEventHash,
  signEvent,
  validateEvent,
  verifySignature,
} from "nostr-tools";
import { getPubkey, getSigner } from "./utils";
import { Lsat } from "lsat-js";

type TagType = string
type EventTags = [TagType, string]

declare enum AuthEventKind {
  AUTH_402 = 1402
}

const EventKinds = { ...AuthEventKind, ...Kind }

type ValueOf<T> = T[keyof T]
type EventKind = ValueOf<typeof EventKinds>

const createBaseEvent = (kind: EventKind, tags: EventTags[], content: string = ""): EventTemplate => ({
  kind,
  created_at: Math.floor(Date.now() / 1000),
  tags,
  content
} as EventTemplate)


const finalizeEvent = (e: EventTemplate): Event => {
  const pubkey = getPubkey();
  const signer = getSigner();
  const event: Event = {
    ...e,
    pubkey,
    id: getEventHash({ ...e, pubkey }),
    sig: signEvent({ ...e, pubkey }, signer.privateKey as string),
  };

  let ok = validateEvent(event);
  let veryOk = verifySignature(event);
  if (!ok) throw new Error("event is not ok");
  if (!veryOk) throw new Error("sig is not ok");
  return event
}

export const createTextEvent = (content: string) => {
  const e: EventTemplate = createBaseEvent(1, [], content)
  return finalizeEvent(e)
};

export const createAuthorizeEvent = (challenge: string, relay: string) => {
  const lsat = Lsat.fromChallenge(challenge)
  const e: EventTemplate = createBaseEvent(1402, [["relay", relay], ["lsat", lsat.toToken()]])
  return finalizeEvent(e)
}

export const publishEvent = (relay: Relay, event: Event) => {
  let pub = relay.publish(event);
  pub.on("ok", () => {
    console.log(`${relay.url} has accepted our event ${event.id}`);
  });
  pub.on("failed", (reason: string) => {
    console.log(`failed to publish ${event.id} to ${relay.url}: ${reason}`);
  });
}
