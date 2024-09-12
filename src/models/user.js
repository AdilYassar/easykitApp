import mongoose from 'mongoose';
//import Branch from './branch.js'; 

// Base user schema for reuse in admin, customer, delivery partner
const userschema = new mongoose.Schema({
    name: { type: String },
    role: {
        type: String,
        enum: ['Customer', 'Admin', 'DeliveryPartner'],
        required: true
    },
    isActivated: { type: Boolean, default: false }
});

// Customer schema
const customerSchema = new mongoose.Schema({
    ...userschema.obj,
    phone: { type: Number, required: true, unique: true },
    role: { type: String, enum: ['Customer'], default: 'Customer' },
    liveLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    address: { type: String }
});

// Delivery Partner schema
const deliveryPartnerSchema = new mongoose.Schema({
    ...userschema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: Number, required: true, unique: true },
    role: { type: String, enum: ['DeliveryPartner'], default: 'DeliveryPartner' },
    liveLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    address: { type: String },
    // branch: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Branch' // Ensure 'Branch' model is properly defined
    // }
});

// Admin schema
const adminSchema = new mongoose.Schema({
    ...userschema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin'], default: 'Admin' }
});

export const Customer = mongoose.model('Customer', customerSchema);
export const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
export const Admin = mongoose.model('Admin', adminSchema);