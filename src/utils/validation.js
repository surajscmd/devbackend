const validator = require("validator");

const validateSignUpData = (req) =>{
    const {firstName , lastName , emailID, password} = req.body;
    if (!firstName || !lastName) {
        throw new Error("Name is not valid"); 
    } else if (!validator.isEmail(emailID)) {
        throw new Error("Email is not valid!");
    }else if (!validator.isStrongPassword(password)){
        throw new Error("Please enter a strong password!");
    }
};

const validateEditProfileData = (req) => {
    const allowedEditFields = ["firstName", "lastName", "emailID", "photoUrl", "password", "gender", "about", "skills", "age"];
    const isEditAllowed = Object.keys(req.body).every(field => allowedEditFields.includes(field));
    return isEditAllowed;
 }
 

module.exports = {
  validateSignUpData,
  validateEditProfileData 
}