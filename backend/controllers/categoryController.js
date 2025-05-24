import categoryModel from "../models/categoryModel.js";

// Get all categories
export const getCategories = async (req, res) => {
    try {
        // subCategories now contains objects with name and type
        const categories = await categoryModel.find({});
        res.json({ success: true, categories });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add a new category
export const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.json({ success: false, message: "Category name required" });
        const exists = await categoryModel.findOne({ name });
        if (exists) return res.json({ success: false, message: "Category already exists" });
        const category = new categoryModel({ name, subCategories: [] });
        await category.save();
        res.json({ success: true, category });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete a category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        await categoryModel.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add a subcategory (expects subCategory: { name, type })
export const addSubCategory = async (req, res) => {
    try {
        const { categoryId, subCategory } = req.body;
        if (!categoryId || !subCategory || !subCategory.name || !subCategory.type)
            return res.json({ success: false, message: "Missing subcategory name or type" });
        const category = await categoryModel.findById(categoryId);
        if (!category) return res.json({ success: false, message: "Category not found" });
        if (category.subCategories.some(sc => sc.name === subCategory.name && sc.type === subCategory.type)) {
            return res.json({ success: false, message: "Subcategory already exists" });
        }
        category.subCategories.push({ name: subCategory.name, type: subCategory.type });
        await category.save();
        res.json({ success: true, category });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete a subcategory (expects subCategory: { name, type })
export const deleteSubCategory = async (req, res) => {
    try {
        const { categoryId, subCategory } = req.body;
        if (!categoryId || !subCategory || !subCategory.name || !subCategory.type)
            return res.json({ success: false, message: "Missing subcategory name or type" });
        const category = await categoryModel.findById(categoryId);
        if (!category) return res.json({ success: false, message: "Category not found" });
        category.subCategories = category.subCategories.filter(
            sub => !(sub.name === subCategory.name && sub.type === subCategory.type)
        );
        await category.save();
        res.json({ success: true, category });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all category names and all subcategory names (no type)
export const getCategoryAndSubCategoryNames = async (req, res) => {
    try {
        const categories = await categoryModel.find({});
        const categoryNames = categories.map(cat => cat.name);
        // Flatten all subcategory names (unique)
        const subCategoryNames = [
            ...new Set(
                categories.flatMap(cat =>
                    (cat.subCategories || []).map(sub => sub.name)
                )
            )
        ];
        res.json({ success: true, categoryNames, subCategoryNames });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get subcategory type by category and subcategory name
export const getSubCategoryType = async (req, res) => {
    try {
        const { category, subCategory } = req.query;
        if (!category || !subCategory) {
            return res.json({ success: false, message: "category and subCategory required" });
        }
        const cat = await categoryModel.findOne({ name: category });
        if (!cat) return res.json({ success: false, message: "Category not found" });
        const sub = (cat.subCategories || []).find(s => s.name === subCategory);
        if (!sub) return res.json({ success: false, message: "Subcategory not found" });
        res.json({ success: true, type: sub.type });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
