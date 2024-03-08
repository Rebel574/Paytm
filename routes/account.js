const express=require("express");
const router=express.Router();
const mongoose=require("mongoose");
const {Account,User}= require("../db");
const userMiddleware=require("../middleware/userMiddleware");

// async function getUserId(username){
//     const user = await User.findOne({ username: username });
    
    
//     if(!user){
//         return;
//     }
//     return user._id;
// }


router.get("/balance",userMiddleware,async(req,res)=>{
    const username=req.username;
    // console.log(username);
    try {
        // Find the user by username
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Find the account balance using the user's ID
        const getBalance = await Account.findOne({ userId: user._id });
        // console.log(getBalance);
        if (!getBalance) {
            return res.status(404).json({ msg: "Account not found" });
        }

        return res.status(200).json({
            balance: getBalance.balance,
            first_name:user.first_name
        });

    } catch (err) {
        return res.status(500).json({
            msg: "Internal Server Error"
        });
    }
});

router.post("/transfer",userMiddleware,async(req,res)=>{
    const session=await mongoose.startSession();
    session.startTransaction();
    const {amount,to}=req.body;
    const username=req.username;
    // const userId=await getUserId(username);
    const account=await Account.findOne({userId:req.userId}).session(session);
    if(!account || account.balance<amount){
        await session.abortTransaction();
        return res.status(400).json({
            msg:"Insufficient Balance"
        });
    }

    const toAccount=await Account.findOne({userId:to}).session(session);
    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            msg:"Invalid Account"
        });
    }

    await Account.updateOne({userId:req.userId},{$inc:{balance:-amount}}).session(session);
    await Account.updateOne({userId:to},{$inc:{balance:amount}}).session(session);

    await session.commitTransaction();
    return res.status(200).json({
        msg:"Transfer Successful"
    })

})

module.exports=router;
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvaGl0QGdtYWlsLmNvbSIsImlhdCI6MTcwNzI5Nzg1NX0.gmtfrvjcAIF_6gDkWkJitymX3B3KTw57-BfTPU8u174
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJ1c2hpQGdtYWlsLmNvbSIsImlhdCI6MTcwNzM3NDQxN30.J0jL_lQ_o3gzA5zXR11S0Qn3dAL5-Nr5WmK0D95ftJ4