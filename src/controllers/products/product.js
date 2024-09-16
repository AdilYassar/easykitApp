
import  Product  from "../../models/products.js";
export const getProductByCategoryId = async (req, reply) => {
    const { categoryId } = req.params;
    try {
        const products = await Product.find({ category: categoryId })
            .select("-category") // Exclude the 'category' field from the result
            .exec();

        return reply.status(200).send({
            message: "Products fetched successfully",
            products
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching products",
            error: error.message
        });
    }
};
