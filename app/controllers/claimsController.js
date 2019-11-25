var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var validation = require('../common/validation');
var claimModels = require('../models/claimModels');

module.exports = {

    claimRequest: (req,res) => { 
        claimModels.claimRequest(req,res).then(results => {
            res.json(results);
        });

    },

        getclaimcategory: (req, res) => {
            claimModels.getclaimcategory(req,res).then(results => {
                res.json(results);
            });
        },

        getclaimslist: (req, res) => {
            claimModels.getclaimlist(req,res).then(results => {
                res.json(results);
            });
        },

        claimListbyId: (req,res) => {
            // console.log('Req body ==========>', req.body.company_id+'-'+req.body.claim_id)
            if((req.body.company_id!=undefined && req.body.company_id!='')&&(req.body.claim_id!=undefined&& req.body.claim_id!=''))
            {
                claimModels.claimListbyId(req,res).then(results => {
                    res.json(results);
                });
        
            }
            else
            {
                res.json({status:0,message:"please pass the company_id and claim_id"})
            }
               
            },
deleteClaim: (req,res) => {
                if((req.body.company_id!=undefined && req.body.company_id!='')&&(req.body.claim_id!=undefined&& req.body.claim_id!=''))
                {
                    claimModels.deleteClaim(req,res).then(results => {
                        res.json(results);
                    });
            
                }
                else
                {
                    res.json({status:0,message:"please pass the company_id and claim_id"})
                }
                       
                    },
    UpdateclaimRequest: (req,res) => {
        console.log("Sdd")
                claimModels.UpdateclaimRequest(req,res).then(results => {
                    res.json(results);
                });
        
            },

     approveClaimRequest: (req, res) => {

        validation.validateApproveClaimRequest(req).then((validationResults) => {
            if (validationResults.length == 0) {
// console.log("Sssssad")
        claimModels.approveClaimRequest(req,res).then(results => {
            res.json(results);
        });

    } else {
        res.json({ status: 0, message: validationResults[0].msg });
    }
});

    },
}

