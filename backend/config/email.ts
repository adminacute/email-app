 const nodemailer = require('nodemailer');
 export const partnerEmailTemplate = {
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: "sanjay.sen@acuteinformatics.in",
        pass: "zncvowccznfjwzti"
    }
};

export const transportConnection = async (config: any): Promise<any|undefined> => {
    return await nodemailer.createTransport(config);
}