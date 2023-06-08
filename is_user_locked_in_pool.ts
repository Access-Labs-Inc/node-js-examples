import { Connection, PublicKey } from "@solana/web3.js";
import { StakePool, StakeAccount, BondAccount, getBondAccounts } from "@accessprotocol/js";

const SOLANA_RPC_PROVIDER_URL = "https://api.devnet.solana.com";
const ACCESS_PROGRAM_PUBKEY = new PublicKey("9LPrKE24UaN9Bsf5rXCS4ZGor9VmjAUxkLCMKHr73sdV");
const MY_POOL_PUBKEY = new PublicKey("2hQSDVwJLbtwHzi3CKj8pmiQzLyfKZs5ZDhT1QZdHXv3");
const USER_PUBKEY = new PublicKey("7Q34nmDP1srbYSQJH5b43heZpPtsssiRZa17hLnx5Gqx");

const connection = new Connection(SOLANA_RPC_PROVIDER_URL);

const main = async () => {
  let poolAccount: StakePool | undefined = undefined;
  try {
    poolAccount = await StakePool.retrieve(connection, MY_POOL_PUBKEY);
  } catch (e) {
    console.error("Could not find stake pool account. Error: ", e)
    return;
  }

  const [stakeKey] = await StakeAccount.getKey(
    ACCESS_PROGRAM_PUBKEY,
    USER_PUBKEY,
    MY_POOL_PUBKEY,
  );

  // Each user can have only one stake account (aka locked account) per pool
  let stakeAccount: StakeAccount | undefined = undefined;
  try {
    stakeAccount = await StakeAccount.retrieve(connection, stakeKey);
  } catch (e) {
    console.error("Could not find lock account. Error: ", e);
  }

  if (stakeAccount) {
    console.log(`Amount locked is ${stakeAccount.stakeAmount.toNumber() / 10 ** 6} ACS`);
  } else {
    console.error("Lock account not found.");
  }

  // Each user can have many bond accounts (aka airdrop) per pool
  let bondsAmountSum = Number(0);
  const allBondAccountsForUser = await getBondAccounts(connection, USER_PUBKEY, ACCESS_PROGRAM_PUBKEY);
  if (allBondAccountsForUser != null && allBondAccountsForUser.length > 0) {
    allBondAccountsForUser.forEach((ba) => {
      const b = BondAccount.deserialize(ba.account.data);
      if (b.stakePool.toBase58() === MY_POOL_PUBKEY.toBase58()) {
        bondsAmountSum += b.totalStaked.toNumber();
        console.log(`Airdrop amount locked is ${b.totalStaked.toNumber() / 10 ** 6} ACS`);
      }
    });
    console.log(`Total sum of airdrops is ${bondsAmountSum / 10 ** 6} ACS`);
  } else {
    console.warn("No airdrops found for this user.");
  }

  const requiredMinAmountToLock = stakeAccount && poolAccount
    ? Math.min(
        Number(stakeAccount.poolMinimumAtCreation),
        Number(poolAccount.minimumStakeAmount)
      )
    : Number(poolAccount.minimumStakeAmount)

  // Check if user meets the min. requirement for receive the benefits of the pool
  if (requiredMinAmountToLock > bondsAmountSum + stakeAccount?.stakeAmount.toNumber()) {
    console.log("User is NOT eligible for benefits of the pool.");
  } else {
    console.log("User is eligable for benefits of the pool.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
