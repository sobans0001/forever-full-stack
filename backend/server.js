import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import virtualTryOnRoute from './routes/virtualTryOnRoute.js'
import categoryRoute from './routes/categoryRoute.js'
import vtonResultRoute from './routes/vtonResultRoute.js' // <-- add this import

// App Config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use('/api/virtualtryon', virtualTryOnRoute)
app.use('/api/category', categoryRoute)
app.use('/api/vtonresult', vtonResultRoute) // <-- add this line

app.get('/',(req,res)=>{
    res.send("API Working")
})

let shippingFee = 100; // In-memory storage for shipping fee

app.get('/api/shipping-fee', (req, res) => {
    res.json({ success: true, fee: shippingFee });
});

app.post('/api/shipping-fee', (req, res) => {
    const { fee } = req.body;
    if (typeof fee !== 'number' || fee < 0) {
        return res.json({ success: false, message: 'Invalid fee value' });
    }
    shippingFee = fee;
    res.json({ success: true, fee: shippingFee });
});

app.listen(port, ()=> console.log('Server started on PORT : '+ port))