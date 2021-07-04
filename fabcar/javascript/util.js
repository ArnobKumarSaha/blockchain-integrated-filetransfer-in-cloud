const path = require('path');
const fs = require('fs');

// FABRIC INCLUDES STARTS
const { Gateway, Wallets } = require('fabric-network');
const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
// FABRIC INCLUDES ENDS

var init = (async () => {
    // Create a new file system based wallet for managing identities.
    // const walletPath = path.join(process.cwd(), "wallet");
    // const wallet = new FileSystemWallet(walletPath);
    // console.log(`Wallet path: ${walletPath}`);
    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
  
    // Check to see if we've already enrolled the user.
    // const userExists = await wallet.exists("user1");
    // if (!userExists) {
    //     console.log(
    //         'An identity for the user "user1" does not exist in the wallet'
    //     );
    //     console.log("Run the registerUser.js application before retrying");
    //     return;
    // }
    const identity = await wallet.get('appUser');
    if (!identity) {
        console.log('An identity for the user "appUser" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
  
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'appUser' });
    // , discovery: { enabled: true, asLocalhost: true }  // After indentity: 'appUser'
  
  
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("mychannel");
  
    // Get the contract from the network.
    const contract = network.getContract("fabcar");
  
    return {
        getInput: function () {
            return {
                contact: contract, // Will be either inc or exp
                gateway: gateway,
            };
        },
    };
  })();

  module.exports = init;