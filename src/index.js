const Web3 = require('web3');
const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient("xoxb-4208929916324-4353492109888-1TPbKHKEXRg2YosZQAAEn5tn", {
  logLevel: LogLevel.DEBUG
});
const channelId = "C0467PK7ZT8";
const mongoose = require('mongoose')
const User = require("./User")
mongoose.connect("mongodb://localhost/testdb")
let toWallet = new Set();
let fromWallet = new Set();
let BNumber = new Set();
//run()
//async function run() {

//// CREATE
//    try{
//         const user = await User.create({ walletAddress: "0x279f4480a43A1B56d64843b2d37484D9461074D0", slackID:"U0462BKP8Q5"})
//         console.log(user)
//     } catch (e) {
//       console.log(e.message)
//     }

// //UPDATE 
    // try{
    //     const user = await User.findById("63692a52cc82e8813ec28357")
    //     user.slackID = "U0462BKP8QK"
    //     await user.save() 
    //     console.log(user)
    // } catch (e) {
    //   console.log(e.message) 
    // }

// //find
//     try{
//         //const user = await User.findById("63676397cc77f5ea2d84b29a")
//         //const user = await User.find({ slackID: "U0462BKP8QK" })
//         const user = await User.find()
//         user.forEach((user) => {
//             console.log(user) 
//         });
//     } catch (e) {
//       console.log(e.message) 
//     }

///DELETE
    // try{
    //     //const user = await User.deleteOne({ walletAddress: "0x8cb72A8D2fb86bEB75ECED30C957F7aA8F839AA5"})
    //     //const user = await User.deleteMany({ walletAddress: "0x8cb72A8D2fb86bEB75ECED30C957F7aA8F839AA4"})
    //     const user = await User.findByIdAndDelete("63692a4fdcc7761d35aee160")
    //     console.log(user)
    // } catch (e) {
    //   console.log(e.message) 
    // }
    
//}

class TransactionChecker {
 web3;
 account;
  constructor(projectId, account) {
    this.web3 = new Web3(new Web3.providers.HttpProvider('https://Goerli.infura.io/v3/4adb25ba68ee4df7a3129096d5cff115'));
    this.account = account.toLowerCase();
  }
  async checkBlock() {
   let block = await this.web3.eth.getBlock('latest');
   let number = block.number;

   if(!BNumber.has(number)){
     BNumber.add(number);
     console.log('searching block: ' + number);
     BNumber.delete(number-4);
    }
     
    if (block != null && block.transactions != null) {
      for (let txHash of block.transactions) {
        let tx = await this.web3.eth.getTransaction(txHash);
        const outputMSG ='Transaction found on block: ' + number + '\nfrom wallet: ' + tx.from + '\nto wallet: ' + tx.to+ '\nvalue: '+ this.web3.utils.fromWei(tx.value, 'ether')+ '\ntime:'+ new Date() +'\nhttps://goerli.etherscan.io/tx/'+txHash
        function output(){
          console.log(outputMSG)
          try {
            const result =  client.chat.postEphemeral({
              channel: channelId,
              user: userId,
              text: outputMSG
            });
            console.log(result);
          }
          catch (error) {
            console.error(error);
          }
        }
        if (this.account == await tx.to?.toLowerCase()|| '') {
          if(!toWallet.has(number + this.account + tx.to?.toLowerCase())){
            toWallet.add(number + this.account + tx.to?.toLowerCase());
            output();
            console.log("to wallet 1 st if");
          }  
        }
        if (this.account == tx.from.toLowerCase()) {
          if(!fromWallet.has(number + this.account + tx.from.toLowerCase())){
            fromWallet.add(number + this.account + tx.from.toLowerCase());
            output();
            console.log("from wallet 2nd if");
          }
        }
        if (toWallet.size > 10000) {
          toWallet.clear();
        }
        if (fromWallet.size > 10000) {
          fromWallet.clear();
        }
      }
    }
  }
}
run()
async function run() {
  try{
    const user = await User.find()
    user.forEach((user) => {
      let txChecker = new TransactionChecker(process.env.INFURA_ID , user.walletAddress);
      userId = user.slackID;
      setInterval(() => {
       txChecker.checkBlock();
      }, 4 * 1000);
    });
  }catch (e) {
    console.log(e.message);
  }
}