const mongoose = require('mongoose');

const connectDB = async () => {
    const conn = await mongoose.connect('Enter your url here',{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology:true
    });
    console.log('MongoDB connected:'.cyan.underline.bold+conn.connection.host.cyan.underline.bold)
}
module.exports = connectDB