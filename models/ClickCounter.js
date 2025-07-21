import mongoose from 'mongoose';

const clickCounterSchema = new mongoose.Schema({
  buttonId: {
    type: String,
    required: true,
    unique: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const ClickCounter = mongoose.model('ClickCounter', clickCounterSchema);

export default ClickCounter;
