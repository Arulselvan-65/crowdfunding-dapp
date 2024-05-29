
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { FC, useState, useEffect } from 'react';
import { notify } from "../utils/notifications";
import { setProvider, AnchorProvider, web3, BN, Program } from '@coral-xyz/anchor';
import idl from "./programfiles/hamscrowdfunding.json";
import { Hamscrowdfunding } from "./programfiles/hamscrowdfunding";
import { PublicKey } from '@solana/web3.js';

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programId = new PublicKey(idl.address);


export const Campaign: FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(0);
    const [fundValue, setFundValue] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getProvider = () => {
        const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
        setProvider(provider);
        return provider;
    }

    const anchorProvider = getProvider();
    const program = new Program<Hamscrowdfunding>(idl_object, anchorProvider);

    useEffect(() => {
        fetchCampaigns()
    },[]);


    const fundCampaign = async () => {
        console.log(wallet.connected)
        if (!wallet.connected) window.alert("Connect Wallet to Continue!!!");
        else {
            try {
                const tx = await program.methods.contribute(new BN(fundValue)).accounts({
                    campaign: campaigns[selectedCampaign].pubkey,
                    user: anchorProvider.publicKey,
                }).rpc();

                if (tx.length > 0) {
                    notify({ type: 'success', message: 'Funding successful!' });
                    window.location.reload();
                }
            } catch (err) {
                notify({ type: "error", message: "Error funding to campaign!!" });
            }
        }
    }

    const fetchCampaigns = async () => {

        try {
            Promise.all((await connection.getParsedProgramAccounts(programId)).map(async campaign => ({
                ...(await program.account.campaign.fetch(campaign.pubkey)),
                pubkey: campaign.pubkey
            }))).then(campaigns => {
                let arr = campaigns.map(c => {
                    return (
                        {
                            title: c.title.toString(),
                            creator: c.creator.toString(),
                            collected: c.collected.toNumber(),
                            target: c.target.toNumber(),
                            pubkey: c.pubkey.toString()
                        }
                    )
                })
                setCampaigns(arr)
            });
        } catch (err) {
            window.location.reload();
        }
    }

    const withdraw = async () => {
        if (!wallet.connected) window.alert("Connect Wallet to Continue!!!");
        else {
            try {
                const anchorProvider = getProvider();
                const program = new Program<Hamscrowdfunding>(idl_object, anchorProvider);

                const tx = await program.methods.withdraw().accounts({
                    campaign: campaigns[selectedCampaign].pubkey,
                    creator: anchorProvider.publicKey,
                }).rpc();

                if (tx.length > 0) {
                    notify({ type: 'success', message: 'Withdraw successful!' });
                    window.location.reload();
                }
            } catch (error) {
                notify({ type: 'error', message: 'Cannot withdraw Funds!' });
            }
        }
    }

    return (
        <div >
            {isModalOpen &&
                <div className={`fixed inset-0 flex items-center justify-center z-50 ${isModalOpen ? 'block' : 'hidden'}`}>
                    <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsModalOpen(false)}></div>

                    <div className="relative z-50 w-[28%] bg-[rgb(40,40,40)] rounded-lg font-roboto p-3">
                        <div className="absolute right-3 top-3 h-8 w-8 cursor-pointer rounded-sm hover:bg-gray-600" onClick={() => setIsModalOpen(false)}>
                            <img src="exit.png" className="object-cover w-full h-full" alt="Close" />
                        </div>
                        <div className="flex flex-col justify-center h-full w-full p-1">
                            <h1 className="text-center text-3xl font-semibold mb-[2%] mx-auto w-[80%]">Fund Campaign</h1>
                            <div className="flex flex-col w-[90%] mx-auto mt-[3%]">
                                <label className="tracking-wider text-xl">Title : {campaigns[selectedCampaign].title}</label>
                            </div>
                            <div className="flex flex-col  w-[90%] mx-auto mt-[3%]">
                                <label className="tracking-wider">Fund Amount(in SOL)</label>
                                <input type="text" className="target input-style mt-2" onChange={(e) => setFundValue(e.target.value)} />
                            </div>
                            <button className="w-[90%] mx-auto bg-gradient-to-br from-green-300 to-green-600 text-black text-lg h-12 mt-3 rounded-lg font-semibold font-sans"
                                onClick={fundCampaign}>Fund</button>
                        </div>
                    </div>
                </div>
            }
            <div className={`w-full h-full flex flex-col ${isModalOpen ? 'blur-sm' : ''}`}>
                {
                    campaigns.map((e, i) => {
                        return (
                            <div key={i} className='bg-custom-gradient shadow-custom backdrop-blur-custom w-[60%] mt-10 mx-auto h-[30%] flex flex-col items-start p-4 rounded-md'>
                                <h1 className='text-4xl font-roboto font-bold'>{e.title}</h1>
                                <div className='border-t-2 mt-2 mb-1 border-gray-500 w-full'></div>
                                <div className='grid grid-cols-2 gap-2 h1-style justify-center w-full'>
                                    <h1 className='text-xl'>Target  </h1>
                                    <h1 className='text-xl'>Collected  </h1>
                                    <h1 className='text-gray-400'>{e.target}</h1>
                                    <h1 className='text-gray-400'>{e.collected}</h1>
                                </div>
                                <div className='border-t-2 mt-2 mb-1 border-gray-500 w-full'></div>
                                <h1 className='text-xl mt-2'>Creator Address : <span className='text-gray-400'>{e.creator}</span></h1>
                                <div className='flex mx-auto'>

                                    <button className={`font-semibold flex mt-5 border-none rounded-lg w-56 font-sans text-center h-12 items-center justify-center ${(e.target != e.collected) ? 'bg-gradient-to-br from-green-300 to-green-600' : 'bg-gradient-to-br from-green-200 to-green-300'} text-black text-lg`}
                                        onClick={() => {
                                            setSelectedCampaign(i);
                                            setIsModalOpen(true);
                                        }}
                                        disabled={(e.target === e.collected)}>
                                        {(e.target != e.collected) ? 'Fund Now' : 'Campaign Finished'}
                                    </button>

                                    {(anchorProvider.publicKey == e.creator && (e.target === e.collected)) ?

                                        <button className="font-semibold flex ml-5 mt-5 border-none rounded-lg w-56 font-sans text-center h-12 items-center justify-center bg-gradient-to-br from-green-300 to-green-600 text-black text-lg"
                                            onClick={() => {
                                                setSelectedCampaign(i);
                                                withdraw();
                                            }}>
                                            Witdraw
                                        </button>
                                        : ''}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
};
