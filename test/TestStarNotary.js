const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:1000000});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    // it can't be equal because we have the gas fee 
    assert.ok(value > starPrice);
});

// Implement Task 2 Add supporting unit tests
it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 6; 
    // 1. create a Star with different tokenId
    await instance.createStar("awesome star", starId, {from: user1});

    // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    // This methods are declared in the ERC.721.sool
    let tokenName = await instance.name();
    let symbol = await instance.symbol(); 

    assert.equal(tokenName, "ComiStar");
    assert.equal(symbol, "CSR");

});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let instance = await StarNotary.deployed(); 
    // the first user is the sender
    let user1 = accounts[0];
    let user2 = accounts[1]; 

    let first_starId = 7; 
    let second_starId = 8; 

    await  instance.createStar("awesome star 1", first_starId, {from: user1}); 
    await  instance.createStar("awesome star 2", second_starId, {from: user2}); 
    

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(first_starId, second_starId);
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(first_starId), user2);
    assert.equal(await instance.ownerOf.call(second_starId), user1);
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let starId = 9; 

    // 1. create a Star with different tokenId
    await instance.createStar("awesome star", starId, {from: user1});

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, starId)
    
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(starId), user2);
});

// This test is not requested in the project task2 but it is present in the starter code
// we will implement it in order to complete all the tests
it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed(); 
    let user1 = accounts[0];
    let starId = 10;
    // 1. create a Star with different tokenId
    await instance.createStar("awesome star", starId, {from: user1});
    // 2. Call your method lookUptokenIdToStarInfo
    let starInfoName = await instance.lookUptokenIdToStarInfo(starId);
    // 3. Verify if you Star name is the same
    assert.equal(starInfoName, "awesome star");
});