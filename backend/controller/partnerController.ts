// const errorHandler = require("../utils/errorHandler");
const errorHandler = require("../utils/errorHandler");
import { dbConnection, database, sendMail1, myconsole } from '../config/index';
import { catchAsyncErrors } from '../middlewares/index';
import {transportConnection,contentTransform,generatePayout} from '../config/index';
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
        
        //partner payout table generate process
        myconsole("payout table generating...",new Date().toUTCString());
        let mainLabel,payoutContent,payoutContentData,payoutContentDefaultData = "<u><i>Failed to load <b>Payout Details.</b></i></u>"; 
        let categoryName         = reqBody?.categoryName ?? "";     
        let typeOfPartner        = reqBody?.idcType ?? "";
        let commissionCategName  = reqBody?.commissionCateg ?? "";
        if(categoryName && typeOfPartner && commissionCategName){
            //eg: Retail Loans | IDC/Connector | SILVER
            mainLabel = categoryName+" | "+typeOfPartner+" | "+commissionCategName; 
            let params = {
                categoryCode   : reqBody?.categoryCode,
                idcTypeCode    : reqBody?.idcTypeCode,
                commissionCode : reqBody?.commissionCode,
                mainLabel      : mainLabel  
            }
            console.log("my param:",params);
            //calling method to generate
            payoutContent = await generatePayout(connection,params);
            if(payoutContent?.status == "0"){
                payoutContentData = payoutContent?.data; 
            }else{
                payoutContentData = payoutContentDefaultData;
            }
        }else{
            payoutContentData = payoutContentDefaultData;
        }
        var content:any =  fs.readFileSync(data?.filePath);
        content = await contentTransform('productActivation',content,payoutContentData,reqWithData);
        
        //fetch email configuration
        const emailConfig = {
            host: data?.hostName ?? '',
            port: data?.port ?? '',
            auth: {
                user: data?.userId ?? '',
                pass: data?.password ?? ''
            }
        }

        //create instance for emailSender
        let trans   = await transportConnection(emailConfig);
        //setting up email properties
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
    let resObject,emailResult;
    const emailConfig = {
        host: 'smtp.gmail.com',
        port: '587',
        auth: {
            user: 'sanjay.sen@acuteinformatics.in',
            pass: 'cxgnguuvdmcbsjur'
        }
    }
    let trans   = await transportConnection(emailConfig);
    let content = '<html><body><table border="1" cellspacing="0" cellpadding="12"><tr><th>Name</th><th>Age</th><tr><td>sanjay</td><td>22</td><tr><td>aakash</td><td>22</td></table></body></html>';
    
   let data:any = {
    categoryCode:"12000001",
    idcTypeCode:"01",
    commissionCode:"01",
    mainLabel:"Retail Loans | IDC/Associate | SILVER"
   }
   //@ts-ignore
   let connection = await dbConnection(database);
   let payoutProcess = await generatePayout(connection,data);
   let message = {
    from: 'noreply@acuteinformatics.in',
    replyTo: 'noreply@acuteinformatics.in',
    to: 'sanjaysen558@gmail.com',
    cc: '',
    subject: 'Test-Email_07/04/2022',
    html: "<h1>Welcome, Sanjay</h1>"+payoutProcess?.data,attachments:[{
      filename:'Ratnaafin.png',
      path:'.\\backend\\templates\\signature.png',  
      cid:'signature'
    },{
        filename:'Ratnaafin1.png',
        path:'.\\backend\\templates\\signature.png',  
        cid:'signature1'
      }]
}
   myconsole("messageMeta:",message);
   myconsole("email sending...",new Date().toUTCString()) 
   resObject = await sendMail1(trans,message);
   myconsole("emailResult",resObject);
   res.send(resObject);
    // res.send(payoutProcess);
})

