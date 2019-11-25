
module.exports = (app) => {

    const authController = require('../controllers/AuthController.js');
    const employeeController = require('../controllers/employeeController.js');
    const leaveController = require('../controllers/leaveController.js');
    const attendenceController=require('../controllers/attendenceController')
    const holidayController=require('../controllers/holidayController');
    const payrollController = require('../controllers/payrollController');
    const usermasterController = require('../controllers/UserMasterController');
    const claimsController = require('../controllers/claimsController');
   
    app.post('/register', authController.register);
    app.post('/login', authController.login);
    app.post('/forgot_password', authController.forgotPassword);
    app.post('/logout', authController.logout);
    app.post('/update_company_profile',  authController.Updatecompany_profile);
    app.post('/company_list',  authController.companyListbyId);
    app.post('/shg_file_upload',  authController.Uploaddocument);

    app.post('/excel_import_employees', employeeController.excelImportEmployees);
    app.post('/add_employee', employeeController.addEmployee);
    app.post('/employee_delete', employeeController.empolyeeDelete);
    app.post('/employee_listbyid', employeeController.empolyeeDetailsById);
    app.post('/employee_list', employeeController.employeeList);
    app.post('/update_employee', employeeController.empolyeeUpdate);
    app.post('/export_employee_details',  employeeController.exportemployee_details);
    app.post('/employee_quotavalidate',  employeeController.employee_quotavalidate);
    

    app.post('/apply_leave', leaveController.applyLeave);
    app.post('/leave_details', leaveController.leaveHistory);
    app.post('/leave_details_by_id', leaveController.leaveHistorybyId);
    app.post('/leave_permission', leaveController.leavePermission);
    app.post('/assign_work', leaveController.assignWork);
    app.post('/update_leave', leaveController.Updateleave);
    app.post('/work_list',  leaveController.workList);
    app.post('/drop_down_list',  leaveController.Dropdownlist);
    app.post('/export_leave_details',  leaveController.exportleave_details);
    app.post('/dashboard_list',  leaveController.Dashboardlist);
    app.post('/recent_Updates_leave',  leaveController.Curentupdatedleave);
    app.post('/remaining_leave_details',  leaveController.remainingLeaveDetails);
    app.post('/notification_list', leaveController.notificationList);
    app.post('/update_notification', leaveController.updateNotification);
    app.post('/dashboard_expense', leaveController.dashboardExpense);

    app.post('/attendence_details_by_id', attendenceController.attendenceDetailsbyId);
    app.post('/create_shift', attendenceController.saveShift);
    app.post('/attendence_details_by_date', attendenceController.attendenceDetailsbyDate);
    app.post('/update_attendence', attendenceController.updateAttendence);
    app.post('/attendence_details_by_date', attendenceController.attendenceDetailsbyDate);
    app.post('/attendence_list', attendenceController.attendenceDetails);
    app.post('/add_attendence', attendenceController.addAttendence); //Attendence based on shift
    app.post('/getattendancelistbyfilter', attendenceController.getattendancelistbyfilter);
    app.post('/getattendanceabsentlistbyfilter', attendenceController.getattendanceabsentlistbyfilter);
    app.post('/import_work_list',  attendenceController.excelImportWorklist);
    app.post('/importattendence',  attendenceController.excelImportattendence);
  
    app.post('/apply_hoilday', holidayController.applyHoilday);
    app.post('/holiday_list_by_year',  holidayController.hoildayListByYear);

    app.post('/getmenus', usermasterController.getprivilagedmenus);
    
    
    app.post('/generate_payrolltest',  payrollController.generatePayrolltest);
    app.post('/generate_payroll',  payrollController.generatePayroll);
    app.post('/generate_payroll_preview',  payrollController.generatePayrollPreview);
    app.post('/add_allowance_type',  payrollController.addAllowanceType);
    app.post('/get_allowance_types',  payrollController.getAllowanceTypes);
    app.post('/delete_allowance_type',  payrollController.deleteAllowanceType);
    app.post('/update_allowance_type',  payrollController.updateAllowanceType);
    app.post('/add_employee_allowance',  payrollController.addEmployeeAllowance);
    app.post('/get_allowance_by_id',  payrollController.getAllowanceById);
    app.post('/export_employee_payslip_pdf',  payrollController.exportEmployeePayslipPdf);
    app.post('/excel_export_payroll',  payrollController.excelExportPayroll);
    app.post('/cpf_statement',  payrollController.cpfStatement);
    app.post('/payroll_list',  payrollController.payrollList);
    app.post('/approve_payroll',  payrollController.approvePayroll);
    app.post('/get_payroll_details_by_id',  payrollController.getPayrollDetailsById);
    app.post('/updatesalarydetails', payrollController.updateSalaryDetails);
    app.post('/finalapprovalofpayroll', payrollController.finalapprovalofpayroll);
    app.post('/generatelevystatement', payrollController.generateLevyStatement);

    app.post('/claim_request',claimsController.claimRequest);
    app.post('/approve_claim_request',claimsController.approveClaimRequest);
    app.post('/work_list_by_id',leaveController.worklistByid);
    app.post('/work_status',leaveController.workStatus);
    app.post('/work_update',leaveController.Workupdate);
    app.post('/Update_claim_request',claimsController.UpdateclaimRequest);
    app.post('/claim_list_by_id',claimsController.claimListbyId);
    app.post('/delete_claim_request',claimsController.deleteClaim);
    ///app.post('/getattendancelistbyfilter', attendenceController.getattendancelistbyfilter);
    app.post('/claimcategory', claimsController.getclaimcategory); 
    app.post('/claimslist', claimsController.getclaimslist); 
    app.post('/selfhelpgroup_list',  payrollController.generatePayrollsghlist);
    app.post('/forgot_password_employee', authController.employeeForgotpassword);
    app.post('/reset_password', authController.resetPassword);
    app.post('/export_shg_list',  authController.exportShglist);
    app.post('/sdl_list',  payrollController.generatePayrollsdllist);
    // app.post('/forgot_password_employee', authController.employeeForgotpassword);
    // app.post('/reset_password', authController.resetPassword);
    app.post('/generateftpfile', payrollController.generateftpfile)
    // for app
    app.post('/attendence_summary', attendenceController.Lastattendencehistory)
    app.post('/biometerattendence_list', attendenceController.biometerattendencelist)
    app.post('/add_leave_type', leaveController.addLeavetype);
    app.post('/attendence_report', attendenceController.Attendencereport);
};