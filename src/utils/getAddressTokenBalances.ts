import { useEffect, useState } from "react";

const tokenUrl = "https://api.covalenthq.com/v1/1/address/0xce88686553686da562ce7cea497ce749da109f9f/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=false&key=ckey_0234f04900264446a5dfbd4687d";
//const portfolioURL = "https://api.covalenthq.com/v1/1/address/0xce88686553686da562ce7cea497ce749da109f9f/portfolio_v2/?&key=ckey_0234f04900264446a5dfbd4687d"


//Define wallet TokenData interface
export interface WalletTokenData {
    data: ERC20Data;
    error: boolean;
    error_message?: any;
    error_code?: any;
}

export interface ERC20Data {
    address: string;
    updated_at: string;
    next_update_at: string;
    quote_currency: string;
    chain_id: number;
    items: ERC20TokenData[];
    pagination?: any;
}

export interface ERC20TokenData {
    contract_decimals: number;
    contract_name: string;
    contract_ticker_symbol: string;
    contract_address: string;
    supports_erc: string[];
    logo_url: string;
    last_transferred_at?: Date;
    type: string;
    balance: string;
    balance_24h: string;
    quote_rate?: number;
    quote_rate_24h?: number;
    quote: number;
    quote_24h?: number;
    nft_data?: any;
}


export function GetAddressTokenBalances () {
        const [jsonData, setJsonData] = useState<WalletTokenData>();
        //Fetch Balancer Front-End Json containing incentives data:
        useEffect(() => {
            const fetchData = async () => {
                try {
                    const response = await fetch(tokenUrl);
                    const json: WalletTokenData = await response.json();
                    setJsonData(json);
                    
                } catch (error) {
                    console.log("error", error);
                }
            };
    
            fetchData();
        }, []);

    return jsonData;
}