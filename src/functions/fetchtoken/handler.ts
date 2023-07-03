import { APIGatewayProxyHandler } from 'aws-lambda';
import { formatJSONResponse } from '@/libs/apiGateway';
import { middyfy } from '@/libs/lambda';
import { createClient } from 'redis';

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
      return null;
    }
  } catch (error) {
    console.error(`Failed to retrieve token list details from Redis for key ${key}:`, error);
    return null;
  }
};

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
