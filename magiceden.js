const { get, post } = require("./http.js");

const API_BASE_URL = "https://api-mainnet.magiceden.io";

async function quoteMintData(nftContract, wallet, chain = "", nftAmount = 1, tokenId = 0) {
  const payload = {
    chain,
    collectionId: nftContract,
    kind: "public",
    nftAmount,
    protocol: "ERC1155",
    tokenId,
    wallet: { address: wallet, chain },
    address: wallet,
  };

  return post(`${API_BASE_URL}/v4/self_serve/nft/mint_token`, payload);
}

async function getAvailableMints(chain = "", period = "1h", limit = 200) {
  const url = `${API_BASE_URL}/v3/rtp/${chain}/collections/trending-mints/v1?period=${period}&type=any&limit=${limit}&useNonFlaggedFloorAsk=true`;
  return get(url);
}

async function getCollectionInfo(contractAddress, chain = "") {
  const endpoints = [
    `${API_BASE_URL}/v2/collections/${contractAddress}`,
    `${API_BASE_URL}/v3/rtp/${chain}/collections/${contractAddress}/v1`,
    `${API_BASE_URL}/v4/collections/${contractAddress}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const result = await get(endpoint);
      if (result && (result.name || result.collection?.name)) {
        return {
          name: result.name || result.collection?.name,
          description: result.description || result.collection?.description,
          image: result.image || result.collection?.image,
          ...result
        };
      }
    } catch {
      continue;
    }
  }

  return null;
}

module.exports = {
  quoteMintData,
  getAvailableMints,
  getCollectionInfo,
};