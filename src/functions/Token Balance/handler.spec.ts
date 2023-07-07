import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { tokenbalance } from './handler'; // Replace 'your-module' with the actual module path
import { formatJSONResponse } from '.././../libs/apiGateway';


// Mock the axios module
jest.mock('axios', () => ({
  get: jest.fn(),
}));

// Only for the Unmarshal function unit test case

describe('tokenbalance', () => {
  it('should return missing chainId parameter if chainId is not provided', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: {
        address: '0xabc123',
        provider: 'unmarshal',
      },
    } as unknown as APIGatewayProxyEvent;

    const expectedResponse: APIGatewayProxyResult = formatJSONResponse({
      status: 400,
      message: 'Missing chainId parameter',
    });

    const response = await tokenbalance(event);
    expect(response).toEqual(expectedResponse);
  });

  it('should return missing address parameter if address is not provided', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: {
        chainId: '4',
        provider: 'unmarshal',
      },
    } as unknown as APIGatewayProxyEvent;

    const expectedResponse: APIGatewayProxyResult = formatJSONResponse({
      status: 400,
      message: 'Missing address parameter',
    });

    const response = await tokenbalance(event);
    expect(response).toEqual(expectedResponse);
  });
  
  it('should return 200 with token balance data', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: {
        address: '0x123456789',
        chainId: '1',
      },
    } as unknown as APIGatewayProxyEvent;

    const mockedResponse = {
      data: [
        {
          contract_address: '0x123456789',
          balance: '100',
          contract_ticker_symbol: 'ABC',
          contract_decimals: 18,
          contract_name: 'Token ABC',
          logo_url: 'https://example.com/logo.png',
          coin: 1,
          coin_gecko_id: 'token-abc',
          quote_rate: 1.23,
        },
      ],
    };

    const axios = require('axios');
    axios.get.mockResolvedValueOnce(mockedResponse);

    let result = await tokenbalance(event);

    expect(result.statusCode).toBe(200);

    const parsedResult = JSON.parse(result.body);
    expect(parsedResult.status).toBe(200);
    expect(parsedResult.message).toBe('Token Balance Successfully');
    expect(parsedResult.data).toEqual([
      {
        address: '0x123456789',
        balance: '100',
        symbol: 'ABC',
        decimals: 18,
        name: 'Token ABC',
        logoUrl: 'https://example.com/logo.png',
        chainId: 1,
        coin_gecko_id: 'token-abc',
        usdPrice: 1.23,
      },
    ]);
  });

  it('should Aptos fetch token data and calculate USD prices correctly', async () => {
    const mockData = [
      {
        token_type: { type: 'address1' },
        chainId: 2,
        decimals: 8,
        name: 'Token 1',
        symbol: 'T1',
        logo_url: 'logo1.png',
        coingecko_id: 'coingecko1',
      },
      {
        token_type: { type: 'address2' },
        chainId: 2,
        decimals: 18,
        name: 'Token 2',
        symbol: 'T2',
        logo_url: 'logo2.png',
        coingecko_id: 'coingecko2',
      },
    ];

    const mockDollarPrices = {
      coingecko1: { usd: 1 },
      coingecko2: { usd: 2 },
    };

    const axios = require('axios');
    axios.get.mockResolvedValueOnce({ data: mockData }); // Mock the axios.get() call for fetching token data
    axios.get.mockResolvedValueOnce({ data: mockDollarPrices }); // Mock the axios.get() call for fetching dollar prices
  });

  it('should return an error for an unknown chainId', async () => {
    const event = {
      queryStringParameters: {
        address: '0x123456789',
        provider: 'unmarshal',
        chainId: '7',
      },
    } as unknown as APIGatewayProxyEvent;

    const expectedResponse: APIGatewayProxyResult = formatJSONResponse({
      status: 400,
      message: 'Invalid ChainId',
    });

    const response = await tokenbalance(event);
    expect(response).toEqual(expectedResponse);
  });

  // Add more test cases for different scenarios


});

