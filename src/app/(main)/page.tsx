import ShowBalance from "#/components/home/balance";
import QuickActions from "#/components/home/quick-actions";
import ListWithFilter from "#/components/transactions/list-with-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import * as Client from "../../../packages/numberspay_wallet";

const wallet = new Client.Client({
  ...Client.networks.testnet,
  rpcUrl: "https://soroban-testnet.stellar.org:443",
});

const Home = () => {
  wallet.initialize({
    supported_tokens: [
      {
        address: "GDU5Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75",
        symbol: "ETH",
        decimals: 18,
      },
      {
        address: "GDU5Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V76",
        symbol: "USDC",
        decimals: 6,
      },
      {
        address: "GDU5Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V75Q6Z3V77",
        symbol: "BTC",
        decimals: 8,
      },
    ],

    wallet_name: "NumbersPay",
    wallet_icon: "https://example.com/icon.png",
    wallet_description:
      "A simple wallet for managing your assets on the Stellar network.",
  });
  return (
    <div className="min-h-screen place-items-center justify-center bg-gradient-to-b from-[#410D8C] via-black to-black">
      <ShowBalance />
      <QuickActions />

      <div className="my-8 w-full p-4">
        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="mb-2 flex w-fit items-center justify-start !bg-transparent">
            <TabsTrigger
              value="crypto"
              className="w-full pb-2.5 font-medium text-white/50 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:pb-2 data-[state=active]:text-white data-[state=inactive]:hover:text-white/80"
            >
              Crypto
            </TabsTrigger>
            <TabsTrigger
              value="nfts"
              className="w-full pb-2.5 font-medium text-white/50 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:pb-2 data-[state=active]:text-white data-[state=inactive]:hover:text-white/80"
            >
              NFTs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="crypto">
            <ListWithFilter />
          </TabsContent>
          <TabsContent value="nfts">
            <div className="flex h-32 items-center justify-center text-white/60">
              No NFTs found
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
