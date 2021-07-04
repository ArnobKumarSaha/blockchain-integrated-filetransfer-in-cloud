[//]: # (SPDX-License-Identifier: CC-BY-4.0)



# Instructions

1. PREREQUISITE
sudo apt-get install git  // Installing Git
sudo apt-get install curl  // Installing curl



2. IN CASE, DOCKER NOT INSTALLED
docker
docker-compose
docker --version // for check if Docker is installed successfully
docker-compose --version
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker <username>  // add user to the Docker group


3. IN CASE, DOCKER IS INSTALLED
docker system prune --volumes       // prune the anonymous volumes
docker rm -vf $(docker ps -a -q)    // Remove Docker containers , -v remove anonymous volumes, force, -q shows only IDs
docker rmi -f $(docker images -a -q)   // Remove Docker images


4. IN CASE ALREADY COUCHDB is running locally
snap stop couchdb.server


5. Pull down the fabric samples , binaries and images.
curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh | bash -s -- 2.2.3 1.5.0   	// <fabric_version> <fabric-ca_version>


6. INSTALLING NODE
#Please try to avoid using apt get to install on Ubuntu node.js , if you have already done so, please remove it manually
sudo apt-get purge nodejs && sudo apt-get autoremove && sudo apt-get autoclean

#Use NVM to install
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

#Check whether the installation of NVM is successful
nvm --version

#Check out all versions of nodejs that can be installed
nvm ls-remote     

#The latest long-term support version of nodejs is 12.18.2
nvm install 12.18.2

#View nodejs version
node -v


7. Now clone this git repo.
git clone https://github.com/ArnobKumarSaha/blockchain-integrated-filetransfer-in-cloud.git


8. Copy and replace /fabcar/javascript folder from this git repo into your locally created fabric-samples project, in /fabric-samples/fabcar/javascript folder.
Similiarly, Copy and replace /fabcar/testRun.sh bash file from this git repo into your locally created fabric-samples project, in /fabric-samples/fabcar/testRun.sh bash file.
And, Copy and replace /chainecode/fabcar/go/fabcar.go file from this git repo into your locally created fabric-samples project, in /fabric-samples/chainecode/fabcar/go/fabcar.go file.


8. Now navigate to /fabcar folder of this project.
Run ./networkDown.sh
./startFabric.sh
./testRun.sh 
one by one.

If successful, You should see the name of all cars in the last line.


9. Go to /fabcar/javascript folder of your local project, and run node app.js to run the blockchain integrated node application.
This will open in 8000 port.  localhost:8000 

10. To see the current state of the databse, go to localhost:5984/_utils
  

# Hyperledger Fabric Samples

You can use Fabric samples to get started working with Hyperledger Fabric, explore important Fabric features, and learn how to build applications that can interact with blockchain networks using the Fabric SDKs. To learn more about Hyperledger Fabric, visit the [Fabric documentation](https://hyperledger-fabric.readthedocs.io/en/latest).

## Getting started with the Fabric samples

To use the Fabric samples, you need to download the Fabric Docker images and the Fabric CLI tools. First, make sure that you have installed all of the [Fabric prerequisites](https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html). You can then follow the instructions to [Install the Fabric Samples, Binaries, and Docker Images](https://hyperledger-fabric.readthedocs.io/en/latest/install.html) in the Fabric documentation. In addition to downloading the Fabric images and tool binaries, the Fabric samples will also be cloned to your local machine.

## Test network

The [Fabric test network](test-network) in the samples repository provides a Docker Compose based test network with two
Organization peers and an ordering service node. You can use it on your local machine to run the samples listed below.
You can also use it to deploy and test your own Fabric chaincodes and applications. To get started, see
the [test network tutorial](https://hyperledger-fabric.readthedocs.io/en/latest/test_network.html).

## Asset transfer samples and tutorials

The asset transfer series provides a series of sample smart contracts and applications to demonstrate how to store and transfer assets using Hyperledger Fabric.
Each sample and associated tutorial in the series demonstrates a different core capability in Hyperledger Fabric. The **Basic** sample provides an introduction on how
to write smart contracts and how to interact with a Fabric network using the Fabric SDKs. The **Ledger queries**, **Private data**, and **State-based endorsement**
samples demonstrate these additional capabilities. Finally, the **Secured agreement** sample demonstrates how to bring all the capabilities together to securely
transfer an asset in a more realistic transfer scenario.

|  **Smart Contract** | **Description** | **Tutorial** | **Smart contract languages** | **Application languages** |
| -----------|------------------------------|----------|---------|---------|
| [Basic](asset-transfer-basic) | The Basic sample smart contract that allows you to create and transfer an asset by putting data on the ledger and retrieving it. This sample is recommended for new Fabric users. | [Writing your first application](https://hyperledger-fabric.readthedocs.io/en/latest/write_first_app.html) | Go, JavaScript, TypeScript, Java | Go, JavaScript, TypeScript, Java |
| [Ledger queries](asset-transfer-ledger-queries) | The ledger queries sample demonstrates range queries and transaction updates using range queries (applicable for both LevelDB and CouchDB state databases), and how to deploy an index with your chaincode to support JSON queries (applicable for CouchDB state database only). | [Using CouchDB](https://hyperledger-fabric.readthedocs.io/en/latest/couchdb_tutorial.html) | Go, JavaScript | Java, JavaScript |
| [Private data](asset-transfer-private-data) | This sample demonstrates the use of private data collections, how to manage private data collections with the chaincode lifecycle, and how the private data hash can be used to verify private data on the ledger. It also demonstrates how to control asset updates and transfers using client-based ownership and access control. | [Using Private Data](https://hyperledger-fabric.readthedocs.io/en/latest/private_data_tutorial.html) | Go, Java | JavaScript |
| [State-Based Endorsement](asset-transfer-sbe) | This sample demonstrates how to override the chaincode-level endorsement policy to set endorsement policies at the key-level (data/asset level). | [Using State-based endorsement](https://github.com/hyperledger/fabric-samples/tree/master/asset-transfer-sbe) | Java, TypeScript | JavaScript |
| [Secured agreement](asset-transfer-secured-agreement) | Smart contract that uses implicit private data collections, state-based endorsement, and organization-based ownership and access control to keep data private and securely transfer an asset with the consent of both the current owner and buyer. | [Secured asset transfer](https://hyperledger-fabric.readthedocs.io/en/latest/secured_asset_transfer/secured_private_asset_transfer_tutorial.html)  | Go | JavaScript |
| [Events](asset-transfer-events) | The events sample demonstrates how smart contracts can emit events that are read by the applications interacting with the network. | [README](asset-transfer-events/README.md)  | JavaScript, Java | JavaScript |
| [Attribute-based access control](asset-transfer-abac) | Demonstrates the use of attribute and identity based access control using a simple asset transfer scenario | [README](asset-transfer-abac/README.md)  | Go | None |



## Additional samples

Additional samples demonstrate various Fabric use cases and application patterns.

|  **Sample** | **Description** | **Documentation** |
| -------------|------------------------------|------------------|
| [Commercial paper](commercial-paper) | Explore a use case and detailed application development tutorial in which two organizations use a blockchain network to trade commercial paper. | [Commercial paper tutorial](https://hyperledger-fabric.readthedocs.io/en/latest/tutorial/commercial_paper.html) |
| [Off chain data](off_chain_data) | Learn how to use the Peer channel-based event services to build an off-chain database for reporting and analytics. | [Peer channel-based event services](https://hyperledger-fabric.readthedocs.io/en/latest/peer_event_services.html) |
| [Token ERC-20](token-erc-20) | Smart contract demonstrating how to create and transfer fungible tokens using an account-based model. | [README](token-erc-20/README.md) |
| [Token UTXO](token-utxo) | Smart contract demonstrating how to create and transfer fungible tokens using a UTXO (unspent transaction output) model. | [README](token-utxo/README.md) |
| [High throughput](high-throughput) | Learn how you can design your smart contract to avoid transaction collisions in high volume environments. | [README](high-throughput/README.md) |
| [Auction](auction) | Run an auction where bids are kept private until the auction is closed, after which users can reveal their bid | [README](auction/README.md) |
| [Chaincode](chaincode) | A set of other sample smart contracts, many of which were used in tutorials prior to the asset transfer sample series. | |
| [Interest rate swaps](interest_rate_swaps) | **Deprecated in favor of state based endorsement asset transfer sample** | |
| [Fabcar](fabcar) | **Deprecated in favor of basic asset transfer sample** |  |

## License <a name="license"></a>

Hyperledger Project source code files are made available under the Apache
License, Version 2.0 (Apache-2.0), located in the [LICENSE](LICENSE) file.
Hyperledger Project documentation files are made available under the Creative
Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
