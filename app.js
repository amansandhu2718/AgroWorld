const express=require("express");
const bodyParser=require("body-parser");
const {check, validationResult } = require('express-validator');
const {matchedData, sanitizeBody} = require('express-validator');
const request=require("request");
const flash=require("connect-flash");
const session = require("express-session");
const passport=require("passport");
const dateFormat = require("dateformat");
const mongoose = require('mongoose');
const md5=require("md5");
const ejs = require("ejs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {ensureAuthenticated}=require('./config/auth');
var multer=require('multer');
var path=require('path');

const app=express();

require('./config/passport')(passport);

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//Express Session
app.use(session({
  secret : 'itsmetherishabh',
  resave : true,
  saveUninitialized : true
}));

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

app.use((req,res,next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

const db=require('./config/keys').MongoURI;

mongoose.connect(db,{useNewUrlParser:true,useUnifiedTopology: true})
.then(() => console.log("MongoDB Connected..."))
.catch(err => console.log(err));

mongoose.set("useCreateIndex",true);


const productSchema = {
  name: String,
  image: String,
  location: String,
  description: String,
  price: String,
  uploaded: String,
  status: String,
  category: String,
  per: String,
  verified: {
    type: Boolean,
    default: false
  }
};

const Farmer=require('./models/Farmer');

const Product =new mongoose.model("Product", productSchema);

var flag=0;

var Storage=multer.diskStorage({
  destination:"./Public/uploads",
  filename:function(req,file,cb){
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  }
});

var upload=multer({
  storage:Storage
}).single('file');

//------------------------------------get routes----------------------------------------------

app.get("/",function(req,res){
  res.render("index",{
    user:req.user
  });
});



app.get("/login",function(req,res){
  if(!req.user)
  res.render("login",{
    user:req.user
  });
  else
  res.redirect("/dashboard");
});

app.get("/signup",function(req,res){
  res.render("signup",{error:"",user:""});
});

app.get("/about",function(req,res){
  res.render("aboutus",{
    user:req.user
  });
});

app.get("/trade",function(req,res){
  Product.find({category:"Crops"}, function(err, products){
    if(err)
    {
      res.redirect("/");
    }
    else
    {
      // console.log(abc);
      res.render("trade", {
        products: products,
        user:req.user
        });
    }
  });
});

app.get("/admin",function(req,res){
  Product.find({}, function(err, products){
    if(err)
    {
      res.redirect("/");
    }
    else
    {
      // console.log(abc);
      res.render("admin", {
        product: products,
        user:req.user
        });
    }
  });
});

app.get("/techniques",function(req,res){
  res.render("learning",{
    user:req.user
  });
});



app.get("/products",function(req,res){
  Product.find({category:{$ne: "Crops"}}, function(err, products){
    if(err)
    {
      res.redirect("/");
    }
    else
    {
      // console.log(abc);
      res.render("products", {
        products: products,
        user:req.user
        });
    }
  });
});

app.get("/wishlist",function(req,res){
  res.render("wishlist",{
    user:req.user
  });
});

app.get("/dashboard",ensureAuthenticated,function(req,res){
    Product.find({}, function(err, products){
    if(err)
    {
      res.redirect("/");
    }
    else
    {
      // console.log(abc);
      res.render("dashboard", {
        products: products,
        user:req.user
        });
    }
  });
});

app.get("/feedback",function(req,res){
  res.render("feedback",{
    user:req.user
  });
});

app.get("/admin",function(req,res){
  Product.find({}, function(err, products){
    if(err)
    {
      res.redirect("/");
    }
    else
    {
      res.render("admin", {
        products: products,
        });
  //res.render("admin");
    };
  });
});


app.get("/verify-email",async(req,res,next)=>{
  try{
    const user=await Farmer.findOne({emailToken:req.query.token});
    if(user){
      //req.flash('error', "Token is invalid!");
      console.log("Token is invalid!");
      res.redirect("/");
    }
    user.emailToken=null;
    user.confirmed=true;
    await user.save();
    await req.login(user, async (err)=>{
      if(err){
        return next(err);
      }
      //req.flash('success',"Welcome to AgroWorld");
      console.log("Welcome to AgroWorld");
      const redirectUrl=req.session.redirectTo || '/';
      delete req.session.redirectTo;
      res.redirect(redirectUrl);
    });
  }catch(error){
    console.log(error);
    //req.flash('error',"Something went Wrong.");
    console.log("Something went Wrong.");
    res.redirect("/");
  }
});

app.get("/logout",function(req,res){
  req.logout();
  req.flash('success_msg','You are logged out');
  res.redirect("/login");
});

app.get("/failure",function(req,res){
  res.render("failure");
});



//-----------------------------------------post routes---------------------------------------


app.post("/productdetails",function(req,res){
  const x=req.body.ttr;
  Product.find({_id:x}, function(err, products){
    if(err)
    {
      res.redirect("/");
      console.log(err);
    }
    else
    {
      // console.log(products[0].name);
      res.render("productdetails", {
        products: products[0],
        user:req.user

        });
    }
  });
});

app.post("/signup",[
  check('email',"Invalid email").trim().isEmail(),
  check('email').custom((value,{req}) => {
    return Farmer.findOne({email : req.body.email}).then(user => {
      if (user) {
        return Promise.reject('E-mail already in use');
      }
    });
  }),
  check('username',"Invalid Name").trim().isString(),
  check('number',"Invalid contact number").trim().isLength({min:10}),
  check('number',"Invalid contact number").trim().isLength({max:10}),
  check('password',"Password must be of at least 8 characters ").trim().isLength({min:8}),
  check('confirm').custom((value,{req})=>{
    if(value!=req.body.password){
      throw new Error("Confirm password does not match");
    }
    return true;
  })
],async function(req,res){
  const errors = validationResult(req);
  //console.log(errors.mapped());
  if(errors.isEmpty())
  {
    Farmer.findOne({email : req.body.email})
    .then(user =>{
      if(user){
        //farmer exists
        console.log({msg : "User with this email already exists!"});
        res.render("signup",{
          error:errors,
          user:user
        });
      }
      else{
        var today=new Date();
        var day=dateFormat(today, "dddd, mmmm dS, yyyy, h:MM:ss TT");
         const farmer = new Farmer({
          name: req.body.username,
          email: req.body.email,
          emailToken: crypto.randomBytes(64).toString('hex'),
          password:req.body.password,
          location:req.body.location,
          contact:req.body.number,
          time:day
        });
        //hashing the password
        bcrypt.genSalt(10,(err,salt)=>
        bcrypt.hash(farmer.password,salt, (err,hash)=>{
          if(err) throw err;
          //set password to hash
          farmer.password=hash;
          //save farmer
          farmer.save()
          .then(user => {
            req.flash('success_msg','You are now registered, you can log in from here.');
            res.redirect("/login");
          })
          .catch(err => console.log(err));
        }));
      }

      // Farmer.create(farmer,async function(err,user){
      //   if(err){
          //req.flash("error",err.message);
        //   console.log(err.message+" this");
        //   return res.redirect("/signup");
        // }
        // const msg = {
        //   from : 'noreply@email.com',
        //   to : user.email,
        //   subject : 'AgroWorld Verification',
        //   text : `
        //     Hello, thanks for registering on our site.
        //     Please copy and paste the address below to verify.
        //     http://${req.headers.host}/verify-email?token=${user.emailToken}
        //   `,
        //   html : `
        //   <h1>Hello,</h1>
        //   <p>Thanks for registering on our site.</p>
        //   <p>Please click the link below to verify.</p>
        //   <a href="http://${req.headers.host}/verify-email?token=${user.emailToken}">Verify your Account!!!</a>
        //   `
        // }
        // try{
        //   await sgMail.send(msg);
          //req.flash('success',"Thanks for registering. Please check your mail to verify your account.")
        //   console.log("Thanks for registering. Please check your mail to verify your account.");
        //   res.redirect("/");
        // }catch(error){
        //   console.log(error);
            //req.flash('error',"Something went Wrong.");
        //   console.log("Something went Wrong1.");
        //   res.redirect("/");

    });
  }
  else
  {
    const user = matchedData(req);
    res.render("signup",{error:errors.mapped(),user:user});
  }
});

app.post("/login",(req,res,next) => {
  passport.authenticate('local',{
    successRedirect:'/dashboard',
    failureRedirect:'/login',
    failureFlash:true
  })(req,res,next);
  // const username=req.body.username;
  // const password=md5(req.body.password);
  // Farmer.findOne({email: username},function(err,foundFarmer){
  //   if(err)
  //   {
  //
  //     res.render("failure");
  //     console.log(err);
  //   }
  //   else{
  //     if(foundFarmer){
  //       if(foundFarmer.password===password){
  //         flag=1;
  //         Product.find({}, function(err, products){
  //           if(err)
  //           {
  //             res.redirect("/");
  //           }
  //           else
  //           {
  //             // console.log(abc);
  //             res.render("dashboard", {
  //               name:foundFarmer.name,
  //               email:foundFarmer.email,
  //               products: products
  //               });
  //           }
  //         });
  //       }
  //       else
  //       {
  //         res.render("failure");
  //         console.log(err);
  //       }
  //     }
  //     else
  //     {
  //       res.render("login");
  //       console.log(err);
  //     }
  //   }
  // });
});

app.post("/dashboard",upload,function(req,res){
  product = new Product({
    category:req.body.category,
    name:req.body.name,
    image:req.file.filename,
    location:req.body.location,
    description:req.body.description,
    price:req.body.price,
    uploaded:req.body.uploaded,
    status:req.body.status,
    per:req.body.per
  });

  product.save(function(err){
    if (err){
        console.log(err);
    }
    else{
      res.redirect("/dashboard");
    }
  });
});

app.post("/products",function(req,res){
  var x=req.body.verified;
  if(x==="yes"){
    console.log("Verified!!");
    res.redirect("/products");
  }
});

app.post("/admin",function(req,res){
  var verified=req.body.verified;
  if(verified=="Accept")
  {
    verified="true";
  }
  else if(verified=="Reject")
  {
    verified="false";
  }
  Product.updateOne({_id:req.body.id},{ $set: { verified: verified } },function(req,res,err){
    if(err)
    {
      console.log(err);
      res.redirect("/");
    }
  });
  res.redirect("/admin");
});

app.post("/failure",function(req,res){
  res.redirect("/login");
});



//--------------------------------listening at port 3000-------------------------------
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
