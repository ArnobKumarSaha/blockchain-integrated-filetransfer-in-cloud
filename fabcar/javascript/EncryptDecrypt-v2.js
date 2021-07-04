const crypto =  require("crypto")
const fs = require('fs');

// Including generateKeyPair from crypto module
const { generateKeyPair } = require('crypto');

// first we need two keys here - index key and private key. Private key will
// be generated only once and then somehow store it

let indexKey = "9uZlGXa0o64kdbQ6Gb96qw=="

let publicKeyPath = './keys/publicKey.key'
let privateKeyPath = './keys/privateKey.key'


// Calling generateKeyPair() method
// with its parameters
exports.generateKeys = () => {

  return new Promise( (resolve, reject) => {

    generateKeyPair('rsa', {
      modulusLength: 2048, // options
      publicExponent: 0x10101,
      publicKeyEncoding: {
         type: 'pkcs1',
         format: 'pem'
      },
      privateKeyEncoding: {
         type: 'pkcs8', 
         format: 'pem',
         cipher: 'aes-192-cbc',
         passphrase: 'sse'
      }
   }, (err, PublicKey, PrivateKey) => { // Callback function
      if(!err)
      {
          fs.writeFile(publicKeyPath, PublicKey.toString('hex'), (er) => {
            if (er) console.log(er);
            console.log("Key Successfully Saved.");
          });
  
          fs.writeFile(privateKeyPath, PrivateKey.toString('hex'), (er) => {
            if (er) console.log(er);
            console.log("Key Successfully Saved.");
          });
          resolve();
  
      }
      else
      {
         // Prints error if any
         console.log("Errr is: ", err);
         reject();
      }
   });

  })

};


exports.getKeywordHash = (keyword) => {
    let keyword_hash = crypto.createHmac('sha256', indexKey)
                        .update(keyword)
                        .digest('hex')
    return keyword_hash
  };

exports.getEncryptionKeyword = (pbKey, keyword) => {      
  //Also pass publicKey.key the file here as a parameter
  //let pbKey = fs.readFileSync('./keys/publicKey.key');

  const encryptedKeyword = crypto.publicEncrypt(
    {
      key: pbKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    
    Buffer.from(keyword)
  )

  //console.log("encypted data: ", encryptedKeyword.toString('hex'));     
  return encryptedKeyword.toString('hex');
}


exports.getDecryptionKeyword = (encryptedKeyword) => {
  let prKey = fs.readFileSync('./keys/privateKey.key');

  const keyword = crypto.privateDecrypt(
    {
      key: prKey,
      passphrase: 'sse',
      padding: crypto.constants.RSA_PKCS8_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encryptedKeyword, 'hex')
  )
  
  //console.log("decrypted data: ", keyword.toString());
  return keyword.toString();
};

exports.getEncryptFile = (pbKey,  filePath) => {     
  //Store publicKey.key as key file
  //Also pass publicKey.key the file here as a parameter
  //let pbKey = fs.readFileSync('./keys/publicKey.key');

  fs.readFile(filePath, "utf-8", (err, data) => {

    const encryptedData = crypto.publicEncrypt(
      {
        key: pbKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      
      Buffer.from(data)
    )

    fs.writeFile(filePath, encryptedData, (error) => {
      if (error) console.log(error);
      //console.log(encryptedData);
      console.log("File Successfully Encrypted."); 
    });
  });
};

//It is for encrypting owner's file data with requester's public key -also output is in HEX
exports.getEncryptFileV2 = (pbKey, filePath ) => {  
  return new Promise( (resolve) => {

    //Store publicKey.key as key file
    //Also pass publicKey.key the file here as a parameter
    //let pbKey = fs.readFileSync('./keys/publicKey.key');
    let againEncryptedfileP = './temp-file/againEncryptFile.txt';
    console.log("Inside encryptFileV2: ");    
    console.log("file data: ", fs.readFileSync(filePath).toString('hex'));
    fs.readFile(filePath, "utf-8" , (err, data) => {    
      


      const encryptedData = crypto.publicEncrypt(
        {
          key: pbKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        
        Buffer.from(data)
      )

      fs.writeFile(againEncryptedfileP, encryptedData.toString('hex'), (error) => {
        if (error) console.log(error);
        console.log("File Successfully Encrypted."); 
        resolve(againEncryptedfileP); 
      });
      //resolve(againEncryptedfileP); 
    });
  });
};

exports.getDecryptFile = (filePath) => {
  return new Promise( (resolve) => {
    
    const plainDataFileP = './temp-file/decryptedFile.txt';
    //let prKey = fs.readFileSync('./keys/privateKey.key'); //toString??
    fs.readFile('./keys/privateKey.key', 'utf8', (err, prKey)=> {
    
      console.log('In the getDecryptFile(). ');
      console.log(filePath);

      const tempPath = './public/files/'+ filePath;

      fs.readFile(tempPath, (err, encryptedData) => {
      
        const decryptedData = crypto.privateDecrypt(
          {
            key: prKey,
            passphrase: 'sse',
            padding: crypto.constants.RSA_PKCS8_OAEP_PADDING,
            oaepHash: "sha256",
          },
          encryptedData
        )
          fs.writeFile(plainDataFileP, decryptedData , (error) => {
          console.log('In the getDecryptFile(). writeFile ');      
          if (error) console.log(error);
          console.log(decryptedData);
          console.log("Successfully decrypted.");
          resolve(plainDataFileP);
        }); 
        //resolve(plainDataFileP);
      });
    });  
  });
    //return plainDataFilePath;
};

exports.getDecryptFileContent = (fileContent) => {
  return new Promise((resolve)=> {
    console.log("File Content: "+ fileContent);
    fs.readFile('./keys/privateKey.key', 'utf8', (err, prKey) => {
      console.log('prKey = ', prKey, typeof(prKey));

      const plainData = crypto.privateDecrypt(
        {
          key: prKey,
          passphrase: 'sse',
          padding: crypto.constants.RSA_PKCS8_OAEP_PADDING,
          oaepHash: "sha256",
        },
        Buffer.from(fileContent,'hex')
      )
      
      //console.log("decrypted data: ", keyword.toString());
      resolve(plainData.toString() );
  })
  });
}; 


exports.generateNonce = () => {
  return new Promise((resolve)=> {

    crypto.randomInt(0, 1000000, (err, n) => {
      if (err) throw err;
  
      resolve(n.toString());
    })
  });
}; 

exports.getEncryptNonce = (pbKey, plainNonce) => {  
  return new Promise( (resolve) => {
    console.log("At Nonce Encrypt: plainNonce: " + plainNonce +" tpy: "+ typeof(plainNonce));

    const encryptedNonce = crypto.publicEncrypt(
      {
        key: pbKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      
      Buffer.from(plainNonce)
    )
    console.log("At Nonce Encrypt: encryptNonce: ", encryptedNonce.toString('hex') + " typ: " + typeof(encryptedNonce.toString('hex')));
    resolve(encryptedNonce.toString('hex')); 
  });
};

exports.getDecryptNonce = (encryptedNonce) => {
  return new Promise( (resolve) => {
    console.log("At Nonce decrypt: encryptedNonce: " + encryptedNonce +" tpy: "+ typeof(encryptedNonce));
    console.log("At Nonce decrypt: encryptedNonce: buffer convert " + Buffer.from(encryptedNonce, 'hex') +" tpy: "+ typeof(Buffer.from(encryptedNonce, 'hex')));

    fs.readFile('./keys/privateKey.key', 'utf8', (err, prKey)=> {
      
      const decryptedNonce = crypto.privateDecrypt(
        {
          key: prKey,
          passphrase: 'sse',
          padding: crypto.constants.RSA_PKCS8_OAEP_PADDING,
          oaepHash: "sha256",
        },
        Buffer.from(encryptedNonce, 'hex') //should use buffer???
      )
      console.log("At Nonce decrypt: decryptedNonce: " + decryptedNonce.toString() +" tpy: "+ typeof(decryptedNonce.toString()));
      resolve(decryptedNonce.toString());
    });  
  });   
}