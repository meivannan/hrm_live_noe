var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var validation = require('../common/validation');
var holidayModels = require('../models/holidayModels');

module.exports = {
    applyHoilday: (req, res) => {

        validation.validatesaveHoilday(req).then((validationResults) => {
            if (validationResults.length == 0) {

                var company_id = req.body.company_id;
                var from_date = req.body.from_date;
                var to_date = req.body.to_date;
                var title = req.body.title;

                holidayModels.applyHoilday(company_id, from_date, to_date, title).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },

    hoildayListByYear: (req, res) => {
        var company_id = (req.body.company_id != undefined && req.body.company_id != '') ? req.body.company_id : 0;
        var year = (req.body.year != undefined && req.body.year != '') ? req.body.year : "0000";

        holidayModels.hoildayListByYear(company_id, year).then(result => {
            res.send(result);
        });
        
    }
}