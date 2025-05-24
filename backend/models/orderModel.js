import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    email: { type: String, required: true }, // add email field
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default:'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true , default: false },
    date: {type: Number, required:true},
    ratings: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
            userId: { type: String },
            rating: { type: Number },
            review: { type: String } // <-- add review field
        }
    ]
})

const orderModel = mongoose.models.order || mongoose.model('order',orderSchema)
export default orderModel;