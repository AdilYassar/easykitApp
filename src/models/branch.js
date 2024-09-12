import mongoose from "mongoose";
import { DeliveryPartner } from "./user.js"; // Ensure the import path is correct

// Define the branch schema
const branchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    liveLocation: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    address: { type: String },
    DeliveryPartner: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryPartner",
        }
    ]
});

export const Branch = mongoose.model("Branch", branchSchema); // Use named export
