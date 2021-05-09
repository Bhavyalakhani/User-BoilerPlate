const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please add a name']
    },
    email:{
        type:String,
        required:[true,'Please add an email id'],
        unique:true
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'please add a password'],
        minlength:6,
        select:false
    },
    resetPasswordToken:{
        type:String
    },
    mobile:{
        type:String,
        unique:true,
        required:[true,"Plase add your number"]
    },
    resetPasswordExpire:Date,
    orders:[{
        type:mongoose.Schema.Types.ObjectId,
        ref : "Order"
    }],
    profileImage:{
        contentType:String,
        imageData:Buffer
    },
},
{
    timestamps:true
})

//Encrypt password using bcrypt
UserSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

// Sign JWT and return

UserSchema.methods.getSignedJwtToken = function() {
    return  jwt.sign({ id : this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}

// Match user entered password to hashed password in database

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
};

UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    //Hash token and set to reset password token field

    this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

    this.resetPasswordExpire = Date.now() + 10*60*1000


    return resetToken;
}

UserSchema.methods.getPublicProfile = function(){
    const userObj=this;
    const user = userObj.toObject()
    const userImageURL = `/api/v1/auth/${user._id}/profileimage`;
    user.imageURL=userImageURL;
    delete user.profileImage;
    delete user.password;
    return user;
}

module.exports = mongoose.model('User',UserSchema)