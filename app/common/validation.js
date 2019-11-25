var q = require('q');
module.exports = {

    validateRegister: (req) => {
        var deferred = q.defer();

        req.checkBody('name', 'Please enter name').notEmpty();
        req.checkBody('address_line1', 'Please enter address_line1').notEmpty();
        req.checkBody('city', 'Please enter city').notEmpty();
        req.checkBody('state', 'Please enter state').notEmpty();
        req.checkBody('country', 'Please enter country').notEmpty();
        req.checkBody('postcode', 'Please enter postcode').notEmpty();
        req.checkBody('email', 'Please enter email').notEmpty();
        req.checkBody('email', 'Please enter email').isEmail();
        req.checkBody('contact', 'Please enter contact').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },
    validatesdllist: (req) => {
        var deferred = q.defer();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('month', 'Please enter month').notEmpty();
        req.checkBody('year', 'Please enter year').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },
    validateemployeeForgotpassword: (req) => {
        var deferred = q.defer();
        req.checkBody('email', 'Please enter email').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },
    validateresetPassword: (req) => {
        var deferred = q.defer();
        req.checkBody('Key', 'Please enter Key').notEmpty();
        req.checkBody('new_password', 'Please enter newpassword').notEmpty();
        req.checkBody('confirm_password', 'Please enter newpassword').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateAddEmployee: (req) => {
        var deferred = q.defer();

        req.checkBody('email', 'Please enter email').notEmpty();
        req.checkBody('email', 'Please enter email').isEmail();
        req.checkBody('firstname', 'Please enter firstname').notEmpty();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('religion', 'Please enter religion').notEmpty();
        req.checkBody('ic_no', 'Please enter ic_no').notEmpty();
        req.checkBody('blood_group', 'Please enter blood_group').notEmpty();
        req.checkBody('emergency_contact', 'Please enter emergency_contact').notEmpty();
        req.checkBody('address_line1', 'Please enter address_line1').notEmpty();
        req.checkBody('city', 'Please enter city').notEmpty();
        req.checkBody('state', 'Please enter state').notEmpty();
        req.checkBody('country', 'Please enter country').notEmpty();
        req.checkBody('employment_type', 'Please enter employment_type').notEmpty();
        req.checkBody('role_id', 'Please enter role_id').notEmpty();
        req.checkBody('direct_report_to', 'Please enter direct_report_to').notEmpty();
        req.checkBody('training_type', 'Please enter training_type').notEmpty();
        req.checkBody('basic_salary', 'Please enter basic_salary').notEmpty();
        req.checkBody('salary', 'Please enter salary').notEmpty();
        req.checkBody('joined_date', 'Please enter joined_date').notEmpty();
        req.checkBody('marital_status', 'Please enter marital_status').notEmpty();
        req.checkBody('national_service_status', 'Please enter national_service_status').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateLogin: (req, isForgotPassword = false) => {
        var deferred = q.defer();
        if (isForgotPassword == false) {
            req.checkBody('password', 'Please enter password').notEmpty();
        }
        req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateForgotpassword: (req) => {
        var deferred = q.defer();

        req.checkBody('email', 'Please enter email').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateEmployeeDetails: (req) => {
        var deferred = q.defer();

        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('firstname', 'Please enter firstname').notEmpty();
        req.checkBody('ic_no', 'Please enter ic_no').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateemplyDelete: (req) => {

        var deferred = q.defer();
        req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
        req.checkBody('status', 'Please enter status').notEmpty();
        if(req.body.status==0||req.body.status==2)
        {
            req.checkBody('last_working_date', 'Please enter last_working_date').notEmpty();
        }
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateClaimRequest: (req) => {

        var deferred = q.defer();
        req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
        req.checkBody('amount', 'Please enter amount').notEmpty();
        req.checkBody('claim_date', 'Please enter claim_date').notEmpty();
        req.checkBody('category', 'Please enter category').notEmpty();
        req.checkBody('sub_category', 'Please enter sub_category').notEmpty();
        req.checkBody('url', 'Please enter url').notEmpty();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },
    validateUpdateClaimrequest: (req) => {

        var deferred = q.defer();
       
        req.checkBody('amount', 'Please enter amount').notEmpty();
        req.checkBody('claim_date', 'Please enter claim_date').notEmpty();
        req.checkBody('category', 'Please enter category').notEmpty();
        req.checkBody('sub_category', 'Please enter sub_category').notEmpty();
        req.checkBody('claim_id', 'Please enter claim_id').notEmpty();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateApproveClaimRequest: (req) => {

        var deferred = q.defer();
        req.checkBody('claim_id', 'Please enter claim_id').notEmpty();
        req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
        req.checkBody('status', 'Please enter status').notEmpty();
        req.checkBody('approval_role_id', 'Please enter approval_role_id').notEmpty();
        req.checkBody('url', 'Please enter url').notEmpty();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateattendencedetailsid: (req) => {
        var deferred = q.defer();

        req.checkBody('checkoutime', 'Please enter checkoutime').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validateApplyLeave: (req) => {

        var deferred = q.defer();
        req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
        req.checkBody('leave_type', 'Please enter leave_type').notEmpty();
        req.checkBody('from_date', 'Please enter from_date').notEmpty();
        req.checkBody('to_date', 'Please enter to_date').notEmpty();
        req.checkBody('reason', 'Please enter reason').notEmpty();

        var leave_type = (req.body.leave_type) ? req.body.leave_type : 1;

        if (leave_type == 9) {
            req.checkBody('from_time', 'Please enter from_time').notEmpty();
            req.checkBody('to_time', 'Please enter to_time').notEmpty();
        }

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateleavepermission: (req) => {
        var deferred = q.defer();
        req.checkBody('leave_id', 'Please enter leave_id').notEmpty();
        req.checkBody('leave_status', 'Please enter leave_status').notEmpty();
        req.checkBody('leave_type_id', 'Please enter leave_type_id').notEmpty();
        //   req.checkBody('emp_id', 'Please enter emp_id').notEmpty();

        var status = (req.body.leave_status) ? req.body.leave_status : 3;
        if (status == 3) {
            req.checkBody('decline_descripation', 'Please enter decline_descripation').notEmpty();
        }
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },
    validateworkStatus: (req) => {
        var deferred = q.defer();
        req.checkBody('work_id', 'Please enter work_id').notEmpty();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('status_id', 'Please enter status_id').notEmpty();
         req.checkBody('confirmation_id', 'Please enter confirmation_id').notEmpty();
         req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
       
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateupdate: (req) => {
        var deferred = q.defer();

        req.checkBody('name', 'Please enter name').notEmpty();
        req.checkBody('address_line1', 'Please enter address_line1').notEmpty();
        req.checkBody('city', 'Please enter city').notEmpty();
        req.checkBody('state', 'Please enter state').notEmpty();
        req.checkBody('country', 'Please enter country').notEmpty();
        req.checkBody('postcode', 'Please enter postcode').notEmpty();
        req.checkBody('email', 'Please enter email').notEmpty();
        req.checkBody('email', 'Please enter email').isEmail();
        req.checkBody('contact', 'Please enter contact').notEmpty();
        req.checkBody('register_number', 'Please enter register_number').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },


    validatesaveshift: (req) => {
        var deferred = q.defer();

        req.checkBody('shift_name', 'Please enter shift_name').notEmpty();
        req.checkBody('descripation', 'Please enter descripation').notEmpty();
        req.checkBody('begin_time', 'Please enter begin_time').notEmpty();
        req.checkBody('end_time', 'Please enter end_time').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validatesaveAttendence: (req) => {
        var deferred = q.defer();
        req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
        req.checkBody('check_in', 'Please enter check_in').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validateGeneratePayroll: (req) => {
        var deferred = q.defer();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('from_date', 'Please enter from_date').notEmpty();
        req.checkBody('to_date', 'Please enter to_date').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validateLevyStatement: (req) => {
        var deferred = q.defer();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('from_date', 'Please enter from_date').notEmpty();
        req.checkBody('to_date', 'Please enter to_date').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validateApprovePayroll: (req) => {
        var deferred = q.defer();
        req.checkBody('employee_id', 'Please enter employee_id ').notEmpty();
        req.checkBody('paymonth', 'Please enter paymonth').notEmpty();
        req.checkBody('payyear', 'Please enter payyear').notEmpty();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('url', 'Please enter url').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validateCreateCpfStatement: (req) => {
        var deferred = q.defer();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('month_year', 'Please enter month_year').notEmpty();
        req.checkBody('employee_id', 'Please enter employee_id').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validateAddAllowanceType: (req) => {
        var deferred = q.defer();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('allowance_name', 'Please enter allowance_name').notEmpty();
        req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
        req.checkBody('amount', 'Please enter amount').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validateUpdateAllowanceType: (req) => {
        var deferred = q.defer();
        req.checkBody('allowance_name', 'Please enter allowance_name').notEmpty();
        req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
        req.checkBody('amount', 'Please enter amount').notEmpty();
        req.checkBody('allowance_id', 'Please enter allowance_id').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validateDeleteAllowanceType: (req) => {
        var deferred = q.defer();
        req.checkBody('allowance_id', 'Please enter allowance_id').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validateAddEmployeeAllowance: (req) => {
        var deferred = q.defer();
        req.checkBody('allowance', 'Please enter allowance').notEmpty();
        req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
        req.checkBody('month_year', 'Please enter month_year').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },


    validateupdateAttendence: (req) => {
        var deferred = q.defer();
        req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
        req.checkBody('check_out', 'Please enter  check_out').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateHolidayListByYear: (req) => {
        var deferred = q.defer();
        req.checkBody('year', 'Please enter year').notEmpty();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateAssignWork: (req) => {
        var deferred = q.defer();

        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('role_id', 'Please enter role_id').notEmpty();
        req.checkBody('login_id', 'Please enter login_id').notEmpty();
        req.checkBody('emp_type', 'Please enter emp_type').notEmpty();
        req.checkBody('work_start_time', 'Please enter work_start_time').notEmpty();
        req.checkBody('work_end_time', 'Please enter work_end_time').notEmpty();
        req.checkBody('review_by', 'Please enter review_by').notEmpty();
        req.checkBody('confirmation_from', 'Please enter confirmation_from').notEmpty();
        req.checkBody('task_description', 'Please enter task_description').notEmpty();
        req.checkBody('employee_list', 'Please enter employee_list').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },
    validateUpdateWork: (req) => {
        var deferred = q.defer();

        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('role_id', 'Please enter role_id').notEmpty();
        req.checkBody('work_id', 'Please enter work_id').notEmpty();
        req.checkBody('emp_type', 'Please enter emp_type').notEmpty();
        req.checkBody('work_start_time', 'Please enter work_start_time').notEmpty();
        req.checkBody('work_end_time', 'Please enter work_end_time').notEmpty();
        req.checkBody('review_by', 'Please enter review_by').notEmpty();
        req.checkBody('confirmation_from', 'Please enter confirmation_from').notEmpty();
        req.checkBody('task_description', 'Please enter task_description').notEmpty();
        req.checkBody('employee_list', 'Please enter employee_list').notEmpty();

        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateupdateLeave: (req) => {
        var deferred = q.defer();

        req.checkBody('leave_id', 'Please enter leave_id').notEmpty();
        req.checkBody('leave_type', 'Please enter leave_type').notEmpty();
        req.checkBody('from_date', 'Please enter from_date').notEmpty();
        req.checkBody('to_date', 'Please enter to_date').notEmpty();
        req.checkBody('reason', 'Please enter reason').notEmpty();

        var leave_type = (req.body.leave_type) ? req.body.leave_type : 1;
        if (leave_type == 9) {
            req.checkBody('from_time', 'Please enter from_time').notEmpty();
            req.checkBody('to_time', 'Please enter to_time').notEmpty();
        }
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validateattendencedetaildate: (req) => {
        var deferred = q.defer();
        req.checkBody('date', 'Please select date').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    },

    validatesaveHoilday: (req) => {

        var deferred = q.defer();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('from_date', 'Please enter from_date').notEmpty();
        req.checkBody('to_date', 'Please enter to_date').notEmpty();
        req.checkBody('title', 'Please enter title').notEmpty();
        
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validateRemainingLeaveDetails: (req) => {

        var deferred = q.defer();
        req.checkBody('emp_id', 'Please enter emp_id').notEmpty();
        req.checkBody('month_year', 'Please enter month_year').notEmpty();
       
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }

        return deferred.promise;
    },

    validateshglist: (req) => {
        var deferred = q.defer();
        req.checkBody('company_id', 'Please enter company_id').notEmpty();
        req.checkBody('month', 'Please enter month').notEmpty();
        req.checkBody('year', 'Please enter year').notEmpty();
        if (!req.validationErrors()) {
            deferred.resolve([]);
        } else {
            deferred.resolve(req.validationErrors());
        }
        return deferred.promise;
    }
}
