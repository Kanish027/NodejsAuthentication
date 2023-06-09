import express from "express";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://localhost:27017",{
    dbName : "backend",
}).then(()=>console.log("Connected to database"))
  .catch((e)=>console.log(e));

  const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
  });

  const User = mongoose.model("User",userSchema); 

const app = express();

// const user = [];

// Middleware
app.use(express.static(path.join(path.resolve(),"public")));
// We can access the data by using below middleware
app.use(express.urlencoded({extended:true}));
// cookieParser middleware
app.use(cookieParser());
// Setting Up View Engine
app.set("view engine","ejs");

const isAuthenticated = async(req,res,next) =>{
    const {token} = req.cookies;
    if(token){
    const decoded = jwt.verify(token,"kanishkanishkanishkanishkanish");
    // console.log(decoded);
    req.user = await User.findById(decoded._id);
        next();
    }else{
        res.redirect("/login");
    }
};
app.get("/",isAuthenticated,(req,res) => {

    // Here in user all values are stored
    // console.log(req.user);

    res.render("Logout",{name : req.user.name});

});

// app.get("/add",async(req,res)=>{
//     await message.create({
//         username : "Kanishmohariya@gmail.com",
//         password : "Kanish27$",
//     });
//     res.send("Nice");
//     console.log("Data Inserted");
// })

app.get("/",(req,res)=>{

   const {token} = req.cookies;
    // console.log(token);

        if(token){
            res.render("logout");
        }else{
            res.render("login");
        }
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/login",(req,res)=>{
    res.render("login"); 
});

app.post("/login",async(req,res)=>{

    const {email, password} = req.body;

    let user = await User.findOne({email});

    if(!user) return res.redirect("/register");

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch) return res.render("login",{email, message : "Incorrect Password"});

    const token = jwt.sign({_id : user._id} , "kanishkanishkanishkanishkanish");

    // console.log(token)

    res.cookie("token",token,{
        httpOnly : true, 
        expires : new Date(Date.now()+50*1000),
    });
    res.redirect("/");

});

// Login Function
app.post("/register",async(req,res)=>{

    const {name, email , password } = req.body;

    console.log(req.body);

    let user = await User.findOne({email});

    if(user){
        return res.render("register",{msg : "User already exists back to login"});
    }

    const hashedPassword = await bcrypt.hash(password,10);

     user = await User.create({
        name,
        email,
        password : hashedPassword,
    });

    const token = jwt.sign({_id : user._id} , "kanishkanishkanishkanishkanish");

    // console.log(token)

    res.cookie("token",token,{
        httpOnly : true, 
        expires : new Date(Date.now()+50*1000),
    });
    res.redirect("/");
});

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly : true,
        expires : new Date(Date.now()),
    });
    res.redirect("/");
})

// app.get("/success",(req,res) => {
//     res.render("success.ejs")
// })

// app.post("/contact", async(req,res)=>{
    
//     const messageData = { username : req.body.username , password : req.body.password};
    
//     await message.create(messageData)

//     res.redirect("/success");

//     console.log(messageData);

// });

// app.get("/users",(req,res) => {
//     res.json({
//         user
//     })
// });

app.listen (5000,() => {
    console.log("Server is Working");
});