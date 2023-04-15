import { ConnectWallet, Web3Button, useConnect, useContract, useAddress, useOwnedNFTs, ThirdwebNftMedia, useContractRead } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import NFTCard from "../components/NFTCard";
import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const address = useAddress();

  const nftAddress = "0xC1FaD4130c90b6E5510d052017363f9Eb13C9c82";
  const stakingAddress = "0x7DFc10A34341797Da007E68eEB907546A4C20856";

  const { contract: bsContract } = useContract(nftAddress, "nft-drop");
  const { contract: stakingContract } = useContract(stakingAddress); 

  const { data: myNfts} = useOwnedNFTs(bsContract, address)
  const {data: stakedNFTs } = useContractRead(stakingContract, "getStakeInfo", address);

  async function stakeNFT(nftID: string){
    if(!address) return;

    const isApproved = await bsContract?.isApproved(
      address,
      stakingAddress
      );

      if(!isApproved) {
        await bsContract?.setApprovalForAll(stakingAddress, true);
      }

      await stakingContract?.call("stake", [nftID])
    }

    const [claimableRewards, setClaimableRewards] = useState<BigNumber>();

    useEffect(() => {
        if(!stakingContract || !address) return;

        async function loadClaimableRewards() {
          const stakeInfo = await stakingContract?.call("getStakeInfo", address);
          setClaimableRewards(stakeInfo[1]);          
        }

        loadClaimableRewards();
    }, [address, stakingContract]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Borg Spiderman NFT</h1>
        <Web3Button
        contractAddress={nftAddress}
        action={(nftContract) => nftContract.erc721.claim(1)}
        >Claim NFT</Web3Button>
        <b />
        <h1>My Borg Spiderman NFT</h1>
        <div>
          {myNfts?.map((nft) => (
            <div>
              <h3>{nft.metadata.name}</h3>
              <ThirdwebNftMedia
                metadata={nft.metadata}
                height="200px"
                width="200px"
              />
              <Web3Button
                contractAddress={stakingAddress}
                action={() => stakeNFT(nft.metadata.id)}
              >Stake NFT</Web3Button>
            </div>
          ))}
        </div>
        <h1>Staked NFTs</h1>
        <div>
          {stakedNFTs && stakedNFTs[0].map((stakedNFT: BigNumber) => (
            <div key={stakedNFT.toString()}>
                            <NFTCard tokenId={stakedNFT.toNumber()} />
            </div>
          ))}
        </div>
        <br />
        <h1>Claimable Tokens</h1>
        {!claimableRewards ? "Loading..." : ethers.utils.formatUnits(claimableRewards, 18)}
        <Web3Button
          contractAddress={stakingAddress}
          action={(stakingContract) => stakingContract.call("claimableRewards")}
        >Claim Rewards</Web3Button>
      </main>
    </div>
  );
};

export default Home;
