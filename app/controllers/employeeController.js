var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var validation = require('../common/validation');
var employeeModels = require('../models/employeeModels');
var commonConfig = require('../config/common_config');
const excel = require('exceljs');
module.exports = {

    addEmployee: (req, res) => {

        employeeModels.addEmployee(req).then(results => {
            res.json(results);
        });
    },

    excelImportEmployees: (req, res) => {

        employeeModels.excelImportEmployees(req, res).then(results => {
            res.json(results);
        });

    },

    empolyeeDelete: (req, res) => {

        validation.validateemplyDelete(req).then((validationResults) => {

            if (validationResults.length == 0) {
                employeeModels.employeeDelete(req).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }

        });
    },

    empolyeeUpdate: (req, res) => {

        employeeModels.updateEmployee(req).then(results => {
            res.json(results);
        });

    },

    empolyeeDetailsById: (req, res) => {
        if(req.body.emp_id!=undefined&&req.body.emp_id!='')
        {
            employeeModels.employeedetailsByID(req).then(results => {
                res.json(results);
            });
        }
        else
        {
            res.json({status:0,message:"Please pass the emp_id"})
        }
               

           
    },

    employeeList: (req, res) => {

        if (req.body.company_id != undefined && req.body.company_id != '') {
            var company_id = req.body.company_id;

            employeeModels.employeeList(company_id).then(result => {
                res.send(result);
            });

        } else {
            res.json({ status: 0, message: "Please enter company_id" });
        }

    },
    
    exportleave_details: (req, res) => {

        if (req.body.company_id != undefined && req.body.company_id != '') {
            var company_id = req.body.company_id;

            employeeModels.Exportleave_details(company_id).then(result => {
                res.send(result)
            });

        } else {
            res.json({ status: 0, message: "Please enter company_id" });
        }

    },

    exportemployee_details: (req, res) => {
        if (req.body.company_id != undefined && req.body.company_id != '') {
            var company_id = req.body.company_id;
            
            employeeModels.Exportemployee_details(company_id).then(result => {
                let workbook = new excel.Workbook();
                let worksheet = workbook.addWorksheet('employee_details');
                worksheet.columns = [
                    { header: 'ID', key: 'id', width: 10 },
                    { header: 'EMP ID', key: 'empid', width: 30 },
                    { header: 'EMP NAME', key: 'employeename', width: 30 },
                    { header: 'IC_NUMBER', key: 'ic_no', width: 30 },
                    { header: 'DRIVING_LICENSE', key: 'driving_license', width: 30 },
                    { header: 'RELIGION', key: 'religionname', width: 30 },
                    { header: 'LANDLINE', key: 'home_contact', width: 30 },
                    { header: 'EMERANCY_CONTACT', key: 'emergency_contact', width: 30 },
                    { header: 'BLOOD_GROUP', key: 'blood_group', width: 30 },
                    { header: 'EMAIL', key: 'email', width: 30 },
                    { header: 'ADDRESS 1', key: 'addrline1', width: 30 },
                    { header: 'ADDRESS 2', key: 'addrline2', width: 30 },
                    { header: 'STATE', key: 'state', width: 10, outlineLevel: 1 },
                    { header: 'COUNTRY', key: 'country', width: 10, outlineLevel: 1 },
                    { header: 'CITY', key: 'city', width: 30 },
                    { header: 'VISA_STATUS', key: 'visastatus', width: 30 },
                    { header: 'VISA START DATE', key: 'visa_start_date', width: 30 },
                    { header: 'VISA END DATE', key: 'visa_end_date', width: 30 },
                    { header: 'EMPLOYEE TYPE', key: 'employee_type', width: 30 },
                     
                    { header: 'JOINED_DATE', key: 'joined_date', width: 30 },
                   
                    { header: 'SALARY', key: 'salary', width: 30 },
                    { header: 'BASIC SALARY', key: 'basic_salary', width: 30 },
                    { header: 'EMPLOYEE_ROLE', key: 'rolename', width: 30 }
                ];
                worksheet.addRows(result);
                var path = "/uploads/Employee_details.xlsx";

                workbook.xlsx.writeFile("./public/uploads/Employee_details.xlsx").then(function (err, results) {
                    if (err) {
                        console.log(err);
                        res.json({ status: 0, message: "Failed to save file" });
                    } else {
                        res.json({ status: 1, message: "File saved successfully", path: commonConfig.SERVER_URL_STATIC + ":9001" + path });
                    }
                });
            });
        } else {
            res.json({ status: 0, message: "Please enter company_id" });
        }
    },
    employee_quotavalidate: (req, res) => {

        if (req.body.visa_status != undefined && req.body.visa_status != '') {
            var company_id = req.body.company_id;
            var visa_status = req.body.visa_status;
            var sector_type = req.body.sector_type;

            employeeModels.Employee_Quotavalidate(company_id,visa_status,sector_type).then(result => {
                res.send(result)
            });

        } else {
            res.json({ status: 0, message: "Please enter Visa Status" });
        }

    },
}

