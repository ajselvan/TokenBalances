import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse } from '@/libs/apiGateway';
import { middyfy } from '@/libs/lambda';
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import axios from 'axios';
import _ from 'lodash';
import { AptosClient } from "aptos";

import dotenv from 'dotenv'
dotenv.config();

const tokenbalance = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try {

    const { address, provider, chainId } = event.queryStringParameters as any;

    const query = new URLSearchParams({
      auth_key: process.env.UNMARSHAL_API_KEY || '',
    }).toString();

    const keyy = await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });

    const chain = EvmChain.ETHEREUM;

    if (!chainId) {
      return formatJSONResponse({
        status: 400,
        message: 'Missing chainId parameter',
      });
    }

    if (!address) {
      return formatJSONResponse({
        status: 400,
        message: 'Missing address parameter',
      });
    }

    let chainName: string;
    let tokenAddress: string;
    let result: any;

    switch (provider) {

      //Moralis balance

      case 'moralis':

        switch (Number(chainId)) {
          case 3:
            chainName = 'matic';
            tokenAddress = address
            console.log("Hi polygonn");
            break;
          case 4:
            chainName = 'ethereum';
            tokenAddress = address
            console.log("Hi ethereum");
            break;
          case 5:
            chainName = 'bsc';
            tokenAddress = address;
            console.log("Hi binance");
          case 6:
            chainName = 'klaytn';
            tokenAddress = address
            console.log("Hi kalytnnn");
            break;
          default:
            console.log("unknown chainId");
            return formatJSONResponse({
              status: 400,
              message: 'Invalid ChainId',
            },);
            break;
        }
        console.log("Switch case ended for moralis");

        const tokenBalanceResponse = await Moralis.EvmApi.token.getWalletTokenBalances({
          address,
          chain,
        });

        const nativeBalanceResponse = await Moralis.EvmApi.balance.getNativeBalance({
          address,
          chain,
        });

        const tokenPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
          address,
          chain,
        });

        const convertedResponse = tokenBalanceResponse.toJSON().map((token) => ({
          address: token.token_address,
          balance: token.balance,
          symbol: token.symbol,
          decimals: token.decimals,
          name: token.name,
          logoUrl: token.logo
        }));

        const usdPrices = [] as any;;

        for (let i = 0; i < convertedResponse.length; i++) {
          const address = convertedResponse[i].address;

          const response = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/${chainName}?contract_addresses=${address}&vs_currencies=usd`);

          await new Promise(resolve => setTimeout(resolve, 5000));

          const data = response.data;

          const tokenData = data[address.toLowerCase()];

          if (tokenData && tokenData.usd) {
            usdPrices.push(tokenData.usd);
           // console.log("USD price:", tokenData.usd);
          } else {
            //console.log("USD price: Null");
            usdPrices.push(null);
          }
        }

        const tokenInfo = {
          nativePrice: {
            address: tokenPriceResponse?.toJSON()?.nativePrice?.address,
            balance: nativeBalanceResponse?.toJSON()?.balance,
            symbol: tokenPriceResponse?.toJSON()?.nativePrice?.symbol,
            decimals: tokenPriceResponse?.toJSON()?.nativePrice?.decimals,
            name: tokenPriceResponse?.toJSON()?.nativePrice?.name,
            logoUrl: tokenPriceResponse?.toJSON()?.tokenLogo,
            chainId: Number.isNaN(Number(chain)) ? 1 : Number(chain),
            usdPrice: tokenPriceResponse?.result?.usdPrice ? Number(tokenPriceResponse?.result?.usdPrice) : undefined,
          },
        };

        console.log("tokenInfo", tokenInfo);

        const final = convertedResponse.map((token, index) => ({
          ...token,
          chainId: Number.isNaN(Number(chain)) ? 1 : Number(chain),
          usdPrice: usdPrices[index]
        }));

        console.log("final", final);

        return formatJSONResponse({
          data: {
            final,
            tokenInfo
          },
          status: 200,
          message: 'Token Balance Successfully',
        });

      default:

        switch (Number(chainId)) {
          case 1:
            chainName = 'solana';
            tokenAddress = address
            console.log("Hi solana");
            result = await unmarshal();
            return result;
          case 2:
            chainName = 'aptos';
            console.log("Hi aptos");
            result = aptbalance();
            return result;
          case 3:
            chainName = 'matic';
            tokenAddress = address
            console.log("Hi polygonn");
            result = await unmarshal();
            return result;
          case 4:
            chainName = 'ethereum';
            tokenAddress = address
            console.log("Hi ethereum");
            result = await unmarshal();
            return result;
          case 5:
            chainName = 'bsc';
            tokenAddress = address;
            console.log("Hi binance");
            result = await unmarshal();
            return result;
          case 6:
            chainName = 'klaytn';
            tokenAddress = address
            console.log("Hi kalytnnn");
            result = await unmarshal();
            return result;
          default:
            console.log("unknown chainId");
            return formatJSONResponse({
              status: 400,
              message: 'Invalid ChainId',
            },);
        }

        //unmarshal balance

        async function unmarshal() {

          try {

            const response = await axios.get(`https://api.unmarshal.com/v1/${chainName}/address/${tokenAddress}/assets?${query}`);

            const data = response.data;

            const UnmarshalData = data.map(
              (item: {
                contract_address: any;
                balance: any;
                contract_ticker_symbol: any;
                contract_decimals: any;
                contract_name: any;
                logo_url: any;
                coin: any;
                coin_gecko_id: any;
                quote_rate: any;
              }) => ({
                address: item.contract_address,
                balance: item.balance,
                symbol: item.contract_ticker_symbol,
                decimals: item.contract_decimals,
                name: item.contract_name,
                logoUrl: item.logo_url,
                chainId: chainName === 'solana' ? 1 : item.coin,
                coin_gecko_id: item.coin_gecko_id,
                usdPrice: item.quote_rate,
              })
            );
            console.log("Unmarshal data is :", UnmarshalData);

            return formatJSONResponse({
              status: 200,
              data: UnmarshalData,
              message: 'Token Balance Successfully',
            });
          } catch (error) {
            return {
              status: 500,
              error: error.message
            };
          }
        }

        //Aptos balance

        async function aptbalance() {

          const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com");

          const dataURL = "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/typescript/src/defaultList.mainnet.json";
          const getDollarPrice = async (mappedData: any) => {
            try {
              const coingetckoIds = mappedData.map((item: { coingeckoId: any }) => (item.coingeckoId ? item.coingeckoId : ''));

              const filteredArray = coingetckoIds.filter((item: string) => item != '');
              const dolarList: any[] = [];
              while (filteredArray.length) {
                const getdollarValue = await (
                  await axios.get(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${filteredArray.splice(0, 600)}&vs_currencies=USD`
                  )
                ).data;
                dolarList.push(getdollarValue);
              }
              const mergedObjects = dolarList.reduce((r, c) => Object.assign(r, c), {});
              return mergedObjects;
            } catch (err) {
              return {};
            }
          };

          const sortArray = (tokenList: any, compareList: any[]) => {
            const sortBy = (array: any[], values: any[], key = 'address') => {
              if (key != null) {
                return (map => values.reduce((a, i) => a.push(map[i]) && a, []))(
                  array.reduce((a, i) => (a[i[key]] = i) && a, {})
                );
              }
            };

            const sortedArray = sortBy(tokenList, compareList);
            const joinedArray = sortedArray.concat(tokenList);
            const uniqueAuthors = _.uniqWith(joinedArray, (arrVal: any, othVal: any) => arrVal?.address === othVal?.address);
            return uniqueAuthors;
          };

          async function setTokenListForAptos() {

            const getTokenListFromUrl = await (await axios.get(dataURL)).data;

            const mappedData = getTokenListFromUrl.map((item: {
              token_type: any; chainId: any; decimals: any; name: any; symbol: any; logo_url: any; coingecko_id: any;
            }) => {
              return {
                address: item?.token_type.type,
                balance: '0',
                symbol: item.symbol,
                decimals: item.decimals,
                name: item.name,
                logoURI: item.logo_url,
                chainId: item.chainId = 2,
                coingeckoId: item.coingecko_id,
              };
            });

            const aptosAdditional = [
              {
                address: '0xcc78307c77f1c2c0fdfee17269bfca7876a0b35438c3442417480c0d5c370fbc::AptopadCoin::APD',
                balance: '0',
                symbol: 'APD',
                decimals: 8,
                name: 'Aptopad Coin',
                logoURI: 'https://user-images.githubusercontent.com/125870680/221866569-87fbb0a2-9d37-4368-8e2f-2e315f9e54b3.png',
                chainId: 2,
                coingeckoId: '',
              },
            ];

            const finalList = mappedData.concat(aptosAdditional);
            const dollarPriceList = await getDollarPrice(mappedData);

            const finalArray = finalList.map((item: { coingeckoId: string | number; }) => {
              return { ...item, usdPrice: dollarPriceList[item.coingeckoId] ? dollarPriceList[item.coingeckoId].usd : 0 };
            });

            const aptosTopList = [
              '0x1::aptos_coin::AptosCoin',
              '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T',
              '0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T',
              '0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T',
              '0xd11107bdf0d6d7040c6c0bfbdecb6545191fdf13e8d8d259952f53e1713f61b5::staked_coin::StakedAptos',
              '0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T',
              '0xacd014e8bdf395fa8497b6d585b164547a9d45269377bdf67c96c541b7fec9ed::coin::T',
            ];

            const sortedList = sortArray(finalArray, aptosTopList);
            const filteredList = sortedList.filter((i: null) => i !== null && typeof i !== 'undefined');

            function removePrefixAndSuffix(inputString: string) {
              const prefix = '0x1::coin::CoinStore<';
              const suffix = '>';

              if (inputString.startsWith(prefix) && inputString.endsWith(suffix)) {
                return inputString.slice(prefix.length, -suffix.length);
              }
              return inputString;
            }

            let coinStoreType: string = "0x1::coin::CoinStore";
            let balances: { address: string, balance: string, decimals: any, symbol: any, name: any, coingeckoId: string, logoURI: string, chainId: undefined }[] = [];
            let resources = await client.getAccountResources(address);
            let coinResources = resources.filter((r) => r.type.startsWith(coinStoreType));

            coinResources.forEach((resource) => {
              let data = resource?.data;
              let address = removePrefixAndSuffix(resource?.type);
              let matchingMappedData = mappedData.find((item: { address: string; }) => item.address === address);

              balances.push({
                address: address,
                balance: (data as any)?.coin?.value,
                symbol: matchingMappedData?.symbol,
                decimals: matchingMappedData?.decimals,
                name: matchingMappedData?.name,
                logoURI: matchingMappedData?.logoURI,
                chainId: matchingMappedData?.chainId,
                coingeckoId: matchingMappedData?.coingeckoId,
              });
            });

            const combinedData = balances.map((item) => {
              const usdValue = finalArray.find((token: { coingeckoId: string; }) => token.coingeckoId === item.coingeckoId)?.usd || 0;
              return { ...item, usdPrice: usdValue };
            }).concat(finalArray);

            console.log("combined data is :", combinedData);

            return formatJSONResponse({
              status: 200,
              data: combinedData,
              message: 'Token Balance Successfully',
            });
          };
          return await setTokenListForAptos();
        }
    };
  }
  catch (error) {
    console.error("Errorrrrrrrrr");
    return formatJSONResponse({
      status: 404,
      message: 'Failed token balance',
    },);
  }
}

export const main = middyfy(tokenbalance);
