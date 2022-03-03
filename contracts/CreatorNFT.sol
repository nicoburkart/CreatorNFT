pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import {Base64} from "./libraries/Base64.sol";
import "./libraries/Whitelistable.sol";

contract CreatorNFT is ERC721URIStorage, Ownable, Whitelistable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string private baseSvg =
        "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>You now have access!</text></svg>";

    address public _deveolper;
    uint256 public _feeAmount;
    uint256 public _supply;

    constructor(uint256 feeAmount, uint256 supply)
        ERC721("CreatorNFT", "ACCESS")
    {
        _feeAmount = feeAmount;
        _deveolper = owner();
        _supply = supply;
    }

    //-- Sale control functions

    bool private _saleStarted;

    modifier whenFeeIncluded() {
        require(msg.value >= _feeAmount, "Fee not included");
        _;
    }

    modifier whenSaleStartedOrOnWhitelist() {
        require(_saleStarted || whitelist[msg.sender], "Not on whitelist");
        _;
    }

    modifier whenTokenLeft() {
        require(_tokenIds.current() < _supply, "No tokens left");
        _;
    }

    function saleStarted() public view returns (bool) {
        return _saleStarted;
    }

    //-- Admin functions

    function flipSaleStarted() external onlyOwner {
        _saleStarted = !_saleStarted;
    }

    //-- Public functions

    function mintNFT(int16 accessTier)
        public
        payable
        whenSaleStartedOrOnWhitelist
        whenFeeIncluded
        whenTokenLeft
        returns (uint256)
    {
        require(accessTier > 0 && accessTier <= 3, "Access Tier not available");

        uint256 newItemId = _tokenIds.current();

        string
            memory tokenUri = "data:application/json;base64,eyJuYW1lIjogInRlc3QiLCAiZGVzY3JpcHRpb24iOiAiQSBoaWdobHkgYWNjbGFpbWVkIGNvbGxlY3Rpb24gb2Ygc3F1YXJlcy4iLCAiaW1hZ2UiOiAiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCNGJXeHVjejBuYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNuSUhCeVpYTmxjblpsUVhOd1pXTjBVbUYwYVc4OUozaE5hVzVaVFdsdUlHMWxaWFFuSUhacFpYZENiM2c5SnpBZ01DQXpOVEFnTXpVd0p6NDhjM1I1YkdVK0xtSmhjMlVnZXlCbWFXeHNPaUIzYUdsMFpUc2dabTl1ZEMxbVlXMXBiSGs2SUhObGNtbG1PeUJtYjI1MExYTnBlbVU2SURJMGNIZzdJSDA4TDNOMGVXeGxQanh5WldOMElIZHBaSFJvUFNjeE1EQWxKeUJvWldsbmFIUTlKekV3TUNVbklHWnBiR3c5SjJKc1lXTnJKeUF2UGp4MFpYaDBJSGc5SnpVd0pTY2dlVDBuTlRBbEp5QmpiR0Z6Y3owblltRnpaU2NnWkc5dGFXNWhiblF0WW1GelpXeHBibVU5SjIxcFpHUnNaU2NnZEdWNGRDMWhibU5vYjNJOUoyMXBaR1JzWlNjK1dXOTFJRzV2ZHlCb1lYWmxJR0ZqWTJWemN5RThMM1JsZUhRK1BDOXpkbWMrIn0=";

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenUri);
        _tokenIds.increment();
        if (!_saleStarted) {
            whitelist[msg.sender] = false;
        }
        return newItemId;
    }
}
