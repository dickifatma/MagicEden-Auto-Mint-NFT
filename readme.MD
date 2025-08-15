# Magic Eden Mint Executor

🚀 A simple and efficient tool for minting NFTs through Magic Eden's API with support for multiple chains.

## Features

✅ **Multi-Chain Support** - Ethereum, Arbitrum, Base, Monad Testnet  
✅ **Gas Estimation** - Accurate gas cost calculation before minting  
✅ **Transaction Monitoring** - Real-time transaction confirmation tracking  
✅ **Error Handling** - Comprehensive error messages and troubleshooting tips  

## Supported Networks

| Network | Chain ID | Currency | Status |
|---------|----------|----------|---------|
| Ethereum Mainnet | 1 | ETH | ✅ |
| Arbitrum | 42161 | ETH | ✅ |
| Base | 8453 | ETH | ✅ |
| Monad Testnet | 10143 | MON | ✅ |

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/dickifatma/MagicEden-Auto-Mint-NFT
cd MagicEden-Auto-Mint-NFT
```

2. **Install dependencies**
```bash
npm install ethers dotenv readline axios
```

3. **Create environment file**
.env.example // Delete .example


4. **Configure your `.env` file**
```env
# Required: Your wallet private key
PRIVATE_KEY=your_private_key_here

# RPC URLs for different networks
RPC_URL_ETH_MAINNET=
RPC_URL_ARBITRUM=
RPC_URL_BASE=
RPC_URL_MONAD=
```

## Project Structure

```
magic-eden-mint-executor/
├── index.js              # Main execution script
├── magiceden.js          # Magic Eden API wrapper
├── .env.example          # Environment template
├── package.json          # Dependencies
└── README.md            # Documentation
```

## Usage

### Basic Usage

1. **Run the script**
```bash
node index.js
```

2. **Select network**
```
🔗 Available chains:
1. Monad-Testnet
2. Arbitrum  
3. Ethereum Mainnet
4. Base

Select chain (1 - 4): 3
```

3. **Enter contract address**
```bash
📋 Enter contract address: 
```

4. **Specify mint amount**
```bash
📦 How many to mint (default 1): 
```

## Features Breakdown

### 🔗 Network Selection
```bash
🔗 Available chains:
1. Monad-Testnet    # Free testnet tokens
2. Arbitrum         # Lower gas fees  
3. Ethereum Mainnet # Main network
4. Base             # Coinbase L2
```

### Common Errors

| Error | Cause | Solution |
|-------|--------|----------|
| `PRIVATE_KEY not found` | Missing environment variable | Add PRIVATE_KEY to .env |
| `RPC URL not found` | Missing RPC configuration | Add RPC URLs to .env |
| `Invalid contract address` | Wrong format | Use 0x... format |
| `Insufficient balance` | Not enough funds | Add more ETH/tokens |
| `No mint steps found` | Mint not active | Check if mint is live |
| `Gas estimation failed` | Network issues | Retry or use default gas |

#### 🔧 Insufficient Funds
```bash
💡 INSUFFICIENT FUNDS:
- Add more ETH to your wallet
- Check if you have enough for mint cost + gas fees
```

#### ⚡ Transaction Issues  
```bash
💡 NONCE ISSUE:
- Try again, transaction might have been replaced
```

#### 🌐 Network Problems
```bash
💡 RPC CONNECTION:
- Check your internet connection
- Verify RPC URL in .env
- Try different RPC provider
```

## Security

⚠️ **Important Security Notes:**

- **Never share your private key**
- **Use testnet for testing**  
- **Keep .env file secure**
- **Don't commit private keys to git**

### .gitignore
Make sure your `.gitignore` includes:
```
.env
node_modules/
```

### Adding New Networks

1. **Add network configuration**
```javascript
const networkNames = {
  10143: 'monad-testnet',
  42161: 'arbitrum', 
  1: 'ethereum',
  8453: 'base',
  // Add new network
  137: 'polygon'
};
```

2. **Add currency symbol**
```javascript
const getCurrencySymbol = (chain) => {
  switch (chain) {
    case 'monad-testnet': return 'MON';
    case 'polygon': return 'MATIC';
    default: return 'ETH';
  }
};
```

3. **Add RPC URL to .env**
```env
RPC_URL_POLYGON=
```

### Testing

#### Testnet Testing
```bash
# Use Monad testnet for free testing
Select chain (1 - 4): 1

# Get testnet tokens from faucet
# Test with small amounts first
```

#### Mainnet Testing
```bash
# Start with small amounts
📦 How many to mint (default 1): 1

# Always verify contract address
# Check gas prices during high activity
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/dickifatma/MagicEden-Auto-Mint-NFT/issues)
- 📧 **Email**: dickifatma.dev@gmail.com

---

⭐ **Star this repo if it helped you!**