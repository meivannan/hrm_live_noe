var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var validation = require('../common/validation');
var leaveModels = require('../models/leaveModels');
var commonConfig = require('../config/common_config');
const excel = require('exceljs');
var ip = require('ip');

module.exports = {
    addLeavetype: (req, res) => {

        
        let {company_id,leavetype_id,leave_type,days,duration}=req.body
     
         leaveModels.addLeavetype(company_id,leavetype_id,days,duration).then(results => {
             res.json(results);
         });

    

 },
    applyLeave: (req, res) => {
        console.log("controller",req.body)
        validation.validateApplyLeave(req).then((validationResults) => {
            if (validationResults.length == 0) {

                leaveModels.applyLeaves(req).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    Curentupdatedleave: (req, res) => {

        if (req.body.company_id != undefined || req.body.company_id != '') {
            var company_id = req.body.company_id;

            leaveModels.CurrentUpdatedleave(company_id).then(results => {
                res.json(results);
            });

        } else {
            res.json({ status: 0, message: "Please enter the company_id" });
        }

    },

    Noticationlist: (req, res) => {
        if (req.body.company_id != undefined && req.body.company_id != '' && req.body.role_id != undefined && req.body.role_id !='') {
       
            var company_id = req.body.company_id;
            let role_id=req.body.role_id;
            let emp_id=req.body.emp_id
         
            console.log("req.body",req.body)
            leaveModels.NoticationList(company_id,role_id,emp_id).then(results => {
                res.json(results);
            });

        } else {
            res.json({ status: 0, message: "Please enter the company_id  and role_id" });
        }
    },

    Updatenotification: (req, res) => {

        if (req.body.notification_id != undefined && req.body.notification_id != '') {
            var notification_id = req.body.notification_id;

            leaveModels.Updatenotification(notification_id).then(result => {
                res.json(result);
            });

        } else {
            res.json({ status: 0, message: "Please enter the notification_id" });
        }
    },

    leavePermission: (req, res) => {
        validation.validateleavepermission(req).then((validationResults) => {
            if (validationResults.length == 0) {

                leaveModels.leavePermission(req).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },
    workStatus: (req, res) => {
        validation.validateworkStatus(req).then((validationResults) => {
            if (validationResults.length == 0) {

                leaveModels.workStatus(req).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    leaveHistory: (req, res) => {
        var leave_type = (req.body.ltype != undefined && req.body.ltype != '') ? req.body.ltype : ''
        var from_date = (req.body.fromdate != undefined && req.body.fromdate != '') ? req.body.fromdate : "";
        var to_date = (req.body.todate != undefined && req.body.todate != '') ? req.body.todate : "";
        var status = (req.body.status != undefined && req.body.status != '') ? req.body.status : 0;
        var emp_id = (req.body.emp_id != undefined && req.body.emp_id != '') ? req.body.emp_id : '';

        leaveModels.leaveHistory(leave_type, from_date, to_date, status, emp_id).then(results => {
            res.json(results);
        });

    },

    workList: (req, res) => {

        leaveModels.workList().then(results => {
            res.json(results);
        });

    },

    leaveHistorybyId: (req, res) => {

        var emp_id = (req.body.emp_id != undefined && req.body.emp_id != '') ? parseInt(req.body.emp_id) : 0;
        var leave_id = (req.body.leave_id != undefined && req.body.leave_id != '') ? parseInt(req.body.leave_id) : 0;

        leaveModels.leavedetailsbyId(emp_id, leave_id).then(results => {
            res.json(results);
        });

    },

    holidayListByYear: (req, res) => {
        validation.validateHolidayListByYear(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var year = req.body.year;
                var company_id = req.body.company_id;

                leaveModels.holidayListByYear(year, company_id).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    assignWork: (req, res) => {
        validation.validateAssignWork(req).then((validationResults) => {
            if (validationResults.length == 0) {

                var company_id = req.body.company_id;
                var emp_type = req.body.emp_type;
                var work_start_time = req.body.work_start_time;
                var work_end_time = req.body.work_end_time;
                var review_by = req.body.review_by;
                var confirmation_from = req.body.confirmation_from;
                var task_description = req.body.task_description;
                var employee_list = req.body.employee_list;
                var outlet_name = (req.body.outlet_name!=undefined)?req.body.outlet_name:'';
                var shift_type = req.body.shift_type;
                var login_id=req.body.login_id
                leaveModels.assignWork(company_id, emp_type, work_start_time, work_end_time, review_by, confirmation_from, task_description, employee_list, shift_type, outlet_name,login_id).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },
    Workupdate: (req, res) => {
        validation.validateUpdateWork(req).then((validationResults) => {
            if (validationResults.length == 0) {
console.log("Sss")
                var company_id = req.body.company_id;
                var emp_type = req.body.emp_type;
                var work_start_time = req.body.work_start_time;
                var work_end_time = req.body.work_end_time;
                var review_by = req.body.review_by;
                var confirmation_from = req.body.confirmation_from;
                var task_description = req.body.task_description;
                var employee_list = req.body.employee_list;
                var outlet_name = (req.body.outlet_name!=undefined)?req.body.outlet_name:'';
                var shift_type = req.body.shift_type;
               var work_id=req.body.work_id
                leaveModels.workUpdate(company_id, emp_type, work_start_time, work_end_time, review_by, confirmation_from, task_description, employee_list, shift_type, outlet_name,work_id).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    Updateleave: (req, res) => {
        validation.validateupdateLeave(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var leave_id = req.body.leave_id;
                var leave_type = req.body.leave_type;
                var from_date = req.body.from_date;
                var to_date = req.body.to_date;
                var from_time = '';
                var to_time = '';
                var reason = req.body.reason;

                if (leave_type == 9) {
                    from_time = req.body.from_time;
                    to_time = req.body.to_time;
                }

                leaveModels.updateLeave(leave_id, leave_type, from_date, to_date, from_time, to_time, reason).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    Dropdownlist: (req, res) => {
        leaveModels.dropDownList(req).then(results => {
            res.json(results);
        });
    },

    workList: (req, res) => {

        if ((req.body.company_id != undefined && req.body.company_id != '')&&(req.body.login_id!=undefined&& req.body.login_id)){
            var company_id = req.body.company_id;
            var login_id=req.body.login_id;
            var role_id=req.body.role_id;
            leaveModels.workList(company_id,login_id,role_id).then(results => {
                res.send(results);
            });
        } else {
            res.json({ status: 0, message: "Please pass the company_id and login_id" });
        }
    },
    dashboardExpense: (req, res) => {

        if ((req.body.company_id != undefined && req.body.company_id != '')&&(req.body.year != undefined && req.body.year != '')) {
            var company_id = req.body.company_id;
            var year=req.body.year
            leaveModels.dashboardExpense(company_id,year).then(results => {
                res.send(results);
            });
        } else {
            res.json({ status: 0, message: "Please enter the company_id and year" });
        }
    },
    worklistByid: (req, res) => {

        if ((req.body.company_id != undefined && req.body.company_id != '')&&(req.body.work_id!=undefined &&req.body.work_id!='')) {
            var company_id = req.body.company_id; 
            var work_id=req.body.work_id
            leaveModels.worklistByid(company_id,work_id).then(results => {
                res.send(results );
            });
        } else {
            res.json({ status: 0, message: "Please pass the company_id and work_id" });
        }
    },  

    Dashboardlist: (req, res) => {

        if (req.body.company_id != undefined || req.body.company_id != '') {
            var company_id = req.body.company_id;

            leaveModels.dashbordlist(company_id).then(results => {
                res.json(results);
            });

        } else {
            res.json({ status: 0, message: "Please enter the company_id" });
        }
    },

    remainingLeaveDetails: (req, res) => {
        
        validation.validateRemainingLeaveDetails(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var emp_id = req.body.emp_id;
                var month_year = req.body.month_year;

                leaveModels.remainingLeaveDetails(emp_id, month_year).then(results => {
                    res.json(results);
                });
            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },

    exportleave_details: (req, res) => {
        var company_id = req.body.company_id;

        leaveModels.Exportleave_details(company_id).then(result => {

            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet('leave_details');

            worksheet.columns = [
                { header: 'leave_id', key: 'leave_id', width: 10 },
                { header: 'emp_id', key: 'empid', width: 30 },
                { header: 'leave_type', key: 'leave_type', width: 30 },
                { header: 'from_date', key: 'from_date', width: 30 },
                { header: 'To_date', key: 'to_date', width: 30 },
                { header: 'Reason', key: 'reason', width: 10, outlineLevel: 1 },
                { header: 'Decline_descripation', key: 'decline_descripation', width: 10, outlineLevel: 1 },
                { header: 'leave_status', key: 'leave_status', width: 10, outlineLevel: 1 },
                { header: 'Employee_name', key: 'employeename', width: 10, outlineLevel: 1 },
                { header: 'From_time', key: 'from_time', width: 10, outlineLevel: 1 },
                { header: 'To_time', key: 'to_time', width: 10, outlineLevel: 1 }
            ];
            worksheet.addRows(result)

            var path = "/uploads/leave_Details.xlsx";
            workbook.xlsx.writeFile("./public/uploads/leave_Details.xlsx").then(function (err, results) {
                if (err) {
                    console.log(err);
                    res.json({ status: 0, message: "Failed to save file" });
                } else {
                    res.json({ status: 1, message: "File saved successfully", path: commonConfig.SERVER_URL_STATIC + ":9001" + path });
                }
            });
        });
    },

    updateNotification: (req, res) => {
        if(req.body.notification_id !=undefined && req.body.notification_id !='') {
            var notification_id=req.body.notification_id;

            leaveModels.updateNotification(notification_id).then(result => {
                res.json(result);
            });

        } else {
            res.json({status:0,message:"Please enter the notification_id"});
        }
    },

    notificationList: (req, res) => {
        if(req.body.company_id !=undefined && req.body.company_id !=''&& req.body.role_id!=undefined && req.body.role_id!='') {
            var company_id=req.body.company_id;
            let role_id=req.body.role_id;
            let emp_id=req.body.emp_id;
            leaveModels.notificationList(company_id,role_id,emp_id).then(result => {
                res.json(result);
            });
            
        } else {
            res.json({status:0,message:"Please enter the company_id"});
        }
    },

}

