const express = require('express');
const app = express();
const userRouter = require('./routes/user.routes.js');
const indexRouter = require('./routes/index.router.js');
const dotenv = require('dotenv');
dotenv.config();
const connectToDB = require('./config/db.js');
connectToDB();
const cookieParser = require('cookie-parser');
const PORT = 3000;

app.set("view engine","ejs");
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/',indexRouter);
app.use('/user',userRouter);

app.listen(PORT,(req,res)=>{
    console.log(`app is listening on PORT: ${PORT}.`);
});