const LocalStrategy=require('passport-local').Strategy;
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const Farmer=require('../models/Farmer');

module.exports=function(passport){
  passport.use(
    new LocalStrategy({usernameField:'email'},(email,password,done) => {
      //looking for the user/farmer
      Farmer.findOne({email:email})
      .then(farmer => {
        if(!farmer){
          return done(null, false, {message: 'Entered email is not registered!'});
        }
        //Match password separately
        bcrypt.compare(password,farmer.password,(err,isMatch) => {
          if(err) throw err;

          if(isMatch){
            return done(null,farmer);
          }
          else{
            return done(null,false,{message: "Entered password does not match!"});
          }
        });
      })
      .catch(err => console.log(err));
    })
  );

  passport.serializeUser((user,done) => {
    done(null,user.id);
  });

  passport.deserializeUser(function(id,done){
    Farmer.findById(id,function(err,user){
      done(err,user);
    });
  });
}
