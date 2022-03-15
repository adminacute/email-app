// const errorHandler = require("../utils/errorHandler");
const errorHandler = require("../utils/errorHandler");
import { dbConnection, database } from '../config/index';
import { catchAsyncErrors } from '../middlewares/index';
import {partnerEmailTemplate,transportConnection,contentTransform,sendMail} from '../config/index';
import { utimes } from 'fs';
const fs = require('fs');
const errorMessage = "Something went wrong please try again.";

//send partner onbaord email
export const onboardEmail = catchAsyncErrors(async (req: any, res: any, next: any) => {
    let connection,flag = false,resObject;
    let errorData:any;
    let reqBody = req.body;
    console.log('Requst body:',reqBody);
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
        console.log("length:",result.rows.length);
        if (result.rows.length <= 0) {
            resObject = {
                status: "99",
                error_cd: "-99",
                error_title: "Template Error",
                error_detail: "configuration not found",
                error_msg: "No rows found for templateId:"+reqBody?.templateId,
            }
            res.send(resObject);
            return;
        }
        console.log("data fetched:",result.rows);
        data = result.rows[0] ?? {};
        reqWithData = {...data,...reqBody};
        console.log("reqWithData",reqWithData);
        //fetch variables
        console.log('filePath:',data?.filePath);
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
        
        console.log("end transportConnectin:",new Date())
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
    //    console.log("messageMeta:",message);
       console.log("start sending:",new Date().toUTCString())
       const abcd = await sendMail(trans,message);
       console.log("abcd",abcd);
       //trans.sendMail(message, function(err:any, info:any) {
       //console.log("end sending:",new Date().toUTCString())
    //     if (err) {
    //       flag = false;
    //       console.log("Error occured",err.response);
    //       errorData = err;
    //     } else {
    //       flag = true;
    //       console.log("success",info);
    //       console.log('Email sent successfully') ;
    //     }
    //     });   
    // } catch (err:any) {
    //     flag = false;
    //     console.log('Catch',err);
    //     errorData = err;
    //     // return next(new errorHandler("", "", "", "Database Connection Refused.", err, 400));
    // } finally {
    //     console.log("final flag",flag);
    //     if (connection) {
    //         try {
    //             await connection.close();
    //         } catch (err) {
    //             console.warn("failed to close connection");
    //             // return next(new errorHandler("", "", "", "Database Connection Refused.", err, 400));
    //         }
    //     };
    //     // return next(new errorHandler("failed to send email", "99", "-99", "Failed to send email.", errorData, 400)); 
      
    }catch(err:any){
        console.log("error",err);
    }
    // console.log("finish");
    // return {
    //     status : 0,
    //     response_data : {
    //         message : "email sent"
    //     }
    // }
    res.send({
        status : 0,
        response_data : {
            message : "email sent"
        }
    });
});
//test post request
export const postTest = catchAsyncErrors(async(req:any, res:any, next:any)=>{
    console.log("post data recevied");
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

