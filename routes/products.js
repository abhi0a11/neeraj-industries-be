import express from "express";
import {
  add,
  fetchProducts,
  fetchAllProducts,
  removeProducts,
  UpdateProducts,
} from "../controllers/products.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAuthenticated, add);
router.get("/allproducts/:category", isAuthenticated, fetchAllProducts);
router.get("/products/:id", isAuthenticated, fetchProducts);
router.delete("/remove/:name", isAuthenticated, removeProducts);
router.put("/update/:name", isAuthenticated, UpdateProducts);

export default router;
