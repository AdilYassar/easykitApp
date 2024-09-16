import  Category  from "../../models/category.js";

export const getAllCategories = async (req, reply) => {
    try {
        const categories = await Category.find();
        return reply.status(200).send({
            message: "Categories fetched successfully",
            categories
        });
    } catch (error) {
        return reply.status(500).send({
            message: "An error occurred while fetching categories",
            error: error.message // sending the error message instead of the full error object
        });
    }
};
