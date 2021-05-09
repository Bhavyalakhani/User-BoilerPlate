// libraries
const express = require("express");
const app = express();
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");


// paths 
const connectDB = require('./config/db');
const user = require("./routes/auth");




connectDB();
dotenv.config({ path: './config/config.env' });
app.use(bodyParser.json())

app.use(morgan('dev'));
app.use(cookieParser());

app.use("/api/v1/user",user)

const server = app.listen(process.env.PORT, () => {
    console.log('App listening on port 5000!'.blue.bold);
});

/**
 * Error handler.
 * Sends 400 for Mongoose validation errors.
 * 500 otherwise.
 * Do all error handling here.
 */
 app.use((err, req, res, next) => {
    console.log("Async error handler")
    console.log(err);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json(err.errors);
    }

    if (err.name === 'MongoError') {
        console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
        return res.status(400).json({err:err.keyPattern});
      }
    
    
    return res.status(500).json(err);
  });
  

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log("UNHANDLE")
    console.log(`Error: ${err.message}`.red.bold.underline);
    //close server and exit process
    server.close(() => process.exit(1));
});


