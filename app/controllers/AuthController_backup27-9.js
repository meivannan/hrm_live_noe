var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var validation = require('../common/validation');
var authModels = require('../models/authModels');

module.exports = {

    register: (req, res) => {
        validation.validateRegister(req).then((validationResults) => {
            if (validationResults.length == 0) {
                authModels.register(req).then(results => {
                    res.json(results);
                });
            } else {
                res.json({ status: 0, message: validationResults[0].msg })
            }
        });
    },

    login: (req, res) => {
        validation.validateLogin(req).then((validationResults) => {
            if (validationResults.length == 0) {
                authModels.login(req).then(results => {
                    res.json(results);
                });
            } else {
                res.json({
                    status: 0,
                    message: validationResults[0].msg
                });
            }
        });
    },
    Updatecompany_profile : (req, res) => {
        // validation.validateupdate(req).then((validationResults) => {
        //     if (validationResults.length == 0) {
                authModels.UpdateCompayprofile(req).then(results => {
                    res.json(results);
                });
        //     } else {
        //         res.json({ status: 0, message: validationResults[0].msg })
        //     }
        // });
    },
 

    forgotPassword: (req, res) => {
        validation.validateForgotpassword(req).then((validationResults) => {
            if (validationResults.length == 0) {

                authModels.forgotPassword(req).then(result => {
                    res.json(result);
                });

            } else {
                res.json({
                    status: 0,
                    message: validationResults[0].msg
                });
            }
        });
    },

    logout: (req, res) => {
        if (req.body.user_id != undefined && req.body.user_id != '') {
            var user_id = parseInt(req.body.user_id);

            authModels.logout(user_id).then(result => {
                if (result == false) {
                    res.json({ status: 0, message: 'Logout failed' });
                } else {
                    res.json({ status: 1, message: 'Logout successfully' });
                }
            });

        } else {
            res.json({ status: 0, message: 'User ID cannot be empty' });
        }
    },

    companyListbyId: (req, res) => {
        if(req.body.company_id !=undefined  && req.body.company_id!='' )
       {
        var company_id=req.body.company_id;
        console.log(company_id)
                authModels.companyListbyid(company_id).then(result => {
                    res.send(result);
                });
       }
       else
       {
          res.json({
              status:0,
              message:"Please enter the company_id"
          })
       }
 }
}

