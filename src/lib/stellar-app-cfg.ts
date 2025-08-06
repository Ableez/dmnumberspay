import {
  ApplicationConfiguration,
  DefaultSigner,
} from "@stellar/typescript-wallet-sdk";
import axios, { type AxiosInstance } from "axios";

const customClient: AxiosInstance = axios.create({
  timeout: 1000,
});

export const appConfig = new ApplicationConfiguration(
  DefaultSigner,
  customClient,
);
