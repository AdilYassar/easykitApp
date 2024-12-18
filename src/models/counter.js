import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sequence_value: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Counter = mongoose.model('Counter', counterSchema);
export default Counter;
