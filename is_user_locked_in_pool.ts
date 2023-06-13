import { Connection, PublicKey } from "@solana/web3.js";
import { hasValidSubscriptionForPool } from "@accessprotocol/js";

const SOLANA_RPC_PROVIDER_URL = "https://api.devnet.solana.com";
const ACCESS_PROGRAM_PUBKEY = new PublicKey("9LPrKE24UaN9Bsf5rXCS4ZGor9VmjAUxkLCMKHr73sdV");
const MY_POOL_PUBKEY = new PublicKey("2hQSDVwJLbtwHzi3CKj8pmiQzLyfKZs5ZDhT1QZdHXv3");
const USER_PUBKEY = new PublicKey("7Q34nmDP1srbYSQJH5b43heZpPtsssiRZa17hLnx5Gqx");

const main = async () => {
  const connection = new Connection(SOLANA_RPC_PROVIDER_URL);
  const eligible = await hasValidSubscriptionForPool(connection, ACCESS_PROGRAM_PUBKEY, MY_POOL_PUBKEY, USER_PUBKEY);
  if (eligible) {
    console.log("User is eligible for benefits of the pool.");
  } else {
    console.log("User is NOT eligable for benefits of the pool.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
