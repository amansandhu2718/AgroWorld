const mongoose=require('mongoose');

const farmerSchema=new mongoose.Schema({
  email:String,
  password:String,
  emailToken:String,
  location:String,
  name:String,
  contact:String,
  time:String
});

const Farmer=new mongoose.model("Farmer",farmerSchema);

module.exports = Farmer;
