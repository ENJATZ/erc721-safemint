import {
  ABIContract,
  Address,
  Clause,
  Mnemonic,
  Transaction,
} from "@vechain/sdk-core";
import { ThorClient } from "@vechain/sdk-network";
import { config, VECHAINACADEMY_CONTRACT_ABI } from "@repo/config-contract";

const SOLO_URL = "http://localhost:8669/";

// Same seed phrase from hardhat.config.ts
const SEED_PHRASE =
  "denial kitchen pet squirrel other broom bar gas better priority spoil cross";

function loadIdentity() {
  const privateKey = Mnemonic.toPrivateKey(SEED_PHRASE.split(" "));

  return {
    privateKey,
    address: Address.ofPrivateKey(privateKey),
    readableAddress: "0x" + Address.ofPrivateKey(privateKey).digits,
  };
}

async function mintNft(recipientAddress: string, tokenURI: string) {
  try {
    const thorClient = ThorClient.at(SOLO_URL);
    const identity = loadIdentity();
    console.log("Identity:", identity);

    console.log(`Minting NFT from ${identity.address} to ${recipientAddress}`);
    console.log(`Token metadata URI: ${tokenURI}`);

    // Create the clause to call the safeMint function
    const clause = Clause.callFunction(
      Address.of(config.CONTRACT_ADDRESS),
      ABIContract.ofAbi(VECHAINACADEMY_CONTRACT_ABI).getFunction("safeMint"),
      [recipientAddress, tokenURI]
    );

    const gas = await thorClient.gas.estimateGas(
      [clause],
      identity.address.toString(),
      { gasPadding: 0.2 }
    );

    const body = await thorClient.transactions.buildTransactionBody(
      [clause],
      gas.totalGas
    );

    const signedTransaction = Transaction.of(body).sign(identity.privateKey);

    const mintResult = await (
      await thorClient.transactions.sendTransaction(signedTransaction)
    ).wait();

    console.log("Mint result:", mintResult);

    const balanceOfResult = await thorClient.contracts.executeCall(
      config.CONTRACT_ADDRESS,
      ABIContract.ofAbi(VECHAINACADEMY_CONTRACT_ABI).getFunction("balanceOf"),
      [recipientAddress]
    );

    console.log("Balance result:", balanceOfResult);
  } catch (error) {
    console.error("Failed to mint NFT:", error);
    throw error;
  }
}

mintNft("0x435933c8064b4Ae76bE665428e0307eF2cCFBD68", "1").catch(console.error);
