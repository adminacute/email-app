import oracledb, { Connection } from 'oracledb';
import dotenv from 'dotenv';

dotenv.config({path:'backend/config/config.env'})

export const database = {
    user: process.env.DB_USER_NAME,
    password: process.env.DB_USER_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
};

export const dbConnection = async (config: any): Promise<Connection | undefined> => {   
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    try {
        return await oracledb.getConnection(config);
    } catch (err) { 
        console.error(err);
    }
    return;
}