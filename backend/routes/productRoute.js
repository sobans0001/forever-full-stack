import express from 'express'
import { listProducts, addProduct, removeProduct, singleProduct, rateProduct, reviewProduct, getProductReviews, editProduct } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js'; // import authUser for rating

const productRouter = express.Router();

productRouter.post('/add',adminAuth,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),addProduct);
productRouter.post('/edit', adminAuth, upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]), editProduct);
productRouter.post('/remove',adminAuth,removeProduct);
productRouter.post('/single',singleProduct);
productRouter.get('/list',listProducts)
productRouter.post('/rate', authUser, rateProduct)
productRouter.post('/review', authUser, reviewProduct)
productRouter.post('/reviews', getProductReviews)

export default productRouter