import { IssuedAssetId } from "@stellar/typescript-wallet-sdk";

export const USDC_ASSET_DATA = {
  address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  code: "USDC",
  symbol: "",
};
export const USDT_ASSET_DATA = {
  address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  code: "USDT",
  symbol: "",
};

export const issuedUSDCAsset = new IssuedAssetId(
  USDC_ASSET_DATA.code,
  USDC_ASSET_DATA.address,
);

export const issuedUSDTAsset = new IssuedAssetId(
  USDT_ASSET_DATA.code,
  USDT_ASSET_DATA.address,
);
