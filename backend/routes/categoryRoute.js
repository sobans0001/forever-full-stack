import express from "express";
import {
    getCategories,
    addCategory,
    deleteCategory,
    addSubCategory,
    deleteSubCategory,
    getCategoryAndSubCategoryNames,
    getSubCategoryType
} from "../controllers/categoryController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/list", getCategories);
router.post("/add", adminAuth, addCategory);
router.post("/delete", adminAuth, deleteCategory);
router.post("/add-sub", adminAuth, addSubCategory);
router.post("/delete-sub", adminAuth, deleteSubCategory);
router.get("/names", getCategoryAndSubCategoryNames);
router.get("/sub-type", getSubCategoryType);

export default router;
