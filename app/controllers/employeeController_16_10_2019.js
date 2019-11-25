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
                    { header: 'id', key: 'id', width: 10 },
                    { header: 'emp_id', key: 'empid', width: 30 },
                    { header: 'Firstname', key: 'firstname', width: 30 },
                    { header: 'Middlename', key: 'middlename', width: 30 },
                    { header: 'Lastname', key: 'lastname', width: 30 },
                    { header: 'State', key: 'state', width: 10, outlineLevel: 1 },
                    { header: 'Country', key: 'country', width: 10, outlineLevel: 1 },
                    { header: 'Visa_start_date', key: 'visa_start_date', width: 30 },
                    { header: 'Visa_end_date', key: 'visa_end_date', width: 30 },
                    { header: 'Employee_type', key: 'employment_type', width: 30 },
                    { header: 'City', key: 'city', width: 30 },
                    { header: 'Driving_license', key: 'driving_license', width: 30 },
                    { header: 'Religion', key: 'religion', width: 30 },
                    { header: 'Landline', key: 'emergency_contact', width: 30 },
                    { header: 'Address1', key: 'addrline1', width: 30 },
                    { header: 'Address2', key: 'addrline2', width: 30 },
                    { header: 'Joined_date', key: 'joined_date', width: 30 },
                    { header: 'Company_register_Number', key: 'ic_no', width: 30 },
                    { header: 'Salary', key: 'salary', width: 30 },
                    { header: 'Basic_salary', key: 'basic_salary', width: 30 }
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

