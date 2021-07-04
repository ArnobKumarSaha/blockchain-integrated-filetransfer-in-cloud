const User = require('../models/user');
const KeywordIndex = require('../models/keyword_index');
const File = require('../models/file');

const path = require('path');
const fs = require('fs');
const encDec = require('../EncryptDecrypt-v2');

const { ObjectID } = require('bson');
const documents = require('../controllers/userUpDownDel').getDocuments();


const init = require('../util');

exports.showFileById = (req, res, next) =>{
  const fileId = req.params.myFileId;

  console.log("showFileById : fileId = ", fileId);

  File.findById(ObjectID(fileId)).then((theFile) => {
    const filePath = theFile.filePath;
    let content;
  
    fs.readFile(path.dirname(process.mainModule.filename) + '/public/files/'+filePath, 'utf8' , (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(data);
  
      res.render("updown/showFile", {
        pageTitle: "Show File",
        path: "/user/uploaded",
        fileContent: data
      });
    });
  })
}

exports.requestFile = async (req, res, next) =>{
    const ownerId = req.params.ownerId;
    const fileName = req.params.fileName; // the file path actually (without /public/files.)
    console.log("requesting file begins");



    //If it is his file.
    if(req.user._id == ownerId){
      return res.render('updown/searchResult', {
        pageTitle: "Search result",
        path: "/user/searchResult",
        docs: documents,
        errorMessage: "This is your file man! "
      });
    }


    const theFile = await File.findOne({filePath: fileName});
    let owner = await User.findOne({_id: ownerId});




    //here is pushing nonce --starts
    let nonce = await encDec.generateNonce(); //use random number or string -- but output must be in string
    const updatedRequestedItems = [...req.user.dcart.allRequests];
    updatedRequestedItems.push({
      isAccept: 0,
      ownerId: ownerId,
      requestedFileId: theFile._id,
      noncePlain: encDec.getKeywordHash(nonce),
      fileContent: null,
      nonceGet: null
    });
    const updatedAllReqs = {
      allRequests: updatedRequestedItems
    };
    //console.log(updatedAllReqs);
    req.user.dcart = updatedAllReqs;
    await req.user.save();
    //here is pushing nonce --ends
  


    // Update the Owner's notification array.
    const updatedNotificationItems = [...owner.reqs.notifications];
    console.log("theFile = ", theFile, "owner = ", owner, "updatedNoti = ", updatedNotificationItems);
    updatedNotificationItems.push({
      requesterId: req.user._id,
      requestedFileId: theFile._id,
      decided: false,
      nonce: await encDec.getEncryptNonce(owner.publicKey, nonce) 
    });
    const updatedReqs = {
      notifications: updatedNotificationItems
    };
    console.log("updated noti = ", updatedNotificationItems, "updated reqs = ", updatedReqs);
    owner.reqs = updatedReqs;
    owner = await owner.save();

    console.log('Done with reques file.');


      // =========================================================================================
  // FABRIC PART STARTS
  // =========================================================================================
  try {
    var contract = (await init).getInput();

    var ct = contract.contact;
    var way = contract.gateway;
    // Submit the specified transaction
    await ct.submitTransaction(
        "FileRequestNotification",   //must declare in capital letter in both js and Go
        theFile._id,
        owner._id,
        req.user._id,
        'queued'
    );
    //await ct.submitTransaction('CreateMed', 'MED12', 'Beximco', 'NapaVX', 'fever,common cold and influenza.');

    console.log(" Request-for-file-transaction has been submitted");
    // res.redirect("/login");
  } catch (error) {
    console.error(`Failed to submit Request-for-file-transaction: ${error}`);
    process.exit(1);
  }
  // =========================================================================================
  // FABRIC PART ENDS
  // =========================================================================================



    // Show the search results to the User.
    res.render('updown/searchResult', {
      pageTitle: "Search result",
      path: "/user/searchResult",
      docs: documents,
      errorMessage: "Requset has been sent to the DataOwner. "
    });
  }

function fudai(p){
  return new Promise((resolve, reject) => {
    fs.readFile(p, (err, data)=> { //can not be utf8
      console.log('Inside fudai.. data:'+ data.toString());
      resolve(data);
    });
  });
}  

function findNonce(notifications,requesterId,requestedFileId){
  return new Promise((resolve) => {
    for(let item of notifications){
      console.log('item -> ', item);
      if(item.requesterId.equals(requesterId) && item.requestedFileId.equals(requestedFileId) && item.decided == false){
        console.log('Nonce -> ', item.nonce);
        resolve(item.nonce);
      }
    }
  });
} 
  
exports.grantPermission = async (req, res, next) =>{
  const requesterId = req.params.requesterId;
  const requestedFileId = req.params.requestedFileId;
  const theFile = await File.findOne({_id: requestedFileId});
  const requester = await User.findOne({_id: requesterId});
  console.log("theFile = ", theFile, "requester = ", requester, "requester public key = ", requester.publicKey);


  
  
  //const plainDataFilePath = await encDec.getDecryptFile(theFile.filePath); 
  //await encDec.getEncryptFileV2(requester.publicKey.toString(), plainDataFilePath); 
  const plainDataFilePath = await encDec.getDecryptFile(theFile.filePath);
  const fpath = await encDec.getEncryptFileV2(requester.publicKey, plainDataFilePath);



    // =========================================================================================
  // FABRIC PART STARTS
  // =========================================================================================
  try {
    var contract = (await init).getInput();

    var ct = contract.contact;
    var way = contract.gateway;
    // Submit the specified transaction
    await ct.submitTransaction(
        "FileRequestAccept",   //must declare in capital letter in both js and Go
        theFile._id,
        req.user._id,
        requester._id,
        'accepted'
    );
    //await ct.submitTransaction('CreateMed', 'MED12', 'Beximco', 'NapaVX', 'fever,common cold and influenza.');

    console.log(" Accept-request-transaction has been submitted");
    // res.redirect("/login");
  } catch (error) {
    console.error(`Failed to submit Accept-request-transaction: ${error}`);
    process.exit(1);
  }
  // =========================================================================================
  // FABRIC PART ENDS
  // =========================================================================================


  
  
  //let encryptedContent = await fudai(fpath);
  
  //for nonce
  //just for test:
  //let N = await encDec.getDecryptNonce(await encDec.getEncryptNonce(req.user.publicKey, "122"));
  //console.log("Nonce Testing: " + N);

  let currentUser = await User.findOne({_id: req.user._id});
  const notifications = [...currentUser.reqs.notifications];
  const nonce = await findNonce(notifications, requesterId, requestedFileId);

  let againEncryptedNonce = await encDec.getEncryptNonce(requester.publicKey, await encDec.getDecryptNonce(nonce));

  //object already EXISTS......Dont push UPDATE::::STARTS
  const queryRequest = {
    'dcart.allRequests': {
      $elemMatch: {
        isAccept: 0,
        ownerId: req.user._id,
        requestedFileId: requestedFileId
      }
    }
  };
  console.log("Result for queryRequest: ", await User.findOne(queryRequest));
  await User.update(queryRequest, {$set: {
    'dcart.allRequests.$.isAccept': 2,
    'dcart.allRequests.$.fileContent': await fudai(fpath),
    'dcart.allRequests.$.nonceGet': againEncryptedNonce
  }} );
//object already EXISTS......Dont push UPDATE::::ENDS



//cmnt starts here for nonce addinf purpose
/*   const updatedRequestedItems = [...requester.dcart.allRequests];

  updatedRequestedItems.push({
    isAccept: 2,
    ownerId: req.user._id,
    requestedFileId: theFile._id,
    nonceSent: againEncryptedNonce, 
    fileContent: await fudai(fpath) //encryptedContent
  });
  const updatedAllReqs = {
    allRequests: updatedRequestedItems
  };
  //console.log(updatedAllReqs);
  requester.dcart = updatedAllReqs;
  await requester.save();
 */
//cmt ends here --- for nonce adding purpuse

  console.log(requester);

  //need to change

  /*
  let currentUser = await User.findOne({_id: req.user._id});
  const updatedNotificationItems = [...currentUser.reqs.notifications];
  let itemToBeSaved;
  for(let item of updatedNotificationItems){
    console.log('item -> ', item);
    if(item.requesterId.equals(requesterId) && item.requestedFileId.equals(requestedFileId)){
      item.decided = true;
      itemToBeSaved = item;
      break;
    }
  }
  */

  const query = {
    'reqs.notifications': {
      $elemMatch: {
        requesterId: requesterId,
        requestedFileId: requestedFileId
      }
    }
  };


  await User.updateOne(query, {$set: {
    'reqs.notifications.$.decided': true
  }} );

  console.log('Done with Grant Permission.');
  res.redirect('/user/notification');
}

exports.denyPermission = async (req, res, next) =>{
  const requesterId = req.params.requesterId;
  const requestedFileId = req.params.requestedFileId;

  const requester = await User.findOne({_id: requesterId});

  const updatedRequestedItems = [...requester.dcart.allRequests];

  //for nonce
  let currentUser = await User.findOne({_id: req.user._id});
  const notifications = [...currentUser.reqs.notifications];
  const nonce = await findNonce(notifications, requesterId, requestedFileId);

  let againEncryptedNonce = await encDec.getEncryptNonce(requester.publicKey, await encDec.getDecryptNonce(nonce));

  //object already EXISTS......Dont push UPDATE::::STARTS
  const queryRequest = {
    'dcart.allRequests': {
      $elemMatch: {
        isAccept: 0,
        ownerId: req.user._id,
        requestedFileId: requestedFileId
      }
    }
  };
  console.log("Result for queryRequest: ", await User.findOne(queryRequest));
  await User.update(queryRequest, {$set: {
    'dcart.allRequests.$.isAccept': 1,
    'dcart.allRequests.$.nonceGet': againEncryptedNonce
  }} );
  //object already EXISTS......Dont push UPDATE::::ENDS

  // For using Nonce - we dont push already added object - we update it -- start
  //console.log(updatedRequestedItems);
/*   updatedRequestedItems.push({
    isAccept: 1,
    ownerId: req.user._id,
    nonceSent: againEncryptedNonce
  });
  const updatedAllReqs = {
    allRequests: updatedRequestedItems
  };

  requester.dcart = updatedAllReqs;
  await requester.save(); */
  // For using Nonce - we dont push already added object - we update it -- end 

  console.log('\n', requester, '\n');

  //need to change
  const query = {
    'reqs.notifications': {
      $elemMatch: {
        requesterId: requesterId,
        requestedFileId: requestedFileId
      }
    }
  };
  await User.updateOne(query, {$set: {
    'reqs.notifications.$.decided': true
  }} );

  console.log('Done with Deny Permission.');
  res.redirect('/user/notification');
}

exports.getAllNotifications = (req, res, next) =>{
  User.findOne({_id: req.user._id})
  .then(user =>{
    const notifications = user.reqs.notifications;
    res.render("updown/notification",{
      pageTitle: "Notifications",
      path: "/user/notification",
      notifications: notifications
    })
  })
}

exports.getAllRequests = (req, res, next) =>{
  User.findOne({_id: req.user._id})
  .then(user =>{
    const requests = user.dcart.allRequests;
    res.render("updown/request",{
      pageTitle: "All Requests",
      path: "/user/request",
      requests: requests
    })
  })
}

function verifyNonce(noncePlain, plainNonce){
  let verify = false;
  if(JSON.stringify(noncePlain) == JSON.stringify(encDec.getKeywordHash(plainNonce))){
    verify = true;
  }
  return verify;
} 

exports.showDecryptedFileContent = async(req, res, next) =>{
  const content = req.params.fileContent;
  const noncePlain = req.params.noncePlain;
  const nonceGet = req.params.nonceGet;
  //console.log(fs.readFileSync('./public/files/rosalind.txt').toString());
  //console.log(nonceGet);

  let plainNonce = await encDec.getDecryptNonce(nonceGet);
  let verify = verifyNonce(noncePlain, plainNonce);
  console.log(verify);

  const plainData = await encDec.getDecryptFileContent(content);

  res.render("updown/showDecryptedContent",{
    pageTitle: "File Content",
    path: "/user/request",
    documents: plainData,
    verification: verify
  })
}