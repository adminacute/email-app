const fs = require("fs");
import express from 'express';
import cookieParse from 'cookie-parser';
import bodyParser from 'body-parser';
// import partnerOnboard from '';

// import {error as errorMiddleware} from './middlewares/index';
import {partnerEmailTemplate,transportConnection} from './config/index';
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParse());

//making route
const partner = require('./routes/partner');

app.use('/partner',partner);
app.get('/sendemail',async function (req, res) {
    try{
        const data:any =  fs.readFileSync('.\\backend\\templates\\partnerWelcome.html');
        
        let trans = await transportConnection(partnerEmailTemplate);
        let message = {
            from: "sanjaysen558@gmail.com",
            to: "sanjay.sen@acuteinformatics.in",
            cc:"",
            subject: "Subject",
            html: data,attachments:[{
              filename:'Ratnaafin.png',
              path:'.\\backend\\templates\\signature.png',  
              cid:'signature'
            }]
       }
       trans.sendMail(message, function(err:any, info:any) {
        if (err) {
          res.send(err)
          console.log(err)
        } else {
          res.send('Email successfully sent')
          console.log(info);
        }
    });
    }catch(e){
        console.log(e);
    }
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