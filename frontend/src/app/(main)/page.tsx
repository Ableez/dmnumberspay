import ShowBalance from "#/components/home/balance";
import QuickActions from "#/components/home/quick-actions";

const Home = () => {
  return (
    <div className="min-h-screen place-items-center justify-center bg-gradient-to-b from-[#410D8C] via-black to-black">
      <ShowBalance />
      <QuickActions />
    </div>
  );
};

export default Home;
