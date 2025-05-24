import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }
}, { _id: false });

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    subCategories: [subCategorySchema]
});

// Use capitalized model name for consistency and to avoid overwrite errors
const categoryModel = mongoose.models.Category || mongoose.model("Category", categorySchema);

export default categoryModel;
