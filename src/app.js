const express = require("express");
const connectDB = require("./config/database")
const app = express();
const cookieparser = require('cookie-parser');
var cors = require('cors')

app.use(cors({
    origin: ["http://localhost:5173", "http://192.168.42.60:7777","http://localhost:7777"], 
    credentials: true, 
  }));

const aothRouter = require("../src/routes/Aoth");
const profileRouter = require("../src/routes/profile");
const requestRouter = require("../src/routes/request");
const userRouter = require("./routes/users");

app.use(express.json());
app.use(cookieparser())

app.use('/', aothRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);


connectDB().then(()=>{
    console.log("database connected sucessfully")
    app.listen(7777 ,()=>{ console.log("server is successfully listening on port 7777")});
}).catch(err=>{
    console.error("database cannot be connected " +":"+ err)
})


