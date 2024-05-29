import type { NextPage } from "next";
import Head from "next/head";
import { CampaignsView } from "../views";

const Basics: NextPage = (props) => {
  return (
    <div className="bg-[rgb(23,23,23)] min-h-screen w-full">
      <Head>
        <title>Hams Crowdfunding</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <CampaignsView />
    </div>
  );
};

export default Basics;
