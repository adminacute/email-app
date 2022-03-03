import express from 'express';
import cookieParse from 'cookie-parser';
import bodyParser from 'body-parser';
import {error as errorMiddleware} from './middlewares/index';
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParse());

//route
const auth = require('./routes/auth');
//const los = require('./routes/los');
//const crm = require('./routes/crm');

app.use('/auth',auth);
//app.use('/los',los);
//app.use('/crm',crm);

app.use(errorMiddleware);

module.exports = app;