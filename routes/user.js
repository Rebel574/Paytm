const express=require("express");
const zod=require("zod");
const router=express.Router();
const JWT_SECRET =require( "../config");
const jwt=require("jsonwebtoken");
const  {User,Account} =require ("../db/index");
const userMiddleware=require("../middleware/userMiddleware")

const userValidation=zod.object({
    username:zod.string().email(),
    first_name:zod.string().min(4),
    last_name:zod.string(),
    password:zod.string().min(6)
});

router.post("/signup",async(req,res)=>{
    const username=req.body.username;
    const isUserExit=await User.findOne({username});
    if(isUserExit){
        return res.status(404).json({
            msg:"User already exits with this username"
        })
    }
    else{
        const userSchema={
            username:username,
            first_name:req.body.first_name,
            last_name:req.body.last_name,
            password:req.body.password
        }
        const validateUser=userValidation.safeParse(userSchema);
        if(validateUser.success){
            const user=await User.create(validateUser.data);
            const userId = user._id;

            await Account.create({
                userId,
                balance: 1 + Math.random() * 10000
            })
            const token=jwt.sign({userId},JWT_SECRET);
            res.status(200).json({
                msg:"User Created Successfully",
                token:token
            })
        }else{
            res.status(400).json({
                msg:"Values are not proper"
            })
        }
    }
});

const signinValidation=zod.object({
    username:zod.string().email(),
    password:zod.string().min(6)
});

router.post("/signin",async(req,res)=>{
    const {username,password}=req.body;
    try {
        const validateSign=signinValidation.safeParse({username,password});
        if(validateSign.success){
            const isUserExist=await User.findOne({username});
            if(isUserExist){
                const token=jwt.sign({username},JWT_SECRET)
                return res.status(200).json({
                    msg:"User Logged In Successfully",
                    token:token
                })
            }else{
                return res.status(402).json({
                    msg:"User Doesn't Exists Firstly Create a User "
                })
            }
        }else{
            return res.status(404).json({
                msg:"Invalid Fields"
            })
        }
    } catch (err) {
        return res.status(500).json({
            msg:"Internal Server Error"
        });
    }

});

const updateValidation=zod.object({
    first_name:zod.string().min(4),
    last_name:zod.string(),
    password:zod.string().min(6)
});

router.put("/update",userMiddleware,async(req,res)=>{
    const validateUpdate=updateValidation.safeParse(req.body);
    try {
        if(validateUpdate.success){
            const updateUser=await User.updateOne({username:req.username},{$set:{first_name:req.body.first_name,last_name:req.body.last_name,password:req.body.password}});
            return res.status(200).json({
                msg:"Updated successfully"
            })
        }else{
            return res.status(411).send("Password is too small. It must be at least 6 characters long.");
        }
        
    } catch (error) {
        return res.status(500).json({
            msg:"Internal Server Error"
        })
    }
});

router.get("/bulk",userMiddleware,async(req,res)=>{
    const filter=req.query.filter;
    const trimFilter=filter.trim();
    try {
        const findUser = await User.find({
            $or: [
                { first_name: { "$regex": trimFilter,"$options": "i" } },
                { last_name: { "$regex": trimFilter,"$options": "i"} }
            ]
        }); 

        return res.status(200).json({
            user:findUser.map(it=>({
                username:it.username,
                first_name:it.first_name,
                last_name:it.last_name,
                _id:it._id
            }))
        })
        
    } catch (error) {
        return res.status(500).send("Internal Server Error")
    }
})

module.exports=router;