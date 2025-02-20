const express = require('express');
const { userAuth } = require('../middleware/auth');
const paymentRouter = express.Router();
const razorpayInstance = require('../utils/razerpay');
const Payment = require('../model/payment');
const { membershipAmount } = require('../utils/constant');
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const User = require('../model/user');
paymentRouter.post('/payment/create', userAuth , async (req, res) => {
    try {
        const {membershipType} = req.body;
       const  {firstName, lastName, emailID} = req.user;

       const order =  await razorpayInstance.orders.create({
            amount: membershipAmount[membershipType] * 100,
            currency: "INR",
            receipt: "order_receipt#11",
            notes: {
                firstName : firstName,
                lastName : lastName,
                emailId : emailID,
                membershipType : membershipType,
            },        
        });
        // console.log(order);
        const payment =  new Payment({
            userId: req.user._id,
            orderId: order.id,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes,
        })
       
        const savedPayment = await payment.save();
        res.json({...savedPayment.toJSON() , KeyId : process.env.RAZORPAY_KEY_ID});
    } catch (error) {
        res.status(400).send( error.message);
    }
})
paymentRouter.post('/payment/webhook', async (req, res) => {
    try {
        const webhookSignature = req.get('X-Razorpay-Signature');
        //or req.get['X-Razorpay-Signature']
       const isWebhookValid = validateWebhookSignature(
        JSON.stringify(req.body), 
        webhookSignature, 
        process.env.RAZORPAY_WEBHOOK_SECRET);
        if(!isWebhookValid){
            return res.status(400).json({msg : "Webhook is not valid"});
        }
        // update the payment status in the database
            //update the user as pripmium user
        const paymentDetais = req.body.payload.payment.entity;

        const payment = await Payment.findOne({orderId : paymentDetais.order_id});
        payment.status = paymentDetais.status;
        await payment.save();

        const user = await User.findOne({_id : payment.userId});
        user.membershipType = payment.notes.membershipType;
        user.isPremium = true;
        await user.save();
        
        // if(req.body.event === "payment.captured"){
            
        // }
        // if(req.body.event === "payment.failed"){
            
        // }
        return res.status(200).json({msg : "Webhook recived suceesfully"});

    } catch (error) {
        return res.status(400).send(error.message);
    }

})
module.exports = paymentRouter;