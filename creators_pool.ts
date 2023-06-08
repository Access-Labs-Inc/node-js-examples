import { Connection, PublicKey } from "@solana/web3.js";

import {
  StakePool,
} from "@accessprotocol/js";

const SOLANA_RPC_PROVIDER_URL = "https://api.devnet.solana.com";
const MY_POOL_PUBKEY = new PublicKey("2hQSDVwJLbtwHzi3CKj8pmiQzLyfKZs5ZDhT1QZdHXv3");

const connection = new Connection(SOLANA_RPC_PROVIDER_URL);

const main = async () => {
  let poolAccount: StakePool | undefined = undefined;
  try {
    poolAccount = await StakePool.retrieve(connection, MY_POOL_PUBKEY);
  } catch (e) {
    console.error("Could not find stake pool account. Error: ", e)
  }

  if (poolAccount) {
    console.log(`Minimum lock amount is ${poolAccount.minimumStakeAmount.toNumber() / 10 ** 6} ACS`);
    console.log(`Total locked amount is ${poolAccount.totalStaked.toNumber() / 10 ** 6} ACS`);
    console.log(`Owner's pubkey is ${poolAccount.owner.toBase58()}`);
    console.log(`Stakers receive ${poolAccount.stakersPart.toNumber()}% of rewards`);
  } else {
    console.error("Pool account not found.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
