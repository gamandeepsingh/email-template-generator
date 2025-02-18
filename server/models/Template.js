const mongoose = require('mongoose');
const { Schema } = mongoose;

const templateSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  body: {
    type: String,
    required: [true, 'Body is required']
  },
  folder: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Template', templateSchema);
