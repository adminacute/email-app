export const catchAsyncErrors = (func:any) => {
    return (req:any, res:any, next:any) => {
        return Promise.resolve(func(req, res, next)).catch(next);
    };
};