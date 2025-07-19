import ShowBalance from "#/components/home/balance";
import QuickActions from "#/components/home/quick-actions";
import ListWithFilter from "#/components/transactions/list-with-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { mockTransactions } from "./transactions/dummy-data";

const Home = () => {
  return (
    <div className="min-h-screen place-items-center justify-center bg-gradient-to-b from-indigo-600 via-transparent to-transparent">
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
            <ListWithFilter mockTransactions={mockTransactions} />
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
