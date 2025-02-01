const express = require("express");
const connectDB = require("./config/database")
const app = express();
const cookieparser = require('cookie-parser');
var cors = require('cors')
const http = require('http');
const intializeSocket = require("./utils/socket");

require("dotenv").config();
require("./utils/cronJob");

app.use(cors({
    origin: ["http://localhost:5173", "http://192.168.42.60:7777","http://localhost:7777"], 
    credentials: true, 
  }));

const aothRouter = require("../src/routes/Aoth");
const profileRouter = require("../src/routes/profile");
const requestRouter = require("../src/routes/request");
const userRouter = require("./routes/users");
const chatRouter = require("./routes/chat");


app.use(express.json());
app.use(cookieparser())

app.use('/', aothRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', chatRouter);

const server = http.createServer(app);
intializeSocket(server);

connectDB().then(()=>{
    console.log("database connected sucessfully")
    server.listen(process.env.PORT ,()=>{ console.log("server is successfully listening on port 7777")});
}).catch(err=>{
    console.error("database cannot be connected " +":"+ err)
})

