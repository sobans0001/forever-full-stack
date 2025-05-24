import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import orderModel from "../models/orderModel.js" // import orderModel
import sharp from "sharp"

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        // Image size limit (2MB)
        for (const img of images) {
            if (img.size > 2 * 1024 * 1024) {
                return res.json({ success: false, message: "Each image must be less than 2MB" });
            }
        }

        // Crop images to square using sharp and upload to Cloudinary
        let imagesUrl = await Promise.all(
            images.map(async (item, idx) => {
                let folderName = `products/${name.replace(/\s+/g, '_')}`;
                // Crop to square buffer
                const inputBuffer = await sharp(item.path)
                    .resize({ width: 600, height: 600, fit: sharp.fit.cover })
                    .toBuffer();
                // Upload buffer to Cloudinary
                let result = await cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: folderName
                    },
                    (error, result) => {
                        if (error) throw error;
                        return result;
                    }
                );
                // Use a Promise to handle upload_stream
                const uploadPromise = new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'image', folder: folderName },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    );
                    stream.end(inputBuffer);
                });
                return await uploadPromise;
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        // Find product to get its name for folder deletion
        const product = await productModel.findById(req.body.id);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        // Remove product from DB
        await productModel.findByIdAndDelete(req.body.id);

        // Remove all images in the product's folder from Cloudinary
        const folderName = `products/${product.name.replace(/\s+/g, '_')}`;
        // Delete all resources in the folder
        await cloudinary.api.delete_resources_by_prefix(folderName + '/');
        // Delete the folder itself
        await cloudinary.api.delete_folder(folderName);

        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function to rate a product
const rateProduct = async (req, res) => {
    try {
        const { productId, rating, orderId, userId } = req.body
        if (!orderId || !userId) return res.json({ success: false, message: "OrderId and userId required" })

        // Find the order
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: "Order not found" })

        // Initialize ratings array if not present
        if (!order.ratings) order.ratings = []

        // Only prevent rating if user already rated this product in THIS order
        const alreadyRated = order.ratings.some(r => r.productId == productId && r.userId == userId)
        if (alreadyRated) {
            return res.json({ success: false, message: "You have already rated this product for this order." })
        }

        // Update product rating
        const product = await productModel.findById(productId)
        if (!product) return res.json({ success: false, message: "Product not found" })

        const totalRating = (product.avgRating || 0) * (product.ratingCount || 0) + Number(rating)
        const newCount = (product.ratingCount || 0) + 1
        const newAvg = totalRating / newCount

        product.avgRating = newAvg
        product.ratingCount = newCount
        await product.save()

        // Save rating info in order
        order.ratings.push({ productId, userId, rating: Number(rating) })
        await order.save()

        res.json({ success: true, avgRating: newAvg, ratingCount: newCount })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// function to save a review for a product in an order
const reviewProduct = async (req, res) => {
    try {
        const { productId, orderId, userId, review } = req.body
        if (!orderId || !userId || !review) return res.json({ success: false, message: "OrderId, userId, and review required" })

        // Find the order
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: "Order not found" })

        // Initialize ratings array if not present
        if (!order.ratings) order.ratings = []

        // Only allow review if not already reviewed for this product in this order
        const ratingObj = order.ratings.find(r => r.productId == productId && r.userId == userId)
        if (!ratingObj) {
            return res.json({ success: false, message: "You must rate before reviewing." })
        }
        if (ratingObj.review) {
            return res.json({ success: false, message: "You have already reviewed this product for this order." })
        }

        // Save review
        ratingObj.review = review
        await order.save()

        res.json({ success: true, message: "Review saved" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get all reviews for a product from all orders, including user name
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.json({ success: false, message: "productId required" });

        // Find all orders that have ratings for this product
        const orders = await orderModel.find({ "ratings.productId": productId });
        let reviews = [];
        // Collect all userIds to fetch names in one go
        let userIds = new Set();
        orders.forEach(order => {
            if (Array.isArray(order.ratings)) {
                order.ratings.forEach(r => {
                    if (
                        r.productId?.toString() === productId &&
                        r.review && r.review.trim()
                    ) {
                        reviews.push({
                            review: r.review,
                            rating: r.rating,
                            userId: r.userId,
                            orderId: order._id,
                            date: order.date
                        });
                        if (r.userId) userIds.add(r.userId);
                    }
                });
            }
        });

        // Fetch user names
        let userMap = {};
        if (userIds.size > 0) {
            const userModel = (await import("../models/userModel.js")).default;
            const users = await userModel.find({ _id: { $in: Array.from(userIds) } }).select("_id name");
            users.forEach(u => userMap[u._id.toString()] = u.name);
        }

        // Attach user name to each review
        reviews = reviews.map(r => ({
            ...r,
            userName: userMap[r.userId] || "User"
        }));

        res.json({ success: true, reviews });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Edit product controller
const editProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, sizes, bestseller } = req.body;
        if (!id) return res.json({ success: false, message: "Product id required" });

        const product = await productModel.findById(id);
        if (!product) return res.json({ success: false, message: "Product not found" });

        // Handle images: if new images are uploaded, upload and replace; else keep old ones
        let imagesUrl = [...product.image];
        const imageFields = ['image1', 'image2', 'image3', 'image4'];
        let updatedImages = [];

        for (let i = 0; i < imageFields.length; i++) {
            const field = imageFields[i];
            if (req.files && req.files[field] && req.files[field][0]) {
                // Upload new image to Cloudinary
                let folderName = `products/${(name || product.name).replace(/\s+/g, '_')}`;
                let result = await cloudinary.uploader.upload(req.files[field][0].path, {
                    resource_type: 'image',
                    folder: folderName
                });
                updatedImages[i] = result.secure_url;
            } else {
                // Keep old image if exists
                updatedImages[i] = imagesUrl[i] || null;
            }
        }
        // Remove nulls at the end
        updatedImages = updatedImages.filter(Boolean);

        // Update product fields
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price !== undefined ? Number(price) : product.price;
        product.category = category || product.category;
        product.subCategory = subCategory || product.subCategory;
        product.sizes = sizes ? JSON.parse(sizes) : product.sizes;
        product.bestseller = bestseller !== undefined ? (bestseller === "true" || bestseller === true) : product.bestseller;
        product.image = updatedImages;

        await product.save();

        res.json({ success: true, message: "Product updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, rateProduct, reviewProduct, getProductReviews, editProduct }