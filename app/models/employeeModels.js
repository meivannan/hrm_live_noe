var sql = require('../../config/database.config');
var tableConfig = require('../config/table_config');
var q = require('q');
var sql = require('../../config/database.config');
var randomstring = require("randomstring");
var mail = require('../common/mail');
var md5 = require('md5');
var commonFunction = require('../models/commonfunction');
var moment = require('moment');
var multer = require('multer');
var Validator = require('jsonschema').Validator;
var forEach = require('asyncforeach-promise');
const excel = require('exceljs');
var employee_upload = require('../common/employee_upload');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/uploads')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

var upload = multer({
    storage: storage
}).single('employee_list');

var employee_upload = employee_upload.any('bankcrypt_file', 'criminal_file', 'dispenary_file');

var XLSX = require('xlsx');

module.exports = {
    // addEmployee: (req) => {
    //     var deferred = q.defer();
    //     var email = (req.body.email) ? req.body.email : '';

    //     var checkEmailQuery = "SELECT id FROM " + tableConfig.HRM_EMPLOYEE_DETAILS + " WHERE email = '" + email + "'";
    //     sql.query(checkEmailQuery, async function (err, employeeDetails) {
    //         if (err) {
    //             console.log(err);
    //             deferred.resolve({ status: 0, message: 'Employee registration failed' });
    //         } else if (employeeDetails.length == 0) {

    //             var company_id = (req.body.company_id) ? req.body.company_id : 0;
    //             var role_id = (req.body.role_id) ? req.body.role_id : 2;
    //             var firstname = (req.body.firstname) ? req.body.firstname : '';
    //             var ic_no = (req.body.ic_no) ? req.body.ic_no : '';
    //             var middlename = (req.body.middlename) ? req.body.middlename : '';
    //             var lastname = (req.body.lastname) ? req.body.lastname : '';
    //             var driving_license = (req.body.driving_license) ? req.body.driving_license : '';
    //             var religion = (req.body.religion) ? req.body.religion : '';
    //             var marital_status = (req.body.marital_status) ? req.body.marital_status : '';
    //             var spouse_name = (req.body.spouse_name) ? req.body.spouse_name : '';
    //             var birthday = (req.body.dob) ? req.body.dob : '';
    //             var occupation = (req.body.occupation) ? req.body.occupation : '';
    //             var contact = (req.body.contact) ? req.body.contact : '';
    //             var no_of_children = (req.body.no_of_children) ? req.body.no_of_children : '';
    //             var emergency_contact = (req.body.emergency_contact) ? req.body.emergency_contact : '';
    //             var home_contact = (req.body.landline_number) ? req.body.landline_number : '';
    //             var blood_group = (req.body.blood_group) ? req.body.blood_group : '';
    //             var passport_no = (req.body.passport_no) ? req.body.passport_no : '';
    //             var visa_start_date = (req.body.visa_start_date) ? req.body.visa_start_date : '';
    //             var visa_end_date = (req.body.visa_end_date) ? req.body.visa_end_date : '';
    //             var visa_status = (req.body.visa_status) ? req.body.visa_status : 0;
    //             var employment_type = (req.body.employment_type) ? req.body.employment_type : 0;
    //             var direct_report_to = (req.body.direct_report_to) ? req.body.direct_report_to : '';
    //             var training_type = (req.body.training_type) ? req.body.training_type : 0;
    //             var salary = (req.body.salary) ? req.body.salary : 0;
    //             var national_service_status = (req.body.national_service_status) ? req.body.national_service_status : 0;
    //             var joined_date = (req.body.joined_date) ? req.body.joined_date : '';

    //             var spouse_contact = (req.body.spouse_contact) ? req.body.spouse_contact : '';
    //             var spouse_blood_group = (req.body.spouse_blood_group) ? req.body.spouse_blood_group : '';
    //             var spouse_occupation = (req.body.spouse_occupation) ? req.body.spouse_occupation : '';
    //             var spouse_dob = (req.body.spouse_dob) ? req.body.spouse_dob : '';
    //             var reference_details = (req.body.reference) ? req.body.reference : [];
    //             var childrens = (req.body.childrens) ? req.body.childrens : [];
    //             var address_line1 = (req.body.address_line1) ? req.body.address_line1 : '';
    //             var address_line2 = (req.body.address_line2) ? req.body.address_line2 : '';
    //             var city = (req.body.city) ? req.body.city : '';
    //             var state = (req.body.state) ? req.body.state : '';
    //             var country = (req.body.country) ? req.body.country : '';
    //             var basic_salary = (req.body.basic_salary) ? req.body.basic_salary : 0;
    //             var cpf_number = (req.body.cpf_number) ? req.body.cpf_number : '';
    //             var password = randomstring.generate(8);
    //             var hashedPassword = md5(password);

    //             var getCompanyName = "SELECT name FROM " + tableConfig.HRM_COMP_PROFILE + " WHERE id = '" + company_id + "'";
    //             var companyNameResult = await commonFunction.getQueryResults(getCompanyName);
    //             var company_name = (companyNameResult[0].name) ? companyNameResult[0].name : '';
    //             var company_code = company_name.substring(0, 3).toUpperCase();
    //             var employIdQuery = "SELECT count(*) as total_count FROM " + tableConfig.HRM_USER_MASTER + " WHERE company_id = '" + company_id + "'";

    //             var totalEmployees = await commonFunction.getQueryResults(employIdQuery);
    //             var newEmployeeID = 1;
    //             if (totalEmployees.length > 0) {
    //                 newEmployeeID = totalEmployees[0].total_count + 1;
    //             }

    //             newEmployeeID = newEmployeeID.toString();
    //             newEmployeeID = newEmployeeID.padStart(5, "0");

    //             var empID = company_code + '-' + newEmployeeID;
    //             var userMasteSaveQuery = "INSERT INTO " + tableConfig.HRM_USER_MASTER + " (emp_id,role_id,company_id,password,pass) VALUES ('" + empID + "','" + role_id + "','" + company_id + "','" + hashedPassword + "','" + password + "')";

    //             sql.query(userMasteSaveQuery, function (err, masterData) {
    //                 if (err) {
    //                     console.log(err);
    //                     deferred.resolve({ status: 0, message: "Failed to add employee" });
    //                 } else {
    //                     var employeePrimaryID = 0
    //                     if (masterData) {
    //                         employeePrimaryID = masterData.insertId;

    //                         var save_employee = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_DETAILS + " (emp_id,firstname,middlename,lastname,email,ic_no,driving_license,religion,marital_status,spouse_name,birthday,occupation,contact,no_of_children,emergency_contact,home_contact,blood_group,passport_no,visa_start_date,visa_end_date,visa_status,employment_type,direct_report_to,training_type,salary,national_service_status,spouse_contact,spouse_blood_group,spouse_occupation,spouse_dob,addrline1,addrline2,city,state,country,joined_date,basic_salary,cpf_number) VALUES ('" + employeePrimaryID + "','" + firstname + "','" + middlename + "','" + lastname + "','" + email + "','" + ic_no + "','" + driving_license + "','" + religion + "','" + marital_status + "','" + spouse_name + "','" + birthday + "','" + occupation + "','" + contact + "','" + no_of_children + "','" + emergency_contact + "','" + home_contact + "','" + blood_group + "','" + passport_no + "','" + visa_start_date + "','" + visa_end_date + "','" + visa_status + "','" + employment_type + "','" + direct_report_to + "','" + training_type + "','" + salary + "','" + national_service_status + "','" + spouse_contact + "','" + spouse_blood_group + "','" + spouse_occupation + "','" + spouse_dob + "','" + address_line1 + "','" + address_line2 + "','" + city + "','" + state + "','" + country + "','" + joined_date + "','" + basic_salary + "','" + cpf_number + "')";
    //                         sql.query(save_employee, async function (err, insertResults) {
    //                             if (err) {
    //                                 console.log(err);
    //                                 deferred.resolve({ status: 0, message: 'Employee registration failed' });
    //                             } else if (insertResults) {
    //                                 var companyID = insertResults.insertId;
    //                                 companyID = companyID.toString();

    //                                 var referenceQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_REFERENCE + " (emp_id,name,email,mobile,company) VALUES ";
    //                                 reference_details.forEach(ref => {
    //                                     var name = (ref.name) ? ref.name : '';
    //                                     let email = (ref.email) ? ref.email : '';
    //                                     var mobile = (ref.mobile) ? ref.mobile : '';
    //                                     var company = (ref.company) ? ref.company : '';
    //                                     referenceQuery = referenceQuery + "('" + employeePrimaryID + "','" + name + "','" + email + "','" + mobile + "','" + company + "'),"
    //                                 });
    //                                 referenceQuery = referenceQuery.substring(0, referenceQuery.length - 1);

    //                                 var childrenQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_CHILDREN + " (emp_id,child_name,DOB,school,blood_group) VALUES ";
    //                                 childrens.forEach(ref => {
    //                                     var child_name = (ref.child_name) ? ref.child_name : '';
    //                                     var dob = (ref.dob) ? ref.dob : '';
    //                                     var school = (ref.school) ? ref.school : '';
    //                                     var blood_group = (ref.blood_group) ? ref.blood_group : '';

    //                                     childrenQuery = childrenQuery + "('" + employeePrimaryID + "','" + child_name + "','" + dob + "','" + school + "','" + blood_group + "'),"
    //                                 });
    //                                 childrenQuery = childrenQuery.substring(0, childrenQuery.length - 1);

    //                                 if (reference_details.length > 0) {
    //                                     commonFunction.executeQuery(referenceQuery);
    //                                 }

    //                                 if (childrens.length > 0) {
    //                                     commonFunction.executeQuery(childrenQuery);
    //                                 }

    //                                 var mailOptions = {
    //                                     to: email,
    //                                     subject: 'HRM employee registration',
    //                                     html: `Hello <b>` + firstname + `,</b><br>
    //                                         Welcome to HRM. Thanks for registering with HRM.<br>
    //                                         Your credentials to login with HRM is <br><br>

    //                                         Email ID:  <b>` + email + `</b>,<br>
    //                                         Password:  <b>` + password + `</b><br><br><br>

    //                                         Thanks,<br>
    //                                         <b>HRM Team</b>
    //                                         `
    //                                 };
    //                                 mail.sendMail(mailOptions);
    //                                 deferred.resolve({ status: 1, message: 'Employee added successfully' });
    //                             }
    //                         });
    //                     } else {
    //                         deferred.resolve({ status: 0, message: "Failed to add employee" });
    //                     }
    //                 }
    //             });

    //         } else {
    //             deferred.resolve({ status: 0, message: 'Email ID already exists' });
    //         }
    //     });
    //     return deferred.promise;
    // },


    addEmployee: (req, res, next) => {
        var deferred = q.defer();
        console.log("body", req.body)
        employee_upload(req, next, async function (err) {

            if (err) {
                console.log(err)
                deferred.resolve({ status: 0, message: "Image error" })
            }
            else {
                console.log("body", req.body)
                var crminal_fileLocation = [];
                var bankcrypt_filelocation = [];
                var warmingletter = []
                var file = '';
                console.log(req.files)
                if (req.files != undefined) {
                    for (var i = 0; i < req.files.length; i++) {
                        file = req.files

                        if (req.files[i].fieldname == 'bankcrypt_file') {
                            bankcrypt_filelocation.push(file[i].location);
                            console.log("file", bankcrypt_filelocation)
                        }
                        if (req.files[i].fieldname == 'criminal_file') {
                            console.log("Sssdsadsfsaafafsffa")
                            crminal_fileLocation.push(file[i].location);
                            console.log("SSS", crminal_fileLocation)
                        }
                        if (req.files[i].fieldname == 'dispenary_file') {
                            warmingletter.push(file[i].location);
                        }
                        // if(req.files[i].fieldname=='Warming_letter'&&req.files[i].fieldname=='criminal_file'&&req.files[i].fieldname=='bank_file')
                        // {

                        // }
                    }


                }
                var email = (req.body.email) ? req.body.email : '';

                var checkEmailQuery = "SELECT id FROM " + tableConfig.HRM_EMPLOYEE_DETAILS + " WHERE email = '" + email + "'";
                sql.query(checkEmailQuery, async function (err, employeeDetails) {
                    if (err) {
                        console.log(err);
                        deferred.resolve({ status: 0, message: 'Employee registration failed' });
                    } else if (employeeDetails.length == 0) {

                        var company_id = (req.body.company_id) ? req.body.company_id : 0;
                        var role_id = (req.body.role_id) ? req.body.role_id : 2;
                        var firstname = (req.body.firstname) ? req.body.firstname : '';
                        var ic_no = (req.body.ic_no) ? req.body.ic_no : '';
                        var middlename = (req.body.middlename) ? req.body.middlename : '';
                        var lastname = (req.body.lastname) ? req.body.lastname : '';
                        var driving_license = (req.body.driving_license) ? req.body.driving_license : '';
                        var religion = (req.body.religion) ? req.body.religion : '';
                        var marital_status = (req.body.marital_status) ? req.body.marital_status : '';
                        var spouse_name = (req.body.spouse_name) ? req.body.spouse_name : '';
                        var birthday = (req.body.birthday) ? req.body.birthday : '';
                        var occupation = (req.body.occupation) ? req.body.occupation : '';
                        var contact = (req.body.contact) ? req.body.contact : '';
                        var no_of_children = (req.body.no_of_children) ? req.body.no_of_children : 0;
                        var emergency_contact = (req.body.emergency_contact) ? req.body.emergency_contact : '';
                        var home_contact = (req.body.home_contact) ? req.body.home_contact : '';
                        var blood_group = (req.body.blood_group) ? req.body.blood_group : '';
                        var passport_no = (req.body.passport_no) ? req.body.passport_no : '';
                        var visa_start_date = (req.body.visa_start_date) ? req.body.visa_start_date : '';
                        var visa_end_date = (req.body.visa_end_date) ? req.body.visa_end_date : '';
                        var visa_status = (req.body.visa_status) ? req.body.visa_status : 0;
                        var employment_type = (req.body.employment_type) ? req.body.employment_type : 0;
                        var direct_report_to = (req.body.direct_report_to) ? req.body.direct_report_to : '';
                        var training_type = (req.body.training_type) ? req.body.training_type : 0;
                        var salary = (req.body.salary) ? req.body.salary : 0;
                        var national_service_status = (req.body.national_service_status) ? req.body.national_service_status : 0;
                        var joined_date = (req.body.joined_date) ? req.body.joined_date : '';
                        var criminal = (req.body.criminal) ? req.body.criminal : 0;
                        var bankrupt = (req.body.bankrupt) ? req.body.bankrupt : 0;
                        var discipline = (req.body.discipline) ? req.body.discipline : 0;
                        var onboard = (req.body.onboard) ? req.body.onboard : 0
                        var spouse_contact = (req.body.spouse_contact) ? req.body.spouse_contact : '';
                        var spouse_blood_group = (req.body.spouse_blood_group) ? req.body.spouse_blood_group : '';
                        var spouse_occupation = (req.body.spouse_occupation) ? req.body.spouse_occupation : '';
                        var spouse_dob = (req.body.spouse_dob) ? req.body.spouse_dob : '';
                        var reference_details = (req.body.reference!=undefined && req.body.reference!='') ? req.body.reference : []
                        var childrens = (req.body.childrens!=undefined && req.body.childrens!='') ? req.body.childrens : [];
                        var address_line1 = (req.body.address_line1) ? req.body.address_line1 : '';
                        var address_line2 = (req.body.address_line2) ? req.body.address_line2 : '';
                        var city = (req.body.city) ? req.body.city : '';
                        var state = (req.body.state) ? req.body.state : '';
                        var country = (req.body.country) ? req.body.country : 0;
                        var basic_salary = (req.body.basic_salary) ? req.body.basic_salary : 0;
                        var cpf_number = (req.body.cpf_number) ? req.body.cpf_number : '';
                        var password = randomstring.generate(8);
                        var hashedPassword = md5(password);
                        var pr_aprroval_date=(req.body.pr_approval_date!=undefined)?moment(req.body.pr_approval_date).format("YYYY-MM"):'';
                        var pr_status=(req.body.pr_status!=undefined)?req.body.pr_status:'';
                        var wp_skill=(req.body.wp_skill!=undefined)?req.body.wp_skill:'';
                        var native = (req.body.native) ? req.body.native : 0;
                        if(visa_status==1)
                        {
                         native=192
                        }
                       
                    
                        // var refer_details=[]
                        // var child_details=[];
                        //   refer_details.push((reference_details.length>0)?JSON.parse(reference_details):'')
                        //    child_details.push((childrens.length > 0)?JSON.parse(childrens):'')
                        var refer_details = (reference_details.length > 0 && reference_details!=undefined && reference_details!='') ? JSON.parse(reference_details) : []
                        var child_details = (childrens.length > 0 && childrens!=undefined && childrens!='') ? JSON.parse(childrens) : []
                        //    console.log(refer_details) 
                        var getCompanyName = "SELECT name FROM " + tableConfig.HRM_COMP_PROFILE + " WHERE id = '" + company_id + "'";
                        var companyNameResult = await commonFunction.getQueryResults(getCompanyName);
                        var company_name = (companyNameResult[0].name) ? companyNameResult[0].name : '';
                        var company_code = company_name.substring(0, 3).toUpperCase();
                        var employIdQuery = "SELECT count(*) as total_count FROM " + tableConfig.HRM_USER_MASTER + " WHERE company_id = '" + company_id + "'";

                        var totalEmployees = await commonFunction.getQueryResults(employIdQuery);
                        var newEmployeeID = 1;
                        if (totalEmployees.length > 0) {
                            newEmployeeID = totalEmployees[0].total_count + 1;
                        }

                        newEmployeeID = newEmployeeID.toString();
                        newEmployeeID = newEmployeeID.padStart(5, "0");

                        var empID = company_code + '-' + newEmployeeID;

                        var userMasteSaveQuery = "INSERT INTO " + tableConfig.HRM_USER_MASTER + " (emp_id,role_id,company_id,password,pass) VALUES ('" + empID + "','" + role_id + "','" + company_id + "','" + hashedPassword + "','" + password + "')";

                        sql.query(userMasteSaveQuery, function (err, masterData) {
                            if (err) {
                                console.log(err);
                                deferred.resolve({ status: 0, message: "Failed to add employee" });
                            } else {
                                var employeePrimaryID = 0
                                if (masterData) {
                                    employeePrimaryID = masterData.insertId;
                                    // var edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='"+basic_salary+"',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "'  where emp_id='" + emp_id + "' ";

                                    var save_employee = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_DETAILS + " (emp_id,firstname,middlename,lastname,email,ic_no,driving_license,religion,marital_status,spouse_name,birthday,occupation,contact,no_of_children,emergency_contact,home_contact,blood_group,passport_no,visa_start_date,visa_end_date,visa_status,employment_type,direct_report_to,training_type,salary,national_service_status,spouse_contact,spouse_blood_group,spouse_occupation,spouse_dob,addrline1,addrline2,city,state,country,joined_date,basic_salary,cpf_number,criminal,bankrupt,discipline,on_bord_history,pr_date,pr_status,wp_skill,native) VALUES ('" + employeePrimaryID + "','" + firstname + "','" + middlename + "','" + lastname + "','" + email + "','" + ic_no + "','" + driving_license + "','" + religion + "','" + marital_status + "','" + spouse_name + "','" + birthday + "','" + occupation + "','" + contact + "','" + no_of_children + "','" + emergency_contact + "','" + home_contact + "','" + blood_group + "','" + passport_no + "','" + visa_start_date + "','" + visa_end_date + "','" + visa_status + "','" + employment_type + "','" + direct_report_to + "','" + training_type + "','" + salary + "','" + national_service_status + "','" + spouse_contact + "','" + spouse_blood_group + "','" + spouse_occupation + "','" + spouse_dob + "','" + address_line1 + "','" + address_line2 + "','" + city + "','" + state + "','" + country + "','" + joined_date + "','" + basic_salary + "','" + cpf_number + "','" + criminal + "','" + discipline + "','" + bankrupt + "','" + onboard + "','"+pr_aprroval_date+"','"+pr_status+"','"+wp_skill+"','"+native+"')";
                                    if ((crminal_fileLocation.length > 0) && (bankcrypt_filelocation.length == 0) && (warmingletter.length == 0)) {
                                        save_employee = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_DETAILS + " (emp_id,firstname,middlename,lastname,email,ic_no,driving_license,religion,marital_status,spouse_name,birthday,occupation,contact,no_of_children,emergency_contact,home_contact,blood_group,passport_no,visa_start_date,visa_end_date,visa_status,employment_type,direct_report_to,training_type,salary,national_service_status,spouse_contact,spouse_blood_group,spouse_occupation,spouse_dob,addrline1,addrline2,city,state,country,joined_date,basic_salary,cpf_number,criminal_history,criminal,bankrupt,discipline,on_bord_history,pr_date,pr_status,wp_skill,native) VALUES ('" + employeePrimaryID + "','" + firstname + "','" + middlename + "','" + lastname + "','" + email + "','" + ic_no + "','" + driving_license + "','" + religion + "','" + marital_status + "','" + spouse_name + "','" + birthday + "','" + occupation + "','" + contact + "','" + no_of_children + "','" + emergency_contact + "','" + home_contact + "','" + blood_group + "','" + passport_no + "','" + visa_start_date + "','" + visa_end_date + "','" + visa_status + "','" + employment_type + "','" + direct_report_to + "','" + training_type + "','" + salary + "','" + national_service_status + "','" + spouse_contact + "','" + spouse_blood_group + "','" + spouse_occupation + "','" + spouse_dob + "','" + address_line1 + "','" + address_line2 + "','" + city + "','" + state + "','" + country + "','" + joined_date + "','" + basic_salary + "','" + cpf_number + "','" + crminal_fileLocation + "','" + criminal + "','" + discipline + "','" + bankrupt + "','" + onboard + "','"+pr_aprroval_date+"','"+pr_status+"','"+wp_skill+"','"+native+"')"
                                    }
                                    else if ((bankcrypt_filelocation.length > 0) && (warmingletter.length == 0) && (crminal_fileLocation.length == 0)) {
                                        save_employee = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_DETAILS + " (emp_id,firstname,middlename,lastname,email,ic_no,driving_license,religion,marital_status,spouse_name,birthday,occupation,contact,no_of_children,emergency_contact,home_contact,blood_group,passport_no,visa_start_date,visa_end_date,visa_status,employment_type,direct_report_to,training_type,salary,national_service_status,spouse_contact,spouse_blood_group,spouse_occupation,spouse_dob,addrline1,addrline2,city,state,country,joined_date,basic_salary,cpf_number,bankruptcy_history,criminal,bankrupt,discipline,on_bord_history,pr_date,pr_status,wp_skill,native) VALUES ('" + employeePrimaryID + "','" + firstname + "','" + middlename + "','" + lastname + "','" + email + "','" + ic_no + "','" + driving_license + "','" + religion + "','" + marital_status + "','" + spouse_name + "','" + birthday + "','" + occupation + "','" + contact + "','" + no_of_children + "','" + emergency_contact + "','" + home_contact + "','" + blood_group + "','" + passport_no + "','" + visa_start_date + "','" + visa_end_date + "','" + visa_status + "','" + employment_type + "','" + direct_report_to + "','" + training_type + "','" + salary + "','" + national_service_status + "','" + spouse_contact + "','" + spouse_blood_group + "','" + spouse_occupation + "','" + spouse_dob + "','" + address_line1 + "','" + address_line2 + "','" + city + "','" + state + "','" + country + "','" + joined_date + "','" + basic_salary + "','" + cpf_number + "','" + bankcrypt_filelocation + "','" + criminal + "','" + discipline + "','" + bankrupt + "','" + onboard + "','"+pr_aprroval_date+"','"+pr_status+"','"+wp_skill+"','"+native+"')"
                                        //edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='"+basic_salary+"',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "',bankruptcy_history='"+bankcrypt_filelocation+"' where emp_id='" + emp_id + "' " 
                                    }
                                    else if ((warmingletter.length > 0) && (bankcrypt_filelocation.length == 0) && (crminal_fileLocation.length == 0)) {
                                        save_employee = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_DETAILS + " (emp_id,firstname,middlename,lastname,email,ic_no,driving_license,religion,marital_status,spouse_name,birthday,occupation,contact,no_of_children,emergency_contact,home_contact,blood_group,passport_no,visa_start_date,visa_end_date,visa_status,employment_type,direct_report_to,training_type,salary,national_service_status,spouse_contact,spouse_blood_group,spouse_occupation,spouse_dob,addrline1,addrline2,city,state,country,joined_date,basic_salary,cpf_number,disciplinary_history,criminal,bankrupt,discipline,on_bord_history,pr_date,pr_status,wp_skill,native) VALUES ('" + employeePrimaryID + "','" + firstname + "','" + middlename + "','" + lastname + "','" + email + "','" + ic_no + "','" + driving_license + "','" + religion + "','" + marital_status + "','" + spouse_name + "','" + birthday + "','" + occupation + "','" + contact + "','" + no_of_children + "','" + emergency_contact + "','" + home_contact + "','" + blood_group + "','" + passport_no + "','" + visa_start_date + "','" + visa_end_date + "','" + visa_status + "','" + employment_type + "','" + direct_report_to + "','" + training_type + "','" + salary + "','" + national_service_status + "','" + spouse_contact + "','" + spouse_blood_group + "','" + spouse_occupation + "','" + spouse_dob + "','" + address_line1 + "','" + address_line2 + "','" + city + "','" + state + "','" + country + "','" + joined_date + "','" + basic_salary + "','" + cpf_number + "','" + warmingletter + "','" + criminal + "','" + discipline + "','" + bankrupt + "','" + onboard + "','"+pr_aprroval_date+"','"+pr_status+"','"+wp_skill+"','"+native+"')"
                                        // edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='"+basic_salary+"',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "',disciplinary_history='"+warmingletter+"' where emp_id='" + emp_id + "' " 
                                    }
                                    else if((crminal_fileLocation.length > 0) && (bankcrypt_filelocation.length > 0))
                                    {
                                        save_employee = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_DETAILS + " (emp_id,firstname,middlename,lastname,email,ic_no,driving_license,religion,marital_status,spouse_name,birthday,occupation,contact,no_of_children,emergency_contact,home_contact,blood_group,passport_no,visa_start_date,visa_end_date,visa_status,employment_type,direct_report_to,training_type,salary,national_service_status,spouse_contact,spouse_blood_group,spouse_occupation,spouse_dob,addrline1,addrline2,city,state,country,joined_date,basic_salary,cpf_number,criminal_history,bankruptcy_history,criminal,bankrupt,discipline,on_bord_history,pr_date,pr_status,wp_skill,native) VALUES ('" + employeePrimaryID + "','" + firstname + "','" + middlename + "','" + lastname + "','" + email + "','" + ic_no + "','" + driving_license + "','" + religion + "','" + marital_status + "','" + spouse_name + "','" + birthday + "','" + occupation + "','" + contact + "','" + no_of_children + "','" + emergency_contact + "','" + home_contact + "','" + blood_group + "','" + passport_no + "','" + visa_start_date + "','" + visa_end_date + "','" + visa_status + "','" + employment_type + "','" + direct_report_to + "','" + training_type + "','" + salary + "','" + national_service_status + "','" + spouse_contact + "','" + spouse_blood_group + "','" + spouse_occupation + "','" + spouse_dob + "','" + address_line1 + "','" + address_line2 + "','" + city + "','" + state + "','" + country + "','" + joined_date + "','" + basic_salary + "','" + cpf_number + "','" + crminal_fileLocation + "','" + bankcrypt_filelocation + "','" + criminal + "','" + discipline + "','" + bankrupt + "','" + onboard + "','"+pr_aprroval_date+"','"+pr_status+"','"+wp_skill+"','"+native+"')"
                                    }
                                    else if((bankcrypt_filelocation.length > 0) && (warmingletter.length > 0))
                                    {
                                        save_employee = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_DETAILS + " (emp_id,firstname,middlename,lastname,email,ic_no,driving_license,religion,marital_status,spouse_name,birthday,occupation,contact,no_of_children,emergency_contact,home_contact,blood_group,passport_no,visa_start_date,visa_end_date,visa_status,employment_type,direct_report_to,training_type,salary,national_service_status,spouse_contact,spouse_blood_group,spouse_occupation,spouse_dob,addrline1,addrline2,city,state,country,joined_date,basic_salary,cpf_number,bankruptcy_history,disciplinary_history,criminal,bankrupt,discipline,on_bord_history,pr_date,pr_status,wp_skill,native) VALUES ('" + employeePrimaryID + "','" + firstname + "','" + middlename + "','" + lastname + "','" + email + "','" + ic_no + "','" + driving_license + "','" + religion + "','" + marital_status + "','" + spouse_name + "','" + birthday + "','" + occupation + "','" + contact + "','" + no_of_children + "','" + emergency_contact + "','" + home_contact + "','" + blood_group + "','" + passport_no + "','" + visa_start_date + "','" + visa_end_date + "','" + visa_status + "','" + employment_type + "','" + direct_report_to + "','" + training_type + "','" + salary + "','" + national_service_status + "','" + spouse_contact + "','" + spouse_blood_group + "','" + spouse_occupation + "','" + spouse_dob + "','" + address_line1 + "','" + address_line2 + "','" + city + "','" + state + "','" + country + "','" + joined_date + "','" + basic_salary + "','" + cpf_number + "','" + bankcrypt_filelocation + "','" + warmingletter + "','" + criminal + "','" + discipline + "','" + bankrupt + "','" + onboard + "','"+pr_aprroval_date+"','"+pr_status+"','"+wp_skill+"','"+native+"')"
                                    }
                                    else if((crminal_fileLocation.length > 0) && (warmingletter.length > 0))
                                    {
                                        save_employee = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_DETAILS + " (emp_id,firstname,middlename,lastname,email,ic_no,driving_license,religion,marital_status,spouse_name,birthday,occupation,contact,no_of_children,emergency_contact,home_contact,blood_group,passport_no,visa_start_date,visa_end_date,visa_status,employment_type,direct_report_to,training_type,salary,national_service_status,spouse_contact,spouse_blood_group,spouse_occupation,spouse_dob,addrline1,addrline2,city,state,country,joined_date,basic_salary,cpf_number,criminal_history,disciplinary_history,criminal,bankrupt,discipline,on_bord_history,pr_date,pr_status,wp_skill,native) VALUES ('" + employeePrimaryID + "','" + firstname + "','" + middlename + "','" + lastname + "','" + email + "','" + ic_no + "','" + driving_license + "','" + religion + "','" + marital_status + "','" + spouse_name + "','" + birthday + "','" + occupation + "','" + contact + "','" + no_of_children + "','" + emergency_contact + "','" + home_contact + "','" + blood_group + "','" + passport_no + "','" + visa_start_date + "','" + visa_end_date + "','" + visa_status + "','" + employment_type + "','" + direct_report_to + "','" + training_type + "','" + salary + "','" + national_service_status + "','" + spouse_contact + "','" + spouse_blood_group + "','" + spouse_occupation + "','" + spouse_dob + "','" + address_line1 + "','" + address_line2 + "','" + city + "','" + state + "','" + country + "','" + joined_date + "','" + basic_salary + "','" + cpf_number + "','" + crminal_fileLocation + "','" + warmingletter + "','" + criminal + "','" + discipline + "','" + bankrupt + "','" + onboard + "','"+pr_aprroval_date+"','"+pr_status+"','"+wp_skill+"','"+native+"')"
                                    }
                                    else if ((warmingletter.length > 0) && (bankcrypt_filelocation.length > 0) && (crminal_fileLocation.length > 0)) {
                                        save_employee = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_DETAILS + " (emp_id,firstname,middlename,lastname,email,ic_no,driving_license,religion,marital_status,spouse_name,birthday,occupation,contact,no_of_children,emergency_contact,home_contact,blood_group,passport_no,visa_start_date,visa_end_date,visa_status,employment_type,direct_report_to,training_type,salary,national_service_status,spouse_contact,spouse_blood_group,spouse_occupation,spouse_dob,addrline1,addrline2,city,state,country,joined_date,basic_salary,cpf_number,criminal_history,bankruptcy_history,disciplinary_history,criminal,bankrupt,discipline,on_bord_history,pr_date,pr_status,wp_skill,native) VALUES ('" + employeePrimaryID + "','" + firstname + "','" + middlename + "','" + lastname + "','" + email + "','" + ic_no + "','" + driving_license + "','" + religion + "','" + marital_status + "','" + spouse_name + "','" + birthday + "','" + occupation + "','" + contact + "','" + no_of_children + "','" + emergency_contact + "','" + home_contact + "','" + blood_group + "','" + passport_no + "','" + visa_start_date + "','" + visa_end_date + "','" + visa_status + "','" + employment_type + "','" + direct_report_to + "','" + training_type + "','" + salary + "','" + national_service_status + "','" + spouse_contact + "','" + spouse_blood_group + "','" + spouse_occupation + "','" + spouse_dob + "','" + address_line1 + "','" + address_line2 + "','" + city + "','" + state + "','" + country + "','" + joined_date + "','" + basic_salary + "','" + cpf_number + "''" + crminal_fileLocation + "','" + bankcrypt_filelocation + "','" + warmingletter + "','" + criminal + "','" + discipline + "','" + bankrupt + "','" + onboard + "','"+pr_aprroval_date+"','"+pr_status+"','"+wp_skill+"','"+native+"')"
                                        // edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='"+basic_salary+"',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "',disciplinary_history='"+warmingletter+"',criminal_history='"+crminal_fileLocation+"',bankruptcy_history='"+bankcrypt_filelocation+"'where emp_id='" + emp_id + "' " 
                                    }
                                    sql.query(save_employee, async function (err, insertResults) {
                                        if (err) {
                                            console.log(err);
                                            deferred.resolve({ status: 0, message: 'Employee registration failed' });
                                        } else if (insertResults) {
                                            var companyID = insertResults.insertId;
                                            companyID = companyID.toString();

                                            var referenceQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_REFERENCE + " (emp_id,name,email,mobile,company) VALUES ";


                                            // for(let key in refer_details) {
                                            //     if(!refer_details.hasOwnProperty(key)) continue;
                                            //    ref = JSON.parse(refer_details[key]);
                                            //     console.log(ref)
                                            //   }
                                            refer_details.forEach((ref) => {

                                                var name = (ref.name) ? ref.name : '';
                                                let email = (ref.email) ? ref.email : '';
                                                var mobile = (ref.mobile) ? ref.mobile : '';
                                                var company = (ref.company) ? ref.company : '';
                                                referenceQuery = referenceQuery + "('" + employeePrimaryID + "','" + name + "','" + email + "','" + mobile + "','" + company + "'),"
                                            });
                                            // referenceQuery = referenceQuery + ")";
                                            referenceQuery = referenceQuery.substring(0, referenceQuery.length - 1);
                                            console.log(referenceQuery)
                                            var childrenQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_CHILDREN + " (emp_id,child_name,DOB,school,blood_group) VALUES ";

                                            child_details.forEach(ref => {
                                                var child_name = (ref.child_name) ? ref.child_name : '';
                                                var dob = (ref.dob) ? ref.dob : '';
                                                var school = (ref.school) ? ref.school : '';
                                                var blood_group = (ref.blood_group) ? ref.blood_group : '';

                                                childrenQuery = childrenQuery + "('" + employeePrimaryID + "','" + child_name + "','" + dob + "','" + school + "','" + blood_group + "'),"
                                            });
                                            // childrenQuery = childrenQuery + ")";
                                            childrenQuery = childrenQuery.substring(0, childrenQuery.length - 1);
                                            console.log("childrenQuery",childrenQuery)
                                            if (reference_details.length > 0) {
                                                commonFunction.executeQuery(referenceQuery);
                                            }

                                            if (childrens.length > 0) {
                                                commonFunction.executeQuery(childrenQuery);
                                            }

                                            var mailOptions = {
                                                to: email,
                                                subject: 'HRM employee registration',
                                                html: `Hello <b>` + firstname + `,</b><br>
                                            Welcome to HRM. Thanks for registering with HRM.<br>
                                            Your credentials to login with HRM is <br><br>
    
                                            Email ID:  <b>` + email + `</b>,<br>
                                            Password:  <b>` + password + `</b><br><br><br>
    
                                            Thanks,<br>
                                            <b>HRM Team</b>
                                            `
                                            };
                                            mail.sendMail(mailOptions);

            //Total workforce
            //Local Employees Count(LQS Count)
            var query = "SELECT * from hrm_employee_details as em inner join hrm_user_master as um  on um.id=em.emp_id WHERE  um.company_id='"+company_id+"' and (em.visa_status=1 || em.visa_status=2)";
            console.log('testquery',query)
            var local_totalemployeecountval=0;
            sql.query(query, function (err, employeecount) {
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                } else {
                    var total_emp_count=0;
                    var visa_status=0;
                    employeecount.forEach((data, index) => {
                        if(data.basic_salary>1300)
                        {
                            var empcount=1;
                        }
                        if(data.basic_salary>650 && data.basic_salary<1300)
                        {
                            var empcount=0.5; 
                        }
                        if(data.basic_salary<400)
                        {
                            var empcount=0;
                        }
                        
                        if(empcount!=undefined){
                            local_totalemployeecountval+=empcount;
                        }
                         
                    });
                    local_totalemployeecount=Math.floor(local_totalemployeecountval);
                
            var wp_spassquery = "SELECT count(*) as foriegn_count,com.sector_type  from hrm_employee_details as em inner join hrm_user_master as um  on um.id=em.emp_id INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " as com ON com.id = um.company_id WHERE  um.company_id='"+company_id+"' and (em.visa_status=3 || em.visa_status=4)";
            sql.query(wp_spassquery, function (err, wp_spassqueryresult) {
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                } else {
                    
                    total_available_foriegn=wp_spassqueryresult[0].foriegn_count;
                    sector_type=wp_spassqueryresult[0].sector_type;
                    
                    
                //S Pass Quota
                if(sector_type!=1)
                {
                    var spassallocated_percent_allother=Math.floor((20/100)*local_totalemployeecount);
                }
                if(sector_type==1)
                {
                    var spassallocated_percent_service=Math.floor((15/100)*local_totalemployeecount);
                }
                
                var service_valuespass=spassallocated_percent_service==undefined?0:spassallocated_percent_service;
                var other_valuespass=spassallocated_percent_allother==undefined?0:spassallocated_percent_allother;
                spass_allocated=service_valuespass+','+other_valuespass;

                //WP Quota
                if(sector_type==1)
                {
                    var wpallocated_percent_service=Math.floor((40/100)*local_totalemployeecount);
                }
                if(sector_type==2)
                {
                    var wpallocated_percent_manufac=Math.floor((60/100)*local_totalemployeecount);
                }
                if(sector_type==3)
                {
                    var wpallocated_percent_cons=Math.floor((87.5/100)*local_totalemployeecount);
                }
                if(sector_type==4)
                {
                    var wpallocated_percent_process=Math.floor((87.5/100)*local_totalemployeecount);
                }
                if(sector_type==5)
                {
                    var wpallocated_percent_marine=Math.floor((77.8/100)*local_totalemployeecount);
                }
                var service_valuewp=wpallocated_percent_service==undefined?0:wpallocated_percent_service;
                var manufac_valuewp=wpallocated_percent_manufac==undefined?0:wpallocated_percent_manufac;
                var cons_valuewp=wpallocated_percent_cons==undefined?0:wpallocated_percent_cons;
                var process_valuewp=wpallocated_percent_process==undefined?0:wpallocated_percent_process;
                var marine_valuewp=wpallocated_percent_marine==undefined?0:wpallocated_percent_marine;

                wpallocated_percent=service_valuewp+','+manufac_valuewp+','+cons_valuewp+','+process_valuewp+','+marine_valuewp;
                    if(wp_spassqueryresult[0].sector_type==3 || wp_spassqueryresult[0].sector_type==4)
                    {
                        canallocate_foriegn=local_totalemployeecount*7;
                    }
                    if(wp_spassqueryresult[0].sector_type==5)
                    {
                        canallocate_foriegn=local_totalemployeecount*3.5;
                    }
                    if(wp_spassqueryresult[0].sector_type==2)
                    {
                        canallocate_foriegn=local_totalemployeecount*1.5;
                    }
                    if(wp_spassqueryresult[0].sector_type==1)
                    {
                        canallocate_foriegn=local_totalemployeecount*0.666667;
                    }
                    
                    total_emp_count=total_available_foriegn+local_totalemployeecount;

                    if(wp_spassqueryresult[0].sector_type==2)
                    {
                    //Tier calculation(Manufacturing)
                    tier1=Math.floor((25/100)*total_emp_count);
                    tier2=Math.floor(((50/100)*total_emp_count)-tier1);
                    tier3=Math.floor(total_available_foriegn - tier1 - tier2);
                    }

                    if(wp_spassqueryresult[0].sector_type==1)
                    {
                    //Tier Calculation(Service)
                    tier1=Math.floor((10/100)*total_emp_count);
                    tier2=Math.floor(((25/100)*total_emp_count)-tier1);
                    tier3=Math.floor(total_available_foriegn - tier1 - tier2);
                    }

                        // var tier1_val=3;
                        // var tier2_val=2;
                        // var tier3_val=1;

                        var tier1_val=tier1;
                        var tier2_val=tier2;
                        var tier3_val=tier3;
                      
                        var tierclearquery = "SELECT * from hrm_employee_details as em inner join hrm_user_master as um  on um.id=em.emp_id WHERE  um.company_id='"+company_id+"'";
                            sql.query(tierclearquery, function (err, tierclearres) {
                                if (err) {
                                    console.log(err)
                                   // deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                } else {  
                                    tierclearres.forEach((datares, index) => { 
                                    var tierclearupdate = "Update hrm_employee_details set tier=0 where emp_id="+ datares.id +" ";
                                                sql.query(tierclearupdate, function (err, tierclear) {
                                                    if (err) {
                                                        console.log(err)
                                                        deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                    } else {

                                                        //Tier1 Allocation
                            var tieronequery = "SELECT * from  " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp  where (emp.visa_status=3 || emp.visa_status=4) and tier=0  order by emp.visa_status,emp.wp_skill asc ";
                            sql.query(tieronequery, function (err, tieroneres) {
                                if (err) {
                                    console.log(err)
                                   // deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                } else {  
                                        tieroneres.forEach((data, index) => {  
                                            if(index < tier1_val)
                                            {
                                                var tieroneupdate = "Update hrm_employee_details set tier=1 where id="+ data.id +" ";
                                                sql.query(tieroneupdate, function (err, tieroneupres) {
                                                    if (err) {
                                                        console.log(err)
                                                        deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                    } else {
                                                        if(tieroneupres.affectedRows)
                                                        {
                                                             //Tier2 Allocation
                                                        var tiertwoquery = "SELECT * from  " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp  where (emp.visa_status=3 || emp.visa_status=4) and tier=0 and tier!=1 order by emp.visa_status,emp.wp_skill asc ";                   
                                                        sql.query(tiertwoquery, function (err, tiertwores) {
                                                            if (err) {
                                                                console.log(err)
                                                                // deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                            } else {  
                                                                tiertwores.forEach((tierres, tier2index) => {  
                                                                        if(tier2index < tier2_val)
                                                                        {
                                                                            var tiertwoupdate = "Update hrm_employee_details set tier=2 where id="+ tierres.id +" ";
                                                                            console.log('upque2',tiertwoupdate)
                                                                            sql.query(tiertwoupdate, function (err, tiertwoupres) {
                                                                                if (err) {
                                                                                    console.log(err)
                                                                                    deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                                                } else {
                                                                                    if(tiertwoupres.affectedRows)
                                                                                    {
                                                        var tierthreequery = "SELECT * from  " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp  where (emp.visa_status=3 || emp.visa_status=4) and tier=0 and tier!=1 and tier!=2 order by emp.visa_status,emp.wp_skill asc ";                   
                                                        sql.query(tierthreequery, function (err, tierthreeres) {
                                                            if (err) {
                                                                console.log(err)
                                                                // deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                            } else {  
                                                                tierthreeres.forEach((tierthreeres, tier3index) => {  
                                                                        if(tier3index < tier3_val)
                                                                        {
                                                                            var tierthreeupdate = "Update hrm_employee_details set tier=3 where id="+ tierthreeres.id +" ";
                                                                            sql.query(tierthreeupdate, function (err, tierthreeupres) {
                                                                                if (err) {
                                                                                    console.log(err)
                                                                                    deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                                                } else {
                                                                                    deferred.resolve({ status: 0, message: 'Updated Successfully' });
                                                                                }
                                                                            });
                                                                        }
                                                                    }); 
                                                            }
                                                        });
                                                                                    }

                                                                                    deferred.resolve({ status: 0, message: 'Updated Successfully' });
                                                                                }
                                                                            });
                                                                        }
                                                                    }); 
                                                            }
                                                        });
                                                        }
                                                        deferred.resolve({ status: 0, message: 'Updated Successfully' });
                                                    }
                                                });
                                            }
                                        }); 
                                }
                            });


                                                    }
                                                });
                                            });
                                }
                            });
                       

                        
                           
                        

                var comp_updatequery = "Update " + tableConfig.HRM_COMP_PROFILE + " as um  set um.spass_canallocate='"+ spass_allocated+"',um.wp_canallocate='"+ wpallocated_percent+"',um.foriegn_can_allocate="+ canallocate_foriegn +",um.total_employees_count = " + total_emp_count + ",um.local_employees_count = " + local_totalemployeecount + ",um.foriegn_worker_count = " + total_available_foriegn + ",um.tier1 = " + tier1 + ",um.tier2 = " + tier2 + ",um.tier3="+tier3+" where um.id=" + company_id+"";
                    console.log('updatecomp',comp_updatequery)
                    sql.query(comp_updatequery, function (err, compupdateres) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                        } else {
                            deferred.resolve({ status: 0, message: 'Company Details Updated Successfully' });
                        }
                    });
                }
            });
                    }
            });
//Total workforce end


                                            deferred.resolve({ status: 1, message: 'Employee added successfully' });
            
                        
                                            

                                        }
                                    });
                                } else {
                                    deferred.resolve({ status: 0, message: "Failed to add employee" });
                                }
                            }

                        });

                    } else {
                        deferred.resolve({ status: 0, message: 'Email ID already exists' });
                    }
                });
            }
        });
        return deferred.promise;
    },

    excelImportEmployees: (req, res) => {
        var deferred = q.defer();
        var v = new Validator();

        var employeeSchema = {
            "id": "/employeeDetails",
            "type": "object",
            "properties": {
                "email": { "type": "email" },
                "firstname": { "type": "string" },
                "middlename": { "type": "string" },
                "lastname": { "type": "lastname" },
                "religion": { "type": "string" },
                "ic_no": { "type": "number" },
                "blood_group": { "type": "string" },
                "emergency_contact": { "type": "number" },
                "address_line1": { "type": "string" },
                "city": { "type": "string" },
                "state": { "type": "string" },
                "country": { "type": "string" },
                "employment_type": { "type": "string" },
                "role": { "type": "string" },
                "direct_report_to": { "type": "string" },
                "training_type": { "type": "string" },
                "basic_salary": { "type": "number" },
                "salary": { "type": "number" },
                "joined_date": { "type": "string" },
                "marital_status": { "type": "string" },
                "national_service_status": { "type": "number" },
                "dob": { "type": "string" },
                "cpf_number": { "type": "string" },

                "driving_license": { "type": "string" },
                "occupation": { "type": "string" },
                "contact": { "type": "number" },
                "no_of_children": { "type": "number" },
                "home_contact": { "type": "number" },
                "passport_no": { "type": "string" },
                "visa_start_date": { "type": "string" },
                "visa_end_date": { "type": "string" },
                "visa_status": { "type": "string" },
                "spouse_contact": { "type": "number" },
                "spouse_blood_group": { "type": "string" },
                "spouse_occupation": { "type": "string" },
                "spouse_dob": { "type": "string" },
                "address_line2": { "type": "string" },
                "pr_approval date":{"type":"string"},
                "pr_status":{"type":"string"},
                "skill":{"type":"string"},
                "native":{"type":"string"}
            },

            "required": ["email", "firstname", "religion", "national_service_status", "ic_no", "blood_group", "emergency_contact", "address_line1", "city", "state", "country", "employment_type", "role", "direct_report_to", "training_type", "basic_salary", "salary", "joined_date", "marital_status", "dob"]
        };

        upload(req, res, async function (err) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to import data" });
            } else {
                if (!req.file) {
                    deferred.resolve({ status: 0, message: "Please choose file" });
                } else {

                    if (req.body.company_id != undefined && req.body.company_id != '') {

                        var company_id = req.body.company_id;
                        var workbook = XLSX.readFile(__dirname + '/uploads/employee_list.xlsx');
                        var first_sheet_name = workbook.SheetNames[0];
                        var worksheet = workbook.Sheets[first_sheet_name];
                        var data = XLSX.utils.sheet_to_json(worksheet);
                        var errors = [];
                        var duplicate_mail_ids = [];
                        var total_number_of_employees_given = 0;
                        var rows = [];     
                        if (data.length > 0) {
                            total_number_of_employees_given = data.length;

                            data.forEach((d, index) => {
                                var ValidatorResult = v.validate(d, employeeSchema);
                                if (ValidatorResult.errors.length > 0) {
                                    rows.push(index + 1);
                                }
                                errors = errors.concat(ValidatorResult.errors);
                                console.log("errors",errors)
                            });

                            if (errors.length == 0) {

                                forEach(data, async (e_detail, index, next) => {

                                    var email = (e_detail.email) ? e_detail.email : '';
                                    var role = (e_detail.role) ? e_detail.role : '';
                                    var firstname = (e_detail.firstname) ? e_detail.firstname : '';
                                    var ic_no = (e_detail.ic_no) ? e_detail.ic_no : '';
                                    var middlename = (e_detail.middlename) ? e_detail.middlename : '';
                                    var lastname = (e_detail.lastname) ? e_detail.lastname : '';
                                    var driving_license = (e_detail.driving_license) ? e_detail.driving_license : '';
                                    var religion = (e_detail.religion) ? e_detail.religion : '';
                                    var marital_status = (e_detail.marital_status) ? e_detail.marital_status : '';
                                    var spouse_name = (e_detail.spouse_name) ? e_detail.spouse_name : '';
                                    var birthday = (e_detail.dob!='') ? moment(e_detail.dob).format("YYYY-MM-DD") : '';
                                    var occupation = (e_detail.occupation) ? e_detail.occupation : '';
                                    var contact = (e_detail.contact) ? e_detail.contact : '';
                                    var no_of_children = (e_detail.no_of_children) ? e_detail.no_of_children : '';
                                    var emergency_contact = (e_detail.emergency_contact) ? e_detail.emergency_contact : '';
                                    var home_contact = (e_detail.landline_number) ? e_detail.landline_number : '';
                                    var blood_group = (e_detail.blood_group) ? e_detail.blood_group : '';
                                    var passport_no = (e_detail.passport_no) ? e_detail.passport_no : '';
                                    var visa_start_date = (e_detail.visa_start_date) ? e_detail.visa_start_date : '';
                                    var visa_end_date = (e_detail.visa_end_date) ? e_detail.visa_end_date : '';
                                    var visa_status = (e_detail.visa_status) ? e_detail.visa_status : 0;
                                    var employment_type = (e_detail.employment_type) ? e_detail.employment_type : 0;
                                    var direct_report_to = (e_detail.direct_report_to) ? e_detail.direct_report_to : '';
                                    var training_type = (e_detail.training_type) ? e_detail.training_type : 0;
                                    var salary = (e_detail.salary) ? e_detail.salary : 0;
                                    var national_service_status = (e_detail.national_service_status) ? e_detail.national_service_status : 0;
                                    var joined_date = (e_detail.joined_date) ? e_detail.joined_date : '';

                                    var spouse_contact = (e_detail.spouse_contact) ? e_detail.spouse_contact : '';
                                    var spouse_blood_group = (e_detail.spouse_blood_group) ? e_detail.spouse_blood_group : '';
                                    var spouse_occupation = (e_detail.spouse_occupation) ? e_detail.spouse_occupation : '';
                                    var spouse_dob = (e_detail.spouse_dob) ? e_detail.spouse_dob : '';
                                    var reference_details = (e_detail.reference) ? e_detail.reference : [];
                                    var childrens = (e_detail.childrens) ? e_detail.childrens : [];
                                    var address_line1 = (e_detail.address_line1) ? e_detail.address_line1 : '';
                                    var address_line2 = (e_detail.address_line2) ? e_detail.address_line2 : '';
                                    var city = (e_detail.city) ? e_detail.city : '';
                                    var state = (e_detail.state) ? e_detail.state : '';
                                    var country = (e_detail.country) ? e_detail.country : '';
                                    var basic_salary = (e_detail.basic_salary) ? e_detail.basic_salary : 0;
                                    var cpf_number = (e_detail.cpf_number) ? e_detail.cpf_number : '';
                                    var password = randomstring.generate(8);
                                    var hashedPassword = md5(password);
                                   var native=(e_detail.native)?e_detail.native:''

                                    
                                    var country_query="select id from hrm_country where nicename='"+country+"'"
                                   var country_data = await commonFunction.getQueryResults(country_query)
                                   var country_id=country_data.length > 0?country_data[0].id:0
                                    var employee_code=0;
                                    var employ_type=employment_type.toUpperCase();
                                    if(employ_type=="INTERN")
                                    {
                                        employee_code=4;
                                    }
                                    else if(employ_type=="FREELANCER")
                                    {
                                        employee_code=5;
                                    }
                                    else if(employ_type=="CONTRACT")
                                    {
                                        employee_code=6;
                                    }
                                    else
                                    {
                                        employee_code=7;
                                    }
                                    var visastatus_id=0;
                                    var pr_date=moment(e_detail.pr_date).format("YYYY-MM-DD");
                                    console.log("pr_date",pr_date)
                                    var pr_status=(e_detail.pr_status!=undefined)?e_detail.pr_status:'';
                                    var pr_status_name=pr_status.toUpperCase();q;
                                    var pr_status_code=0;
                                    var skill_name=(e_detail.skill!=undefined)?(e_detail.skill).toUpperCase():'';
                                    var skill_code=0;
                                    var visa_status_name=visa_status.toUpperCase();
                                   console.log("visaname",visa_status_name)
                                    if(visa_status_name=="SINGAPORE CITIZEN")
                                    {
                                        console.log("12234")
                                        visastatus_id=1;
                                        pr_date='';
                                        pr_status_code=0
                                        native="SINGAPORE"

                                    }
                                    else if(visa_status_name=="SINGAPORE PR")
                                    {
                                      
                                        
                                            visastatus_id=2
                                            if(pr_status_name=='GRADUATED')
                                            {
                                                console.log("vhhfhm")
                                                pr_status_code=1;

                                            }
                                            else if(pr_status_name=='FULL EMPLOYEE')
                                            {
                                                pr_status_code=2;
                                            }
                                       
                                    }
                                    else if(visa_status_name=='WORK PERMIT'||visa_status_name=='S PASS')
                                    {
                                        visastatus_id=3;
                                        if(skill_name=='BASIC SKILLED')
                                        {
                                            skill_code=1;
                                        }
                                        else if(skill_name=='HIGHER SKILLED')
                                        {
                                            skill_code=2;
                                        }
                                        else
                                        {
                                            skill_code=3;
                                        }
                                    }
                                    console.log("jkjgbdg", pr_status_code)
                                    var direct_report_role=0;
                                    var direct_report_role_name=direct_report_to.toUpperCase();
                                    if(direct_report_role_name=="MANAGER")
                                    {
                                        direct_report_role=3
                                    }
                                    else if(direct_report_role_name=="HR")
                                    {
                                        direct_report_role=4;
                                    }
                                    else if(direct_report_role_name=="SUPERVISOR")
                                    {
                                        direct_report_role=6;
                                    }
                                    var trainingtype_id=0;
                                    var trainingtype_name=training_type.toUpperCase();
                                    if(trainingtype_name=='ORIENTATION TRAINING')
                                    {
                                        trainingtype_id=1;
                                    }
                                    else if(trainingtype_name=='ON JOB TRAINING')
                                    {
                                        trainingtype_id=2;
                                    }
                                    else
                                    {
                                        trainingtype_id=3;
                                    }


                                    var religion_id=0;
                                    var marital_status_code=marital_status.toUpperCase();
                                    var martial_id=0;
                                    if(marital_status_code=="MARRIED")
                                    {
                                        martial_id=2;

                                    }
                                    else if(marital_status_code=="SINGLE")
                                    {
                                        martial_id=1
                                    }
                                    var religions=religion.toUpperCase();

                                    if(religions=='HINDU')
                                    {
                                        religion_id=3
                                    }
                                    else if(religions=='MUSLIM')
                                    {
                                        religion_id=2
                                    }
                                    else
                                    {
                                        religion_id=1
                                    }
                                
                                    var role_query="select id from hrm_user_role where role='"+role+"'"
                                    var role_data= await commonFunction.getQueryResults(role_query);

                                   var role_id=(role_data.length > 0)?role_data[0].id:0
                                   var nativeQuery="select id from hrm_country where nicename='"+native+"'";
                                   var nativedata= await commonFunction.getQueryResults(nativeQuery);

                                    var checkEmailQuery = "SELECT id FROM " + tableConfig.HRM_EMPLOYEE_DETAILS + " WHERE email = '" + email + "' AND status ='1'";
                                    var emailResult = await commonFunction.getQueryResults(checkEmailQuery);
                                    if (emailResult.length > 0) {
                                        duplicate_mail_ids.push(email);
                                        next();
                                    } else {
                                        var getCompanyName = "SELECT name FROM " + tableConfig.HRM_COMP_PROFILE + " WHERE id = '" + company_id + "'";
                                        var companyNameResult = await commonFunction.getQueryResults(getCompanyName);
                                        if (companyNameResult.length == 0) {
                                            next()
                                        } else {
                                            var company_name = (companyNameResult[0].name) ? companyNameResult[0].name : '';
                                            var company_code = company_name.substring(0, 3).toUpperCase();

                                            var employIdQuery = "SELECT count(*) as total_count FROM " + tableConfig.HRM_USER_MASTER + " WHERE company_id = '" + company_id + "'";
                                            var totalEmployees = await commonFunction.getQueryResults(employIdQuery);
                                            var newEmployeeID = 1;
                                            if (totalEmployees.length > 0) {
                                                newEmployeeID = totalEmployees[0].total_count + 1;
                                            }

                                            newEmployeeID = newEmployeeID.toString();
                                            newEmployeeID = newEmployeeID.padStart(5, "0");

                                            var empID = company_code + '-' + newEmployeeID;
                                            console.log("empid",empID)
                                            var userMasteSaveQuery = "INSERT INTO " + tableConfig.HRM_USER_MASTER + " (emp_id,role_id,company_id,password,pass) VALUES ('" + empID + "','" + role_id + "','" + company_id + "','" + hashedPassword + "','" + password + "')";

                                            sql.query(userMasteSaveQuery, function (err, masterData) {
                                                if (err) {
                                                    console.log(err);
                                                    next();
                                                } else {
                                                    var employeePrimaryID = 0;
                                                    if (masterData) {
                                                        employeePrimaryID = masterData.insertId;
console.log("pr_status_code",pr_status_code)
                                                        var save_employee = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_DETAILS + " (emp_id,firstname,middlename,lastname,email,ic_no,driving_license,religion,marital_status,spouse_name,birthday,occupation,contact,no_of_children,emergency_contact,home_contact,blood_group,passport_no,visa_start_date,visa_end_date,visa_status,employment_type,direct_report_to,training_type,salary,national_service_status,spouse_contact,spouse_blood_group,spouse_occupation,spouse_dob,addrline1,addrline2,city,state,country,joined_date,basic_salary,cpf_number,pr_date,pr_status,wp_skill,native) VALUES ('" + employeePrimaryID + "','" + firstname + "','" + middlename + "','" + lastname + "','" + email + "','" + ic_no + "','" + driving_license + "','" + religion_id + "','" + martial_id + "','" + spouse_name + "','" + birthday + "','" + occupation + "','" + contact + "','" + no_of_children + "','" + emergency_contact + "','" + home_contact + "','" + blood_group + "','" + passport_no + "','" + visa_start_date + "','" + visa_end_date + "','" + visastatus_id + "','" + employee_code + "','" + direct_report_role + "','" + trainingtype_id + "','" + salary + "','" + national_service_status + "','" + spouse_contact + "','" + spouse_blood_group + "','" + spouse_occupation + "','" + spouse_dob + "','" + address_line1 + "','" + address_line2 + "','" + city + "','" + state + "','" + country_id + "','" + joined_date + "','" + basic_salary + "','" + cpf_number + "','"+pr_date+"','"+pr_status_code+"','"+skill_code+"','"+nativedata[0].id+"')";
                                                        sql.query(save_employee, async function (err, insertResults) {
                                                            if (err) {
                                                                console.log(err);
                                                            } else {
                                                                if(insertResults.affectedRows  > 0)
                                                                {
                                                                    console.log('true');
                                                                    var mailOptions = {
                                                                        to: email,
                                                                        subject: 'HRM employee registration',
                                                                        html: `Hello <b>` + firstname + `,</b><br>
                                                                    Welcome to HRM. Thanks for registering with HRM.<br>
                                                                    Your credentials to login with HRM is <br><br>
                            
                                                                    Email ID:  <b>` + email + `</b>,<br>
                                                                    Password:  <b>` + password + `</b><br><br><br>
                            
                                                                    Thanks,<br>
                                                                    <b>HRM Team</b>
                                                                    `
                                                                    };
                                                                    mail.sendMail(mailOptions);
                                                                }
                                                                
                                                            }
                                                        });

                                                    } else {
                                                        deferred.resolve({ status: 0, message: "Failed to add employee" });
                                                    }
                                                }
                                            });
                                            next();
                                        }
                                    }
                                }).then(() => {
                                    deferred.resolve({ status: 1, message: "Employee added successfully", duplicate_email_ids: duplicate_mail_ids, total_given_employees: total_number_of_employees_given });
                                }).catch((error) => {
                                    deferred.resolve({ status: 0, message: "Failed to add employee" });
                                });

                            } else {
                                deferred.resolve({ status: 0, message: "Parameter mismatch error while import data in following rows. Please give correct data", rows: rows });
                            }
                        } else {
                            deferred.resolve({ status: 0, message: "No data to import" });
                        }
                    } else {
                        deferred.resolve({ status: 0, message: "Please enter company_id" });
                    }
                }
            }
        });
        return deferred.promise;
    },

    // updateEmployee: (req) => {
    //     var deferred = q.defer();
    //     var emp_id = req.body.emp_id;

    //     var CheckidQuery = "select * from  " + tableConfig.HRM_USER_MASTER + " as um inner join " + tableConfig.HRM_EMPLOYEE_DETAILS + " as em  on um.id=em.emp_id where um.id=" + emp_id + " and um.status=1";
    //     sql.query(CheckidQuery, function (err, data) {
    //         if (err) {
    //             deferred.resolve({ status: 0, message: "Something Went Wrong" });
    //         } else {
    //             if (data.length != 0) {
    //                 var email = (req.body.email) ? req.body.email : '';
    //                 var company_id = (req.body.company_id) ? req.body.company_id : 0;
    //                 var role_id = (req.body.role_id) ? req.body.role_id : 2;
    //                 var firstname = (req.body.firstname) ? req.body.firstname : '';
    //                 var ic_no = (req.body.ic_no) ? req.body.ic_no : '';
    //                 var middlename = (req.body.middlename) ? req.body.middlename : '';
    //                 var lastname = (req.body.lastname) ? req.body.lastname : '';
    //                 var driving_license = (req.body.driving_license) ? req.body.driving_license : '';
    //                 var religion = (req.body.religion) ? req.body.religion : '';
    //                 var marital_status = (req.body.marital_status) ? req.body.marital_status : '';
    //                 var spouse_name = (req.body.spouse_name) ? req.body.spouse_name : '';
    //                 var birthday = (req.body.birthday) ? req.body.birthday : '';
    //                 var occupation = (req.body.occupation) ? req.body.occupation : '';
    //                 var contact = (req.body.contact) ? req.body.contact : '';
    //                 var no_of_children = (req.body.no_of_children) ? req.body.no_of_children : '';
    //                 var emergency_contact = (req.body.emergency_contact) ? req.body.emergency_contact : '';
    //                 var home_contact = (req.body.landline_number) ? req.body.landline_number : '';
    //                 var blood_group = (req.body.blood_group) ? req.body.blood_group : '';
    //                 var passport_no = (req.body.passport_no) ? req.body.passport_no : '';
    //                 var visa_start_date = (req.body.visa_start_date) ? req.body.visa_start_date : '';
    //                 var visa_end_date = (req.body.visa_end_date) ? req.body.visa_end_date : '';
    //                 var visa_status = (req.body.visa_status) ? req.body.visa_status : 0;
    //                 var employment_type = (req.body.employment_type) ? req.body.employment_type : 0;
    //                 var direct_report_to = (req.body.direct_report_to) ? req.body.direct_report_to : '';
    //                 var training_type = (req.body.training_type) ? req.body.training_type : 0;
    //                 var salary = (req.body.salary) ? req.body.salary : 0;
    //                 var national_service_status = (req.body.national_service_status) ? req.body.national_service_status : 0;
    //                 var joined_date = (req.body.joined_date) ? req.body.joined_date : '';
    //                 var basic_salary = (req.body.basic_salary) ? req.body.basic_salary : 0
    //                 var spouse_contact = (req.body.spouse_contact) ? req.body.spouse_contact : '';
    //                 var spouse_blood_group = (req.body.spouse_blood_group) ? req.body.spouse_blood_group : '';
    //                 var spouse_occupation = (req.body.spouse_occupation) ? req.body.spouse_occupation : '';
    //                 var spouse_dob = (req.body.spouse_dob) ? req.body.spouse_dob : '';
    //                 var reference_details = (req.body.reference) ? req.body.reference : [];
    //                 var childrens = (req.body.childrens) ? req.body.childrens : [];
    //                 var address_line1 = (req.body.address_line1) ? req.body.address_line1 : '';
    //                 var address_line2 = (req.body.address_line2) ? req.body.address_line2 : '';
    //                 var city = (req.body.city) ? req.body.city : '';
    //                 var state = (req.body.state) ? req.body.state : '';
    //                 var country = (req.body.country) ? req.body.country : '';
    //                 var accno = (req.body.accno) ? req.body.accno : '';
    //                 var acchldr = (req.body.acchldr) ? req.body.acchldr : '';
    //                 var bankname = (req.body.bankname) ? req.body.bankname : '';
    //                 var ifsc = (req.body.ifsc) ? req.body.ifsc : '';

    //                 var userMasteUpdateQuery = " Update " + tableConfig.HRM_USER_MASTER + "  SET   role_id='" + role_id + "'  where  id=" + emp_id + "";
    //                 sql.query(userMasteUpdateQuery, function (err, masterData) {
    //                     if (err) {
    //                         console.log(err);
    //                         deferred.resolve({ status: 0, message: "Failed to update employee" });
    //                     } else {
    //                         var employeePrimaryID = 0
    //                         if (masterData) {
    //                             employeePrimaryID = emp_id;

    //                             var edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='" + basic_salary + "',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "' where emp_id='" + emp_id + "' ";
    //                             sql.query(edit_employee, async function (err, updateResults) {
    //                                 if (err) {
    //                                     console.log(err);
    //                                     deferred.resolve({ status: 0, message: 'Employee updation failed' });
    //                                 } else if (updateResults) {

    //                                     var refername = '';
    //                                     var referenceemail = '';
    //                                     var referencemobile = '';
    //                                     var referencecompany = '';

    //                                     reference_details.forEach(ref => {
    //                                         refername = (ref.name) ? ref.name : '';
    //                                         referenceemail = (ref.email) ? ref.email : '';
    //                                         referencemobile = (ref.mobile) ? ref.mobile : '';
    //                                         referencecompany = (ref.company) ? ref.company : '';
    //                                     });
    //                                     var referenceQuery = "Update " + tableConfig.HRM_EMPLOYEE_REFERENCE + "  SET name='" + refername + "',email='" + referenceemail + "',mobile='" + referencemobile + "',company='" + referencecompany + "' where emp_id='" + employeePrimaryID + "'";

    //                                     var child_name = '';
    //                                     var child_dob = '';
    //                                     var child_school = '';
    //                                     var child_blood_group = '';

    //                                     childrens.forEach(ref => {
    //                                         child_name = (ref.child_name) ? ref.child_name : '';
    //                                         child_dob = (ref.dob) ? ref.dob : '';
    //                                         child_school = (ref.school) ? ref.school : '';
    //                                         child_blood_group = (ref.blood_group) ? ref.blood_group : '';
    //                                     });

    //                                     var childrenQuery = "Update  " + tableConfig.HRM_EMPLOYEE_CHILDREN + "  SET child_name = '" + child_name + "',DOB='" + child_dob + "',school='" + child_school + "',blood_group='" + child_blood_group + "' where emp_id=" + emp_id + "";
    //                                     if (reference_details.length > 0) {
    //                                         commonFunction.executeQuery(referenceQuery);
    //                                     }

    //                                     if (childrens.length > 0) {
    //                                         commonFunction.executeQuery(childrenQuery);
    //                                     }

    //                                     // Add or Update Account details
    //                                     var checkaccountifexist = "Select * from " + tableConfig.HRM_EMPLOYEE_ACCOUNT_DETAILS + " where emp_id = " + emp_id;

    //                                     sql.query(checkaccountifexist, async function (err, accountexist) {
    //                                         if (accountexist.length > 0) {
    //                                             var addaccountdetails = "Update " + tableConfig.HRM_EMPLOYEE_ACCOUNT_DETAILS + " set acc_no = '" + accno + "', account_holder_name = '" + acchldr + "', bank_name = '" + bankname + "', ifsc_code = '" + ifsc + "' where emp_id = " + emp_id;
    //                                             commonFunction.executeQuery(addaccountdetails);
    //                                         } else {
    //                                             var addaccountdetails = "INSERT into " + tableConfig.HRM_EMPLOYEE_ACCOUNT_DETAILS + " (acc_no,account_holder_name,bank_name,ifsc_code,emp_id) Values('" + accno + "','" + acchldr + "', '" + bankname + "', '" + ifsc + "', " + emp_id + " )";
    //                                             commonFunction.executeQuery(addaccountdetails);
    //                                         }
    //                                     });
    //                                     deferred.resolve({ status: 1, message: 'Employee update successfully' });
    //                                 }
    //                             });

    //                         } else {
    //                             deferred.resolve({ status: 0, message: "Failed to Update employee" });
    //                         }
    //                     }
    //                 });

    //             } else {
    //                 deferred.resolve({ status: 0, message: "Employee does not exist" });
    //             }
    //         }
    //     });

    //     return deferred.promise;
    // },


    updateEmployee: (req, next) => {
        var deferred = q.defer();
        console.log("body", req.body)
        employee_upload(req, next, async function (err) {

            if (err) {
                console.log(err)
                deferred.resolve({ status: 0, message: "Image error" })
            }
            else {


                var crminal_fileLocation = [];
                var bankcrypt_filelocation = [];
                var warmingletter = []
                var file = '';

                if (req.files != undefined) {
                    for (var i = 0; i < req.files.length; i++) {
                        file = req.files

                        if (req.files[i].fieldname == 'bankcrypt_file') {
                            // company_logo.push(req.file.location);
                            bankcrypt_filelocation.push(file[i].location);
                            console.log("file", bankcrypt_filelocation)
                        }
                        if (req.files[i].fieldname == 'criminal_file') {
                            console.log("Sssdsadsfsaafafsffa")
                            crminal_fileLocation.push(file[i].location);

                        }
                        if (req.files[i].fieldname == 'dispenary_file') {
                            warmingletter.push(file[i].location);
                        }

                    }


                }

                var emp_id = req.body.emp_id;
                console.log("body", req.body)
                var CheckidQuery = "select * from  " + tableConfig.HRM_USER_MASTER + " as um inner join " + tableConfig.HRM_EMPLOYEE_DETAILS + " as em  on um.id=em.emp_id where um.id=" + emp_id + "";
                sql.query(CheckidQuery, function (err, data) {
                    if (err) {
                        deferred.resolve({ status: 0, message: "Something Went Wrong" });
                    } else {
                        if (data.length != 0) {
                            var email = (req.body.email) ? req.body.email : '';


                            var company_id = (req.body.company_id) ? req.body.company_id : 0;
                            var role_id = (req.body.role_id) ? req.body.role_id : 2;
                            var firstname = (req.body.firstname) ? req.body.firstname : '';
                            var ic_no = (req.body.ic_no) ? req.body.ic_no : '';
                            var middlename = (req.body.middlename) ? req.body.middlename : '';
                            var lastname = (req.body.lastname) ? req.body.lastname : '';
                            var driving_license = (req.body.driving_license) ? req.body.driving_license : '';
                            var religion = (req.body.religion) ? req.body.religion : '';
                            var marital_status = (req.body.marital_status) ? req.body.marital_status : '';
                            var spouse_name = (req.body.spouse_name) ? req.body.spouse_name : '';
                            var birthday = (req.body.birthday) ? req.body.birthday : '';
                            var occupation = (req.body.occupation) ? req.body.occupation : '';
                            var contact = (req.body.contact) ? req.body.contact : '';
                            var no_of_children = (req.body.no_of_children) ? req.body.no_of_children : 0;
                            var emergency_contact = (req.body.emergency_contact) ? req.body.emergency_contact : '';
                            var home_contact = (req.body.home_contact) ? req.body.home_contact : '';
                            var blood_group = (req.body.blood_group) ? req.body.blood_group : '';
                            var passport_no = (req.body.passport_no) ? req.body.passport_no : '';
                            var visa_start_date = (req.body.visa_start_date) ? req.body.visa_start_date : '';
                            var visa_end_date = (req.body.visa_end_date) ? req.body.visa_end_date : '';
                            var visa_status = (req.body.visa_status) ? req.body.visa_status : 0;
                            var employment_type = (req.body.employment_type) ? req.body.employment_type : 0;
                            var direct_report_to = (req.body.direct_report_to) ? req.body.direct_report_to : '';
                            var training_type = (req.body.training_type) ? req.body.training_type : 0;
                            var salary = (req.body.salary) ? req.body.salary : 0;
                            var national_service_status = (req.body.national_service_status) ? req.body.national_service_status : 0;
                            var joined_date = (req.body.joined_date) ? req.body.joined_date : '';
                            var basic_salary = (req.body.basic_salary) ? req.body.basic_salary : 0
                            var spouse_contact = (req.body.spouse_contact) ? req.body.spouse_contact : '';
                            var spouse_blood_group = (req.body.spouse_blood_group) ? req.body.spouse_blood_group : '';
                            var spouse_occupation = (req.body.spouse_occupation) ? req.body.spouse_occupation : '';
                            var spouse_dob = (req.body.spouse_dob) ? req.body.spouse_dob : 0;
                            var reference_details = req.body.reference ? req.body.reference : [];
                            var childrens = req.body.childrens ? req.body.childrens : [];
                            var address_line1 = (req.body.address_line1) ? req.body.address_line1 : '';
                            var address_line2 = (req.body.address_line2) ? req.body.address_line2 : '';
                            var city = (req.body.city) ? req.body.city : '';
                            var state = (req.body.state) ? req.body.state : '';
                            var country = (req.body.country) ? req.body.country : 0;
                            var criminal = (req.body.criminal) ? req.body.criminal : 0;
                            var bankrupt = (req.body.bankrupt) ? req.body.bankrupt : 0;
                            var discipline = (req.body.discipline) ? req.body.discipline : 0;
                            var onboard = (req.body.onboard) ? req.body.onboard : 0
                            var accno = (req.body.accno) ? req.body.accno : '';
                            var acchldr = (req.body.acchldr) ? req.body.acchldr : '';
                            var bankname = (req.body.bankname) ? req.body.bankname : '';
                            var pr_aprroval_date=''
                            if(visa_status==2)
                            {
                                pr_aprroval_date=(req.body.pr_approval_date!=undefined)?moment(req.body.pr_approval_date).format("YYYY-MM"):'';
                            }
                            //var pr_aprroval_date=(req.body.pr_approval_date!=undefined)?moment(req.body.pr_approval_date).format("YYYY-MM"):'';
                            var pr_status=(req.body.pr_status!=undefined)?req.body.pr_status:'';
                            var wp_skill = (req.body.wp_skill) ? req.body.wp_skill : 0;
                             var ifsc = (req.body.ifsc) ? req.body.ifsc : '';
                            var refer_details = (reference_details.length > 0) ? JSON.parse(reference_details) : []
                            var child_details = (childrens.length > 0) ? JSON.parse(childrens) : []
                           var cpf_number=(req.body.cpf_number!=undefined)?req.body.cpf_number:0;
                           var native = (req.body.native) ? req.body.native : 0;
                           if(visa_status==1)
                           {
                            native=192
                           }
                          
                            //  var refer_details=(reference_details.length>0)?JSON.parse(reference_details):[]
                            //var child_details=(childrens.length > 0)?JSON.parse(childrens):[]

                            var userMasteUpdateQuery = " Update " + tableConfig.HRM_USER_MASTER + "  SET   role_id='" + role_id + "'  where  id=" + emp_id + "";
                            sql.query(userMasteUpdateQuery, function (err, masterData) {
                                if (err) {
                                    console.log(err);
                                    deferred.resolve({ status: 0, message: "Failed to update employee" });
                                } else {
                                    var employeePrimaryID = 0
                                    if (masterData) {
                                        employeePrimaryID = emp_id;

                                        var edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',criminal='" + criminal + "', bankrupt='" + bankrupt + "', discipline='" + discipline + "',on_bord_history='" + onboard + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='" + basic_salary + "',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "',cpf_number='"+cpf_number+"',pr_date='"+pr_aprroval_date+"',pr_status='"+pr_status+"',wp_skill='"+wp_skill+"',native='"+native+"' where emp_id='" + emp_id + "' ";
                                        if ((crminal_fileLocation.length > 0) && (bankcrypt_filelocation.length == 0) && (warmingletter.length == 0)) {
                                            edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',criminal='" + criminal + "', bankrupt='" + bankrupt + "', discipline='" + discipline + "',on_bord_history='" + onboard + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='" + basic_salary + "',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "',criminal_history='" + crminal_fileLocation + "',cpf_number='"+cpf_number+"',pr_date='"+pr_aprroval_date+"',pr_status='"+pr_status+"',wp_skill='"+wp_skill+"',native='"+native+"' where emp_id='" + emp_id + "' "
                                        }
                                        else if ((bankcrypt_filelocation.length > 0) && (warmingletter.length == 0) && (crminal_fileLocation.length == 0)) {
                                            edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',criminal='" + criminal + "', bankrupt='" + bankrupt + "', discipline='" + discipline + "',on_bord_history='" + onboard + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='" + basic_salary + "',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "',bankruptcy_history='" + bankcrypt_filelocation + "',cpf_number='"+cpf_number+"',pr_date='"+pr_aprroval_date+"',pr_status='"+pr_status+"',wp_skill='"+wp_skill+"',native='"+native+"' where emp_id='" + emp_id + "' "
                                        }
                                        else if ((warmingletter.length > 0) && (bankcrypt_filelocation.length == 0) && (crminal_fileLocation.length == 0)) {
                                            edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',criminal='" + criminal + "', bankrupt='" + bankrupt + "', discipline='" + discipline + "',on_bord_history='" + onboard + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='" + basic_salary + "',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "',disciplinary_history='" + warmingletter + "',cpf_number='"+cpf_number+"',pr_date='"+pr_aprroval_date+"',pr_status='"+pr_status+"',wp_skill='"+wp_skill+"',native='"+native+"' where emp_id='" + emp_id + "' "
                                        }
                                        else if ((crminal_fileLocation.length > 0) && (bankcrypt_filelocation.length  > 0)) {
                                            edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',criminal='" + criminal + "', bankrupt='" + bankrupt + "', discipline='" + discipline + "',on_bord_history='" + onboard + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='" + basic_salary + "',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "',criminal_history='" + crminal_fileLocation + "',bankruptcy_history='" + bankcrypt_filelocation +"',cpf_number='"+cpf_number+"',pr_date='"+pr_aprroval_date+"',pr_status='"+pr_status+"',wp_skill='"+wp_skill+"',native='"+native+"' where emp_id='" + emp_id + "' "
                                        }
                                        else if((bankcrypt_filelocation.length > 0) && (warmingletter.length  > 0))
                                        {
                                            edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',criminal='" + criminal + "', bankrupt='" + bankrupt + "', discipline='" + discipline + "',on_bord_history='" + onboard + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='" + basic_salary + "',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "',disciplinary_history='" + warmingletter + "',bankruptcy_history='" + bankcrypt_filelocation +"',cpf_number='"+cpf_number+"',pr_date='"+pr_aprroval_date+"',pr_status='"+pr_status+"',wp_skill='"+wp_skill+"',native='"+native+"' where emp_id='" + emp_id + "' "
                                        }
                                        else if((warmingletter.length > 0) && (crminal_fileLocation.length  > 0))
                                        {
                                            edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',criminal='" + criminal + "', bankrupt='" + bankrupt + "', discipline='" + discipline + "',on_bord_history='" + onboard + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='" + basic_salary + "',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "',disciplinary_history='" + warmingletter + "',criminal_history='" + crminal_fileLocation +"',cpf_number='"+cpf_number+"',pr_date='"+pr_aprroval_date+"',pr_status='"+pr_status+"',wp_skill='"+wp_skill+"',native='"+native+"' where emp_id='" + emp_id + "' "
                                        }
                                        else if ((warmingletter.length > 0) && (bankcrypt_filelocation.length > 0) && (crminal_fileLocation.length > 0)) {
                                            edit_employee = "UPDATE  " + tableConfig.HRM_EMPLOYEE_DETAILS + "  SET firstname='" + firstname + "',criminal='" + criminal + "', bankrupt='" + bankrupt + "', discipline='" + discipline + "',on_bord_history='" + onboard + "',middlename='" + middlename + "',lastname='" + lastname + "',email='" + email + "',ic_no='" + ic_no + "',driving_license='" + driving_license + "',religion='" + religion + "',basic_salary='" + basic_salary + "',marital_status='" + marital_status + "',spouse_name='" + spouse_name + "',birthday='" + birthday + "',occupation='" + occupation + "',contact='" + contact + "',no_of_children='" + no_of_children + "',emergency_contact='" + emergency_contact + "',home_contact='" + home_contact + "',blood_group='" + blood_group + "',passport_no='" + passport_no + "',visa_start_date='" + visa_start_date + "',visa_end_date='" + visa_end_date + "',visa_status='" + visa_status + "',employment_type='" + employment_type + "',direct_report_to='" + direct_report_to + "',training_type='" + training_type + "',salary='" + salary + "',national_service_status='" + national_service_status + "',spouse_contact='" + spouse_contact + "',spouse_blood_group='" + spouse_blood_group + "',spouse_occupation='" + spouse_occupation + "',spouse_dob='" + spouse_dob + "',addrline1='" + address_line1 + "',addrline2='" + address_line2 + "',city='" + city + "',state='" + state + "',country='" + country + "',joined_date='" + joined_date + "',disciplinary_history='" + warmingletter + "',criminal_history='" + crminal_fileLocation + "',bankruptcy_history='" + bankcrypt_filelocation + "',cpf_number='"+cpf_number+"',pr_date='"+pr_aprroval_date+"',pr_status='"+pr_status+"',wp_skill='"+wp_skill+"',native='"+native+"' where emp_id='" + emp_id + "' "

                                        }
                                        console.log('test',edit_employee)
                                       
                                        sql.query(edit_employee, async function (err, updateResults) {
                                            console.log(edit_employee)
                                            if (err) {
                                                console.log(err);
                                                deferred.resolve({ status: 0, message: 'Employee updation failed' });
                                            } else if (updateResults) {

                                                var refername = '';

                                                var referenceemail = '';
                                                var referencemobile = '';
                                                var referencecompany = '';
                                                console.log("refernce", typeof (reference_details))
                                                var checking_query = "select * from hrm_employee_reference where emp_id=" + emp_id + "";
                                                sql.query(checking_query, function (err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    else {
                                                        if (data.length > 0) {

                                                            refer_details.forEach(ref => {
                                                                refername = (ref.name) ? ref.name : '';

                                                                referenceemail = (ref.email) ? ref.email : '';
                                                                referencemobile = (ref.mobile) ? ref.mobile : '';
                                                                referencecompany = (ref.company) ? ref.company : '';
                                                            });


                                                            var referenceQuery = "Update " + tableConfig.HRM_EMPLOYEE_REFERENCE + "  SET name='" + refername + "',email='" + referenceemail + "',mobile='" + referencemobile + "',company='" + referencecompany + "' where emp_id='" + employeePrimaryID + "'";
                                                            if (reference_details.length > 0) {
                                                                commonFunction.executeQuery(referenceQuery);
                                                            }


                                                        }
                                                        else {
                                                            var referenceQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_REFERENCE + " (emp_id,name,email,mobile,company) VALUES ";



                                                            refer_details.forEach((ref) => {

                                                                var name = (ref.name) ? ref.name : '';
                                                                let email = (ref.email) ? ref.email : '';
                                                                var mobile = (ref.mobile) ? ref.mobile : '';
                                                                var company = (ref.company) ? ref.company : '';
                                                                referenceQuery = referenceQuery + "('" + employeePrimaryID + "','" + name + "','" + email + "','" + mobile + "','" + company + "'),"
                                                            });
                                                            // referenceQuery = referenceQuery + ")";
                                                            referenceQuery = referenceQuery.substring(0, referenceQuery.length - 1);
                                                            if (reference_details.length > 0) {
                                                                commonFunction.executeQuery(referenceQuery);
                                                            }
                                                        }
                                                        var child_name = '';
                                                        var child_dob = '';
                                                        var child_school = '';
                                                        var child_blood_group = '';
                                                        var checkingQuerychilden = "select * from hrm_employee_children where emp_id=" + emp_id + "";
                                                        sql.query(checkingQuerychilden, function (err, cdata) {
                                                            if (err) {
                                                                console.log(err)
                                                                deferred.resolve({ status: 0, message: "Something went wrong" })
                                                            }
                                                            else {

                                                                if (cdata.length > 0) {


                                                                    child_details.forEach(ref => {
                                                                        child_name = (ref.child_name) ? ref.child_name : '';
                                                                        child_dob = moment(ref.dob !='Invaild date').format("YYYY-MM-DD") ? moment(ref.dob).format("YYYY-MM-DD") : '';
                                                                        child_school = (ref.school) ? ref.school : '';
                                                                        child_blood_group = (ref.blood_group) ? ref.blood_group : '';
                                                                    });

                                                                    var childrenQuery = "Update  " + tableConfig.HRM_EMPLOYEE_CHILDREN + "  SET child_name = '" + child_name + "',DOB='" + child_dob + "',school='" + child_school + "',blood_group='" + child_blood_group + "' where emp_id=" + emp_id + "";

                                                                    console.log("childresbupdate",childrenQuery)
                                                                    if (childrens.length > 0) {
                                                                        commonFunction.executeQuery(childrenQuery);
                                                                    }

                                                                } else {
                                                                    var childrenQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_CHILDREN + " (emp_id,child_name,DOB,school,blood_group) VALUES ";
                                                                    console.log("childrenQuery", childrenQuery)
                                                                    child_details.forEach(ref => {

                                                                        child_name = (ref.child_name) ? ref.child_name : '';
                                                                        child_dob =  moment(ref.dob !='Invaild date').format("YYYY-MM-DD") ? moment(ref.dob).format("YYYY-MM-DD") : '';
                                                                        child_school = (ref.school) ? ref.school : '';
                                                                        child_blood_group = (ref.blood_group) ? ref.blood_group : '';

                                                                        childrenQuery = childrenQuery + "('" + employeePrimaryID + "','" + child_name + "','" + child_dob + "','" + child_school + "','" + child_blood_group + "'),"
                                                                    });
                                                                    console.log(childrenQuery)
                                                                    // childrenQuery = childrenQuery + ")";
                                                                    childrenQuery = childrenQuery.substring(0, childrenQuery.length - 1);
                                                                    if (childrens.length > 0) {
                                                                        commonFunction.executeQuery(childrenQuery);
                                                                    }
                                                                  
                                                                }
                                                            }
                                                        })




                                                    }
                                                })


                                                // Add or Update Account details
                                                var checkaccountifexist = "Select * from " + tableConfig.HRM_EMPLOYEE_ACCOUNT_DETAILS + " where emp_id = " + emp_id;
                                                console.log('Account Query =======>', checkaccountifexist)
                                                sql.query(checkaccountifexist, async function (err, accountexist) {
                                                    console.log('Account Query =======>', accountexist)
                                                    if (accountexist.length > 0) {
                                                        var addaccountdetails = "Update " + tableConfig.HRM_EMPLOYEE_ACCOUNT_DETAILS + " set acc_no = '" + accno + "', account_holder_name = '" + acchldr + "', bank_name = '" + bankname + "', ifsc_code = '" + ifsc + "' where emp_id = " + emp_id;
                                                        commonFunction.executeQuery(addaccountdetails);
                                                        console.log("addaccountdetails",addaccountdetails)
                                                    } else {
                                                        var addaccountdetails = "INSERT into " + tableConfig.HRM_EMPLOYEE_ACCOUNT_DETAILS + " (acc_no,account_holder_name,bank_name,ifsc_code,emp_id) Values('" + accno + "','" + acchldr + "', '" + bankname + "', '" + ifsc + "', " + emp_id + " )";
                                                        commonFunction.executeQuery(addaccountdetails);
                                                        console.log("addaccountdetails",addaccountdetails)
                                                    }

                                                });
            //Total workforce
            //Local Employees Count(LQS Count)
            var query = "SELECT * from hrm_employee_details as em inner join hrm_user_master as um  on um.id=em.emp_id WHERE  um.company_id='"+company_id+"' and (em.visa_status=1 || em.visa_status=2)";
            console.log('testquery',query)
            var local_totalemployeecountval=0;
            sql.query(query, function (err, employeecount) {
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                } else {
                    var total_emp_count=0;
                    var visa_status=0;
                    employeecount.forEach((data, index) => {
                        if(data.basic_salary>1300)
                        {
                            var empcount=1;
                        }
                        if(data.basic_salary>650 && data.basic_salary<1300)
                        {
                            var empcount=0.5; 
                        }
                        if(data.basic_salary<400)
                        {
                            var empcount=0;
                        }
                        console.log('idandsal',data.basic_salary+'-'+data.id)
                        console.log('ecount',empcount)
                        if(empcount!=undefined){
                            local_totalemployeecountval+=empcount;
                        }
                         
                    });
                    local_totalemployeecount=Math.floor(local_totalemployeecountval);
                
            var wp_spassquery = "SELECT count(*) as foriegn_count,com.sector_type  from hrm_employee_details as em inner join hrm_user_master as um  on um.id=em.emp_id INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " as com ON com.id = um.company_id WHERE  um.company_id='"+company_id+"' and (em.visa_status=3 || em.visa_status=4)";
            sql.query(wp_spassquery, function (err, wp_spassqueryresult) {
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                } else {
                    
                    total_available_foriegn=wp_spassqueryresult[0].foriegn_count;
                    sector_type=wp_spassqueryresult[0].sector_type;
                    
                    
                //S Pass Quota
                if(sector_type!=1)
                {
                    var spassallocated_percent_allother=Math.floor((20/100)*local_totalemployeecount);
                }
                if(sector_type==1)
                {
                    var spassallocated_percent_service=Math.floor((15/100)*local_totalemployeecount);
                }
                
                var service_valuespass=spassallocated_percent_service==undefined?0:spassallocated_percent_service;
                var other_valuespass=spassallocated_percent_allother==undefined?0:spassallocated_percent_allother;
                spass_allocated=service_valuespass+','+other_valuespass;

                //WP Quota
                if(sector_type==1)
                {
                    var wpallocated_percent_service=Math.floor((40/100)*local_totalemployeecount);
                }
                if(sector_type==2)
                {
                    var wpallocated_percent_manufac=Math.floor((60/100)*local_totalemployeecount);
                }
                if(sector_type==3)
                {
                    var wpallocated_percent_cons=Math.floor((87.5/100)*local_totalemployeecount);
                }
                if(sector_type==4)
                {
                    var wpallocated_percent_process=Math.floor((87.5/100)*local_totalemployeecount);
                }
                if(sector_type==5)
                {
                    var wpallocated_percent_marine=Math.floor((77.8/100)*local_totalemployeecount);
                }
                var service_valuewp=wpallocated_percent_service==undefined?0:wpallocated_percent_service;
                var manufac_valuewp=wpallocated_percent_manufac==undefined?0:wpallocated_percent_manufac;
                var cons_valuewp=wpallocated_percent_cons==undefined?0:wpallocated_percent_cons;
                var process_valuewp=wpallocated_percent_process==undefined?0:wpallocated_percent_process;
                var marine_valuewp=wpallocated_percent_marine==undefined?0:wpallocated_percent_marine;

                wpallocated_percent=service_valuewp+','+manufac_valuewp+','+cons_valuewp+','+process_valuewp+','+marine_valuewp;
                    if(wp_spassqueryresult[0].sector_type==3 || wp_spassqueryresult[0].sector_type==4)
                    {
                        canallocate_foriegn=local_totalemployeecount*7;
                    }
                    if(wp_spassqueryresult[0].sector_type==5)
                    {
                        canallocate_foriegn=local_totalemployeecount*3.5;
                    }
                    if(wp_spassqueryresult[0].sector_type==2)
                    {
                        canallocate_foriegn=local_totalemployeecount*1.5;
                    }
                    if(wp_spassqueryresult[0].sector_type==1)
                    {
                        canallocate_foriegn=local_totalemployeecount*0.666667;
                    }
                    
                    total_emp_count=total_available_foriegn+local_totalemployeecount;

                    if(wp_spassqueryresult[0].sector_type==2)
                    {
                    //Tier calculation(Manufacturing)
                    tier1=Math.floor((25/100)*total_emp_count);
                    tier2=Math.floor(((50/100)*total_emp_count)-tier1);
                    tier3=Math.floor(total_available_foriegn - tier1 - tier2);
                    }

                    if(wp_spassqueryresult[0].sector_type==1)
                    {
                    //Tier Calculation(Service)
                    tier1=Math.floor((10/100)*total_emp_count);
                    tier2=Math.floor(((25/100)*total_emp_count)-tier1);
                    tier3=Math.floor(total_available_foriegn - tier1 - tier2);
                    }

                    console.log('tier1val',tier1)
                    console.log('tier2val',tier2) 
                    console.log('tier3val',tier3)

                        // var tier1_val=3;
                        // var tier2_val=2;
                        // var tier3_val=1;

                        var tier1_val=tier1;
                        var tier2_val=tier2;
                        var tier3_val=tier3;
                        
                       

                        var tierclearquery = "SELECT * from hrm_employee_details as em inner join hrm_user_master as um  on um.id=em.emp_id WHERE  um.company_id='"+company_id+"'";
                            sql.query(tierclearquery, function (err, tierclearres) {
                                if (err) {
                                    console.log(err)
                                   // deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                } else {  
                                    tierclearres.forEach((datares, index) => { 
                                    var tierclearupdate = "Update hrm_employee_details set tier=0 where emp_id="+ datares.id +" ";
                                                sql.query(tierclearupdate, function (err, tierclear) {
                                                    if (err) {
                                                        console.log(err)
                                                        deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                    } else {

                                                    }
                                                });
                                            });
                                }
                            });

                            //Tier1 Allocation
                            var tieronequery = "SELECT * from  " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp  where (emp.visa_status=3 || emp.visa_status=4) and tier=0  order by emp.visa_status,emp.wp_skill asc ";
                            sql.query(tieronequery, function (err, tieroneres) {
                                if (err) {
                                    console.log(err)
                                   // deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                } else {  
                                        tieroneres.forEach((data, index) => {  
                                            if(index < tier1_val)
                                            {
                                                console.log('index1',index)
                                                var tieroneupdate = "Update hrm_employee_details set tier=1 where id="+ data.id +" ";
                                               console.log('up1',tieroneupdate)
                                                sql.query(tieroneupdate, function (err, tieroneupres) {
                                                    if (err) {
                                                        console.log(err)
                                                        deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                    } else {
                                                        if(tieroneupres.affectedRows)
                                                        {
                                                             //Tier2 Allocation
                                                        var tiertwoquery = "SELECT * from  " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp  where (emp.visa_status=3 || emp.visa_status=4) and tier=0 and tier!=1 order by emp.visa_status,emp.wp_skill asc ";                   
                                                        sql.query(tiertwoquery, function (err, tiertwores) {
                                                            if (err) {
                                                                console.log(err)
                                                                // deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                            } else {  
                                                                tiertwores.forEach((tierres, tier2index) => {  
                                                                        if(tier2index < tier2_val)
                                                                        {
                                                                            var tiertwoupdate = "Update hrm_employee_details set tier=2 where id="+ tierres.id +" ";
                                                                            console.log('up2',tiertwoupdate)
                                                                            sql.query(tiertwoupdate, function (err, tiertwoupres) {
                                                                                if (err) {
                                                                                    console.log(err)
                                                                                    deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                                                } else {
                                                                                    if(tiertwoupres.affectedRows)
                                                                                    {
                                                        var tierthreequery = "SELECT * from  " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp  where (emp.visa_status=3 || emp.visa_status=4) and tier=0 and tier!=1 and tier!=2 order by emp.visa_status,emp.wp_skill asc ";                   
                                                        sql.query(tierthreequery, function (err, tierthreeres) {
                                                            if (err) {
                                                                console.log(err)
                                                                // deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                            } else {  
                                                                tierthreeres.forEach((tierthreeres, tier3index) => {  
                                                                        if(tier3index < tier3_val)
                                                                        {
                                                                            var tierthreeupdate = "Update hrm_employee_details set tier=3 where id="+ tierthreeres.id +" ";
                                                                            console.log('up3',tierthreeupdate)
                                                                            sql.query(tierthreeupdate, function (err, tierthreeupres) {
                                                                                if (err) {
                                                                                    console.log(err)
                                                                                    deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                                                                                } else {
                                                                                    deferred.resolve({ status: 0, message: 'Updated Successfully' });
                                                                                }
                                                                            });
                                                                        }
                                                                    }); 
                                                            }
                                                        });
                                                                                    }

                                                                                    deferred.resolve({ status: 0, message: 'Updated Successfully' });
                                                                                }
                                                                            });
                                                                        }
                                                                    }); 
                                                            }
                                                        });
                                                        }
                                                        deferred.resolve({ status: 0, message: 'Updated Successfully' });
                                                    }
                                                });
                                            }
                                        }); 
                                }
                            });
                       

                           
                        

                var comp_updatequery = "Update " + tableConfig.HRM_COMP_PROFILE + " as um  set um.spass_canallocate='"+ spass_allocated+"',um.wp_canallocate='"+ wpallocated_percent+"',um.foriegn_can_allocate="+ canallocate_foriegn +",um.total_employees_count = " + total_emp_count + ",um.local_employees_count = " + local_totalemployeecount + ",um.foriegn_worker_count = " + total_available_foriegn + ",um.tier1 = " + tier1 + ",um.tier2 = " + tier2 + ",um.tier3="+tier3+" where um.id=" + company_id+"";
                    console.log('updatecomp',comp_updatequery)
                    sql.query(comp_updatequery, function (err, compupdateres) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                        } else {
                            deferred.resolve({ status: 0, message: 'Company Details Updated Successfully' });
                        }
                    });
                }
            });
                    }
            });
//Total workforce end

            

                                                deferred.resolve({ status: 1, message: 'Employee update successfully' });
                                            }
                                        });

                                    } else {
                                        deferred.resolve({ status: 0, message: "Failed to Update employee" });
                                    }
                                }
                            });

                        } else {
                            deferred.resolve({ status: 0, message: "Employee does not exist" });
                        }
                    }
                });
            }

        });

        return deferred.promise;
    },

    employeeDelete: (req) => {
        var deferred = q.defer();
        console.log(req.body)
        var emp_id = req.body.emp_id;
        var status = req.body.status;
        var last_working_date=moment(req.body.last_working_date!=undefined).format("YYYY-MM-DD")?moment(req.body.last_working_date).format("YYYY-MM-DD"):''
        var condition=",em.last_working_date='"+last_working_date+"'"
        var query = "SELECT  * FROM " + tableConfig.HRM_USER_MASTER + "  WHERE id ='" + emp_id + "'";
      
        sql.query(query, function (err, user) {

            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: 'Something Went Wrong' });
            } else {
                if (user.length > 0) {
                    var emp_id = (user[0].id) ? user[0].id : 0;
                    var deleteQuery = "Update " + tableConfig.HRM_USER_MASTER + " set status = " + status + " where id=" + emp_id;
                    if(status==0||status==2)
                    {
                        deleteQuery = "Update " + tableConfig.HRM_USER_MASTER + " as um ,hrm_employee_details as em set um.status = " + status + ""+condition+" where um.id=" + emp_id+" and em.emp_id="+emp_id+"";
                    }
                    sql.query(deleteQuery, function (err, data) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Failed to Delete employee" });
                        } else {
                            if (data.affectedRows > 0) {
                                deferred.resolve({ status: 1, message: "Employee deleted Successfully" });
                            } else if (data.affectedRows == 0) {
                                deferred.resolve({ status: 1, message: "No employee exists" });
                            } else {
                                deferred.resolve({ status: 0, message: "Fail to delete" });
                            }
                        }
                    });
                } else {
                    deferred.resolve({ status: 0, message: "User does not exist" });
                }
            }
        });

        return deferred.promise;
    },

    employeedetailsByID: (req) => {
        var deferred = q.defer();
        var emp_id = req.body.emp_id;

        var query = "SELECT * FROM " + tableConfig.HRM_USER_MASTER + " WHERE id=" + emp_id + "";
        sql.query(query,  async function (err, user) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
            } else {
                if (user.length != 0) {
                    var selectQuery = "Select em.native,em.wp_skill,em.pr_status,pr_date,um.status,em.last_working_date,em.cpf_number,um.role_id,em.on_bord_history,em.criminal,em.bankrupt,em.discipline,em.disciplinary_history,em.criminal_history,em.bankruptcy_history,em.birthday,em.city,em.basic_salary,em.joined_date,em.home_contact,em.email,em.addrline1,em.addrline2,em.state,em.country,em.emergency_contact,em.passport_no,em.visa_start_date,em.visa_end_date,em.visa_status,em.employment_type,em.training_type,em.blood_group,em.salary,em.joined_date,em.direct_report_to,em.national_service_status,em.firstname,em.middlename,em.lastname,em.ic_no,em.driving_license,em.religion,em.marital_status,em.spouse_name as Spouse_name,em.spouse_dob as Spouse_dob,em.spouse_contact as Spouse_contact,em.spouse_occupation as Spouse_occupation,em.spouse_blood_group as Spouse_blood_group from " + tableConfig.HRM_EMPLOYEE_DETAILS + " as em inner join hrm_user_master as um on um.id=em.emp_id where em.emp_id=" + emp_id + " group by em.id "
                    sql.query(selectQuery,  async function (err, data) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Failed to Reterive" });
                        } else {
                            if (data.length > 0) {
                                var country_id=typeof(data[0].country)=='string' ?data[0].country:0
                                var countryquery="select nicename from hrm_country where id="+country_id+"";
                                var country_data=await commonFunction.getQueryResults(countryquery);
                                var nativequery="select nicename from hrm_country where id="+data[0].native+""
                                var nativedata= await commonFunction.getQueryResults(nativequery)
                                var ChildQuery = "Select ec.child_name as children_name,ec.DOB as DOB,ec.school as children_school,ec.blood_group as children_bloodgroup from " + tableConfig.HRM_EMPLOYEE_CHILDREN + " as ec where ec.emp_id=" + emp_id + " group by ec.id"
                                sql.query(ChildQuery, function (err, childdata) {
                                    if (err) {
                                        console.log(err);
                                        deferred.resolve({ status: 0, message: "Failed to Reterive" });
                                    } else {
                                        var refernceQuery = "Select er.name as reference_name,er.email as reference_email,er.mobile as reference_mobile,er.company as reference_company  from " + tableConfig.HRM_EMPLOYEE_REFERENCE + " as er where er.emp_id=" + emp_id + " group by er.id";
                                        sql.query(refernceQuery, function (err, results) {
                                            if (err) {
                                                console.log(err);
                                                deferred.resolve({ status: 0, message: "Failed to Reterive" });
                                            } else {
                                                var reference = [];
                                                var datas = [];
                                                var children = [];

                                                if (results != undefined) {
                                                    results.forEach((row) => {
                                                        reference.push({
                                                            name: row.reference_name,
                                                            email: row.reference_email,
                                                            mobile: row.reference_mobile,
                                                            company: row.reference_company
                                                        });
                                                    });
                                                }

                                                if (childdata != undefined) {
                                                    childdata.forEach((rows) => {
                                                        var dbchild_dob = moment.utc(rows.DOB).format()
                                                        var child_dob = moment(dbchild_dob).local();
                                                        var getchilddobdate = moment(child_dob != undefined).format("YYYY-MM-DD") ? moment(child_dob).format("YYYY-MM-DD") : '';
                                                        children.push({
                                                            child_name: rows.children_name,
                                                            dob: getchilddobdate,
                                                            school: rows.children_school,
                                                            blood_group: rows.children_bloodgroup
                                                        });
                                                    });
                                                }

                                                var Accno = ''
                                                var Acchldr = ''
                                                var bankName = ''
                                                var ifsc = '';
                                                var AccountDetailsQuery = "Select * from " + tableConfig.HRM_EMPLOYEE_ACCOUNT_DETAILS + " where emp_id=" + emp_id;
                                                sql.query(AccountDetailsQuery, function (err, AccountData) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                    else {
                                                        Accno = (AccountData.length > 0) ? AccountData[0].acc_no : 0;
                                                        Acchldr = (AccountData.length > 0) ? AccountData[0].account_holder_name : '';
                                                        bankName = (AccountData.length > 0) ? AccountData[0].bank_name : '';
                                                        ifsc = (AccountData.length > 0) ? AccountData[0].ifsc_code : 0;
                                                    }
                                                    let visastatus='';
                                                    data.forEach((result, index) => {
                                                        if(result.visa_status==1)
                                                        {
                                                            visastatus="Singapore Citizen"
                                                        }
                                                        else if(result.visa_status==2)
                                                        {
                                                            visastatus="Singapore PR"
                                                        }
                                                        else if(result.visa_status==3) 
                                                        {
                                                            visastatus="S Pass"
                                                        }
                                                        else if(result.visa_status==4)
                                                        {
                                                            visastatus="Work Permit"

                                                        }
                                                        var dbspouse_dob = moment.utc(result.Spouse_dob).format()
                                                        var spouse_dob = moment(dbspouse_dob).local();
                                                        var getspousedobdate =moment(spouse_dob,"YYYY-MM-DD",true).isValid()// moment(spouse_dob != undefined ).format("YYYY-MM-DD") ? moment(spouse_dob).format("YYYY-MM-DD") : '';
                                                        console.log("spousedate",getspousedobdate)
                                                        datas.push({
                                                            accno: (Accno != undefined) ? Accno : 0,
                                                            acchldr: (Acchldr != undefined) ? Acchldr : '',
                                                            bankName: (bankName != undefined) ? bankName : '',
                                                            ifsccode: (ifsc != undefined) ? ifsc : 0,
                                                            emp_id: user[0].emp_id,
                                                            firstname: result.firstname,
                                                            middlename: result.middlename,
                                                            lastname: result.lastname,
                                                            ic_no: result.ic_no,
                                                            driving_license: result.driving_license,
                                                            religion: result.religion,
                                                            passport_no: result.passport_no,
                                                            visa_start_date: result.visa_start_date,
                                                            visa_end_date: result.visa_end_date,
                                                            visa_status: visastatus,
                                                            marital_status: result.marital_status,
                                                            home_contact: result.home_contact,
                                                            email: result.email,
                                                            joined_date: result.joined_date,
                                                            employment_type: result.employment_type,
                                                            training_type: result.training_type,
                                                            blood_group: result.blood_group,
                                                            direct_report_to: result.direct_report_to,
                                                            salary: result.salary,
                                                            national_service_status: result.national_service_status,
                                                            emergency_contact: result.emergency_contact,
                                                            address_line1: result.addrline1,
                                                            address_line2: result.addrline2,
                                                            state: result.state,
                                                            basic_salary: result.basic_salary,
                                                            country: country_data.length > 0?country_data[0].nicename:'',
                                                            city: result.city,
                                                            bankruptcy_file_path: (result.bankruptcy_history != undefined) ? result.bankruptcy_history : '',
                                                            criminal_file_path: (result.criminal_history != undefined) ? result.criminal_history : '',
                                                            disciplinary_file_path: (result.disciplinary_history != undefined) ? result.disciplinary_history : '',
                                                            disciplinary_value: result.discipline,
                                                            bankrupt_value: result.bankrupt,
                                                            criminal_value: result.criminal,
                                                            on_bord_history: result.on_bord_history,
                                                            role_id:result.role_id,
                                                            employee_current_status:(result.status!=undefined)?result.status:'',
                                                            last_working_date:moment(result.last_working_date!=undefined).format("YYYY-MM-DD")?moment(result.last_working_date).format("YYYY-MM-DD"):'',
                                                            cpf_number:(result.cpf_number!=undefined)?result.cpf_number:0,
                                                            dob: moment(result.birthday != 'Invaild date').format("YYY-MM-DD") ? moment(result.birthday).format("YYYY-MM-DD") :'',
                                                           pr_date:moment(result.pr_date!='Invaild date').format("YYYY-MM")?moment(result.pr_date).format("MMMM-YYYY"):'',
                                                           pr_status:result.pr_status,
                                                           wp_skill:result.wp_skill,
                                                           native:(nativedata.length > 0)?nativedata[0].nicename:'',
                                                            naive_code:result.native_code,
                                                            country_code:result.country,
                                                            visa_status_code:result.visa_status,

                                                            Spouse_details:
                                                                [{
                                                                    Spouse_name: result.Spouse_name,
                                                                    Spouse_dob: (getspousedobdate!=true)?'':moment(result.Spouse_dob).format("YYYY-MM-DD"),
                                                                    Spouse_contact: result.Spouse_contact,
                                                                    Spouse_occupation: result.Spouse_occupation,
                                                                    Spouse_blood_group: result.Spouse_blood_group
                                                                }],
                                                            Children_details: children,
                                                            Refernce_details: reference,
                                                        });
                                                        deferred.resolve({ status: 1, message: "Employee Details", details: datas });
                                                    });


                                                });


                                            }


                                        });
                                    }
                                });
                            } else {
                                deferred.resolve({ status: 0, message: "Employee Details Not found", details: [] });
                            }
                        }
                    });
                } else {
                    deferred.resolve({ status: 0, message: "User does not exist" });
                }
            }
        });

        return deferred.promise;
    },

    employeeList: (company_id) => {
        var deferred = q.defer();
        var query = "SELECT FN_EMPLOYEE_STATUS(em.emp_id) as status,em.birthday,em.cpf_number,em.home_contact,em.basic_salary,em.city,um.id as id,um.emp_id as emp_id,em.firstname,em.lastname,em.ic_no as Icnumber,em.middlename,em.driving_license as Driving_license,em.joined_date as Join_date,em.salary as salary,FN_EMPLOYEE_LIST_ACTION(um.id, um.status) as action_status FROM " + tableConfig.HRM_EMPLOYEE_DETAILS + " as em inner join " + tableConfig.HRM_USER_MASTER + " as um  on um.id=em.emp_id  and um.company_id =" + company_id + " group by em.emp_id ";
        sql.query(query, function (err, user) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
            } else {
                if (user.length > 0) {
                    var response = [];
                    user.forEach((data, index) => {
                        var dbjoining_date = moment.utc(data.Join_date).format();
                        var joindate = moment(dbjoining_date).local();
                        var getjoindate = moment(joindate).format("DD MMM YYYY");
                        var dob = moment(data.birthday).format("YYYY-MM-DD");
                        response.push({
                            id: data.id,
                            emp_id: data.emp_id,
                            dob: (dob != "Invalid date") ? dob : '',
                            name: data.firstname + ' ' +data.middlename+' '+ data.lastname,
                            ic_number: data.Icnumber,
                            driving_license: data.Driving_license,
                            joined_date: getjoindate,
                            salary: data.salary,
                            action_status: data.action_status,
                            city: data.city,
                            basic_salary: data.basic_salary,
                            landline_number: data.home_contact,
                            cpf_number: data.cpf_number,
                            status: data.status
                        });
                    });
                    deferred.resolve({ status: 1, message: "Employee Details", details: response });
                } else {
                    deferred.resolve({ status: 1, message: "No data Found", details: [] });
                }
            }
        });
        return deferred.promise;
    },

    Exportleave_details: (company_id) => {
        var deferred = q.defer();

        var query = "Select  lr.*,FN_EMPLOYEE_NAME(lr.emp_id)  as employee_name,lr.emp_id as empid FROM hrm_leave_request as lr inner join " + tableConfig.HRM_USER_MASTER + " as um  on um.id=lr.emp_id WHERE um.status='1' and um.company_id=" + company_id;
        sql.query(query, function (err, user) {

            if (err) {
                console.log(err)
                deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
            } else {
                if (user.length > 0) {

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
                        { header: 'Employee_name', key: 'employee_name', width: 10, outlineLevel: 1 },

                    ];

                    worksheet.addRows(user);
                    var path = process.cwd() + '/' + 'app/upload/leave_details.xlsx';
                    workbook.xlsx.writeFile(path).then(function (err, results) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Failed to save file" });
                        } else {
                            deferred.resolve({ status: 1, message: "File saved successfully", path });
                        }
                    });

                } else {
                    deferred.resolve({ status: 0, message: "No data Found", details: [] });
                }
            }
        });
        return deferred.promise;
    },

    Exportemployee_details: (company_id) => {
        var deferred = q.defer();
        var query = "SELECT FN_COUNTRY_NAME(em.country) as countryname,FN_RELIGION_NAME(em.religion) as religionname,FN_ROLE_NAME(um.role_id) as rolename,FN_EMPLOYEE_TYPE_ROLE(em.employment_type) as employee_type,FN_VISA_STATUS_NAME(em.visa_status)as visastatus,um.emp_id as empid,em.basic_salary,em.id,em.emp_id,CONCAT(IFNULL(em.firstname,''),' ',IFNULL(em.middlename,''),' ',IFNULL(em.lastname,'')) as employeename,em.state,em.country,em.employment_type,em.city,em.driving_license,em.religion,em.home_contact,em.emergency_contact,em.addrline1,em.addrline2,CASE WHEN em.joined_date != '0000-00-00' THEN em.joined_date ELSE 'null' END as joined_date,CASE WHEN em.ic_no != '0000-00-00'  THEN em.ic_no ELSE '' END as ic_no ,CASE WHEN em.salary != 0 THEN em.salary ELSE '' END as salary,IFNULL(em.visa_start_date,'') as visa_start_date,IFNULL(em.visa_end_date,'') as visa_end_date FROM hrm_employee_details as em inner join hrm_user_master as um  on um.id=em.emp_id WHERE um.status='1' and um.company_id='" + company_id + "' group by em.emp_id";
        console.log("employeequery",query)
        sql.query(query, function (err, user) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
            } else {
                if (user.length > 0) {
                    deferred.resolve(user);
                } else {
                    deferred.resolve({ status: 0, message: "No data Found", details: [] });
                }
            }
        });
        return deferred.promise;
    },

    Employee_Quotavalidate: (company_id,visa_status,sector_type) => {
        var deferred = q.defer();
        var query = "SELECT * from hrm_employee_details as em inner join hrm_user_master as um  on um.id=em.emp_id WHERE  um.company_id='"+company_id+"'";
        var totalemployeecount=0;
        sql.query(query, function (err, employeecount) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
            } else {
                employeecount.forEach((data, index) => {
                    if(data.basic_salary>1300)
                    {
                        var empcount=1;
                    }
                    if(data.basic_salary>650 && data.basic_salary<1300)
                    {
                        var empcount=0.5; 
                    }
                    if(data.basic_salary<400)
                    {
                        var empcount=0;
                    }
                    console.log('idandsal',data.basic_salary+'-'+data.id)
                    console.log('ecount',empcount)
                    if(empcount!=undefined){
                        totalemployeecount+=empcount;
                    }
                });
                finalout_localemployees=Math.floor(totalemployeecount);
                console.log('totalemps',totalemployeecount)
                if(sector_type!=1 && visa_status==3)
                {
                    allocated_percent=Math.floor((20/100)*finalout_localemployees);
                }
                if(sector_type==1 && visa_status==3)
                {
                    allocated_percent=Math.floor((15/100)*finalout_localemployees);
                }
                if(sector_type==1 && visa_status==4)
                {
                    allocated_percent=Math.floor((40/100)*finalout_localemployees);
                }
                if(sector_type==2 && visa_status==4)
                {
                    allocated_percent=Math.floor((60/100)*finalout_localemployees);
                }
                if(sector_type==3 && visa_status==4)
                {
                    allocated_percent=Math.floor((87.5/100)*finalout_localemployees);
                }
                if(sector_type==4 && visa_status==4)
                {
                    allocated_percent=Math.floor((87.5/100)*finalout_localemployees);
                }
                if(sector_type==5 && visa_status==4)
                {
                    allocated_percent=Math.floor((77.8/100)*finalout_localemployees);
                }
                
               var visacount_query = "SELECT count(*) as totalvisacount from hrm_employee_details as em inner join hrm_user_master as um  on um.id=em.emp_id WHERE em.visa_status='" + visa_status + "' and um.company_id='"+company_id+"'";
               sql.query(visacount_query, function (err, visacount) {
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                } else {
                    var available_visa=visacount[0].totalvisacount;
                    var employee_tryingtoallocate=available_visa+1;
                    console.log('canallocate',allocated_percent)
                    console.log('tryingtoinsert',employee_tryingtoallocate)
                    if(allocated_percent<employee_tryingtoallocate)
                    {
                        deferred.resolve({ status: 1, message: 'Cant Add Employees in this Status' });
                    }
                    else{
                        deferred.resolve({ status: 1, message: 'Quota Available' });
                    }
                    
                }   
            });
            }
        });
        return deferred.promise;
    }
}
