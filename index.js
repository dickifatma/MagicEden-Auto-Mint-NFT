const { ethers } = require('ethers');
const dotenv = require('dotenv');
const magiceden = require('./magiceden.js');
const readline = require('readline');

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const networkNames = {
  10143: 'monad-testnet',
  42161: 'arbitrum',
  1: 'ethereum',
  8453: 'base'
};

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const waitForConfirmation = async (txHash, provider, maxWaitTime = 300000) => {
  console.log(`⏳ Waiting for transaction confirmation...`);
  console.log(`🔗 TX Hash: ${txHash}`);
  
  try {
    const receipt = await provider.waitForTransaction(txHash, 1, maxWaitTime);
    return receipt;
  } catch (error) {
    throw new Error(`Transaction confirmation timeout or failed: ${error.message}`);
  }
};

(async () => {
  console.log("🚀 MAGIC EDEN MINT EXECUTOR");
  console.log("=".repeat(50));

  try {
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY not found in .env file");
    }
  
    console.log("\n🔗 Available chains:");
    console.log("1. Monad-Testnet");
    console.log("2. Arbitrum");
    console.log("3. Ethereum Mainnet");
    console.log("4. Base");
    
    const chainChoice = await askQuestion("Select chain (1 - 4): ");
    let selectedChain;
    let rpcURL;
    
    switch (chainChoice) {
      case '1':
        selectedChain = 'monad-testnet';
        rpcURL = process.env.RPC_URL_MONAD;
        break;
      case '2':
        selectedChain = 'arbitrum';
        rpcURL = process.env.RPC_URL_ARBITRUM;
        break;
        case '3':
        selectedChain = 'ethereum';
        rpcURL = process.env.RPC_URL_ETH_MAINNET;
        break;
        case '4':
        selectedChain = 'base';
        rpcURL = process.env.RPC_URL_BASE;
        break;
      default:
        console.log("❌ Invalid choice! Using monad-testnet as default.");
        selectedChain = 'monad-testnet';
    }

    if (!rpcURL) {
      throw new Error(`RPC URL not found for ${selectedChain}. Please set it in .env`);
    }

    const getCurrencySymbol = (chain) => {
      switch (chain) {
        case 'monad-testnet':
          return 'MON';
        default:
          return 'ETH';
      }
    };

    console.log("🔗 Connecting to RPC...");
    const provider = new ethers.JsonRpcProvider(rpcURL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("👛 Wallet Address:", wallet.address);
    
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), getCurrencySymbol(selectedChain));

    const network = await provider.getNetwork();
    const networkName = networkNames[network.chainId] || network.name || selectedChain;

    console.log("🌐 Network:", networkName, "- Chain ID:", network.chainId.toString());

    const contract = await askQuestion("\n📋 Enter contract address: ");
    if (!contract || !contract.startsWith('0x')) {
      console.log("❌ Invalid contract address! Must start with 0x");
      rl.close();
      return;
    }

    const amountInput = await askQuestion("📦 How many to mint (default 1): ");
    const amount = parseInt(amountInput) || 1;
    rl.close();

    const config = {
      contract: contract.trim(),
      wallet: wallet.address,
      chain: selectedChain,
      amount: amount,
      currency: getCurrencySymbol(selectedChain)
    };

    console.log("\n" + "=".repeat(50));
    console.log("📋 EXECUTION CONFIG:");
    console.log("Contract:", config.contract);
    console.log("Chain:", config.chain.toUpperCase());
    console.log("Currency:", config.currency);
    console.log("Wallet:", config.wallet);
    console.log("Amount:", config.amount);
    console.log("=".repeat(50));

    console.log("\n🔄 Getting mint quote...");
    const quote = await magiceden.quoteMintData(
      config.contract,
      config.wallet,
      config.chain,
      config.amount,
      0
    );

    if (!quote.steps || quote.steps.length === 0) {
      throw new Error("No mint steps found. Mint might not be active or collection is sold out.");
    }

    const mintStep = quote.steps[0];
    const valueFromAPI = mintStep.params.value;
    let weiValue = BigInt(valueFromAPI);

    console.log("\n✅ MINT QUOTE RECEIVED");
    console.log("-".repeat(50));
    
    if (weiValue === 0n) {
      console.log("💰 Cost: FREE");
    } else {
      console.log("💰 Cost (wei):", weiValue.toString());
      console.log(`💰 Cost (${config.currency}):`, ethers.formatEther(weiValue), config.currency);
    }
    
    if (balance < weiValue) {
      throw new Error(`Insufficient balance! Need ${ethers.formatEther(weiValue)} ${config.currency}, but have ${ethers.formatEther(balance)} ${config.currency}`);
    }

    console.log("\n⛽ Estimating gas...");
    const txRequest = {
      to: mintStep.params.to,
      value: weiValue,
      data: mintStep.params.data,
    };

    let gasLimit;
    try {
      gasLimit = await provider.estimateGas({
        ...txRequest,
        from: wallet.address
      });
      console.log("⛽ Estimated Gas:", gasLimit.toString());
    } catch {
      console.log("⚠️  Gas estimation failed, using default gas limit");
      gasLimit = BigInt(500000); 
    }

    const feeData = await provider.getFeeData();
    console.log("⛽ Gas Price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
    
    const estimatedGasCost = gasLimit * feeData.gasPrice;
    console.log(`⛽ Estimated Gas Cost:`, ethers.formatEther(estimatedGasCost), config.currency);
    
    const totalCost = weiValue + estimatedGasCost;
    console.log(`💰 Total Cost (Mint + Gas):`, ethers.formatEther(totalCost), config.currency);

    console.log("\n" + "⚠️ ".repeat(20));
    console.log("🚨 READY TO EXECUTE MINT TRANSACTION");
    console.log("Contract:", mintStep.params.to);
    console.log(`Value:`, ethers.formatEther(weiValue), config.currency);
    console.log("Gas Limit:", gasLimit.toString());
    console.log(`Total Cost:`, ethers.formatEther(totalCost), config.currency);
    console.log("⚠️ ".repeat(20));

    const finalTx = {
      to: mintStep.params.to,
      value: weiValue,
      data: mintStep.params.data,
      gasLimit: gasLimit,
      gasPrice: feeData.gasPrice
    };

    console.log("\n🚀 Sending transaction...");
    const tx = await wallet.sendTransaction(finalTx);
    
    console.log("✅ Transaction sent!");
    console.log("🔗 TX Hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await waitForConfirmation(tx.hash, provider);
    
    if (receipt.status === 1) {
      console.log("\n🎉 MINT SUCCESSFUL!");
      console.log("-".repeat(50));
      console.log("✅ Status: Success");
      console.log("🔗 TX Hash:", receipt.hash);
      console.log("📦 Block Number:", receipt.blockNumber);
      console.log("⛽ Gas Used:", receipt.gasUsed.toString());
      console.log(`💰 Actual Gas Cost:`, ethers.formatEther(receipt.gasUsed * receipt.gasPrice), config.currency);
      console.log("🎯 Contract:", receipt.to);
    } else {
      console.log("\n❌ TRANSACTION FAILED");
      console.log("🔗 TX Hash:", receipt.hash);
      console.log("❌ Status: Failed");
    }

  } catch (error) {
    rl.close();
    console.log("\n❌ ERROR:", error.message);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("\n💡 INSUFFICIENT FUNDS:");
      console.log(`- Add more ${config?.currency || 'tokens'} to your wallet`);
      console.log("- Check if you have enough for mint cost + gas fees");
    }
    
    if (error.code === 'NONCE_EXPIRED') {
      console.log("\n💡 NONCE ISSUE:");
      console.log("- Try again, transaction might have been replaced");
    }

    if (error.reason) {
      console.log("🔍 Reason:", error.reason);
    }
  }
})();
