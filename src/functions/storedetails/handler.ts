import 'source-map-support/register';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { formatJSONResponse } from '@/libs/apiGateway';
import { middyfy } from '@/libs/lambda';
import axios from 'axios';
import { createClient } from 'redis';

enum ChainId {
  ALL = 0, //enum value representing all token list details
  SOLANA = 1,
  APTOS = 2,
  POLYGON = 3,
  BINANCE = 4,
  ETHEREUM = 5,
  KLAYTN = 6,
  FANTOM = 7,
}

 interface TokenList {
   url: string;
   key: ChainId;
 }

const tokenListUrls: TokenList[] = [
  { url: 'https://cache.jup.ag/tokens', key: ChainId.SOLANA },
  {
    url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/typescript/src/defaultList.mainnet.json',
    key: ChainId.APTOS,
  },
  { url: 'https://raw.githubusercontent.com/0xAnto/token-lists/main/polygon.json', key: ChainId.POLYGON },
  { url: 'https://raw.githubusercontent.com/0xAnto/token-lists/main/bsc.json', key: ChainId.BINANCE },
  { url: 'https://raw.githubusercontent.com/0xAnto/token-lists/main/ethereum.json', key: ChainId.ETHEREUM },
  { url: 'https://raw.githubusercontent.com/0xAnto/token-lists/main/klaytn.json', key: ChainId.KLAYTN },
  { url: 'https://raw.githubusercontent.com/0xAnto/token-lists/main/fantom.json', key: ChainId.FANTOM },
];

const redisClient = createClient();
redisClient.connect().catch(console.error);

// Function to store token list details in Redis
const storeTokenListDetailsInRedis = async (key: ChainId, tokenListDetails: any[]) => {
  try {
    const redisKey = `tokenList:${key}`;
    const value = JSON.stringify(tokenListDetails);
    await redisClient.set(redisKey, value);
    console.log(`Token list details stored in Redis for key ${key}`);
  } catch (error) {
    console.error(`Failed to store token list details in Redis for key ${key}:`, error);
  }
};

// Function to add a new token to the token list
const addTokenToTokenList = (tokenListDetails: any[], token: any) => {
  tokenListDetails.push(token);
};

// Handler function for the API endpoint
export const storedetails: APIGatewayProxyHandler = async (event) => {
  const { chainId } = event.queryStringParameters as any;

  const chainIdNumber = Number(chainId);

  // If chainId is ALL, fetch and store token list details for all chains
  if (chainIdNumber === ChainId.ALL) {
    try {
      for (const { url, key } of tokenListUrls) {
        const response = await axios.get(url);
        const tokenListDetails = response.data;
        await storeTokenListDetailsInRedis(key, tokenListDetails);
        console.log(`Token list details retrieved from URL ${url} and stored in Redis for key ${key}`);
      }
      return formatJSONResponse({
        message: 'Token list details stored in Redis for all chains',
      });
    } catch (error) {
      console.error('Failed to fetch data or store token list details in Redis:', error);
      return formatJSONResponse({
        message: 'Failed to fetch data or store token list details in Redis',
      });
    }
  }

  // If chainId is a specific chain, fetch token list details and add a new token to the list
  for (const { url, key } of tokenListUrls) {
    if (key === chainIdNumber) {
      try {
        const response = await axios.get(url);
        const tokenListDetails = response.data;

        const newTokenData = {
          symbol: getSymbolByChainId(key),
          name: getNameByChainId(key),
          decimals: 18,
          address: "0x1234567890",
          logoURI: "https://example.com/new-token.png",
          tags: ["tokens"],
          coingeckoId: "new-token",
        };

        addTokenToTokenList(tokenListDetails, newTokenData);
        await storeTokenListDetailsInRedis(key, tokenListDetails);
        console.log(`Token added and token list details stored in Redis for key ${key}`);
        return formatJSONResponse({
          message: 'Token added and token list details stored in Redis',
          data: {
            chainId: key,
            chainName: ChainId[key],
            tokenListDetails,
          },
        });
      } catch (error) {
        console.error(`Failed to fetch data for URL ${url}:`, error);
        return formatJSONResponse({
          message: `Failed to fetch data for URL ${url}`,
        });
      }
    }
  }

  return formatJSONResponse({
    message: 'Invalid chainId provided',
  });
};

// Middleware wrapper for the handler function
export const main = middyfy(storedetails);

// Helper function to get the symbol based on the chainId
const getSymbolByChainId = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.SOLANA:
      return 'SLN';
    case ChainId.APTOS:
      return 'APT';
    case ChainId.POLYGON:
      return 'MATIC';
    case ChainId.BINANCE:
      return 'BNB';
    case ChainId.ETHEREUM:
      return 'ETH';
    case ChainId.KLAYTN:
      return 'KLAY';
    case ChainId.FANTOM:
      return 'FTM';
    default:
      return 'NEW';
  }
};

// Helper function to get the name based on the chainId
const getNameByChainId = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.SOLANA:
      return 'Solana';
    case ChainId.APTOS:
      return 'Aptos';
    case ChainId.POLYGON:
      return 'Polygon';
    case ChainId.BINANCE:
      return 'Binance';
    case ChainId.ETHEREUM:
      return 'Ethereum';
    case ChainId.KLAYTN:
      return 'Klaytn';
    case ChainId.FANTOM:
      return 'Fantom';
    default:
      return 'New Token';
  }
};
