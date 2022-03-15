//Error handler class
class ErrorHandler extends Error {
    status:any;
    code:any;
    title:any;
    detail:any;
    statusCode:any;    
    constructor(message:any, status:any,code:any,title:any,detail:any,statusCode:any) {
      super(message);
      this.statusCode = statusCode;
      this.status = status;
      this.code = code;
      this.title = title;
      this.detail = detail;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  module.exports = ErrorHandler;
  