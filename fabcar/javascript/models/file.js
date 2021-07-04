const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const fileSchema = new Schema({
    filePath: {
         type: String,
         required: true
    },
    store: {
        keywordsList: [
          {
            keyHashId: {type: Schema.Types.ObjectId, ref: 'Keyword-Index', required: true}
          }
        ]
    },
    keyword: {
        type: String,
        required: true
    },
    numberOfKeyword: {
        type: Number,
        required: true
    }
});


module.exports = mongoose.model('File', fileSchema);