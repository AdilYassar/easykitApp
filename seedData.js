import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  role: { type: String, required: true },
  isActivated: { type: Boolean, required: true },
});

const deliveryPartnerSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  // Ensure that phone is not a required field here if not needed
  phone: { type: String } // or remove this line if not needed
});

export const Customer = mongoose.model('Customer', customerSchema);
export const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
