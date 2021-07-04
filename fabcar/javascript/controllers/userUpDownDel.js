const User = require('../models/user');
const KeywordIndex = require('../models/keyword_index');
const File = require('../models/file');

const path = require('path');
const fs = require('fs');
const encDec = require('../EncryptDecrypt-v2');
const { ObjectID } = require('bson');

const init = require('../util');

exports.getFrontPage = (req, res, next) => {
  res.render("users", {
    pageTitle: "User",
    path: "/user",
    editing: false,
  });
};



// About Upload file ..............................................................

exports.getUploadFile = (req, res, next) =>{
  res.render("updown/upload", {
    pageTitle: "Upload a file",
    path: "/user/upload",
    errorMessage: ""
  });
}

var matchCount = 0;
var bestMatchFiles = {};

exports.postUploadFile = async (req, res, next) =>{
  const name = req.body.name;
  const keyword = req.body.keyword;
  const file = req.file;
  let tempPath = file.path;


  // encrypt the file, store it to the same path
  encDec.getEncryptFile(req.user.publicKey, tempPath);
  tempPath = file.path.split('/')[2];
  // this is to store in the user.cart.myFiles
  console.log("Here in PostUplod public key of owner: " + req.user.publicKey);
  let encryptedKeyword = encDec.getEncryptionKeyword(req.user.publicKey, keyword);
  let space_separated_keywords = keyword.split(' ');



  const numberOfKeyword = space_separated_keywords.length;
  let HashedKeywordSet = [];
  matchCount = 0;
  // In this for loop, I have just counted the files-frequency (those are related with keywords) in bestMatchFiles container.
  for(let tmpKey of space_separated_keywords){
    const keyHash = encDec.getKeywordHash(tmpKey);
    HashedKeywordSet.push(keyHash);
    const keyDoc = await KeywordIndex.findOne({index_hash:keyHash});
    if(keyDoc){
      // which files contain this key ..
      let myfiles = [...keyDoc.whereItIs.myFiles];
      for(var fl of myfiles){
        var f = fl.filePath;
        if(bestMatchFiles[f]>=1) {bestMatchFiles[f]++;}
        else {bestMatchFiles[f]=1;}
      }
    }
  }


  // which file has most common keyword set with the currently uploaded file.
  for (let [key,value] of Object.entries(bestMatchFiles) ){
    //console.log('printing :', key, value);
    matchCount = Math.max(value, matchCount);
  }
  let decide = false;
  for (let [key,value] of Object.entries(bestMatchFiles) ){
    if(matchCount == value){
      const matchedFile = await File.findOne({filePath: key});
      if(matchedFile &&  matchedFile.numberOfKeyword == HashedKeywordSet.length){
        decide = true;
      }
    }
  }


  if(matchCount == HashedKeywordSet.length && decide){
    //keyword string fully matched
    return res.status(422).render('updown/upload', {
      path: '/upload',
      pageTitle: 'Upload a file',
      errorMessage: "Keyword fully Matched!!!",
      oldInput: {
        name: name,
        keyword: keyword,
        file: file
      }
    });
  }



  // Code is here ... That means all keywords didn't matched.
  // In this for loop, Just saving or updating the KewordIndex table.
  //*****************************Upper part is about checking, Lower part is about saving/updating*******************************


  // Part 1:  Just create a new File
  let newSavedFile = new File({
    filePath: tempPath,
    keyword: encryptedKeyword,
    numberOfKeyword: numberOfKeyword,
    store: {
      keywordsList: []
    }
  });
  newSavedFile = await newSavedFile.save();
  //console.log("\n newSavedFile1 = ", newSavedFile,"\n");




  // Part 2: In this for loop, Just saving or updating the KewordIndex table.
  let keyList = []

  for(let keyHash of HashedKeywordSet){
    //const keyDoc = await KeywordIndex.findOne({index_hash: keyHash});
    let keyDoc = await KeywordIndex.findOne({index_hash: keyHash});
    if(keyDoc){
      // If the index is already there. Just update the keyDoc.whereItIs.myFiles array.
      let newMyFiles = [...keyDoc.whereItIs.myFiles];
      newMyFiles.push({
        //filePath: tempPath
        fileId: newSavedFile._id
      });

      const updatedList = {
        myFiles: newMyFiles
      };
      keyDoc.whereItIs = updatedList;
      keyDoc.save();
    }
    else{
      // If the index is not in the db, then create a new one.
      let newKey = new KeywordIndex({
        index_hash: keyHash,
        whereItIs: {
          //myFiles: [ {filePath: tempPath} ]
          myFiles: [ {fileId: newSavedFile._id} ]
        }
      });
      //newKey.save();
      newKey = await newKey.save();
      keyDoc = newKey;
    }
    keyList.push({keyHashId: keyDoc._id});
  }
  //console.log("\n keyList = ", keyList, "\n");



  // Part 3: Updating the Files's keyword list.
  const updatedStore = {
    keywordsList: keyList
  };
  //console.log("updatedStore = ", updatedStore);

  const toCheckList = [...newSavedFile.store.keywordsList];

  //console.log("ToCheckList 1 = ", toCheckList);

  for(let obj of keyList){
    toCheckList.push(obj);
  }

  //console.log("ToCheckList 2 = ", toCheckList);

  //console.log("newSavedFile.store = ", newSavedFile.store);
  newSavedFile.store = updatedStore;
  //console.log("newSavedFile.store = ", newSavedFile.store);
  //console.log("\n newSavedFile2 = ", newSavedFile,"\n");

  newSavedFile = await newSavedFile.save();
  //console.log("\n newSavedFile3 = ", newSavedFile,"\n");


  // =========================================================================================
  // FABRIC PART STARTS
  // =========================================================================================
  try {
    var contract = (await init).getInput();

    var ct = contract.contact;
    var way = contract.gateway;
    // Submit the specified transaction
    await ct.submitTransaction(
        "FileUpload",   //must declare in capital letter in both js and Go
        newSavedFile._id,
        name,
        tempPath,
        encryptedKeyword,
        numberOfKeyword
    );
    //await ct.submitTransaction('CreateMed', 'MED12', 'Beximco', 'NapaVX', 'fever,common cold and influenza.');

    console.log("FileUplaod Transaction has been submitted");
    // res.redirect("/login");
  } catch (error) {
    console.error(`Failed to submit FileUpload transaction: ${error}`);
    process.exit(1);
  }
  // =========================================================================================
  // FABRIC PART ENDS
  // =========================================================================================


  
// Part 4: Updating to  User table.
  return req.user.addToCart(newSavedFile._id)
    .then(result=>{
      res.redirect('/user/uploaded');
    });

};

// About Download file ..................................................................

exports.getDownloadFile = (req, res, next) =>{
  res.render("updown/download", {
    pageTitle: "Download a file",
    path: "/user/download"
  });
}

// It finds out the entries from DB those are matched with searched keywords.
// Then finds out the file path, And count the frequencies.
var freqTable = {};
async function calculate1(space_separated_keywords){

  freqTable = {};

  for(let tmpKey of space_separated_keywords){
    const keyHash = await encDec.getKeywordHash(tmpKey);

    const keyDoc = await KeywordIndex.findOne({index_hash: keyHash});
    if(keyDoc){
      let myfiles = [...keyDoc.whereItIs.myFiles];

      for(let fl of myfiles){

        let temp = await File.findOne({_id: fl.fileId});
        let fp = temp.filePath; 
        if(freqTable[fp]==1) {freqTable[fp]++;}
        else { freqTable[fp] = 1;}
      }
      
    }
    else{
      console.log("Inside else block!");
    }
  }
}

let sortable = [];
let documents = [];
// It makes the array sorted in descending order. To show more matched files before the less matched files.
function calculate2(){
  sortable = [];
  documents = [];
  return new Promise( (resolve, reject) =>{
    
    for (var file in freqTable) {
        sortable.push([file, freqTable[file]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });

    resolve(sortable);
  });
}

async function intermediateFunction(space_separated_keywords){
  console.log("At the start of intermediate function.");
  await calculate1(space_separated_keywords);
  await calculate2();

  console.log('sortable = ', sortable);

  for(let doc of sortable){
    //const userDoc = await User.findOne({ "cart.myFiles.filePath": doc[0]},  {name: 1} );
    const fileDoc = await File.findOne({ filePath: doc[0]});
    console.log(fileDoc._id);
    const userDoc = await User.findOne({ "cart.myFiles.myFileId": fileDoc._id} );
    console.log("useDoc = ", userDoc);
    doc.push(userDoc._id);
    documents.push(doc);
  }
  return;
}

exports.postDownloadFile = async (req, res, next) =>{

  const keyword = req.body.keyword;

  let space_separated_keywords = keyword.split(' ');

  await intermediateFunction(space_separated_keywords);

  res.render('updown/searchResult', {
    pageTitle: "Search result",
    path: "/user/searchResult",
    docs: documents,
    errorMessage: ""
  });
}


// Rendering Uploaded and downloaded files...................................................

exports.getUploadedFiles = (req, res, next) =>{
  User.findOne({_id: req.user._id})
  .then(user =>{
    const files = user.cart.myFiles;
    res.render("updown/uploaded",{
      pageTitle: "Uploaded Files",
      path: "/user/uploaded",
      files: files
    })
  })
}
exports.getDownloadedFiles = (req, res, next) =>{
  res.render("updown/downloaded", {
    pageTitle: "Downloaded Files",
    path: "/user/downloaded"
  });
}




//Delete part........................................................

exports.deleteFile = async (req, res, next) => {
  const fileId = req.params.myFileId;

  const theFile = await File.findOne({_id: fileId});

  //Going through the keyword list of this file, and update them accordingly.
  for(let hashId of theFile.store.keywordsList){
    //console.log("_id & hashId from file.store are = ", hashId);
    let keyHash = await KeywordIndex.findOne({_id: hashId.keyHashId});

    //console.log("\n keyHash = ", keyHash, "\n");

    let updatedList = [];
    for(let something of keyHash.whereItIs.myFiles){
      if(something.fileId.equals(theFile._id) ){
        //console.log('\n If statement\n');
      }
      else{
        updatedList.push(something);
      }
    }
    console.log(updatedList);
    const updatedWhereItIs = {
      myFiles: updatedList
    }
    keyHash.whereItIs = updatedWhereItIs;
    keyHash = await keyHash.save();

    if(updatedList.length == 0){
      await KeywordIndex.deleteOne({_id: hashId.keyHashId});
    }
  }

  // Now, delete from fileSystem and then the file itself
  fs.unlinkSync(path.resolve('./') + '/public/files/' + theFile.filePath);

  await File.deleteOne({_id: theFile._id});
  console.log('successfully deleted !');

  return req.user.deleteFromCart(fileId)
  .then(result =>{
    res.redirect('/user/uploaded');
  });
}


exports.getDocuments = function(){
  return documents;
}