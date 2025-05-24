import mongoose from "mongoose";

const vtonResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    vtn_link: { type: String, required: true }
}, { timestamps: true });

// Ensure unique result per user-product pair
vtonResultSchema.index({ userId: 1, productId: 1 }, { unique: true });

const vtonResultModel = mongoose.models.vtonResult || mongoose.model("vtonResult", vtonResultSchema);

export default vtonResultModel;
