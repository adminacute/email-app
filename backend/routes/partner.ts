const express = require("express");
const partner = express.Router();

const partnerController = require('../controller/partnerController');
// import partnerController from '../controller/partnerController';
//define controller
partner.route("/product-activation-email").post(partnerController.onboardEmail)
partner.route("/post/test").post(partnerController.postTest)
module.exports = partner;