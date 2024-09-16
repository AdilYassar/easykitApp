import { getAllCategories } from "../controllers/products/category.js";
import { getProductByCategoryId } from "../controllers/products/product.js";

export const categoryRoutes = async (fastify, options) => {
    fastify.get("/categories", getAllCategories);
};

export const productRoutes = async (fastify, options) => {
    fastify.get("/products/:categoryId", getProductByCategoryId);
};
