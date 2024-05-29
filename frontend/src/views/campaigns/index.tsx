
import { FC, useState } from "react";
import { Campaign } from '../../components/Campaign';
import { notify } from "../../utils/notifications";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { setProvider, AnchorProvider, web3, BN, Program } from '@coral-xyz/anchor';
import idl from "../../components/programfiles/hamscrowdfunding.json";
import { Hamscrowdfunding } from "../../components/programfiles/hamscrowdfunding";

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);

export const CampaignsView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);


  const getProvider = () => {
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    setProvider(provider);
    return provider;
  }

  const createCampaign = async () => {
    const anchorProvider = getProvider();
    const program = new Program<Hamscrowdfunding>(idl_object, anchorProvider);

    try {

      const tx = await program.methods.createCampaign(title, new BN(parseInt(target))).accounts({
        creator: anchorProvider.publicKey
      }).rpc();
      console.log(tx);

      if (tx.length > 0) {
        notify({ type: 'success', message: 'Campaign Created!' });
        window.location.reload();
      }
    } catch (err) {
      notify({ type: 'error', message: 'Campaign not Created!' });
    }
  }


  return (
    <div className="md:hero mx-auto p-4">

      {isModalOpen &&
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${isModalOpen ? 'block' : 'hidden'}`}>
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative z-50 w-[28%] bg-[rgb(40,40,40)] rounded-lg font-roboto p-3">
            <div className="absolute right-3 top-3 h-8 w-8 cursor-pointer rounded-sm hover:bg-gray-600" onClick={() => setIsModalOpen(false)}>
              <img src="exit.png" className="object-cover w-full h-full" alt="Close" />
            </div>
            <div className="flex flex-col justify-center h-full w-full p-1">
              <h1 className="text-center text-3xl font-semibold mb-[2%]">Campaign</h1>
              <div className="flex flex-col w-[90%] mx-auto">
                <label className="tracking-wider">Title</label>
                <input type="text" className="title input-style" onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="flex flex-col w-[90%] mx-auto mt-[2%]">
                <label className="tracking-wider">Target Amount(in SOL)</label>
                <input type="text" className="target input-style" onChange={(e) => setTarget(e.target.value)} />
              </div>
              <button className="w-[90%] mx-auto bg-gradient-to-br from-green-300 to-green-600 text-black text-lg h-12 mt-6 rounded-lg font-semibold font-sans"
                onClick={createCampaign}>Create</button>
            </div>
          </div>
        </div>
      }

      <div className={`w-full h-full flex flex-col ${isModalOpen ? 'blur-sm' : ''}`}>
        <div className=" flex w-[90%] mx-auto">
          <div className="w-[50%]  flex flex-col  justify-center">
            <h1 className="text-5xl font-bold font-roboto leading-[120%]">
              Create a <span className="text-transparent bg-clip-text bg-gradient-to-br from-green-300 to-green-600">Campaign</span> and Bring
              Your Ideas to <span className="text-transparent bg-clip-text bg-gradient-to-br from-green-300 to-green-600">World!</span>
            </h1>
            <p className="tracking-widest text-gray-400 text-lg mt-6">Empower your project dreams with our crowdfunding platform. Create a compelling campaign, share your story, and invite backers to support your vision. Start your crowdfunding journey today and turn ideas into reality!</p>

            <button className="font-semibold flex mt-10 border-none rounded-full w-56 font-sans text-center h-14 items-center justify-center bg-gradient-to-br from-green-300 to-green-600 text-black text-lg"
              onClick={() => setIsModalOpen(true)}>
              Create Campaign
            </button>
          </div>
          <div className="w-[50%] flex justify-end items-center">
            <img src="/create.png" className="object-cover w-[90%] m-auto"></img>
          </div>
        </div>
        <h1 className="text-center mt-[3%] text-[40px] font-bold mb-7">Campaigns</h1>
        <div className="text-center">
          <Campaign />
        </div>
      </div>
    </div>
  );
};
