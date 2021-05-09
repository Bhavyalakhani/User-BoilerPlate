const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Requires a token in request headers.
 * Header format is
 * Authorization: Bearer token
 */
const authRequired =(role="user")=>async (req, res, next) => {
    const header = req.header('Authorization');
    if (!header) {
        return res.status(401).json({
            msg: 'Please Provide JWT',
        });
    }
    const token = header.replace('Bearer', '').trim();
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                msg: 'Invalid token',
            });
        }
        const user = role=='user'?await User.findOne({ _id: decoded.id }).select({password:0}): null
        
        if(!user){
            return res.status(404).json(`${role} not found!!`)
        }
        req.token = token;
        req.user = user;
        res.locals.user=user
        next();
    } catch (e) {
        return res.status(401).json({
            msg: 'Invalid token',
        });
    }
};

const hasRoles=(roles)=>async (req, res, next) =>{
    const role = req.user.role;
    console.log(role)
    console.log(roles)
    if(!roles.includes(role)){
        return res.status(403).json({success:false,msg:"Not allowed"})
    }
    next();
}

module.exports={authRequired,hasRoles}