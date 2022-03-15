import { error } from './error';
import { catchAsyncErrors } from './catchAsyncErrors';
const jwt = require("jsonwebtoken");
const errorHandler = require("../utils/errorHandler");

export const isAuthenticatedUser = catchAsyncErrors(async function (req, res, next) {
    const { token } = req.cookies;

    if (!token) {
        return next(new errorHandler("Login first to access this resource.", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //req.user = await user.findById(decoded.id);

    next();
});