import { myconsole } from "./utility";

 const nodemailer = require('nodemailer');
 export const partnerEmailTemplate = {
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: "sanjay.sen@acuteinformatics.in",
        pass: "cxgnguuvdmcbsjur"
    }
};

export const transportConnection = async (config: any): Promise<any|undefined> => {
    return await nodemailer.createTransport(config);
}

export const sendMail = async (transsactionObj: any, message: any): Promise<any | undefined> => {
    return await transsactionObj.sendMail(message, ((err: any, info: any) => {
        if (err) {
            console.log(err);
        }
    }));
};
//https://stackoverflow.com/questions/56508261/nodemailer-email-confirmation-using-async-await
export const sendMail1 = async(transactionObj: any, message: any) => {
    return new Promise((res) => {
        transactionObj.sendMail(message, ((error: any, info: any) => {
            if (error) {
                res({ status: "99", message: error.response });
            } else { 
                res({ status: "0", message: "Mail Sent." });
            }
        }));
    });
};

export const contentTransform = async(type:any,content:any,payoutContentData:any,dataPair:any)=>{
    var newData = content;
    var strData:string = newData.toString();
    myconsole('content is transforming...','');
    switch(type){
        case "productActivation":
            console.log('productActivation case found');
            strData = strData.replace(/#{firstName}/g,dataPair.firstName);
            strData = strData.replace(/#{lastName}/g,dataPair.lastName);
            strData = strData.replace(/#{roleName}/g,dataPair.roleName);
            strData = strData.replace(/#{registrationCode}/g,dataPair.regCode);
            strData = strData.replace(/#{category}/g,dataPair.commissionCateg);
            strData = strData.replace(/#{productCategory}/g,dataPair.productName);
            strData = strData.replace(/#{employeeUserName}/g,dataPair?.employee?.userName);
            strData = strData.replace(/#{emloyeeEmailId}/g,dataPair?.employee?.emailId);
            strData = strData.replace(/#{employeeMobile}/g,dataPair?.employee?.mobile);
            strData = strData.replace(/#{bvhUsername}/g,dataPair?.bvh?.userName);
            strData = strData.replace(/#{bvhEmailId}/g,dataPair?.bvh?.emailId);
            strData = strData.replace(/#{bvhMobile}/g,dataPair?.bvh?.mobile);

            //add payout table
            strData = strData.replace(/#{payoutTable}/g,payoutContentData);
            

            strData = strData.replace(/#{idcUserName}/g,dataPair?.idc?.userName);
            strData = strData.replace(/#{idcMobile}/g,dataPair?.idc?.mobile);
            strData = strData.replace(/#{idcEmailId}/g,dataPair?.idc?.emailId);
            
            strData = strData.replace(/#{note1}/g,dataPair.note1);

            strData = strData.replace(/#{signatureLine1}/g,dataPair.signatureLine1);
            strData = strData.replace(/#{signatureLine2}/g,dataPair.signatureLine2);
            strData = strData.replace(/#{disclaimer}/g,dataPair.disclaimer);
            break;
        default:
            return content;
    }
    // console.log('contentTransform end:',strData);
    return strData;
}

export const generatePayout = async(connection:any,{categoryCode,idcTypeCode,commissionCode,mainLabel}:any)=>{
    //let startOf = `<html><head><style> .table{table-layout:fixed;padding:0;border-spacing:1.4px;width:100%;background-color:#fff;font-size:small}.mainLabel{background-color:white;text-align1:center;font-size:14px;}.text{font-family:calibri}.column{background-color:#237bdc;color:#fff;vertical-align:center;font-size:14px;}.data1{background-color:#26a456;color:#fff;font-weight:500;text-align:center;}.data2{background-color:#26a456;color:#fff;font-weight:400;text-align:right;}</style></head><body class = "text"><table class="table">`;
    let startOf = `<html><head><style>.table{table-layout:fixed;border-spacing:1.4px;background-color:#000;width:100%;font-size:small;margin:0;padding:0}.mainLabel{background-color:#888;text-align1:center;font-size:14px;color: white}.text{font-family:calibri}.column_gr1{background-color:#237bdc;color:#fff;vertical-align:center;font-size:13px}.column_gr2{background-color:#26a456;color:#fff;vertical-align:center;font-size:13px}.data1{color:#237bdc;font-weight:500;text-align:center;font-size:13px;background-color:#fff}.data2{color:#26a456;font-weight:500;text-align:right;background-color:#fff}</style></head><body class="text"><table class="table">`;
    let endOf   = `</table></body></html>`;
    console.log("generatePayout-mainLabel",mainLabel);
    let label1 = `<tr class="mainLabel" rowspan=2>
                    <th colspan="3">Product Category | Type | Commission Type</th>
                  </tr><tr class="mainLabel"><th colspan="3" style = "color:black; font-size:13px">{mainLabel}</th></tr>`.replace('{mainLabel}',mainLabel);
    //let columns = `<tr class="column"><th>Product(s)</th><th colspan="2">Type of Bank</th><tr class="column"><th>From-Amount(₹)</th><th>To-Amount(₹)</th><th>Payout(%)</th></tr>`;
    let columns = `<tr class="column_gr1"><th>Product(s)</th><th colspan="2">Type of Bank</th><tr class="column_gr2"><th>From-Amount(₹)</th><th>To-Amount(₹)</th><th>Payout(%)</th></tr>`;
    let body = ``;
    let resObject:any = {};
    try {
        let sql = `select
                        s.tran_cd as "tranCode",
                        s.sr_cd as "srCode",
                        s.line_id as "lineId",
                        func_get_sub_prod_desc(h.category_cd) as "categoryName", 
                        replace(to_char(func_get_product_jlist_name('['||h.product_cd||']')),',',',<br>') as "prods",
                        func_get_crm_misc_disp_value('BANK_TYPE',h.bank_type) as "bankType",
                        trim(to_char(s.from_amount,'99,99,99,99,999.00')) as "fromAmount",
                        trim(to_char(s.to_amount,'99,99,99,99,999.00')) as "toAmount",
                        trim(to_char(s.percentage,'0.00')) as "percentage"
                from crm_los_idc_payout_matrix_hdr h,crm_los_idc_payout_matrix_dtl d,crm_los_idc_payout_matrix_sdt s
                where h.tran_cd = d.tran_cd
                and d.tran_cd = s.tran_cd
                and d.sr_cd = s.sr_cd
                and h.category_cd = :categoryCode
                and h.idc_type = :idcTypeCode
                and h.idc_category = :commissionCode
                and h.active = 'Y'
                and s.sr_cd = d.sr_cd
                and ( (to_date(sysdate,'dd/mm/rrrr') between to_date(d.from_dt,'dd/mm/rrrr') and to_date(d.to_dt,'dd/mm/rrrr'))
                    or (to_date(sysdate,'dd/mm/rrrr') >= to_date(d.from_dt,'dd/mm/rrrr') and d.to_dt is null))
                order by s.tran_cd,s.sr_cd,s.line_id`;
        const sqResult: any = await connection?.execute(sql, [categoryCode,idcTypeCode,commissionCode]);
        let hdrRowsCount = sqResult.rows.length;
        if(hdrRowsCount>0){
            let prevProd:any,prevBankType:any,currProd:any,currBankType:any;
            let headerRow = `<tr class = "data1">`;
            let detailRow = `<tr class = "data2">`; 
            let isheaderPrint:boolean = false; 
            let counter = 0;
            sqResult.rows.map((one:any)=>{
                counter++;
                console.log("new one",one);
                /*
                <tr class = "data1">
                    <td>Retail Home Loan</td>
                    <td colspan="2">Nationalize bank</td>
                </tr>
                <tr class = "data2">
                    <td>10000</td>
                    <td>100001</td>
                    <td style="text-align:center">12.56%</td>
                </tr>
                */
                currProd = one?.prods ?? "";
                currBankType = one?.bankType ?? "";
                console.log("counter",counter);
                console.log("prevProd:",prevProd," currProd:",currProd);
                console.log("prevBankType:",prevBankType," currBankType:",currBankType);
                
                if(counter>1 && (prevProd!==currProd || prevBankType!==currBankType)){
                    console.log("print false");
                    isheaderPrint = false;
                }
                if(!isheaderPrint){
                    body = body+headerRow+`<td>${currProd}</td><td colspan="2">${currBankType}</td></tr>`;
                    isheaderPrint = true;
                }
                body = body+detailRow+`<td>${one?.fromAmount}</td><td>${one?.toAmount}</td><td style="text-align:center">${one?.percentage}</td></tr>`;
                //store current for checking
                prevProd = currProd;
                prevBankType = currBankType;
            });
            body = startOf+label1+columns+body+endOf; 
            body = body.replace("\n","");
            body = body.replace("\r","");
            resObject = {
                status: "0",
                data :body,
            } 
        }else{
            resObject = {
                status: "99",
                data : "No any Payout details:0 rows fetch",
            }  
        } 
    }catch(err){
        myconsole("error",err);
        resObject = {
            status: "99",
            data : err,
        }
    }
    return resObject;
}