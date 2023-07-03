<<<<<<< HEAD
=======
import 'source-map-support/register';
>>>>>>> origin/develop
import { APIGatewayProxyHandler } from 'aws-lambda';
import { formatJSONResponse } from '@/libs/apiGateway';
import { middyfy } from '@/libs/lambda';
import { createClient } from 'redis';
<<<<<<< HEAD

// Enum representing chain IDs
enum ChainId {
  ALL = 0, // enum value representing all token list details
  SOLANA = 1,
  APTOS = 2,
  POLYGON = 3,
  BINANCE = 4,
  ETHEREUM = 5,
  KLAYTN = 6,
  FANTOM = 7,
}

// Create Redis client
const redisClient = createClient();
redisClient.connect().catch(console.error);

// Retrieve token list details from Redis based on the given chainId
const retrieveTokenListDetailsFromRedis = async (key: ChainId) => {
  try {
    const redisKey = `tokenList:${key}`;
    const value = await redisClient.get(redisKey);
    if (value) {
      const tokenListDetails = JSON.parse(value);
      return tokenListDetails;
    } else {
=======
import axios from 'axios';

enum ChainId {
  SOLANA = 0,
  APTOS = 1,
  POLYGON = 2,
  BINANCE = 3,
  ETHEREUM = 4,
  KLAYTN = 5,
  FANTOM = 6,
}

const redisClient = createClient();
redisClient.connect().catch(console.error);

const fetchTokenListDetails = async (url: string) => {
  try {
    const response = await axios.get(url);
    const tokenListDetails = response.data;
    const transformedDetails = tokenListDetails.map((value: any) => ({
      address: value.address,
      chainId: value.chainId,
      symbol: value.symbol,
      logoURI: value.logoURI,
      coingecko_id: value.coingeckoId,
      decimals: value.decimals,
    }));

    console.log(`Token list details for URL ${url}:`, transformedDetails);
    return transformedDetails;
  } catch (error) {
    console.error(`Failed to fetch token list details from URL ${url}:`, error);
    return null;
  }
};

const fetchAndStoreTokenListDetails = async (url: string, key: ChainId, redisClient: any) => {
  const tokenListDetails = await fetchTokenListDetails(url);
  if (tokenListDetails) {
    try {
      const redisKey = `tokenList:${key}`;
      const value = JSON.stringify(tokenListDetails);
      await redisClient.set(redisKey, value);
    } catch (error) {
      console.error(`Failed to store token list details for key ${key} in Redis:`, error);
    }
  } else {
    console.log('Error');
  }
};

const fetchAllTokenListDetails = async (arg: ChainId, redisClient: any) => {
  const tokenListUrls = [
    { url: 'https://cache.jup.ag/tokens', key: ChainId.SOLANA },
    { url: 'https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/typescript/src/defaultList.mainnet.json', key: ChainId.APTOS },
    { url: 'https://raw.githubusercontent.com/0xAnto/token-lists/main/polygon.json', key: ChainId.POLYGON },
    { url: 'https://raw.githubusercontent.com/0xAnto/token-lists/main/bsc.json', key: ChainId.BINANCE },
    { url: 'https://raw.githubusercontent.com/0xAnto/token-lists/main/ethereum.json', key: ChainId.ETHEREUM },
    { url: 'https://raw.githubusercontent.com/0xAnto/token-lists/main/klaytn.json', key: ChainId.KLAYTN },
    { url: 'https://raw.githubusercontent.com/0xAnto/token-lists/main/fantom.json', key: ChainId.FANTOM },
  ];

  for (const { url, key } of tokenListUrls) {
    await fetchAndStoreTokenListDetails(url, key, redisClient);
    if (arg === key) {
      try {
        const response = await axios.get(url);
        console.log(`Response for URL ${url}:`, response.data);
      } catch (error) {
        console.error(`Failed to fetch data for URL ${url}:`, error);
      }
    }
  }
};

const retrieveTokenListDetailsFromRedis = async (key: ChainId, redisClient: any) => {
  try {
    const redisKey = `tokenList:${key}`;

    // Get the value from Redis
    const value = await redisClient.get(redisKey);
    if (value) {
      const tokenListDetails = JSON.parse(value);
      console.log(`Token list details for key ${key}:`, tokenListDetails);
      return tokenListDetails;
    } else {
      console.error(`Token list details for key ${key} not found in Redis`);
>>>>>>> origin/develop
      return null;
    }
  } catch (error) {
    console.error(`Failed to retrieve token list details from Redis for key ${key}:`, error);
    return null;
  }
};

<<<<<<< HEAD
// Handler function to fetch token list details
export const fetchtoken: APIGatewayProxyHandler = async (event) => {
  const { chainId } = event.queryStringParameters as any;

  if (Number(chainId) === ChainId.ALL) {
    // Retrieve token list details for all chains
    const allTokenListDetails = {};
    try {
      for (const key in ChainId) {
        if (isNaN(Number(key))) {
          continue;
        }
        const chainIdValue = Number(key) as ChainId;
        const storedTokenListDetails = await retrieveTokenListDetailsFromRedis(chainIdValue);
        if (storedTokenListDetails) {
          allTokenListDetails[chainIdValue] = storedTokenListDetails;
        }
      } 
                     
      console.log(`Token list details retrieved from Redis for all chains`);
      return formatJSONResponse({
        message: 'Token list details retrieved from Redis',
        data: {
          allTokenListDetails,
        },
      });
    } catch (error) {
      console.error(`Failed to retrieve token list details from Redis:`, error);
      return formatJSONResponse({
        message: 'Failed to retrieve token list details from Redis',
      });
    }
  }

  const parsedChainId = Number(chainId);
  if (isNaN(parsedChainId) || !Object.values(ChainId).includes(parsedChainId as ChainId)) {
    // Invalid chainId provided
    return formatJSONResponse({
      message: 'Invalid chainId provided',
    });
  }

  const chainName = ChainId[parsedChainId];
  try {
    const storedTokenListDetails = await retrieveTokenListDetailsFromRedis(parsedChainId);
    if (storedTokenListDetails) {
      console.log(`Token list details retrieved from Redis for key ${parsedChainId}`);
      return formatJSONResponse({
        message: 'Token list details retrieved from Redis',
        data: {
          chainId: parsedChainId,
          chainName,
          tokenListDetails: storedTokenListDetails,
        },
      });
    } else {
      console.log(`Token list details not found in Redis for key ${parsedChainId}`);
      return formatJSONResponse({
        message: 'Token list details not found in Redis',
      });
    }
  } catch (error) {
    console.error(`Failed to retrieve token list details from Redis for key ${parsedChainId}:`, error);
    return formatJSONResponse({
      message: 'Failed to retrieve token list details from Redis',
    });
  }
};

// Middleware wrapper for the fetchtoken handler function
export const main = middyfy(fetchtoken);;
=======
export const fetchToken: APIGatewayProxyHandler = async (event) => {
  const chainIdParam = event.queryStringParameters?.chainId;
  const chainId: ChainId = chainIdParam ? parseInt(chainIdParam) : ChainId.SOLANA;

  let chainName: string;

  switch (chainId) {
    case ChainId.SOLANA:
      chainName = 'Solana';
      break;
    case ChainId.APTOS:
      chainName = 'Aptos';
      break;
    case ChainId.POLYGON:
      chainName = 'Polygon';
      break;
    case ChainId.BINANCE:
      chainName = 'Binance';
      break;
    case ChainId.ETHEREUM:
      chainName = 'Ethereum';
      break;
    case ChainId.KLAYTN:
      chainName = 'Klaytn';
      break;
    case ChainId.FANTOM:
      chainName = 'Fantom';
      break;
    default:
      chainName = 'Unknown';
      break;
  }

  await fetchAllTokenListDetails(chainId, redisClient);

  const tokenListDetails = await retrieveTokenListDetailsFromRedis(chainId, redisClient);

  return formatJSONResponse({
    message: 'Token list details retrieved successfully',
    data: {
      chainId,
      chainName,
      tokenListDetails,
    },
  });
};

export const storeData: APIGatewayProxyHandler = async (event) => {
  const { data } = JSON.parse(event.body); // Assuming the data is sent in the request body

  try {
    // Store the data in Redis
    await redisClient.set('myData', JSON.stringify(data));

    return formatJSONResponse({
      message: 'Data stored successfully',
    });
  } catch (error) {
    console.error('Failed to store data in Redis:', error);
    return formatJSONResponse({
      message: 'Failed to store data',
    }, );
  }
};

export const main = middyfy(fetchToken);
>>>>>>> origin/develop