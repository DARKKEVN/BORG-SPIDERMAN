import { FC } from 'react'
import { ThirdwebNftMedia, useContract, useNFT, Web3Button } from '@thirdweb-dev/react'

interface NFTCardProps {
    tokenId: number;
}

const NFTCard: FC<NFTCardProps> = ({ tokenId }) => {
    const nftAddress = "0xC1FaD4130c90b6E5510d052017363f9Eb13C9c82";
    const stakingAddress = "0x7DFc10A34341797Da007E68eEB907546A4C20856";

    const { contract: bsContract } = useContract(nftAddress, "nft-drop");
    const { contract: stakingContract } = useContract(stakingAddress); 
    const { data: nft } = useNFT(bsContract, tokenId);

    async function withdraw(nftId: string) {
        await stakingContract?.call("withdraw", [nftId])      
    }


  return (
      <> 
        {nft && (
            <div>
              <h3>{nft.metadata.name}</h3>
              {nft.metadata && (
                  <ThirdwebNftMedia
                    metadata={nft.metadata}
                  />
              )}
              <Web3Button
                  contractAddress={stakingAddress}
                  action={() => withdraw(nft.metadata.id)}
              >Withdraw NFT</Web3Button>
            </div>
        )}
      </>
    )
}
export default NFTCard;