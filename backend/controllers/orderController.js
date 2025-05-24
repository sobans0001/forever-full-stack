import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// global variables
const currency = 'inr'
const deliveryCharge = 10

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    try {
        const { userId, items, amount, address} = req.body;

        // Prevent placing order if cart is empty
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.json({success:false, message:"Your cart is empty"});
        }

        // Fetch user email
        const user = await userModel.findById(userId);
        const email = user ? user.email : '';

        const orderData = {
            userId,
            email, // add email to order
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"Order Placed"})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {
        
        // include email in response
        const orders = await orderModel.find({})
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        const { userId } = req.body
        // include ratings in response
        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
    try {
        
        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({success:true,message:'Status Updated'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export {placeOrder, allOrders, userOrders, updateStatus}