var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var validation = require('../common/validation');
var attendenceModels = require('../models/attendenceModels');

module.exports = {

    saveShift: (req, res) => {
        validation.validatesaveshift(req).then((validationResults) => {

            if (validationResults.length == 0) {
                attendenceModels.saveShift(req).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },
    biometerattendencelist: (req, res) => {
          
        var emp_id =req.body.emp_id
        // var date = (req.body.sdate != undefined && req.body.sdate != '') ? req.body.sdate : "";
        // var checkoutime = new Date();
    // var limit =(req.body.limit!=undefined)?req.body.limit:0;
        attendenceModels.Biometerattendencelist(emp_id).then(results => {
            res.json(results);
        });
     
    },
    Lastattendencehistory: (req, res) => {
          
        var emp_id =req.body.emp_id!=undefined?req.body.emp_id:0
        // var date = (req.body.sdate != undefined && req.body.sdate != '') ? req.body.sdate : "";
        // var checkoutime = new Date();
    var limit =(req.body.limit!=undefined)?req.body.limit:0;
        attendenceModels.lastAttendencesummary(emp_id,limit).then(results => {
            res.json(results);
        });
     
    },
    Attendencereport: (req, res) => {
        let{from_date,to_date,company_id}=req.body;
           // var emp_id =req.body.emp_id!=undefined?req.body.emp_id:0
            // var date = (req.body.sdate != undefined && req.body.sdate != '') ? req.body.sdate : "";
            // var checkoutime = new Date();
        //var limit =(req.body.limit!=undefined)?req.body.limit:0;
        if(from_date!=''&& from_date!=undefined && to_date!=''&&to_date!=undefined)
        {
            attendenceModels.attendence_report(from_date,to_date,company_id).then(results => {
                res.json(results);
            });
        }
        else
        {
            res.json({Status:0,message:"please enter from_date and to_date"})
        }
            
        },
    
    attendenceDetailsbyId: (req, res) => {
        validation.validateattendencedetailsid(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var emp_id = req.body.emp_id;

                attendenceModels.attendenceDetailsbyId(emp_id).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    saveAttendence: (req, res) => {

        validation.validatesaveAttendence(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var emp_id = req.body.emp_id;
                var check_in = req.body.check_in;
                var check_out = req.body.check_out;

                attendenceModels.saveAttendence(emp_id, check_in, check_out).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    updateAttendence: (req, res) => {
        validation.validateupdateAttendence(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var emp_id = req.body.emp_id;
                var check_out = req.body.check_out;

                attendenceModels.updateAttendence(emp_id, check_out).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    attendenceDetailsbyDate: (req, res) => {
        validation.validateattendencedetaildate(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var date = req.body.date;

                attendenceModels.attendenceDetailsbydate(date).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    excelImportWorklist: (req, res) => {

        attendenceModels.excelImportWorklist(req, res).then(results => {
            res.json(results);
        });

    },
    excelImportattendence: (req, res) => {

        attendenceModels.excelImportAttendence(req, res).then(results => {
            res.json(results);
        });

    },

    addAttendence: (req, res) => {
        validation.validatesaveAttendence(req).then((validationResults) => {

            if (validationResults.length == 0) {
                var emp_id = req.body.emp_id;
                var check_in = req.body.check_in;

                attendenceModels.addAttendencebyrole(emp_id, check_in).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    attendenceDetails: (req, res) => {
        
        validation.validateattendencedetailsid(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var emp_id = (req.body.emp_id != undefined && req.body.emp_id != '') ? parseInt(req.body.emp_id) : '';
                var date = (req.body.date != undefined && req.body.date != '') ? req.body.date : "";
                var checkoutime = (req.body.checkoutime != undefined && req.body.checkoutime != '') ? req.body.checkoutime : new Date();

                attendenceModels.attendenceDetails(emp_id, date, checkoutime).then(results => {
                    res.json(results);
                });
            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    getattendancelistbyfilter: (req, res) => {
          
                var emp_id = (req.body.sempid != undefined && req.body.sempid != '') ? parseInt(req.body.sempid) : '';
                var date = (req.body.sdate != undefined && req.body.sdate != '') ? req.body.sdate : "";
                var checkoutime = new Date();

                attendenceModels.getattendancelistbyfilter(emp_id, date, checkoutime).then(results => {
                    res.json(results);
                });
             
    },

    getattendanceabsentlistbyfilter: (req, res) => {
          
        var emp_id = (req.body.sempid != undefined && req.body.sempid != '') ? parseInt(req.body.sempid) : '';
        var date = (req.body.sdate != undefined && req.body.sdate != '') ? req.body.sdate : "";
        var checkoutime = new Date();

        attendenceModels.getattendanceabsentlistbyfilter(emp_id, date, checkoutime).then(results => {
            res.json(results);
        });
     
}

}