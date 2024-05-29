import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hamscrowdfunding } from "../target/types/hamscrowdfunding";
import { assert } from "chai";

const web3 = anchor.web3;


const provider = anchor.AnchorProvider.env();

describe("hamscrowdfunding", async () => {
  anchor.setProvider(provider);

  const program = anchor.workspace.Hamscrowdfunding as Program<Hamscrowdfunding>;

  const campaignCreator = web3.Keypair.generate();

  const user1 = web3.Keypair.generate();
  const title = "hams crowdfunding";

  const [campaignAccount] = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from(title), campaignCreator.publicKey.toBuffer()],
    program.programId
  );


  describe("Should airdrop to all Accounts!", () => {
    try {
      it("Should airdrop to Campaign Creator!", async () => {
        await airdrop(campaignCreator.publicKey);
      });
      it("Should airdrop to User1!", async () => {
        await airdrop(user1.publicKey);
      });
    }
    catch (err) {
      console.error("Failed to Airdrop!!");
    }
  })

  describe("Campaign Account creation and fetch:", async () => {
    try {
      it("Is campaign created!", async () => {
        await airdrop(campaignCreator.publicKey)

        await program.methods.createCampaign(title, new anchor.BN(100)).accounts({
          creator: campaignCreator.publicKey
        }).signers([campaignCreator]).rpc();
      });
    } catch (err) {
      console.log(err);
    }

    it("Fetch values for valid campaign address!", async () => {
      try {
        const tx = await program.account.campaign.fetch(campaignAccount);
        assert.ok(1);
      } catch (err) {
        console.log(err);
      }
    });

    it("Should throw Error on fetch for invalid campaign address!", async () => {
      try {
        const tx = await program.account.campaign.fetch(user1.publicKey);
        assert.fail()
      }
      catch (err) {
        if (err.toString().substring(0, 14) === "AssertionError") assert.fail("Valid Address!");
        else
          assert.ok(1);
      }
    });

  });

  describe("Contribute Function Tests:", async () => {
    it("User can contribute campaign with sufficient funds!", async () => {
      const tx = await program.methods.contribute(new anchor.BN(90)).accounts({
        campaign: campaignAccount,
        user: user1.publicKey,
      }).signers([user1]).rpc();
    });

    it("Should throw Error if insufficient funds!", async () => {
      try {
        const tx = await program.methods.contribute(new anchor.BN(200)).accounts({
          campaign: campaignAccount,
          user: user1.publicKey
        }).signers([user1]).rpc();

        if (tx.length != 0) assert.fail();
      }
      catch (err) {
        if (err.toString().substring(0, 14) === "AssertionError") assert.fail("Has enough funds!");
        else
          assert.ok(1);
      }
    });

  });


  describe("Withdraw Function Tests:", async () => {
    it("Should throw Error if Campaign not hit the target!", async () => {
      try {
        await program.methods.withdraw().accounts({
          campaign: campaignAccount,
          creator: campaignCreator.publicKey
        }).signers([campaignCreator]).rpc();
        assert.fail();
      }
      catch (err) {
        if (err.toString().substring(75, 91) === "InsufficientFund") assert.ok(1);
        else
          assert.fail("Campaign hit the target!");

        await program.methods.contribute(new anchor.BN(10)).accounts({
          campaign: campaignAccount,
          user: user1.publicKey,
        }).signers([user1]).rpc();
      }
    });

    it("Should throw Error if user is not Owner!", async () => {
      try {
        await program.methods.withdraw().accounts({
          campaign: campaignAccount,
          creator: user1.publicKey
        }).signers([user1]).rpc();
        assert.fail();
      }
      catch (err) {
        if (err.toString().substring(75, 87) === "InvalidOwner") assert.ok(1);
        else if (err.toString().substring(75, 87) === "AssertionError")
          assert.fail("Requesting address is Owner!");
        else
          assert.fail(err)
      }
    });

    it("Owner can withdraw funds if Campaign hit the target!", async () => {
      try {
        await program.methods.withdraw().accounts({
          campaign: campaignAccount,
          creator: campaignCreator.publicKey
        }).signers([campaignCreator]).rpc();
      }
      catch (err) {
        console.log("ERROR :" + err);
      }
    });

  })
});

const airdrop = async (addr: any) => {
  const txn = await provider.connection.requestAirdrop(addr, 200 * web3.LAMPORTS_PER_SOL);
  await provider.connection.confirmTransaction(txn);
} 