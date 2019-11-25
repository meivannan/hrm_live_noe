var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var validation = require('../common/validation');
var authModels = require('../models/authModels');
const excel = require('exceljs');
var commonConfig = require('../config/common_config');
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
    Uploaddocument: (req, res) => {
        authModels.Uploaddocument(req).then(results => {
            res.json(results);
        });
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
 },
 employeeForgotpassword: (req, res) => {
    validation.validateemployeeForgotpassword(req).then((validationResults) => {
        if (validationResults.length == 0) {
            authModels.EmployeeforgotPassword(req).then(result => {
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
resetPassword: (req, res) => {
    validation.validateresetPassword(req).then((validationResults) => {
        if (validationResults.length == 0) {
            console.log("hdhvd")
            authModels.resetPassword(req).then(result => {
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
exportShglist: (req, res) => {
    if (req.body.company_id != undefined && req.body.company_id != ''&& req.body.month!=undefined) {
        var company_id = req.body.company_id;
      
      var month=req.body.month
        var year=req.body.year;
        authModels.Exportshg_details(company_id,month,year).then(result => {
           if(result.length > 0)
           {
            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet('SHG_list');
            worksheet.columns = [
                { header: 'Employee_id', key: 'employee_id', width: 10 },
                { header: 'Employee_name', key: 'employee_name', width: 30 },
                { header: 'SHG_type', key: 'shg_type', width: 30 },
                { header: 'Amount', key: 'shg_amount', width: 30 },
             
            ];
            worksheet.addRows(result);
            var path = "/uploads/SHG_list.xlsx";

            workbook.xlsx.writeFile("./public/uploads/SHG_list.xlsx").then(function (err, results) {
                if (err) {
                    console.log(err);
                    res.json({ status: 0, message: "Failed to save file" });
                } else {
                    res.json({ status: 1, message: "File saved successfully", path: commonConfig.SERVER_URL_STATIC + ":9001" + path });
                }
            });
           }
           else
           {
               res.json({status:0,message:"Payroll not generated"})
           }
            
        });
    } else {
        res.json({ status: 0, message: "Please enter company_id" });
    }
}
}

