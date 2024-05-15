// SPDX-License-Identifier: UNLICENSE
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "base64-sol/base64.sol";
pragma solidity ^0.8.24;

/**
 * @title DynamicSvgNft
 * @dev ERC721 token contract representing dynamic SVG NFTs hosted 100% on-chain that changes based on a price feed.
 */

contract DynamicSvgNft is ERC721 {
    /**
     * @dev Emitted when a new NFT is minted.
     * @param _owner The address of the NFT owner.
     * @param _tokenId The ID of the minted NFT.
     * @param _highValue The high value associated with the minted NFT.
     */
    event NftMinted(address indexed _owner, uint _tokenId, int _highValue);

    //State Variables
    uint private s_tokenCounter;
    string private s_lowSvgUrl;
    string private s_highSvgUrl;
    mapping(uint256 => int256) private s_tokenIdToValue;

    string private constant base64EncodedImagePrefix =
        "data:image/svg+xml;base64,";
    AggregatorV3Interface private immutable i_priceFeed;

    constructor(
        string memory _lowSvg,
        string memory _highSvg,
        address _priceFeedAddress
    ) ERC721("Dynamic Svg Nft", "DSN") {
        s_lowSvgUrl = SvgToUrl(_lowSvg);
        s_highSvgUrl = SvgToUrl(_highSvg);
        i_priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function mintNft(int256 _highValue) external {
        s_tokenCounter++;
        uint256 tokenId = s_tokenCounter;
        s_tokenIdToValue[tokenId] = _highValue;
        _safeMint(msg.sender, tokenId);
        emit NftMinted(msg.sender, tokenId, _highValue);
    }

    /**
     * @dev Converts SVG to a data URL.
     * @param _svg The SVG to convert.
     * @return _imageUrl The data URL of the SVG.
     */

    function SvgToUrl(
        string memory _svg
    ) public pure returns (string memory _imageUrl) {
        string memory encodedSvg = Base64.encode(bytes(_svg));
        _imageUrl = string(
            abi.encodePacked(base64EncodedImagePrefix, encodedSvg)
        );
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory tokenUri) {
        _requireOwned(tokenId);

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageUri;
        //if the price of an asset is low than high_value of the tokenId, show low svg, if higher,  show high svg.
        if (price >= s_tokenIdToValue[tokenId]) {
            imageUri = s_highSvgUrl;
        } else {
            imageUri = s_lowSvgUrl;
        }
        // Constructs the token URI
        tokenUri = string(
            abi.encodePacked(
                _baseURI(),
                Base64.encode(
                    abi.encodePacked(
                        '{ "name": "',
                        name(),
                        '", ',
                        '"description": "A dynmic Nft that changes based on a price feed", ',
                        '"image": "',
                        imageUri,
                        '", ',
                        '"attributes": [ { "trait_type": "cool", "value": 100 } ] }'
                    )
                )
            )
        );
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    //Getter functions/view functions

    function getLowSvgUrl() external view returns (string memory) {
        return s_lowSvgUrl;
    }

    function getHighSvgUrl() external view returns (string memory) {
        return s_highSvgUrl;
    }

    function getTokenCounter() external view returns (uint) {
        return s_tokenCounter;
    }

    function getTokenValue(uint _tokenId) external view returns (int) {
        return s_tokenIdToValue[_tokenId];
    }

    function getPriceFeed() external view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }
}
