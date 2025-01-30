const express = require("express");
const requestRouter = express.Router();
const{ userAuth } = require("../middleware/auth")
const User = require('../model/user');
const ConnectionRequest = require("../model/connectionRequest");
const  sendEmail = require("../utils/sendEmail");
requestRouter.post("/request/send/:status/:toUserId", userAuth, async(req , res)=>{
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        
        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({ message: "Invalid status type: " + status});
        }

        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(404).json({ message : "User not found!" });
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId},
            ], 
        });
        if (existingConnectionRequest){
            return res.status(400).send({ message : "Connection Request Alredy Exists!!"});
        }
        
        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });    
       
        const emailRes = await sendEmail.run(
            "A new friend request from " + req.user.firstName,
            req.user.firstName + " is " + status + " in " + toUser.firstName
          );
         const data = await connectionRequest.save();

        res.json({
            message: status + " Request Sent to " + toUser.firstName + " Successfully!",
            data,
        }) 
    }
    catch (err) {
        res.status(400).send("Error saving the User: " + err.message)
    } 
});
requestRouter.post("/request/review/:status/:requestId", userAuth, async(req , res)=>{
    try {
        const loggedInUser = req.user;
        const { status , requestId} = req.params;

        const allowedStatus = ["accepted" , "rejected"];

        if(!allowedStatus.includes(status)){
            return res.status(404).json({ message : "Status not allowed!"});
        }
        
        const connectionRequest =await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });
        if(!connectionRequest){
            return res.status(404).json({message: "Connection request not found"});            
        }
        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.json({message: "Connection request" + status , data});
    }
    catch (err) {
        res.status(400).send("Error saving the User: " + err.message)
    } 
})


module.exports = requestRouter