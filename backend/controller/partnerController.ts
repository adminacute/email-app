// const errorHandler = require("../utils/errorHandler");
const errorHandler = require("../utils/errorHandler");
import { dbConnection, database, sendMail1, myconsole } from '../config/index';
import { catchAsyncErrors } from '../middlewares/index';
import {transportConnection,contentTransform} from '../config/index';
import { utimes } from 'fs';
const fs = require('fs');
const errorMessage = "Something went wrong please try again.";

//send partner onbaord email
export const onboardEmail = catchAsyncErrors(async (req: any, res: any, next: any) => {
    let connection,flag = false,resObject;
    let errorData:any,emailResult:any;
    let reqBody = req.body;
    myconsole('Request body:',reqBody);
    try {
        //@ts-ignore
        connection = await dbConnection(database);
        
        let query = `select  
                        temp_name as "desc", 
                        user_id as "userId", 
                        user_password as "password", 
                        port as "port", host_name as "hostName" , 
                        html_file_path as "filePath", 
                        additional_note1 as "note1", 
                        additional_note2 as "note2", 
                        signature_line1 as "signatureLine1", 
                        signature_line2 as "signatureLine2", 
                        disclaimer as "disclaimer",
                        subject as "subject", 
                        to_cc as "toCC", 
                        to_bcc as "toBCC"
                    from email_template_hdr e
                    where e.tran_cd = :tran_cd`;
        let data:any, reqWithData:any;
        
        const result: any = await connection?.execute(query, [reqBody?.templateId]);
        myconsole("check-length","length:"+result.rows.length);
        if (result.rows.length <= 0) {
            resObject = {
                status: "99",
                message : "configuration not found, Id="+reqBody?.templateId,
            }
            res.send(resObject);
            return;
        }
        myconsole("data fetched:",result.rows);
        data = result.rows[0] ?? {};
        reqWithData = {...data,...reqBody};
        // myconsole("reqWithData",reqWithData);
        //fetch variables
        // myconsole('filePath:',data?.filePath);
        var content:any =  fs.readFileSync(data?.filePath);
        content = await contentTransform('productActivation',content,reqWithData);
        const emailConfig = {
            host: data?.hostName ?? '',
            port: data?.port ?? '',
            auth: {
                user: data?.userId ?? '',
                pass: data?.password ?? ''
            }
        }
        let trans   = await transportConnection(emailConfig);
        let message = {
			from: data.userId,
            to: reqBody.emailId,
            cc: data.toCC,
            subject: data.subject,
            html: content,attachments:[{
              filename:'Ratnaafin.png',
              path:'.\\backend\\templates\\signature.png',  
              cid:'signature'
            }]
       }
    //    myconsole("messageMeta:",message);
       myconsole("email sending...",new Date().toUTCString()) 
       resObject = emailResult = await sendMail1(trans,message);
       myconsole("process completed:",new Date().toUTCString()) 
       myconsole("emailResult",resObject);
    }catch(err:any){
        myconsole("error",err);
        resObject = {
            status: "99",
            message : err,
        }
    }finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.warn("failed to close connection",err);
                // return next(new errorHandler("", "", "", "Database Connection Refused.", err, 400));
            }
        };
    }
    res.send(resObject);
    return;
});
//test post request
export const postTest = catchAsyncErrors(async(req:any, res:any, next:any)=>{
    const body = req.body;
    let reqData = body.request_data;
    let data1 = reqData?.data1;
    const result = {
        status : "0",
        data : data1,
    }
    res.status(200);
    res.send(result);

})

