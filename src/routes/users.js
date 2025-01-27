const express = require("express");
const { userAuth } = require("../middleware/auth");
const userRouter = express.Router();
const ConnectionRequest = require("../model/connectionRequest"); 
const User = require("../model/user");
//get all the pending connection request
userRouter.get("/user/requests/received", userAuth , async (req,res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested",
        }).populate("fromUserId", ["firstName", "lastName" , "photoUrl", "about" , "skills", "gender"]);

        res.json({
            message: "Data feched succesfully",
            data: connectionRequests,
        })

    } catch (error) { 
      res.status(400).send("Error: " + error.message);
        
    }

})

userRouter.get("/user/connections", userAuth , async (req,res) => {
 try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
        $or : [
            {toUserId: loggedInUser._id, status: "accepted"},
            {toUserId: loggedInUser._id, status: "accepted"},
        ],
    }).populate("fromUserId", ["firstName", "lastName" , "photoUrl", "about" , "skills", "gender"]).populate("toUserId",["firstName", "lastName" , "photoUrl", "about" , "skills", "gender"] );
    const data = connectionRequests.map((row) => {
        if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
            return row.toUserId;
        } return row.fromUserId;
    });
    res.json({data: data });
 } catch (error) {
    res.status(400).send({ message: error.message})
 }
})


userRouter.get("/feed", userAuth , async (req,res) => {
    try {
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;

        const skip = (page -1) * limit;
        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: loggedInUser._id} ,
                {toUserId : loggedInUser._id}
            ]
        }).select("fromUserId toUserId");
       
        const hideUserFromFeed = new Set();
        connectionRequests.forEach((req)=>{
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        })

        const users = await User.find({
            $and: [{_id: {$nin: Array.from(hideUserFromFeed)}},
                {_id: {$ne: loggedInUser._id}}
            ],
        }).select("firstName lastName photoUrl about skills gender age").skip(skip).limit(limit);

     res.json({data : users});
    } catch(error){
        res.status(400).send({ message: error.message})
    }
})

module.exports = userRouter