const express = require("express");
const mongoose=require("mongoose")
// mongodb+srv://learndsax1:123@cluster0.nh7e5g7.mongodb.net/

 mongoose.connect("mongodb+srv://learndsax1:123@cluster0.nh7e5g7.mongodb.net/paytm")

const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const AccountSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    balance:{
        type:Number,
        required:true
    }

})

const User=mongoose.model("Users",UserSchema);
const Account=mongoose.model("Accounts",AccountSchema);

module.exports={
    User,Account
}