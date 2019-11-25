var sql = require('../../config/database.config');
var tableConfig = require('../config/table_config');
var q = require('q');
var sql = require('../../config/database.config');
var randomstring = require("randomstring");
var mail = require('../common/mail');
var md5 = require('md5');
var commonFunction = require('../models/commonfunction');
var jwt = require('jsonwebtoken');
var config = require('../config/security');
var upload = require('../common/upload');
var validation = require('../common/validation');
var moment = require('moment');
module.exports = {
  
    claimRequest: (req,res,next) => {
        var deferred = q.defer();
        var fileupload = upload.single('invoice');
   
        fileupload(req,next, function (err, some) {
            console.log("sss")
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Invoice upload error" });
            }
            var fileLocation = '';
            if (req.file != undefined) {
                fileLocation = req.file.location;
            }
        
            validation.validateClaimRequest(req).then((validationResults) => {
                if (validationResults.length == 0) {
                   
                    var emp_id = req.body.emp_id;
                    var amount = req.body.amount;
                    var category = req.body.category;
                    var sub_category = req.body.sub_category;
                    var image_url = fileLocation;
                   var claim_date=req.body.claim_date
                  
                   var company_id=req.body.company_id;
                   var url=req.body.url;
                   var cliam_month=moment(claim_date).format("MM");
                   var cliam_year=moment(claim_date).format("YYYY");
                   var checking_query="select * from "+ tableConfig.HRM_CLAIM_DETAILS +" where emp_id="+emp_id+" and  DATE(claim_date)='"+claim_date+"' and category="+category+" and sub_category="+sub_category+"";
                   sql.query(checking_query,function(err,checkdata)
                   {
                       if(err)
                       {
                           console.log(err);
                            deferred.resolve({status:0,message:"Something went wrong"})
                       }
                       else
                       {
                           if(checkdata.length > 0)
                           {
                            deferred.resolve({status:0,message:"You have already claim request"})
                           }
                           else
                           {
                              
                                       var employee_primaryID=emp_id;
                                       var current_date=new Date();
                                       var invoicenumber="INV"+employee_primaryID+current_date.getTime();
                                   
                            var claimQuery = "INSERT INTO "+ tableConfig.HRM_CLAIM_DETAILS +" (emp_id,amount,category,sub_category,image_url,status,claim_date,month,year,company_id,invoice_number) VALUES ('"+ emp_id +"','"+ amount +"','"+ category +"','"+ sub_category +"','"+ image_url +"','1','"+claim_date+"','"+cliam_month+"','"+cliam_year+"','"+company_id+"','"+invoicenumber+"')";
                
                            sql.query(claimQuery, function (err, insertResult) {
                              
                                 if (err) {
                                     console.log(err);
                                     deferred.resolve({ status: 0, message: "Failed to request claim"});
                                 } else {
                                     
                                     if(insertResult.affectedRows > 0)
                                     {
                                         var message="Claim has been request";
                                          var notictation_query="Insert into hrm_notication(from_emp_id,to_role_id,filter,message,url)VALUES("+emp_id+",'3,7','Claims','"+message+"','"+url+"')";
                                          sql.query(notictation_query,function(err,noticationdata)
                                          {
                                              if(err)
                                              {
                                                
                                                  console.log(err);
                                                  deferred.resolve({status:0,message:"Something went wrong"})
                                              }
                                              else
                                              {
                                                     if(noticationdata.affectedRows > 0)
                                                     {
                                                         deferred.resolve({ status: 1, message: "Claim request sent successfully" });
                                                     }
                                              }
         
                                          })
                                     }
                                   
                                 }
                             });
                           }
                       }
                       })
                
                } else {
                    res.json({ status: 0, message: validationResults[0].msg });
                }
            });
        });

        return deferred.promise;
    },
    UpdateclaimRequest: (req,res,next) => {
        var deferred = q.defer();
        // var fileupload = upload.single('invoice');
   
        // fileupload(req,next, function (err, some) {
            // console.log("sss")
            // if (err) {
            //     console.log(err);
            //     deferred.resolve({ status: 0, message: "Invoice upload error" });
            // }
            // var fileLocation = '';
            // if (req.file != undefined) {
            //     fileLocation = req.file.location;
            // }
        
            validation.validateUpdateClaimrequest(req).then((validationResults) => {
                if (validationResults.length == 0) {
                   var claim_id=req.body.claim_id;
                  //  var emp_id = req.body.emp_id;
                    var amount = req.body.amount;
                    var category = req.body.category;
                    var sub_category = req.body.sub_category;
                   // var image_url = fileLocation;
                   var claim_date=req.body.claim_date
                  
                   var company_id=req.body.company_id;
                 //  var url=req.body.url;
                   var cliam_month=moment(claim_date).format("MM");
                   var cliam_year=moment(claim_date).format("YYYY");
                 
                              
                                    //    var employee_primaryID=emp_id;
                                    //    var current_date=new Date();
                                    //    var invoicenumber="INV"+employee_primaryID+current_date.getTime();
                                   
                            var claimQuery = "UPDATE "+ tableConfig.HRM_CLAIM_DETAILS +" set amount='"+amount+"',category='"+category+"',sub_category='"+sub_category+"',claim_date='"+claim_date+"',month='"+cliam_month+"',year='"+cliam_year+"' where company_id="+company_id+" and id="+claim_id+"";
                
                            sql.query(claimQuery, function (err, Updateresult) {
                              
                                 if (err) {
                                     console.log(err);
                                     deferred.resolve({ status: 0, message: "Failed to request claim"});
                                 } else {
                                     
                                     if(Updateresult.affectedRows > 0)
                                     {
                                        deferred.resolve({ status: 1, message: "Updated Claim successfully"});
                                     }
                                     else
                                     {
                                        deferred.resolve({ status: 0, message: "No data found"});
                                     }
                                   
                                 }
                             });
                           
                      
                
                } else {
                    res.json({ status: 0, message: validationResults[0].msg });
                }
            });
        // });

        return deferred.promise;
    },

    getclaimcategory: (req, res) => {
        
                var deferred = q.defer();
                        //var description = req.body.description;
                        
                        var response=[];
                            var claimcatQuery = "select * from  hrm_cliam_category where parent = "+ req.body.parent;
                            sql.query(claimcatQuery, function (err, catdata) {
                                if (err) {
                                    console.log(err);
                                    deferred.resolve({ status: 0, message: "Failed to Retrive"});
                                } else {
                                    
                                    if(catdata.length > 0)
                                    {
                                        catdata.forEach((rows) => {
                                            response.push({
                                                id:rows.id,
                                                parent:rows.parent, 
                                                category:rows.category, 
                                                status: rows.status
                                             })
                                        });
                                    
                                        deferred.resolve({ status: 1, message: "Category list",response });
                                    }
                                    else
                                    {
                                        deferred.resolve({ status: 0, message: "No data found" });
                                    }
                                
                                
                                }
                            }); 

                return deferred.promise;
    },

    getclaimlist: (req, res) => {
        
        var deferred = q.defer();  
                var response=[];
                var where = '';
                if(req.body.emp_id != ''){
                    where += ' where emp_id ='+req.body.emp_id
                }
                    var claimsQuery = "select *, IFNULL(FN_EMPLOYEE_NAME(emp_id), 'Super Admin') as empname, FN_EMPID(emp_id) as empid, FN_CLAIM_STATUS(id) as cstatus, FN_CLAIM_ACTION(id, emp_id) as action from  hrm_claim_details "+ where;
                    console.log('claimsQuery -------> ', claimsQuery)
                    sql.query(claimsQuery, function (err, catdata) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Failed to Retrive"});
                        } else {
                            
                            if(catdata.length > 0)
                            {
                                catdata.forEach((rows) => {
                                    response.push({
                                        id:rows.id,
                                        emp_id: rows.emp_id,
                                        amount: rows.amount,
                                        category: rows.category,
                                        sub_category: rows.sub_category,
                                        status: rows.status,
                                        claim_date: moment(rows.claim_date).format('DD-MM-YYYY'),
                                        invoice_number: rows.invoice_number,
                                        approval_role_id: rows.approval_role_id,
                                        claimstatus:  rows. cstatus,
                                        action: rows.action,
                                        empid: rows.empid,
                                        empname: rows.empname                                        
                                     })
                                });
                            
                                deferred.resolve({ status: 1, message: "Category list",response });
                            }
                            else
                            {
                                deferred.resolve({ status: 0, message: "No data found" });
                            }
                        
                        
                        }
                    }); 

        return deferred.promise;
},

    claimListbyId: (req, res) => {
        var deferred = q.defer();
                 //var description = req.body.description;
                    var claim_id =req.body.claim_id;
                 var company_id=req.body.company_id
                 var response=[];
                    var claimQuery = "select * from "+ tableConfig.HRM_CLAIM_DETAILS +" where id="+claim_id+"  and company_id="+company_id+" and isdelete!=1";
                    sql.query(claimQuery, function (err, claimdata) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Failed to approval claim"});
                        } else {
                            
                            if(claimdata.length > 0)
                            {
                               response.push({
                                   id:claimdata[0].id,
                                   emp_id:claimdata[0].emp_id,
                                   invoice_number:claimdata[0].invoice_number,
                                   category:claimdata[0].category,
                                   sub_category:claimdata[0].sub_category,
                                   amount:claimdata[0].amount,
                                   claim_status:claimdata[0].status,
                                   claim_date:claimdata[0].claim_date,
                                   image_url: claimdata[0].image_url
                                })
                                deferred.resolve({ status: 1, message: "claim list",response });
                            }
                            else
                            {
                                deferred.resolve({ status: 0, message: "No data found" });
                            }
                          
                           
                        }
                    });
                
        

        return deferred.promise;
    },
    deleteClaim: (req, res) => {
        var deferred = q.defer();
                 //var description = req.body.description;
                    var claim_id =req.body.claim_id;
                 var company_id=req.body.company_id
                
                    var claimQuery = "Update "+tableConfig.HRM_CLAIM_DETAILS+" set isdelete=1 where id="+claim_id+" and company_id='"+company_id+"'";
                    sql.query(claimQuery, function (err, claimdata) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Failed to delete"});
                        } else {
                            
                          if(claimdata.affectedRows >0)
                                deferred.resolve({ status: 1, message: "claim deleted successfully" });
                            }
                           
                          
                           
                        
                    });
                
        

        return deferred.promise;
    },

    approveClaimRequest: (req, res) => {
        var deferred = q.defer();
      

                    var emp_id = req.body.emp_id;
                    var company_id=req.body.company_id;
                    var approval_role_id = req.body.approval_role_id;
                    //var description = req.body.description;
                    var claim_id =req.body.claim_id;
                    var status=req.body.status;
                    var url=req.body.url;
                    var claimQuery = "Update "+ tableConfig.HRM_CLAIM_DETAILS +" set status='"+status+"',approval_role_id='"+approval_role_id+"' where id="+claim_id+" and emp_id="+emp_id+" and company_id="+company_id+"";
                    sql.query(claimQuery, function (err, insertResult) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Failed to approval claim"});
                        } else {
                            var message='Claims has been declined';
                            if(insertResult.affectedRows > 0)
                            {
                                if(status==2)
                                {
                                    message='Claims has been approved'
                                }
                                
                                              var notictation_query="Insert into hrm_notication(from_emp_id,to_role_id,filter,message,url)VALUES("+emp_id+",'7,4','Claims','"+message+"','"+url+"')";
                                              sql.query(notictation_query,function(err,noticationdata)
                                              {
                                                  if(err)
                                                  {
                                                    
                                                      console.log(err);
                                                      deferred.resolve({status:0,message:"Something went wrong"})
                                                  }
                                                  else
                                                  {
                                                         if(noticationdata.affectedRows > 0)
                                                         {
                                                             deferred.resolve({ status: 1, message: "Claim appoval sent successfully" });
                                                         }
                                                  }
                                                  
                                              })
                            }
                            else
                            {
                                deferred.resolve({ status: 0, message: "No data found" });
                            }
                          
                           
                        }
                    });
                
        

        return deferred.promise;
    }
}
//  function generateinvoicenumber() {
//   // Math.random should be unique because of its seeding algorithm.
//   // Convert it to base 36 (numbers + letters), and grab the first 9 characters
//   // after the decimal.
//   return '_' + Math.random().toString(36).substr(2, 9);
// };
