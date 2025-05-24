import vtonResultModel from "../models/vtonResultModel.js";
import mongoose from "mongoose";

// Save or update try-on result
export const saveVtonResult = async (req, res) => {
  try {
    const { userId, productId, vtn_link } = req.body;
    if (!userId || !productId || !vtn_link) {
      return res.json({ success: false, message: "userId, productId, and vtn_link are required" });
    }

    const vtonResult = await vtonResultModel.findOneAndUpdate(
      { userId, productId },
      { vtn_link },
      { new: true, upsert: true }
    );

    res.json({ success: true, vtonResult });
  } catch (error) {
    console.error("Error in saveVtonResult:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get all try-ons for a user
export const getUserVtonResults = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.json({ success: false, message: "userId required" });

    const results = await vtonResultModel.find({ userId });
    res.json({ success: true, results });
  } catch (error) {
    console.error("Error in getUserVtonResults:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get a specific try-on result
export const getVtonResult = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.json({ success: false, message: "userId and productId required" });
    }

    const result = await vtonResultModel.findOne({ userId, productId });
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error in getVtonResult:", error);
    res.json({ success: false, message: error.message });
  }
};

// Delete a specific try-on result
export const deleteVtonResult = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.json({ success: false, message: "userId and productId required" });
    }

    await vtonResultModel.deleteOne({ userId, productId });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Error in deleteVtonResult:", error);
    res.json({ success: false, message: error.message });
  }
};
