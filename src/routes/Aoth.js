const express = require("express");
const{validateSignUpData} = require("../utils/validation")
const aothRouter = express.Router();
const User = require("../model/user");
const bcrypt = require("bcrypt");

aothRouter.post("/signup", async (req, res) =>{
    try {
    validateSignUpData(req);
    const {firstName , lastName , emailID, password} = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
        firstName, 
        lastName,
        emailID, 
        password:passwordHash,
    })
       const saveduser = await user.save();
       const token = await saveduser.getJWT()
       res.cookie("token", token, {
           expires: new Date(Date.now()+ 8 * 3600000)
       });
        res.json({message : "User Added succesfully", data: saveduser});
    }
    catch (error) {
        res.status(400).send("Error saving the User: " + error.message)
    }  
})

aothRouter.post("/Login", async(req, res)=>{
    try {
        const {emailID, password} = req.body;
        const user = await User.findOne({ emailID : emailID})
        if (!user){
            throw new Error("EmailId id not present in DB");
        }
        const isPasswordValid = await user.validatePassword(password);
        if (isPasswordValid) {
            const token = await user.getJWT()
            res.cookie("token", token, {
                expires: new Date(Date.now()+ 8 * 3600000)
            });
            res.send(user)
        } else {
            throw new Error("Password is not correct");
        }
    }catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
})

aothRouter.post("/Logout", async(req, res)=>{
  
    res.cookie("token", null , {
       expires: new Date(Date.now()),
    })
    res.send("logout succesfull");
})



module.exports = aothRouter;
