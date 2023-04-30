import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import * as dotenv from "dotenv";
import { getPublicKey, nip19 } from "nostr-tools";
import QRCode from 'qrcode-terminal'

dotenv.config();

export const nsec = process.env.NSEC;

let signer: NDKPrivateKeySigner;

export const getSigner = () => {
  if (signer) return signer

  signer = new NDKPrivateKeySigner(
    nip19.decode(nsec as string).data as string
  );
  return signer
}

export const getPrivateKey = () => {
  const s = getSigner();
  if (!s.privateKey) throw new Error("missing priv key");
  return s.privateKey
}

export const getPubkey = () => getPublicKey(getPrivateKey())

export const generateQR = async (text: string) => {
  try {
    console.log(await QRCode.generate(text, { small: true }))
  } catch (err) {
    console.error(err)
  }
}