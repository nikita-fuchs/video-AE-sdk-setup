// SDK & Node setup
const { Universal: Ae, MemoryAccount, Node } = require('@aeternity/aepp-sdk')



const privkey1 = ''
const pubkey1 = ''

const privkey2 = ''
const pubkey2 = ''



// accounts that will be used for the transactions
const acc1 = MemoryAccount({ keypair: { secretKey: privkey1, publicKey: pubkey1 } });
const acc2 = MemoryAccount({ keypair: { secretKey: privkey2, publicKey: pubkey2 } });

if(privkey1.length < 1 || privkey2.length < 1 || pubkey1.length < 1 || pubkey2.length < 1 ) {
    console.log("Ooops, did you provide the keys like seen in the video ?")
}

// a reference to the aeternity blockchain
var Chain;

// instantiate a connection to the aeternity blockchain
const main = async () => {
  const node1 = await Node({ url: 'https://testnet.aeternity.io/', internalUrl: 'https://testnet.aeternity.io/'})
  // const node2 = ...

    Chain = await Ae({
      // Define Node
      nodes: [
        { name: 'someNode', instance: node1 },
        // mode2
      ],
      compilerUrl: 'https://latest.compiler.aepps.com',
      accounts: [
        acc1,
        acc2
      ],
      address: pubkey2

    })


    const height = await Chain.height()
    console.log('Connected to Testnet Node! Current Block:', height)

// CONTRACT DEPLOYMENT

// the code of your contract - watch out for correct indentations !
    const code = 
    `
contract SimpleToken =

    record state = {
        total_supply : int,
        name : string,
        balances : map(address, int)
        }
    
    entrypoint init(initial_balance : int, name : string) =
     { name         = name,
       total_supply = initial_balance,
       balances     = {[Call.caller] = initial_balance}
      }

    entrypoint name() : string =
        state.name

    entrypoint balance(account : address) : int = 
        state.balances[account = 0]


    stateful entrypoint transfer(recipient : address, value : int) =
        require(value >= 0, "NON_NEGATIVE_VALUE_REQUIRED")
        require(balance(Call.caller) >= value, "Not enough funds")

        put(state{ balances[Call.caller] = state.balances[Call.caller] - value } )
        put(state{ balances[recipient] = state.balances[recipient = 0] + value })
        true
`

    // create a contract instance
   const SimpleToken = await Chain.getContractInstance(code);

    // Deploy the contract
    try {
      console.log("Deploying contract....")
      console.log("Using account for deployment: ", Chain.addresses()[0]);
      await SimpleToken.methods.init(1337,'SimpleToken');
      console.log("Contract deployed successfully!")
      console.log("Contract address: ", SimpleToken.deployInfo.address)
      console.log("Transaction ID: ", SimpleToken.deployInfo.transaction)
      console.log("\n \n")  
    } catch(e){
      console.log("Something went wrong, did you set up the SDK properly?");
      console.log("Deployment failed: ", e)
    }
      
      
//      await new Promise(resolve => setTimeout(resolve, 4000));

    // CONTRACT FUNCTION CALL

    const options = {
        amount: 1337,
        onAccount: 'ak_214WSEqTB1MbkEKmS9Sh5V4fqHY9b6Xterex15JQTdyiDLdXYW'
    }

    try{
      let callresult = await SimpleToken.methods.transfer('ak_214WSEqTB1MbkEKmS9Sh5V4fqHY9b6Xterex15JQTdyiDLdXYW', 42);
      
      // const myContract = SimpleToken.methods;
      // const callresult = await myContract.transfer('ak_214WSEqTB1MbkEKmS9Sh5V4fqHY9b6Xterex15JQTdyiDLdXYW', 42);

      //  explicitly do a transaction for that function call
      //  let callresult = await SimpleToken.methods.transfer.send('ak_214WSEqTB1MbkEKmS9Sh5V4fqHY9b6Xterex15JQTdyiDLdXYW', 42);

      //  just dry-run the transaction to check if it would succeed at current block
      //  let callresult = await SimpleToken.methods.transfer.get('ak_214WSEqTB1MbkEKmS9Sh5V4fqHY9b6Xterex15JQTdyiDLdXYW', 42);

      console.log("Transaction ID: ", callresult.hash);
      console.log("Advice: log the full callResult object for more useful information!")
      console.log("Function call returned: ", callresult.decodedResult);
    } catch (e){
      console.log("Calling your function errored: ", e)
    }

    // optionally, give the sync some time:
    //await new Promise(resolve => setTimeout(resolve, 3000));

    const spendResult = await Chain.spend(1337, "ak_214WSEqTB1MbkEKmS9Sh5V4fqHY9b6Xterex15JQTdyiDLdXYW")
    console.log("Spend result: ", spendResult)
      } 

 main();