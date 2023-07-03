import 'source-map-support/register';

import type { ValidatedEventAPIGatewayProxyEvent } from '@/libs/apiGateway';
import { formatJSONResponse } from '@/libs/apiGateway';
import { middyfy } from '@/libs/lambda';
import { createClient } from 'redis';
import schema from './schema';
import axios from 'axios';

const redisClient = createClient();
redisClient.connect().catch(console.error);


const dataURL = "https://api.unmarshal.com/v1/bsc/address/demo.eth/assets?auth_key=eOWBd30RHS54uAk6ACdhh7dS6GRRKPaK3PXi09C1";

 axios.get(dataURL)
  .then(response => {
    const data = response.data;

    const convertedData = data.map((item: { contract_address: any; balance: any; contract_ticker_symbol: any; contract_decimals: any; contract_name: any; logo_url: any; coin: any; quote_rate: any; }) => ({
      address: item.contract_address,
      balance: item.balance,
      symbol: item.contract_ticker_symbol,
      decimals: item.contract_decimals,
      name: item.contract_name,
      logoUrl: item.logo_url,
      chainId: item.coin,
      usdPrice: item.quote_rate
    }));
     console.log("convertedData is :",convertedData);
    // return formatJSONResponse({
    //   dataURL,
    //   status : 200,
    //   message : "unmarsha dataaaaa",
    // })
    return response.data
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });

