// SPDX-License-Identifier: UNLICENSE
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
pragma solidity ^0.8.24;

error RANDOMIPFSNFT__INSUFFICIENT_MINTFEE();
error RANDOMIPFSNFT__UNSUCCESFUL_WITHDRAWAL();
error RANDOMIPFSNFT__UNAUTHORIZED_TRANSFER();

/**
 * @title RandomIpfsNft
 * @dev An ERC721 compliant contract that mints NFTs with metadata stored on IPFS, based on Chainlink's verifiably random number generation.
 */

contract RandomIpfsNft is ERC721URIStorage, VRFConsumerBaseV2 {
    event NftRequested(address indexed _requester, uint _requestId);
    event NftMinted(
        address indexed _owner,
        uint _tokenId,
        Breed indexed _breed
    );
    enum Breed {
        Pug,
        ShibaInu,
        StBernard
    }

    //state variables
    mapping(uint => address) private s_requestIdToSender;
    string[3] private s_tokenURIs;
    uint private s_tokenCounter;
    uint private immutable MINT_FEE;
    uint256 private constant PUG_PROBABILITY = 10; // Probability of minting a Pug (in percentage)
    uint256 private constant SHIBA_INU_PROBABILITY = 40; // Probability of minting a Shiba Inu (in percentage)
    uint256 private constant ST_BERNARD_PROBABILITY = 60; // Probability of minting a St. Bernard (in percentage)
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    uint64 private immutable i_subId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    address private immutable i_owner;

    constructor(
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint _mintFee,
        string[3] memory _tokenURIs
    ) ERC721("RandomNFt", "RDMNFT") VRFConsumerBaseV2(_vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        MINT_FEE = _mintFee;
        i_subId = _subscriptionId;
        i_keyHash = _keyHash;
        i_callbackGasLimit = _callbackGasLimit;
        s_tokenURIs = _tokenURIs;
        i_owner = msg.sender;
    }

    /**
     * @notice Requests a new NFT to be minted.
     * @dev The caller must provide the required minting fee.
     * @return requestId The ID of the request.
     */

    function requestNft() external payable returns (uint requestId) {
        if (msg.value < MINT_FEE) {
            revert RANDOMIPFSNFT__INSUFFICIENT_MINTFEE();
        }

        requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(msg.sender, requestId);
    }

    function withdraw() external {
        if (msg.sender != i_owner) {
            revert RANDOMIPFSNFT__UNAUTHORIZED_TRANSFER();
        }
        (bool success, ) = payable(i_owner).call{value: address(this).balance}(
            ""
        );
        if (!success) {
            revert RANDOMIPFSNFT__UNSUCCESFUL_WITHDRAWAL();
        }
    }

    function getBreed(uint _randomNum) public pure returns (Breed breed) {
        //get breed from random number
        if (_randomNum < PUG_PROBABILITY) {
            breed = Breed.Pug;
        } else if (_randomNum < SHIBA_INU_PROBABILITY) {
            breed = Breed.ShibaInu;
        } else {
            breed = Breed.StBernard;
        }
    }

    /**
     * @notice Fulfills the random words request by minting a new NFT.
     * @param requestId The ID of the request.
     * @param randomWords The generated random words.
     */

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint randomNum = randomWords[0] % 100;
        Breed breed = getBreed(randomNum);
        address requestAddress = s_requestIdToSender[requestId];
        mintNft(requestAddress, s_tokenCounter, breed);
    }

    /**
     * @notice Mints a new NFT.
     * @param _to The address to which the NFT will be minted.
     * @param _tokenId The ID of the NFT.
     * @param _breed The breed of the NFT.
     */

    function mintNft(address _to, uint _tokenId, Breed _breed) private {
        s_tokenCounter++;
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, s_tokenURIs[uint(_breed)]);
        emit NftMinted(_to, _tokenId, _breed);
    }

    //getter/view functions

    function getMintFee() external view returns (uint) {
        return MINT_FEE;
    }

    function getRequestSender(uint _requestId) external view returns (address) {
        return s_requestIdToSender[_requestId];
    }

    function getTokenCounter() external view returns (uint) {
        return s_tokenCounter;
    }

    function getOwner() external view returns (address) {
        return i_owner;
    }

    function getTokenURI(uint _index) external view returns (string memory) {
        return s_tokenURIs[_index];
    }
}
