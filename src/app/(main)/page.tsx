import { getSession } from "#/lib/auth/session";
import HomeClientComp from "./main-page-comp";

const HomePage = async () => {
  const user = await getSession();

  console.log("USER", user);

  return <div>Home</div>;
};
export default HomePage;
