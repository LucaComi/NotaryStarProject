// For this project a more recent version of solidity has been used
pragma solidity ^0.8.13;

//Importing ERC-721 from @openzeppelin
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'

    // Task 1a: Add a name and a symbol for your starNotary token
    constructor() ERC721("ComiStar","CSR") {}

    struct Star {
        string name; 
    }

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }

    function _make_payable(address x) internal pure returns (address payable) {
        return payable(address(uint160(x)));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transfer(ownerAddress, payable(msg.sender), _tokenId); // we change _transferFrom() to _transfer()
        address payable ownerAddressPayable = _make_payable(ownerAddress); 
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            payable(msg.sender).transfer(msg.value - starCost);
        }
    }


    // Task 1b - Add a function lookUptokenIdToStarInfo, that looks up the stars using the Token ID, and then returns the name of the star.
    function lookUptokenIdToStarInfo(uint256 _tokenId) public view returns (string memory starName){
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        starName = tokenIdToStarInfo[_tokenId].name; 
        return starName;
    }

    // Task 1c - Add a function called exchangeStars, so 2 users can exchange their star tokens
    function exchangeStars(uint256 _firstTokenId, uint256 _secondTokenId) public {
            //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
            //2. You don't have to check for the price of the token (star)
            //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId2)
            //4. Use _transferFrom function to exchange the tokens.

            // i get the addess the user's addresses
            address addressFirstUser = ownerOf(_firstTokenId);
            address addressSecondUser = ownerOf(_secondTokenId);

            // There are two possible configuration that we need to consider
            if(msg.sender == addressFirstUser){
                _transfer(addressFirstUser, addressSecondUser, _firstTokenId);
                _transfer(addressSecondUser, addressFirstUser, _secondTokenId);
            }

            if(msg.sender == addressSecondUser){
                _transfer(addressSecondUser, addressFirstUser, _secondTokenId);
                _transfer(addressFirstUser, addressSecondUser, _firstTokenId);
            }
            
    }

    // Task 1d - Write a function to Transfer a Star. 
    // The function should transfer a star from the address of the caller. 
    // The function should accept 2 arguments, the address to transfer the star to, and the token ID of the star
    function transferStar(address receiver, uint256 _tokenId) public{
        //1. Check if the sender is the ownerOf(_tokenId)
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        
        // we need to check if the caller has the star
        require(msg.sender == ownerOf(_tokenId), "The star doesn't belong to the caller!");
        _transfer(msg.sender, receiver, _tokenId);
        
    }
}
