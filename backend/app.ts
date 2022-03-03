const fs = require("fs");
import express from 'express';
import cookieParse from 'cookie-parser';
import bodyParser from 'body-parser';

// import {error as errorMiddleware} from './middlewares/index';
import {partnerEmailTemplate,transportConnection} from './config/index';
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParse());

app.get('/',async function (req, res) {
    try{
        const data:any =  fs.readFileSync(__dirname+'/temp.html');
        
        let trans = await transportConnection(partnerEmailTemplate);
        let message = {
            from: "sanjay.sen@acuteinformatics.in",
            to: "milan.pithiya@acuteinformatics.in",
            subject: "Subject",
            html: data
       }
       trans.sendMail(message, function(err:any, info:any) {
        if (err) {
          console.log(err)
        } else {
          console.log(info);
        }
    });
    }catch(e){
        console.log(e);
    }
    
    res.send('hello world')
});
//route
// const auth = require('./routes/auth');
//const los = require('./routes/los');
//const crm = require('./routes/crm');

// app.use('/auth',auth);
//app.use('/los',los);
//app.use('/crm',crm);

// app.use(errorMiddleware);

module.exports = app;