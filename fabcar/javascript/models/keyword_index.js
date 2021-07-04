const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const indexSchema = new Schema({
  index_hash: {
    type: String,
    required: true
  },
  whereItIs: {
    myFiles: [
      {
        fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true }
      }
    ]
  }
});

module.exports = mongoose.model('Keyword-Index', indexSchema);