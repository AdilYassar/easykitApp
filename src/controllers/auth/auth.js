import { Customer, DeliveryPartner } from "../../models/user.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../../middleware/auth.js";


// Generate access and refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }  // Typically, refresh tokens have a longer expiry
  );

  // Logging the accessToken for debugging purposes
  console.log(`Generated Access Token: ${accessToken}`);

  return { accessToken, refreshToken };
};

// Customer Login or Registration
export const loginCustomer = async (req, reply) => {
  try {
    const { phone } = req.body;
    let customer = await Customer.findOne({ phone });

    if (!customer) {
      // Create a new customer if none exists
      customer = new Customer({
        phone,
        role: "Customer",
        isActivated: true,
      });
      await customer.save();
    }

    const { accessToken, refreshToken } = generateTokens(customer);
    return reply.send({
      message: "Login successful",
      accessToken,
      refreshToken,
      customer,
    });
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};
export const loginDeliveryPartner = async (req, reply) => {
  try {
    console.log('Request body:', req.body);
    const { email, password } = req.body;
    const deliveryPartner = await DeliveryPartner.findOne({ email });

    if (!deliveryPartner) {
      console.error('Delivery Partner not found');
      return reply.status(404).send({ message: "Delivery Partner not found" });
    }

    // Check if the provided password matches
    const isMatch = password === deliveryPartner.password;
    if (!isMatch) {
      console.error('Invalid credentials');
      return reply.status(400).send({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(deliveryPartner);
    return reply.send({
      message: "Login successful",
      accessToken,
      refreshToken,
      deliveryPartner,
    });
  } catch (error) {
    console.error('Error in loginDeliveryPartner:', error);
    return reply.status(500).send({ message: "An error occurred", error });
  }
};

// Refresh Token
export const refreshToken = async (req, reply) => {
  const { refreshToken: providedRefreshToken } = req.body;

  if (!providedRefreshToken) {
    return reply.status(401).send({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(providedRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    let user;
    if (decoded.role === "Customer") {
      user = await Customer.findById(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(decoded.userId);
    } else {
      return reply.status(403).send({ message: "Invalid role" });
    }

    if (!user) {
      return reply.status(403).send({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    return reply.send({
      message: "Token refreshed",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return reply.status(403).send({ message: "Invalid refresh token", error });
  }
};

// Fetch User Details
export const fetchUser = async (req, reply) => {
  try {
    const { userId, role } = req.user; // assuming `req.user` has been populated with JWT data

    let user;
    if (role === "Customer") {
      user = await Customer.findById(userId);
    } else if (role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else {
      return reply.status(403).send({ message: "Invalid role" });
    }

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    return reply.send({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};

