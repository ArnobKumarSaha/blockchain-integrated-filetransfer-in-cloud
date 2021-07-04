const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true
  },
  cart: {
    myFiles: [
      {
        myFileId: {type: Schema.Types.ObjectId, ref: 'File', required: true}
      }
    ]
  },
  reqs: {
    notifications: [
      {
        requesterId: {type: Schema.Types.ObjectId, required: true},
        requestedFileId: {type: Schema.Types.ObjectId, required: true},
        decided: {type: Boolean, required: true},
        nonce: {type: String, required: false},
      }
    ]
  },
  dcart: {
    allRequests: [
      {
        isAccept: {type: Number, required: true},
        ownerId: {type: Schema.Types.ObjectId, required: false},
        requestedFileId: {type: Schema.Types.ObjectId, required: false},
        fileContent: {type: String, required: false},
        noncePlain: {type: String, required: false}, //plain random number as string
        nonceGet: {type: String, required: false}
      }
    ]
  }
});


userSchema.methods.addToCart = function(fileId) {
  const updatedFileItems = [...this.cart.myFiles];

  updatedFileItems.push({
    myFileId: fileId
  });
  const updatedCart = {
    myFiles: updatedFileItems
  };
  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.deleteFromCart = function(fileId){
  const updatedCartItems = this.cart.myFiles.filter(item => {
    return item.myFileId != fileId;
  });
  this.cart.myFiles = updatedCartItems;
  return this.save();
}

module.exports = mongoose.model('User', userSchema);