const User = require('../models/User');


// @desc      Register User
// @route     POST /api/v1/auth/register
// @access    public
exports.register = async(req,res, next) => {
    console.log(req.body)
    const { name, email, mobile ,password, role} = req.body;
    const file = req.file;
    //Create user
    let user = new User({
        name: name,
        email: email,
        mobile:mobile,
        password: password,
        role: role,
    });
        await user.save()
        sendTokenResponse(user, 200, res)
};


// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = async(req, res, next) => {
    console.log(req.body)
    const {email,password} = req.body;
    //Validate email and password 
    if (!email || !password){
        return next(new ErrorResponse('Please provide an email and password',400));
    }


    // Check for user
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return next(new ErrorResponse('Invalid Credentials',401));
    }
    
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch){
        return next(new ErrorResponse('Invalid Credentials',401));  
    }

    sendTokenResponse(user,200,res)
};

// @desc      Get token, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const sendUser =  user.getPublicProfile()
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    res.status(statusCode).cookie('token', token, options).json({success: true,token,sendUser})
}






/**
 * @ROUTE : api/v1/auth/me
 * @DESC  : Get Current User
 */
exports.getMe = async (req,res)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json(user)
}

/**
 * @ROUTE : api/v1/auth/users
 * @DESC  : Get all users
 */
exports.getUsers = async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
};


/**
 * @ROUTE : /api/v1/auth/users/:id
 * @DESC  : Get  user by id
 */
exports.getUserById= async (req,res,next)=>{
    console.log(req.params.id)
    const user = await User.findById(req.params.id);
    if(!user)return res.status(404).json("No user found");
    const userSend = user.getPublicProfile();
    res.status(200).json(userSend);
}


/**
 * @ROUTE : /api/v1/auth/:id/profileimage
 * @DESC  : Get profile Pic
 */
exports.getProfileImage = async (req,res)=>{
    const user = await User.findById(req.params.id).select({password:0});
    if(!user || !user.profileImage) return res.status(404).json()
    res.set('Content-Type', user.profileImage.contentType);
    res.send(user.profileImage.imageData);
}


/**
 * @ROUTE : /api/v1/auth/upload
 * @DESC  : Upload profile image
 */
exports.uploadProfileImage = async (req,res)=>{
    const file = req.file;
    let profileImage={
        contentType:file.mimetype,
        imageData:file.buffer
    }
    req.user.profileImage = profileImage;
    await req.user.save()
    res.status(200).json("Profile image updated successfully.")
}

/**
 * @ROUTE : /api/v1/auth/update
 * @DESC  : Update user Profile
 */
exports.updateProfile = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    });
    return res.status(200).json(user.getPublicProfile());
  };
  