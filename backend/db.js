const mongoose = require('mongoose');

const mongoURI="mongodb://127.0.0.1:27017/inotebook?directConnection=true&readPreference=primary";

const connectToMongo=()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connected to mongo successfully!!!!!");
    })
}

module.exports=connectToMongo;