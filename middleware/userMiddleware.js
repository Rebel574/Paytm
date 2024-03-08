const jwt=require("jsonwebtoken");
const JWT_SCERET= require("../config"); 

const  userMiddleware=(req,res,next)=>{
    const words=req.headers.authorization;
    const word=words.split(" ");
    const token=word[1];
    try{
        const user=jwt.verify(token,JWT_SCERET);
        req.userId=user.userId;
        req.username=user.username;
        next();

    }catch(err){
        return res.status(403).json({
            err:"User don't authorized"
        })
    }
}

module.exports=userMiddleware;