import { Customer, DeliveryPartner } from "../../models/user.js";
import { Branch } from "../../models/branch.js";
import Order from "../../models/order.js";
import mongoose from "mongoose";

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new order
export const createOrder = async (req, reply) => {
    try {
        const { userId } = req.user;
        const { items, branch, totalPrice } = req.body;

        // Validate input
        if (!items || items.length === 0) {
            return reply.status(400).send({ message: "Items are required to create an order" });
        }
        if (!branch || !isValidObjectId(branch)) {
            return reply.status(400).send({ message: "Valid branch ID is required" });
        }
        if (!totalPrice || totalPrice <= 0) {
            return reply.status(400).send({ message: "Total price must be a positive number" });
        }

        const customerData = await Customer.findById(userId);
        const branchData = await Branch.findById(branch);

        if (!customerData) {
            return reply.status(404).send({ message: "Customer not found" });
        }

        if (!branchData) {
            return reply.status(404).send({ message: "Branch not found" });
        }

        const newOrder = new Order({
            customer: userId,
            items: items.map((item) => ({
                id: item.id,
                item: item.item,
                count: item.count,
            })),
            branch,
            totalPrice,
            deliveryLocation: {
                latitude: customerData.liveLocation.latitude,
                longitude: customerData.liveLocation.longitude,
                address: customerData.address || "No address found",
            },
            pickupLocation: {
                latitude: branchData.location.latitude,
                longitude: branchData.location.longitude,
                address: branchData.address || "No address found",
            },
        });

        const savedOrder = await newOrder.save();
        return reply.status(201).send(savedOrder);
    } catch (error) {
        console.error("Error creating order:", error);
        return reply.status(500).send({
            message: "Failed to create your order at the moment",
            error: error.message,
        });
    }
};

// Confirm an order
export const confirmOrder = async (req, reply) => {
    try {
        const { orderId } = req.params;
        const { userId } = req.user;
        const { deliveryPersonLocation } = req.body;

        // Validate orderId
        if (!isValidObjectId(orderId)) {
            return reply.status(400).send({ message: "Invalid order ID" });
        }

        const deliveryPerson = await DeliveryPartner.findById(userId);
        if (!deliveryPerson) {
            return reply.status(404).send({ message: "Delivery partner not found" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return reply.status(404).send({ message: "Order not found" });
        }

        if (order.status !== "available") {
            return reply.status(400).send({ message: "Order is not available" });
        }

        order.status = "confirmed";
        order.deliveryPartner = userId;
        order.deliveryPersonLocation = {
            latitude: deliveryPersonLocation?.latitude,
            longitude: deliveryPersonLocation?.longitude,
            address: deliveryPersonLocation?.address || "",
        };

        await order.save();
        return reply.send(order);
    } catch (error) {
        console.error("Error confirming order:", error);
        return reply.status(500).send({ message: "Failed to confirm order", error: error.message });
    }
};

// Update order status
export const updateOrderStatus = async (req, reply) => {
    try {
        const { orderId } = req.params;
        const { status, deliveryPersonLocation } = req.body;
        const { userId } = req.user;

        // Validate orderId
        if (!isValidObjectId(orderId)) {
            return reply.status(400).send({ message: "Invalid order ID" });
        }

        const deliveryPerson = await DeliveryPartner.findById(userId);
        if (!deliveryPerson) {
            return reply.status(404).send({ message: "Delivery person not found" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return reply.status(404).send({ message: "Order not found" });
        }

        if (["cancelled", "delivered"].includes(order.status)) {
            return reply.status(400).send({ message: "Order cannot be updated" });
        }

        if (order.deliveryPartner.toString() !== userId) {
            return reply.status(403).send({ message: "Unauthorized" });
        }

        // Status transition validation
        const validStatusUpdates = {
            "available": ["confirmed", "cancelled"],
            "confirmed": ["arriving", "cancelled"],
            "arriving": ["delivered", "cancelled"],
        };

        if (!validStatusUpdates[order.status]?.includes(status)) {
            return reply.status(400).send({ message: `Invalid status transition from ${order.status} to ${status}` });
        }

        order.status = status;
        order.deliveryPersonLocation = deliveryPersonLocation;

        await order.save();
        return reply.send(order);
    } catch (error) {
        console.error("Error updating order status:", error);
        return reply.status(500).send({ message: "Failed to update order", error: error.message });
    }
};

// Get orders with optional filters (status, customerId, deliveryPartnerId, branchId)
export const getOrders = async (req, reply) => {
    try {
        const { status, customerId, deliveryPartnerId, branchId } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }
        if (customerId && isValidObjectId(customerId)) {
            query.customer = customerId;
        }
        if (deliveryPartnerId && isValidObjectId(deliveryPartnerId)) {
            query.deliveryPartner = deliveryPartnerId;
        }
        if (branchId && isValidObjectId(branchId)) {
            query.branch = branchId;
        }

        const limit = parseInt(req.query.limit, 10) || 10;
        const page = parseInt(req.query.page, 10) || 1;

        const orders = await Order.find(query)
            .populate("customer branch items.item deliveryPartner")
            .skip((page - 1) * limit)
            .limit(limit);

        return reply.send(orders);
    } catch (error) {
        console.error("Error retrieving orders:", error);
        return reply.status(500).send({ message: "Failed to retrieve orders", error: error.message });
    }
};

// Get a single order by ID
export const getOrderById = async (req, reply) => {
    try {
        const { orderId } = req.params;

        // Validate orderId
        if (!isValidObjectId(orderId)) {
            return reply.status(400).send({ message: "Invalid order ID" });
        }

        const order = await Order.findById(orderId).populate(
            "customer branch items.item deliveryPartner"
        );

        if (!order) {
            return reply.status(404).send({ message: "Order not found" });
        }

        return reply.send(order);
    } catch (error) {
        console.error("Error retrieving order by ID:", error);
        return reply.status(500).send({ message: "Failed to retrieve order", error: error.message });
    }
};
