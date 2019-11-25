var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var validation = require('../common/validation');
var UmasterModels = require('../models/usermasterModel');

module.exports = {

    getprivilagedmenus: (req, res) => {
      
            if ( (req.body.company_id != undefined && req.body.company_id != '') && (req.body.emp_id != undefined && req.body.emp_id != '') ) {
                var company_id  = req.body.company_id;
                var emp_id  = req.body.emp_id;
                
                UmasterModels.getMenusaccess(company_id, emp_id).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: 'company_id cannot be empty' });
            }
       
    },
}

