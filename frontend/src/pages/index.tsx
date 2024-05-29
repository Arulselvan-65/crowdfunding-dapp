import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";


const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Hams Crowdfunding</title>
        <meta
          name="description"
          content="Hams Crowdfunding"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
