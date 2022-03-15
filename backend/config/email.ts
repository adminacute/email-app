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

export const sendMail = async(transsactionObj:any,message:any):Promise<any|undefined> => {
    return await transsactionObj.sendMail(message,((err:any,info:any)=>{
        if(err){
            console.log(err);
        }
    }));
}

export const contentTransform = async(type:any,content:any,dataPair:any)=>{
    var newData = content;
    var strData:string = newData.toString();
    console.log('contentTransform start:',Date);
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

            strData = strData.replace(/#{idcUserName}/g,dataPair?.idc?.userName);
            strData = strData.replace(/#{idcMobile}/g,dataPair?.idc?.emailId);
            strData = strData.replace(/#{idcEmailId}/g,dataPair?.idc?.mobile);
            
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