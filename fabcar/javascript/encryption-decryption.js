const crypto =  require("crypto")
const fs = require('fs');

// first we need two keys here - index key and private key. Private key will
// be generated only once and then somehow store it

indexKey = "9uZlGXa0o64kdbQ6Gb96qw=="
privateKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3"

//here we are search only by keywords section of a file.
// suppose a keyword value for a file is this -

//keyword = "office management file"

// for index of keyword in database table - we store the HMAC value
// Like this

//keyword_hash = crypto.createHmac('sha256', indexKey)
//                        .update(keyword)
//                        .digest('hex')

// we store this hash value in keyword_index column in database table

//Now for file and other thing storation with encryption
//skip file for this tym - will surely add later

//suppose we will store keyword and username as encrypted
//for this

//username = "getThisFromSignUpForm"

// Now we use AES for this

const algorithm = 'aes-256-cbc';
//const key = crypto.randomBytes(32);
//const iv = crypto.randomBytes(16);

//let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);

//let encryptedUserName = cipher.update(username);
//let encryptedKeyword = cipher.update(keyword);

// Now store it to the database
// works almost same for file

exports.getKeywordHash = (keyword) => {
    keyword_hash = crypto.createHmac('sha256', indexKey)
                        .update(keyword)
                        .digest('hex')
    return keyword_hash
  };

exports.getEncryptionKeyword = (keyword) => {
  const iv = crypto.randomBytes(16);
  var ivstring = iv.toString('hex').slice(0, 16);

  let cipher = crypto.createCipheriv(algorithm, privateKey, ivstring);

  let encryptedKeyword = cipher.update(keyword, 'utf8', 'hex');
  encryptedKeyword += cipher.final('hex');

  //let encryptedKeywordIV = hex_to_ascii(ivstring/* iv.toString('hex') */).concat("//").concat(hex_to_ascii(encryptedKeyword));
  let encryptedKeywordIV = ivstring.concat("//").concat(encryptedKeyword);

  return encryptedKeywordIV;
};

exports.getDecryptionKeyword = (keyword) => {
  let splitString  = keyword.split("//");
  let extractIV = splitString[0];
  let extractKeyword = splitString[1];

  let decipher = crypto.createDecipheriv(algorithm, privateKey, extractIV);

  let decryptedKeyword = decipher.update(extractKeyword, 'hex', 'utf-8')
  decryptedKeyword += decipher.final('utf8');

  return decryptedKeyword;
};

exports.getEncryptFile = (filePath) => {
  const iv = crypto.randomBytes(16);
  var ivstring = iv.toString('hex').slice(0, 16);

  let cipher = crypto.createCipheriv(algorithm, privateKey, ivstring);

  fs.readFile(filePath, "utf-8", (err, data) => {
    //console.log(data);
    encryptdata = cipher.update(data, 'utf8', 'hex');
    encryptdata += cipher.final('hex');

    let encryptedDataIV = ivstring.concat("//").concat(encryptdata);
    fs.writeFile(filePath, encryptedDataIV, (err) => {
      if (err) console.log(err);
      console.log(encryptedDataIV);
      console.log("Successfully Encrypted.");
    });
  });
};

exports.getDecryptFile = (filePath) => {

  fs.readFile(filePath, "binary", (err, data) => {
    let splitData  = data.split("//");
    let extractIV = splitData[0];
    let extractFileData = splitData[1];

    const decipher = crypto.createDecipheriv(algorithm, privateKey, extractIV);

    let decrypted = decipher.update(extractFileData, 'hex', 'utf-8')
    decrypted += decipher.final('utf8');
    //decoded = decipher.update(data, 'binary', 'binary');
    //decoded += decipher.final('binary');
    //var plaintext = new Buffer(decrypted, 'binary').toString('utf8');
    fs.writeFile(filePath, decrypted , (err) => {
      if (err) console.log(err);
      console.log(decrypted);
      console.log("Successfully decrypted.");
    });
  });


};

function hex_to_ascii(str1)
 {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
 }

 function ascii_to_hex(str)
 {
 var arr1 = [];
 for (var n = 0, l = str.length; n < l; n ++) 
    {
   var hex = Number(str.charCodeAt(n)).toString(16);
   arr1.push(hex);
  }
 return arr1.join('');
  }

