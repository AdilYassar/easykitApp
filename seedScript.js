import mongoose from "mongoose";
import { Customer, DeliveryPartner } from "./src/models/user.js";
import "dotenv/config"; // Ensure environment variables are loaded

const MONGO_URI = process.env.MONGO_URI; // Get the MongoDB URI from environment variables

const seedData = async () => {
  const customers = [
    { phone: '1234567890', role: 'Customer', isActivated: true },
    { phone: '0987654321', role: 'Customer', isActivated: true },
  ];

  const deliveryPartners = [
    { email: 'partner1@example.com', password: 'password1', role: 'DeliveryPartner' },
    { email: 'partner2@example.com', password: 'password2', role: 'DeliveryPartner' },
  ];

  try {
    // Connect to the database
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Use bulk operations to handle duplicate keys
    const bulkOperations = customers.map(customer => ({
      updateOne: {
        filter: { phone: customer.phone },
        update: customer,
        upsert: true
      }
    }));

    await Customer.bulkWrite(bulkOperations);

    // Repeat for DeliveryPartners if needed
    await DeliveryPartner.bulkWrite(deliveryPartners.map(partner => ({
      updateOne: {
        filter: { email: partner.email }, // Assuming email is unique
        update: partner,
        upsert: true
      }
    })));

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error("Error seeding database", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Execute the seedData function
seedData().then(() => process.exit());
