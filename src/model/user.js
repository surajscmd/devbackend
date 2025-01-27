const mongoose = require('mongoose');
var validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required:true,
        minLength: 4,
        maxLength: 58,
    },
    lastName: {
        type:String,
    },
    emailID: {
        type:String,
        unique: true,
        lowercase:true,
        required: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ("Invalid email addders: "+ value);
            }
        }
    },
    password: {
        type:String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
             throw new Error("Enter the strong password "+ value);
            }
    }},
    age:{
        type:Number,
        min:18,
    },
    gender:{
        type:String,
        validate(value){
           if(!["male","female","others"].includes(value)){
            throw new Error("Invalid phot URL: "+ value);
           }
        }},
    photoUrl: {
         type: String,
         default: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png",
         validate(value){
            if(!validator.isURL(value)){
             throw new Error("url is not valid");
            }
         }
    
        },
    about: {
        type: String,
        default: "This is my defult Bio",
        maxLength: 500
    },
    skills: {
        type: [String],
    }   
},{
    timestamps:true,
});

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({_id : user._id}, "Dev@mysecreat" ,{
    expiresIn: "7d"
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByuser) {
    const user = this;
    const passwordHash = user.password
    const isPasswordValid = await bcrypt.compare(passwordInputByuser, passwordHash);
    return   isPasswordValid
}



const User = mongoose.model("user", userSchema);

module.exports = User;