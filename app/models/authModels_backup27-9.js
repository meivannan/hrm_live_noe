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
var moment = require('moment');

module.exports = {
    register: (req) => {
        var deferred = q.defer();
        var email = req.body.email;
        var name = req.body.name;

        var checkEmailQuery = "SELECT id FROM " + tableConfig.HRM_COMP_PROFILE + " WHERE email = '" + email + "'";
        sql.query(checkEmailQuery, async function (err, companyDetails) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: 'Company registration failed' });
            } else if (companyDetails.length == 0) {

                var checkCompanyName = "SELECT id FROM " + tableConfig.HRM_COMP_PROFILE + " WHERE name = '" + name + "'";
                var companyNameResult = await commonFunction.getQueryResults(checkCompanyName);
                if (companyNameResult.length == 0) {
                    var address_line1 = req.body.address_line1;
                    var address_line2 = (req.body.address_line2) ? req.body.address_line2 : '';
                    var city = req.body.city;
                    var state = req.body.state;
                    var country = req.body.country;
                    var postcode = req.body.postcode;
                    var contact = req.body.contact;
                    var industrial_type=req.body.industrial_type;                  
                    var save_company = "INSERT INTO " + tableConfig.HRM_COMP_PROFILE + " (name,addrline1,addrline2,city,state,country,postcode,email,contact,industrial_type) VALUES ('" + name + "','" + address_line1 + "','" + address_line2 + "','" + city + "','" + state + "','" + country + "','" + postcode + "','" + email + "','" + contact + "','"+industrial_type+"')";
                    sql.query(save_company, async function (err, insertResults) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: 'Company registration failed' });
                        } else if (insertResults) {
                            var companyID = insertResults.insertId;
                            companyID = companyID.toString();
                            var company_id = companyID;
                            var password = randomstring.generate(8);
                            var hashedPassword = md5(password);
                            var company_code = name.substring(0, 3).toUpperCase();

                            // companyID =  companyID.padStart(5, "0");
                            // var empID = company_code + '-'+ companyID;

                            var empID = company_code + '-' + '00001';

                            var userMasterQuery = "INSERT INTO hrm_user_master (emp_id,role_id,company_id,password,pass) VALUES ('" + empID + "','1','" + company_id + "','" + hashedPassword + "','" + password + "')";
                            var saveToUserMaster = await commonFunction.executeQuery(userMasterQuery);
                            if (saveToUserMaster == true) {

                                var mailOptions = {
                                    to: email,
                                    subject: 'HRM company registration',
                                    html: `Hello <b>` + name + `,</b><br>
                                        Welcome to HRM. Thanks for registering with HRM.<br>
                                        Your credentials to login with HRM is <br><br>

                                        Email ID:  <b>` + email + `</b>,<br>
                                        Password:  <b>` + password + `</b><br><br><br>

                                        Thanks,<br>
                                        <b>HRM Team</b>
                                        `
                                };
                                mail.sendMail(mailOptions);
                                deferred.resolve({ status: 1, message: 'Company registration completed successfully. Your credentials are sent to your mail ID' });
                            } else {
                                deferred.resolve({ status: 0, message: 'Company registration failed' });
                            }
                        }
                    });
                } else {
                    deferred.resolve({ status: 0, message: 'Company name already exists' });
                }
            } else {
                deferred.resolve({ status: 0, message: 'Email ID already exists' });
            }
        });
        return deferred.promise;
    },

    // login: (req) => {
    //     var deferred = q.defer();
    //     var email = req.body.email;
    //     var password = req.body.password;
    //     var query = "SELECT id,email,name,addrline1,addrline2,city,state,country,postcode,email,contact FROM " + tableConfig.HRM_COMP_PROFILE + " WHERE email ='" + email + "' AND status = '1'";

    //     sql.query(query, function (err, user) {
    //         if (err) {
    //             deferred.resolve({ status: 0, message: 'Login Failed' });
    //         } else {
    //             if (user.length > 0) {
    //                 var companyID = user[0].id;

    //                 var passwordQuery = "SELECT id,emp_id,role_id,company_id,avatar FROM hrm_user_master WHERE company_id = '" + companyID + "' AND pass = '" + password + "' AND status = '1'";

    //                 sql.query(passwordQuery, function (err, companyData) {
    //                     if (err) {
    //                         deferred.resolve({ status: 0, message: 'Login Failed' });
    //                     } else {
    //                         if (companyData.length > 0) {
    //                             var companyDetails = user[0];
    //                             var loginDetails = companyData[0];

    //                             var responseData = {
    //                                 status: 1,
    //                                 message: 'Loggedin Successfully',
    //                                 details: {
    //                                     name: companyDetails.name,
    //                                     address_line1: (companyDetails.addrline1) ? companyDetails.addrline1 : '',
    //                                     address_line2: (companyDetails.addrline2) ? companyDetails.addrline2 : '',
    //                                     city: (companyDetails.city) ? companyDetails.city : '',
    //                                     state: (companyDetails.state) ? companyDetails.state : '',
    //                                     country: (companyDetails.country) ? companyDetails.country : '',
    //                                     postcode: (companyDetails.postcode) ? companyDetails.postcode : '',
    //                                     email: (companyDetails.email) ? companyDetails.email : '',
    //                                     contact: (companyDetails.contact) ? companyDetails.contact : '',
    //                                     login_details: {
    //                                         id: loginDetails.id,
    //                                         emp_id: loginDetails.emp_id,
    //                                         role_id: loginDetails.role_id,
    //                                         company_id: loginDetails.company_id,
    //                                         avatar: (loginDetails.avatar) ? loginDetails.avatar : ''
    //                                     }
    //                                 }
    //                             };
    //                             deferred.resolve(responseData);
    //                         } else {
    //                             deferred.resolve({ status: 0, message: 'Incorrect Password' });
    //                         }
    //                     }
    //                 });
    //             } else {
    //                 deferred.resolve({ status: 0, message: 'Email ID not found' });
    //             }
    //         }
    //     });
    //     return deferred.promise;
    // },

    login: (req) => {
        var deferred = q.defer();
        var emp_id = req.body.emp_id;
        var employeeID = emp_id;
        
  var current_date=moment().format("YYYY-MM-DD")
        var password = req.body.password;
        var query = "SELECT id FROM " + tableConfig.HRM_USER_MASTER + " WHERE emp_id ='" + emp_id + "' AND status='1'";
        sql.query(query, async function (err, userMasterData) {
            if (err) {
                console.log('login error..', err);
                deferred.resolve({ status: 0, message: 'Login Failed' });
            } else {
                if (userMasterData.length > 0) {
                    var passwordQuery = "SELECT um.*,role.role_key FROM " + tableConfig.HRM_USER_MASTER + " AS um INNER JOIN " + tableConfig.HRM_ROLE + " AS role ON role.id = um.role_id WHERE um.emp_id ='" + employeeID + "' AND um.pass = '" + password + "' AND um.status='1'";
                    var userData = await commonFunction.getQueryResults(passwordQuery);
                    if (userData.length > 0) {
                        var token = jwt.sign({ id: userData.id }, config.secret, {
                            expiresIn: 86400 //expires in 24 hours
                        })

                        var todaylogin = moment().format('YYYY-MM-DD');
                        // console.log('Log Date =========>', todaylogin)
                        var attendancequery = "SELECT count(*) as attcount FROM " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " WHERE emp_id ='" + userData[0].id + "' AND status = 1  and DATE(check_in) = DATE('"+todaylogin+"')";
                        sql.query(attendancequery, async function (err, attendanceData) {
                            if (err) {
                                console.log('Attendance error..', err);
                                deferred.resolve({ status: 0, message: 'Login Failed' });
                            } else {
                                console.log('attendanceData ==========>', attendancequery)
                                var alreadylogged;
                                if(attendanceData[0].attcount > 0){
                                    alreadylogged = 1;
                                }else{
                                    alreadylogged = 0
                                }
                                var company_id=userData[0].company_id
                        var company_query="select industrial_type,sector_type from hrm_comp_profile where id="+company_id+""
                        sql.query(company_query,function(err,result)
                        {
                            if(err)
                            {
                                console.log(err);
                                deferred.resolve({status:0,message:"Something went wrong"})
                            }
                            else
                            {
                                var industrial_type=result[0].industrial_type;
                                var sector_type=result[0].sector_type;
                                deferred.resolve({
                                    status: 1,
                                    message: "Log In Successfully",
                                    auth: true,
                                    Accesstoken: token,
                                    id: userData[0].id,
                                    company_id: userData[0].company_id,
                                    emp_id: emp_id,
                                    role_id: userData[0].role_id,
                                    role_key: userData[0].role_key, 
                                    alreadylogged: alreadylogged,
                                    industrial_type:industrial_type,
                                    sector_type:sector_type

                                })
                            }
                        })

                                
                            }
                        });

                       
                    }
                    else {
                        deferred.resolve({
                            status: 0,
                            message: "Incorrect Password"
                        })
                    }
                }
                else {
                    deferred.resolve({
                        status: 0,
                        message: "User does not Exist"
                    })
                }
            }
        });
        return deferred.promise;
    },
    // login: (req) => {
    //     var deferred = q.defer();
    //     var emp_id = req.body.emp_id;
    //     var employeeID = emp_id;

    //     var password = req.body.password;
    //     var query = "SELECT id FROM " + tableConfig.HRM_USER_MASTER + " WHERE emp_id ='" + emp_id + "' AND status='1'";
    //     sql.query(query, async function (err, userMasterData) {
    //         if (err) {
    //             console.log('login error..', err);
    //             deferred.resolve({ status: 0, message: 'Login Failed' });
    //         } else {
    //             if (userMasterData.length > 0) {
    //                 var passwordQuery = "SELECT um.*,role.role_key FROM " + tableConfig.HRM_USER_MASTER + " AS um INNER JOIN " + tableConfig.HRM_ROLE + " AS role ON role.id = um.role_id WHERE um.emp_id ='" + employeeID + "' AND um.pass = '" + password + "' AND um.status='1'";
    //                 var userData = await commonFunction.getQueryResults(passwordQuery);
    //                 if (userData.length > 0) {
    //                     var token = jwt.sign({ id: userData.id }, config.secret, {
    //                         expiresIn: 86400 //expires in 24 hours
    //                     })

    //                     var todaylogin = moment().format('YYYY-MM-DD');
    //                     // console.log('Log Date =========>', todaylogin)
    //                     var attendancequery = "SELECT count(*) as attcount FROM " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " WHERE emp_id ='" + userData[0].id + "' AND status = 1 " //and DATE(check_in) = DATE('"+todaylogin+"');
    //                     sql.query(attendancequery, async function (err, attendanceData) {
    //                         if (err) {
    //                             console.log('Attendance error..', err);
    //                             deferred.resolve({ status: 0, message: 'Login Failed' });
    //                         } else {
    //                             console.log('attendanceData ==========>', attendancequery)
    //                             var alreadylogged;
    //                             if(attendanceData[0].attcount > 0){
    //                                 alreadylogged = 1;
    //                             }else{
    //                                 alreadylogged = 0
    //                             }

    //                             deferred.resolve({
    //                                 status: 1,
    //                                 message: "Log In Successfully",
    //                                 auth: true,
    //                                 Accesstoken: token,
    //                                 id: userData[0].id,
    //                                 company_id: userData[0].company_id,
    //                                 emp_id: emp_id,
    //                                 role_id: userData[0].role_id,
    //                                 role_key: userData[0].role_key, 
    //                                 alreadylogged: alreadylogged
    //                             })
    //                         }
    //                     });

                       
    //                 }
    //                 else {
    //                     deferred.resolve({
    //                         status: 0,
    //                         message: "Incorrect Password"
    //                     })
    //                 }
    //             }
    //             else {
    //                 deferred.resolve({
    //                     status: 0,
    //                     message: "User does not Exist"
    //                 })
    //             }
    //         }
    //     });
    //     return deferred.promise;
    // },

    UpdateCompayprofile: (req,next) => {
        var deferred = q.defer();
        var Singleupload=upload.single('images');
        Singleupload(req,next,function(err,some)
        {
            
            if(err)
            {
                console.log(err);
                deferred.resolve({status:0,message:"Image error"})
            }
            
                var company_logo = [];
                var fileLocation = '';
               
                if(req.file!=undefined){
                    console.log("come")
                
                    company_logo.push(req.file.location);
                    fileLocation = req.file.location;
                    console.log("file",fileLocation)
               
                
            }
          
                
               
                var email = req.body.email;
                var name = req.body.name;
                var register_number=req.body.register_number
                var fax_no=req.body.fax_no;
                var landline_number=req.body.landline_number;
               var images=req.file;
               var industrial_type=req.body.industrial_type;      
               
                       
                  
        
                        
                            
                               var sector_type=req.body.sector_type;
                                    var address_line1 = req.body.address_line1;
                                    var address_line2 = (req.body.address_line2) ? req.body.address_line2 : '';
                                    var city = req.body.city;
                                    var state = req.body.state;
                                    var country = req.body.country;
                                    var postcode = req.body.postcode;
                                    var contact = req.body.contact;
                                    var branch_details = (req.body.branch_details) ? req.body.branch_details : [];
                var company_id=req.body.company_id;
                var save_company = "update  " + tableConfig.HRM_COMP_PROFILE + " set logo='"+ fileLocation +"', name='"+name+"',addrline1='"+address_line1+"',addrline2='"+address_line2+"',city='"+city+"',state='"+state+"',country='"+country+"',postcode='"+postcode+"',email='"+email+"',contact='"+contact+"',registartion_number='"+register_number+"',fax_no='"+fax_no+"',lnumber='"+landline_number+"',industrial_type='"+industrial_type+"',sector_type='"+sector_type+"' where id="+company_id+"";
               
            if(fileLocation == '') {
                save_company = "update  " + tableConfig.HRM_COMP_PROFILE + " set  name='"+name+"',addrline1='"+address_line1+"',addrline2='"+address_line2+"',city='"+city+"',state='"+state+"',country='"+country+"',postcode='"+postcode+"',email='"+email+"',contact='"+contact+"',registartion_number='"+register_number+"',fax_no='"+fax_no+"',lnumber='"+landline_number+"',industrial_type='"+industrial_type+"',sector_type='"+sector_type+"' where id="+company_id+"";
            }
                sql.query(save_company, async function (err, updateResults) {
                    console.log(save_company)
                    if (err) {
                        console.log(err);
                        deferred.resolve({ status: 0, message: 'Company registration failed' });
                    }  
                   
                      
                        else
                        {
                            if(updateResults.affectedRows > 0)
                            {
                                var branch_query="Update hrm_comp_branches set branch_details ='"+branch_details+"' where company_id='"+company_id+"'";
                                sql.query(branch_query,function(err,branchdata)
                                {
                                    if(err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        if(branchdata.affectedRows > 0)
                                        {
                                            console.log(branchdata)
                                            // var details= {
                                            //     company_id:28,
                                            //    name:req.body.name,
                                            //    address_line1: address_line1,
                                            //    address_line2: address_line2,
                                            //    city: city,
                                            //    state:state,
                                            //    country:country,
                                            //    postcode:postcode,
                                            //    email: email,
                                            //    contact:contact,
                                            //    branch_details:
                                            //    [{
                                            //     branch_details
                                                  
                                            //    } 
                                            //    ]
                                                   
                                                    
                                                 
                                                
                                            //    }
                                          
                                               deferred.resolve({ status: 1, message: 'Company updated completed successfully.' });
                                              // deferred.resolve({ status: 1, message: 'Company updated completed successfully.', details});
                                        }
                                        else
                                        {
                                            var branch_save_query="Insert into hrm_comp_branches(company_id,branch_details)VALUES("+company_id+",'"+branch_details+"')";
                                //             var branch_save_query = "INSERT INTO  hrm_comp_branches(company_id,address, city, state, country, postal_code) VALUES (";
                                //             branch_details.forEach(ref => {
                                //     var branch_address = (ref.branch_address) ? ref.branch_address : '';
                                //     var branch_city = (ref.branch_address) ? ref.branch_address : '';
                                //     var branch_country = (ref.branch_country) ? ref.branch_country : '';
                                //     var branch_state = (ref.branch_state) ? ref.branch_state : '';
                                //     var branch_postcode = (ref.branch_postcode) ? ref.branch_postcode : '';
                                //     branch_save_query = branch_save_query + "'" + company_id + "','" + branch_address + "','" + branch_city + "','" + branch_country + "','" + branch_state + "','"+branch_postcode+"'"
                                // });
                                // branch_save_query = branch_save_query + ")";
                                            sql.query(branch_save_query,function(err,savedata)
                                            {
                                                console.log(savedata)
                                                if(err)
                                                {
                                                    console.log(err);
                                                    deferred.resolve({status:0,message:"Something went wrong"});
                                                }
                                                else
                                                {
                                                    if(savedata.affectedRows > 0)
                                                    {
                                                       
                                                           
                                                         deferred.resolve({status:1,message:"Update branch Successfully"})
                                                        //deferred.resolve({ status: 1, message: 'branch register completed successfully '});
                                                    }
                                                    else
                                                    {
                                                        deferred.resolve({ status: 0, message: 'Failed to add branch'});
                                                    }
                                                }
                                            })
                                        }
                                       
                                    }
                                   
                                })
                                
                            }
                           
                          
                         else
                         {
                            deferred.resolve({ status: 0, message: 'Company registration failed' });
                        }
                    }
                      
                });                                
        })
        return deferred.promise;
    },

    forgotPassword: (req) => {
        var deferred = q.defer();
        var email = req.body.email;

        var query = "SELECT id,name FROM " + tableConfig.HRM_COMP_PROFILE + " WHERE email='" + email + "' AND status = '1'";
        sql.query(query, function (err, userData) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: 'Getting new password failed' });
            } else {
                if (userData.length != 0) {
                    var password = randomstring.generate(8);
                    var hashedPassword = md5(password);

                    var company_id = userData[0].id != undefined ? userData[0].id : 0
                    var name = userData[0].name != undefined ? userData[0].name : '';

                    var query = "UPDATE " + tableConfig.HRM_USER_MASTER + " SET password = '" + hashedPassword + "',pass = '" + password + "' WHERE company_id='" + company_id + "' AND status = '1'";
                    sql.query(query, async function (err, updateResult) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: 'Password update failed' });
                        } else {

                            var text = `Hello <b>` + name + `</b>,<br>
                                     Your new password is <b>`+ password + `</b>
                                    `
                            var mailOptions = {
                                to: email,
                                subject: 'HRM Forgot password',
                                html: text
                            };

                            mail.sendMail(mailOptions);
                            deferred.resolve({
                                status: 1,
                                message: 'New password is sent to your email ID'
                            });
                        }
                    });
                } else {
                    deferred.resolve({ status: 0, message: 'Email ID not found' });
                }
            }
        });
        return deferred.promise;
    },

    logout: (user_id) => {
        var deferred = q.defer();
        var result = false;

        var query = "UPDATE " + tableConfig.NOTIFICATIONS + " SET device_token ='' WHERE user_id='" + user_id + "'";
        sql.query(query, function (err, deviceIdUpdateResults) {
            if (err) {
                console.log(err);
                deferred.resolve(result);
            } else {
                deferred.resolve(true);
            }
        });
        return deferred.promise;
    },

    companyListbyid: (company_id) => {
        var deferred = q.defer();
        // var query = "SELECT cp.fax_no,cp.registartion_number,cp.id,cp.name,cp.addrline1,cp.addrline2,cp.city,cp.state,cp.state,cp.country,cp.postcode,cp.email,cp.contact,cb.company_id,cb.branch_details FROM " + tableConfig.HRM_COMP_PROFILE + " as cp left join hrm_comp_branches as cb on cp.id=cb.company_id  WHERE  cp.id="+company_id+"";
        var query = "SELECT spass_canallocate,wp_canallocate,total_employees_count,local_employees_count,foriegn_worker_count,foriegn_can_allocate,sector_type,industrial_type,cp.logo,cp.lnumber,cp.fax_no,cp.registartion_number,cp.id,cp.name,cp.addrline1,cp.addrline2,cp.city,cp.state,cp.state,cp.country,cp.postcode,cp.email,cp.contact,cb.company_id,cb.branch_details FROM " + tableConfig.HRM_COMP_PROFILE + " as cp left join hrm_comp_branches as cb on cp.id=cb.company_id  WHERE  cp.id=" + company_id + "";
        console.log('query', query)
        sql.query(query, function (err, user) {
            console.log("err", query)
            if (err) {
                console.log(err)
                deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
            } else {
                if (user.length > 0) {
                    var response = [];
                    user.forEach((data, index) => {
                        response.push({
                            company_id: data.id,
                            name: data.name,
                            registration_number: data.registartion_number,
                            address_line1: data.addrline1,
                            address_line2: data.addrline2,
                            state: data.state,
                            city: data.city,
                            contact: data.contact,
                            country: data.country,
                            postcode: data.postcode,
                            email: data.email,
                            logo:data.logo,
                            fax_no: data.fax_no,
                            lnumber: data.lnumber,
                            industrial_type:data.industrial_type,
                            branch_details: data.branch_details,
                            sector_type:data.sector_type,
                            total_employees_count:data.total_employees_count,
                            local_employees_count:data.local_employees_count,
                            foriegn_worker_count:data.foriegn_worker_count,
                            foriegn_can_allocate:data.foriegn_can_allocate,
                            spass_canallocate:data.spass_canallocate,
                            wp_canallocate:data.wp_canallocate
                        });
                    });
                    deferred.resolve({ status: 1, message: "Company Details", details: response })
                }
                else {
                    deferred.resolve({ status: 1, message: "No data Found", details: [] })
                }
            }
        });
        return deferred.promise;
    }
}
