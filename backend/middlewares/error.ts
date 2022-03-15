export const error = (err:any, req:any, res:any, next:any) => {
    //err.statusCode = err.statusCode || 500;
    //err.message = err.message || "Internal Server error";
    if ((typeof(err.status) === "number") || (err.status !== "99")){
        err.status = "99";
        err.detail = err?.message??"Something went wrong please try again.";
    }
    if (process.env.NODE_ENV === "DEVELOPMENT") {
        res.status(err.statusCode).json({
            //success: false,
            //error: err,
            //errMessage: err.message,
            status:err?.status??"99",
            errorData:{ 
                errorCode:err?.code??"-99",
                errorTitle:err?.title??"Unexpected Error.",
                errorMessage: err?.message??"Something went wrong please try again.",
                errorDetail:err?.detail??"Something went wrong please try again.",
                stack: err?.stack??""
            },            
        });
    }
    if (process.env.NODE_ENV === "PRODUCTION") {
        res.status(err.statusCode).json({
            //success: false,
            //message: err.message || "INTERNAL SERVER ERROR",
            status:err?.status??"99",
            errorData:{ 
                errorCode:err?.code??"-99",
                errorTitle:err?.title??"Unexpected Error.",
                errorMessage: err?.message??"Unexpected Error.",
                errorDetail:err?.detail??"Unexpected Error."
            },            
        });
    }
    // res.status(err.statusCode).json({
    //   success: false,
    //   error: err.stack,
    // });
};

