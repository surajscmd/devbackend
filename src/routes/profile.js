const express = require("express");
const profileRouter = express.Router();
const{ userAuth } = require("../middleware/auth")
const{ validateEditProfileData } = require("../utils/validation")
// profile
profileRouter.get("/profile/view", userAuth , async(req, res) => {
    try {   
        const user = req.user 
        res.status(200).json({ message: "User profile retrieved successfully", user });
    } catch (error) {
        res.status(400).send("Error retrieving user profile: " + error.message);
    }
});


profileRouter.patch("/profile/edit", userAuth , async(req, res) => {
    try {   
        if(!validateEditProfileData(req)){
            throw new Error("Invalid Edit Request");
        }
         const loggedInUser = req.user;
         Object.keys(req.body).forEach((key) => (loggedInUser[key]= req.body[key]));
        
         await loggedInUser.save();

         res.json({
            message: `${loggedInUser.firstName}, your profile updated successfuly`,
            data: loggedInUser,
          });
          

    } catch (error) {
        res.status(400).send("Error retrieving user profile: " + error.message)
    }
})

module.exports = profileRouter