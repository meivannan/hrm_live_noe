var sql = require('../../config/database.config');
var tableConfig = require('../config/table_config');
var q = require('q');
var sql = require('../../config/database.config');
var moment = require('moment');
var serialize = require('locutus/php/var/serialize');
var phpunserialize = require('phpunserialize');
var commonFunction = require('./commonfunction');
var pdf = require('html-pdf');
var ip = require("ip");
var commonConfig = require('../config/common_config.json');
var toWords = require('to-words');
var XLSX = require('xlsx');
var async = require('async');
module.exports = {

    employeeSalaryDetails: (month_year) => {
        var deferred = q.defer();
        let query = `SELECT esd.*, ed.cpf_number, ed.firstname, ed.pr_date, ed.joined_date, um.status FROM hrm_employee_salary_details esd JOIN hrm_employee_details ed ON esd.emp_id = ed.emp_id JOIN hrm_user_master as um on um.id=esd.emp_id WHERE esd.month_year = ?`
        sql.query(query, [month_year], function (err, results) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to reterive" });
            } else {
                 if(results.length > 0){
                    deferred.resolve({ status: 1, employeeLists: results });
                 }else{
                    deferred.resolve({ status: 0, message: "Payroll does not Exist "});
                 }
            }
        });
        return deferred.promise;
    },
    generatePayrolltest: async (company_id, fromDate = '', toDate = '', isPreview = false) => {
        var deferred = q.defer();
       // var cpf_query = "SELECT * from " + tableConfig.HRM_EMPLOYEE_CPF;
      var cpf_query = "SELECT * from hrm_cpf_regular_rates";
      var cpf_data = await commonFunction.getQueryResults(cpf_query);
        var totalSalaryAmount = 0;
        var regular_rates=[];
     
        var totalNumberOfDaysPerMonth = moment(toDate, "YYYY-MM").daysInMonth();
        console.log("totalNumberOfDaysPerMonth",totalNumberOfDaysPerMonth)
        var month_year = moment(toDate).format('YYYY-MM');

        var month = moment(toDate).format('MM');
        var year = moment(toDate).format('YYYY');
        var monthtomonth = month;
        var yeartoyear = year;
        var alreadygenerated = 0;
        var ifPayrollGenerated = "SELECT count(*) as count FROM " + tableConfig.HRM_PAYROLL_FOR_MONTH + " WHERE company_id = '"+ company_id +"' AND month = '"+ monthtomonth +"' and  year = '"+ yeartoyear +"' and ( status = 1 or status = 2) ";
        var ifGenerated = await commonFunction.getQueryResults(ifPayrollGenerated);
        console.log('generate----------->', ifGenerated[0].count)
        if(ifGenerated[0].count > 0){
            alreadygenerated = 1;
        }
        var checkPayrollGenerated = "SELECT count(*) as count FROM " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " WHERE company_id = '"+ company_id +"' AND month_year = '"+ month_year +"'";
        var isPayrollGenerated = await commonFunction.getQueryResults(checkPayrollGenerated);
        var payrollGenerated = false;

        if(isPayrollGenerated.length > 0) {
            payrollGenerated = (isPayrollGenerated[0].count > 0)? true : false; 
        }

        if (isPreview == false && payrollGenerated == false) {
           var addpayrollForMonthQuery = "INSERT INTO "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " (company_id,month,year,payroll_file_path) VALUES ('"+ company_id +"','"+ month +"','"+ year +"','')";
           var addPayrollResult = await commonFunction.executeQueryAndRetunResults(addpayrollForMonthQuery);
           var payroll_id = 0;

           if(addPayrollResult.insertId != undefined && addPayrollResult.insertId != null) {
            payroll_id = addPayrollResult.insertId;
           }
        }

        var incometax_query = "SELECT * from " + tableConfig.HRM_INCOMETAX;
        var incometax_data = await commonFunction.getQueryResults(incometax_query);

        var leaveTypeQuery = "SELECT * FROM " + tableConfig.HRM_LEAVE_TYPE + " WHERE status = '1'";
        var leaveType = await commonFunction.getQueryResults(leaveTypeQuery);
        var cpg_age_object = {};
      
        var numberOfWorkingDays = await commonFunction.getBusinessDatesCount(fromDate, toDate);
        console.log("numberofworking",numberOfWorkingDays)
        var holidayQuery = "SELECT from_date,to_date FROM " + tableConfig.HRM_HOLIDAYS + " WHERE company_id = '" + company_id + "' AND ((from_date BETWEEN '" + fromDate + "' AND '" + toDate + "') OR (to_date BETWEEN '" + fromDate + "' AND '" + toDate + "'))";
        var holidayList = await commonFunction.getQueryResults(holidayQuery);

        var approvedLeaveQuery = "SELECT um.id as employ_id,lr.from_date,lr.to_date FROM " + tableConfig.HRM_USER_MASTER + " as um INNER JOIN " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " as lr ON lr.emp_id = um.id  AND ((lr.from_date BETWEEN '" + fromDate + "' AND '" + toDate + "') or (lr.from_date < '" + fromDate + "' AND lr.to_date > '" + toDate + "')) AND lr.status = '2' WHERE um.company_id = '" + company_id + "'";
        var approvedLeaveList = await commonFunction.getQueryResults(approvedLeaveQuery);

        var approved_leave_object = {};
        if (approvedLeaveList.length > 0) {
            approvedLeaveList.forEach((leave, i) => {
                let fdate = moment(leave.from_date).format('YYYY-MM-DD');
                let edate = moment(leave.to_date).format('YYYY-MM-DD');
                let to_date = moment(toDate).format('YYYY-MM-DD');
                var from_date = moment(fromDate).format('YYYY-MM-DD');
                approvedLeaveList[i].approved_leaves = 0;

                if (edate < to_date) {
                    approvedLeaveList[i].approved_leaves = approvedLeaveList[i].approved_leaves + moment(edate).diff(fdate, 'days') + 1;
                } else {
                    approvedLeaveList[i].approved_leaves = approvedLeaveList[i].approved_leaves + moment(to_date).diff(fdate, 'days') + 1;
                }

                if (approved_leave_object[leave.employ_id] == undefined) {
                    approved_leave_object[leave.employ_id] = 0;
                }
                approved_leave_object[leave.employ_id] = approved_leave_object[leave.employ_id] + approvedLeaveList[i].approved_leaves;
            });
        }

        var numberOfHolidays = 0;

        if (holidayList.length > 0) {
            holidayList.forEach(holiday => {
                var fdate = moment(holiday.from_date).format('YYYY-MM-DD');
                var edate = moment(holiday.to_date).format('YYYY-MM-DD');
                var to_date = moment(toDate).format('YYYY-MM-DD');
                var from_date = moment(fromDate).format('YYYY-MM-DD');

                if (edate < to_date && from_date < fdate) {
                    var count = 0;
                    let holidayStartDate = new Date(fdate);
                    let holidayEndDate = new Date(edate);

                    var curDate = holidayStartDate;
                    while (curDate <= holidayEndDate) {
                        var dayOfWeek = curDate.getDay();
                        if (((dayOfWeek == 6) || (dayOfWeek == 0)))
                            count++;
                        curDate.setDate(curDate.getDate() + 1);
                    }
                    numberOfHolidays = numberOfHolidays + moment(edate).diff(fdate, 'days') + 1;
                    numberOfHolidays = numberOfHolidays - count;
                } else if (fdate < from_date) {

                    var count = 0;
                    let holidayStartDate = new Date(from_date);
                    let holidayEndDate = new Date(edate);

                    var curDate = holidayStartDate;
                    while (curDate <= holidayEndDate) {
                        var dayOfWeek = curDate.getDay();
                        if (((dayOfWeek == 6) || (dayOfWeek == 0)))
                            count++;
                        curDate.setDate(curDate.getDate() + 1);
                    }
                    numberOfHolidays = numberOfHolidays + moment(edate).diff(from_date, 'days') + 1;
                    numberOfHolidays = numberOfHolidays - count;
                } else {
                    var count = 0;
                    let holidayStartDate = new Date(fdate);
                    let holidayEndDate = new Date(to_date);

                    var curDate = holidayStartDate;
                    while (curDate <= holidayEndDate) {
                        var dayOfWeek = curDate.getDay();
                        if (((dayOfWeek == 6) || (dayOfWeek == 0)))
                            count++;
                        curDate.setDate(curDate.getDate() + 1);
                    }

                    numberOfHolidays = numberOfHolidays + moment(to_date).diff(fdate, 'days') + 1;
                    numberOfHolidays = numberOfHolidays - count;
                }
            });
        }

        numberOfWorkingDays = numberOfWorkingDays - numberOfHolidays;
       
        var query = "SELECT emp.shg_contribution,emp.native,emp.religion, FN_SHG_AMOUNT_NEW(native, religion) as shg_type, visa_status as emp_status,pr_date,pr_status,COUNT(att.emp_id) as present_days,IFNULL(SUM(overtime),0) as overtime,um.id,um.emp_id as employee_id,emp.birthday,CONCAT(IFNULL(emp.firstname,''),' ',IFNULL(emp.middlename,''),' ',IFNULL(emp.lastname,'')) as employeename,emp.basic_salary,emp.salary,emp.email,ea.allowance as allowances,FN_PAYROLL_ACTION(um.id) as action_status from " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp ON emp.emp_id = um.id AND um.status = '1' LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = emp.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " as att ON att.emp_id = emp.emp_id and DATE(att.check_in) >=  DATE('" + fromDate + "')  AND DATE(att.check_in) <= DATE('" + toDate + "') where um.company_id = '" + company_id + "' GROUP BY emp.emp_id";
console.log("mainquery",query)
        sql.query(query, async function (err, result) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to get employee details" });
            }
            else {

                if (result.length > 0) {
                    var amount_to_calculate_cpf = 0;
                  //  var cpfInsertQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " (company_id,emp_id,ordinary_account,special_account,medisave_account,employer_contribution,employee_contribution,month_year,income_tax,net_salary,gross_salary,lop,overtime_allowance,lop_days,payroll_id,basic_salary,salary,bonus,hra,transport_allowance,food_allowance,phone_allowance) VALUES ";

                    result.forEach(async (data, index) => {
                        var employer_contribution_percent = 0;
                        var employee_contribution_percent = 0;
                        var income_tax_amount = 0;
                        var totalAllowanceAmount = 0;
                        result[index].total_allowance = 0;

                        data.bonus = 0;
                        result[index].hra = 0;
                        result[index].transport_allowance = 0;
                        result[index].food_allowance = 0;
                        result[index].phone_allowance = 0;

                        try {
                            if (data.allowances && data.allowances.length > 0) {
                                data.allowances = phpunserialize(data.allowances);
                                Object.keys(data.allowances).forEach(function (key) {
                                    var val = data.allowances[key];
                                    if (key == 'bonus') {
                                        data.bonus = parseInt(val);
                                    } else {
                                        totalAllowanceAmount = parseInt(totalAllowanceAmount) + parseInt(val);
                                        if(key == '1') {
                                            result[index].hra = parseInt(val);
                                        } else if (key == '2') {
                                            result[index].transport_allowance = parseInt(val);
                                        } else if(key == '3') {
                                            result[index].food_allowance = parseInt(val);
                                        } else if(key == '4'){
                                            result[index].phone_allowance = parseInt(val);
                                        }
                                    } 
                                    result[index].total_allowance = parseInt(totalAllowanceAmount) + parseInt(result[index].bonus)
                                });
                                
                                delete data.allowances;
                            }
                        } catch (ex) {
                            console.log('Parsing allowance object error...', ex);
                        }

                        var dob = (data.birthday) ? data.birthday : '';
                        var emp_primary_ID = (data.id) ? data.id : 0;
                        var present_days = data.present_days;
                        var approved_leaves = approved_leave_object[emp_primary_ID] ? approved_leave_object[emp_primary_ID] : 0;
                        present_days = present_days + approved_leaves;

                        var lopDaysForEmployee = numberOfWorkingDays - present_days;
                        if (lopDaysForEmployee < 0) {
                            lopDaysForEmployee = 0;
                        }
                        result[index].present_days=present_days
                        result[index].presentdays=(data.present_days + approved_leaves);
                        var age = 0;
                        var ordinary_amount = 0;
                        var special_amount = 0;
                        var medisave_amount = 0;
                        var employer_contribution_amount = 0;
                        var employee_contribution_amount = 0;
                        var overTimeAllowance = 0;
                        var employeeOverTime=0;
                        employeeOverTime = (data.overtime!=0) ? Math.round(data.overtime / 60) : 0;
                      

                        overTimeAllowance =Math.round((result[index].basic_salary / (totalNumberOfDaysPerMonth * 8)) * employeeOverTime);
                        console.log("overtimecal",overTimeAllowance)
                        // var ordinary_acccount_percent = 0;
                        // var special_account_percent = 0;
                        // var medisave_account_percent = 0;
                        var ordinary_wage=data.basic_salary+overTimeAllowance;
                        var basic_salary=0
                       if(ordinary_wage >= 6000)
                       {
                           console.log("hjvdfsjhsdf")
                           basic_salary=6000;
                       }
                       if(ordinary_wage< 6000){
                           console.log("sdasdas")
                           basic_salary=ordinary_wage;
                       }
                       console.log("basic_salary",basic_salary)
                    
                        amount_to_calculate_cpf = basic_salary + data.bonus;
                      
                        if (dob != '') {
                            age = moment().diff(dob, 'years', false);
                        }

                        age = parseInt(age);
                        var minAge = 0;

var total_wages=data.basic_salary+data.bonus+data.overtime;
var OW=data.basic_salary+data.overtime;
var AW=data.bonus;

var year=(data.pr_date!='NaN')?data.pr_date:'';
console.log("pr_datew",moment().format("YYYY"))
                    var pr_years= (data.pr_date!=null)?moment().diff(year, 'years'):0;
                  console.log("pr_yeays",pr_years)
                 
               
                var salary=0;
                var pr_emp_year=0;
                var pr_emp_status=0;
                var emptype=0;
                var maxage=0;
                var ageidentefied=false;
                var salaryidentified=false;
                async.each(cpf_data,function(cpfdata,callback)
                {
                    salary=cpfdata.max_salary;
                        pr_emp_year=parseInt(cpfdata.pr_year);
                       pr_emp_visa_status=parseInt(cpfdata.emp_visa_status)
                        pr_emp_status=parseInt(cpfdata.pr_status);
                        emptype=parseInt(cpfdata.emp_type);
                        maxage=parseInt(cpfdata.max_age);
                        if(pr_emp_visa_status==data.emp_status && data.emp_status!=0&&pr_emp_visa_status!=1&&data.emp_status!=1)
                            {
                                

                                if(pr_emp_year==pr_years||pr_years==0)
                                {
                                   
                                    if(data.pr_status==pr_emp_status&&data.pr_status!=0)
                                    {
                                        if(age<maxage&&ageidentefied==false)
                                      {
                                        if(amount_to_calculate_cpf <=salary && salaryidentified==false && amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
                                        {
                                        
                                             
                                           console.log("asbbjhdsg",)
                                          salaryidentified=true;
                                              ageidentefied=true;
                                            
                                                  employee_contribution_percent=cpfdata.employee_contribution,
                                                  employer_contribution_percent=cpfdata.employer_contribution  
                                                
                                        }
                                        else if(amount_to_calculate_cpf <=salary && salaryidentified==false )
                                        {
                                            employee_contribution_percent=cpfdata.employee_contribution,
                                                  employer_contribution_percent=cpfdata.employer_contribution  
                                                 
                                                  salaryidentified=true;
                                                  //ageidentefied=true;
                                        }
                                      }
                                    }
                                }  
                                    
                                 
                                  
                                      
                                        
                                          
                            }
                            else if(pr_years>=3||data.emp_status==1)
                            {
                              
                                    if(age<maxage&&ageidentefied==false)
                                {
                                   
                                    
                                  if(amount_to_calculate_cpf <=salary && salaryidentified==false && amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
                                  {
                                    console.log("meivanann")
                                    //   if(amount_to_calculate_cpf!=element.annual_max_amount)
                                    //   {
                                       console.log("nandhini record  is not coming",pr_years)
                                     
                                   
                                       
                                          console.log("3yrdlessthan750",cpfdata)
                                            employee_contribution_percent=cpfdata.employee_contribution,
                                            employer_contribution_percent=cpfdata.employer_contribution  
                                            salaryidentified=true;
                                            ageidentefied=true;
                                          
                                  }
                                  else if(amount_to_calculate_cpf <=salary && salaryidentified==false )
                                  {
                                    console.log("nandhini")
                                      employee_contribution_percent=cpfdata.employee_contribution,
                                            employer_contribution_percent=cpfdata.employer_contribution  
                                            console.log("3yrd",cpfdata)
                                            salaryidentified=true;
                                            ageidentefied=true;
                                  }
                                }
                             
                                
                            }
                               
                                
                                                    
                                           
                    callback();
               
                }, function(err)
                {

                }
            )
                    
                    employer_contribution_amount = amount_to_calculate_cpf * (employer_contribution_percent / 100);
                    if(amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
                    {
                        console.log("jhasajsd")
                        employee_contribution_amount=employee_contribution_percent*(amount_to_calculate_cpf-500)
                    }
                    else if(!(amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750))
                    {
                        console.log("meivannana")
                        employee_contribution_amount = amount_to_calculate_cpf * (employee_contribution_percent / 100);
                    }
                   console.log("jaskkjsadc",employee_contribution_amount)

                      ;
                     

                        
                        var lopAmount = 0;

                      

                        var sdlsalary=false                
                        var renumeration=result[index].basic_salary + totalAllowanceAmount + result[index].bonus;
                        var sdlQuery="select * from hrm_employee_sdl";
                        var sdldata=await commonFunction.getQueryResults(sdlQuery);
                         var sdlpercent=0;
                        async.each(sdldata,function(sdldata,callback)
                        { 
                            if(sdldata.type==1)
                            {
                                if( (sdldata.max_salary == null  || sdldata.max_salary == '') && (renumeration > sdldata.min_salary&&sdlsalary==false) ){
                                    console.log("sdldata",sdldata)
                                    sdlpayable=sdldata.amount
                                    sdlsalary=true
                                   }else if(renumeration > sdldata.min_salary && renumeration <= sdldata.max_salary&&sdlsalary==false){
                                       console.log("2condition",sdldata)
                                    sdlpayable=sdldata.amount 
                                    sdlsalary=true  
                                   }
                                
                            }
                            else if(sdldata.type==2)
                            
                            {
                                if(renumeration > sdldata.min_salary && renumeration <= sdldata.max_salary&&sdlsalary==false)
                                {
                                    sdlpercent=sdldata.amount
                                    sdlpayable=(renumeration*sdlpercent)/100;
                                }
                              
                            }
                          
                           
                            
                            callback(); 
                        },function(err)
                        {
                            console.log(err);
                        }
                        )
                        //console.log("sdlpayable",sdlpayable)
                        
                  
                                        
                  
                        result[index].sdlpayableamount=sdlpayable.toFixed(2);
                        result[index].employee_contribution_amount =   Math.round(employee_contribution_amount);
                        result[index].employer_contribution_amount =  Math.round(employer_contribution_amount) ;
                        result[index].gross_salary = result[index].basic_salary + totalAllowanceAmount + result[index].bonus;
                        result[index].overamount=overTimeAllowance;
                    
                        if (incometax_data.length > 0) {
                            let calculated = false;
                            incometax_data.forEach((taxdata) => {
                                if (taxdata.type == 1 && calculated == false) {
                                    if ((result[index].basic_salary * 12) <= taxdata.income_upto) {
                                        income_tax_amount = Math.ceil(taxdata.tax_amount / 12);
                                        calculated = true;
                                    }
                                } else if (calculated == false) {
                                    income_tax_amount = result[index].basic_salary * (taxdata.tax_amount / 100);
                                    income_tax_amount = Math.ceil(income_tax_amount);
                                    calculated = true;
                                }
                            });
                        }
                        lopAmount = lopDaysForEmployee * (result[index].basic_salary / totalNumberOfDaysPerMonth);
                        console.log("lopdats",numberOfWorkingDays)
                        lopAmount = Math.round(lopAmount);
                        result[index].claims = 0;
                        result[index].lopDaysForEmployee = lopDaysForEmployee;
                        result[index].lop = lopAmount; 
                        result[index].income_tax_amount = income_tax_amount;
                        // result[index].net_salary = (result[index].gross_salary - result[index].employee_contribution_amount - lopAmount) + data.bonus + overTimeAllowance - income_tax_amount;
                       
                        var netSalaryFinal = ( parseInt(result[index].gross_salary) + parseInt(overTimeAllowance)) - ( parseInt(employer_contribution_amount) + parseInt(result[index].employee_contribution_amount)); //parseInt(lopAmount)
                        
                        var shgtype= data.shg_type;   
                      var   sgh_amountdeducation=0;
                        var shg_type_name=''
                        if(shgtype==1)
                        {
                            shg_type_name="CDAC"
                        }
                        else if(shgtype==2)
                        {
                            shg_type_name="ECF"
                        }
                        else if(shgtype==3)
                        {
                            shg_type_name="SINDA"
                        }
                        else if(shgtype==4)
                        {
                            shg_type_name="MBMF"
                        }
                       
                        var sgh_query="select * from hrm_employee_shg where type="+shgtype+" ";
                                        
                        var sghdata=await commonFunction.getQueryResults(sgh_query) 
                       
                         async.each(sghdata,function(sgh_data,callback)
                         { 
                           

                            if( (sgh_data.max_salary == null  || sgh_data.max_salary == '') && (result[index].gross_salary > sgh_data.min_salary) ){
                                sgh_amountdeducation=sgh_data.amount
                            }else if(result[index].gross_salary > sgh_data.min_salary && result[index].gross_salary <= sgh_data.max_salary){
                                console.log("sgh_amountdeducation",sgh_data)
                                sgh_amountdeducation=sgh_data.amount   
                            }

                             
                             callback(); 
                         },function(err)
                         {
                             console.log(err);
                         }
                         )
                       
                        result[index].shg_type=shg_type_name    
                        if(data.shg_contribution!=0)
                        {
                            result[index].shg_deucation=sgh_amountdeducation;
                        }   
                        else
                        {
                            result[index].shg_deucation=0;
                        }     
                          
                       var sgh_final=(result[index].shg_deucation)==undefined?0:result[index].shg_deucation;
                       console.log("finalsalary",sgh_final)
                       var finalnet=netSalaryFinal-sgh_final+ parseInt(result[index].sdlpayableamount);  
                       console.log("finalnet",finalnet)
                         
                       result[index].self_group_amount =sgh_final // sgh_amountdeducation==undefined?0:sgh_amountdeducation; 
                       if(present_days==0)
                       {
                        result[index].net_salary =  0;
                       }
                       else
                       {
                        result[index].net_salary = (finalnet < 0) ? 0: (Math.round(finalnet-lopAmount)< 0)?0:Math.round(finalnet-lopAmount) 
                       }
                      if(result[index].net_salary!=0)
                      {
                        totalSalaryAmount = totalSalaryAmount + parseInt(result[index].gross_salary)+parseInt(result[index].sdlpayableamount)+parseInt(overTimeAllowance)+parseInt(result[index].employer_contribution_amount);
                      }
                        
                        console.log("totalSalaryAmount",totalSalaryAmount)
                        // console.log('Month and Year -------------->', monthtomonth + "-" + yeartoyear)
                        var monthyear = yeartoyear + "-" + monthtomonth;
                        var cpf_InsertQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " (company_id,emp_id,ordinary_account,special_account,medisave_account,employer_contribution,employee_contribution,month_year,income_tax,net_salary,gross_salary,lop,overtime_allowance,lop_days,payroll_id,basic_salary,salary,bonus,hra,transport_allowance,food_allowance,phone_allowance,shg_deduction,sdl_payable,shg_type,present_days)VALUES ('" + company_id + "','" + data.id + "','" + ordinary_amount + "','" + special_amount + "','" + medisave_amount + "','" + employer_contribution_amount + "','" + employee_contribution_amount + "','" + monthyear + "','" + income_tax_amount + "','" + result[index].net_salary + "','" + result[index].gross_salary + "','" + lopAmount + "','" + overTimeAllowance + "','" + lopDaysForEmployee + "','"+ payroll_id +"','"+ result[index].basic_salary +"','"+ result[index].salary +"','"+ result[index].bonus+"','"+ result[index].hra +"','"+ result[index].transport_allowance  +"','"+ result[index].food_allowance +"','"+ result[index].phone_allowance +"','"+result[index].shg_deucation+"','"+result[index].sdlpayableamount+"','"+shgtype+"','"+ result[index].presentdays+"')"
                        var getcurrentyear=moment.utc().format("YYYY")
                        if (isPreview == false && payrollGenerated == false) {
                            var cpfInsertResult = await commonFunction.executeQuery(cpf_InsertQuery);
                             
                            var updateTotalSalaryExpense = "UPDATE "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " SET total_salary_amount = '"+ totalSalaryAmount +"' WHERE company_id = '"+ company_id +"' AND month = '"+ month +"' AND year = '"+ getcurrentyear +"' AND status = '0'";
                            var updatePayrollResult = await commonFunction.executeQueryAndRetunResults(updateTotalSalaryExpense);
                        }
                        // cpfInsertQuery = cpfInsertQuery + " ('" + company_id + "','" + data.id + "','" + ordinary_amount + "','" + special_amount + "','" + medisave_amount + "','" + employer_contribution_amount + "','" + employee_contribution_amount + "','" + monthyear + "','" + income_tax_amount + "','" + result[index].net_salary + "','" + result[index].gross_salary + "','" + lopAmount + "','" + overTimeAllowance + "','" + lopDaysForEmployee + "','"+ payroll_id +"','"+ result[index].basic_salary +"','"+ result[index].salary +"','"+ result[index].bonus+"','"+ result[index].hra +"','"+ result[index].transport_allowance  +"','"+ result[index].food_allowance +"','"+ result[index].phone_allowance +"')";
                        // if (isPreview == false && payrollGenerated == false) {
                        //     var cpfInsertResult = await commonFunction.executeQuery(cpfInsertQuery);
                        //     console.log("totalsalary",totalSalaryAmount)
                            
                        //     var updateTotalSalaryExpense = "UPDATE "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " SET total_salary_amount = '"+ totalSalaryAmount +"' WHERE company_id = '"+ company_id +"' AND month = '"+ month +"' AND year = '"+ year +"' AND status = '1'";
                        //     var updatePayrollResult = await commonFunction.executeQueryAndRetunResults(updateTotalSalaryExpense);
                        // }
                    })
                   
                   // cpfInsertQuery = cpfInsertQuery.substring(0, cpfInsertQuery.length - 1);
                    // console.log("salarydetails",cpfInsertQuery)
                  
                    // console.log("inertresult",cpfInsertResult)
                    // if (isPreview == false && payrollGenerated == false) {
                    //     var cpfInsertResult = await commonFunction.executeQuery(cpfInsertQuery);
                    //     console.log("totalsalary",totalSalaryAmount)
                        
                    //     var updateTotalSalaryExpense = "UPDATE "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " SET total_salary_amount = '"+ totalSalaryAmount +"' WHERE company_id = '"+ company_id +"' AND month = '"+ month +"' AND year = '"+ year +"' AND status = '1'";
                    //     var updatePayrollResult = await commonFunction.executeQueryAndRetunResults(updateTotalSalaryExpense);
                    // }
              

                
                  
                 

                    


                    //Generate xl file
                    var month_year = yeartoyear+'-'+monthtomonth; 
                    var month_year_new = monthtomonth+'-'+yeartoyear;
                   
                    
                    var query = "SELECT es.sdl_payable,es.shg_deduction,um.company_id as company_id,um.emp_id as emp_ref_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.middlename,'') as middlename,IFNULL(ed.lastname,'') as lastname,ed.basic_salary,es.*,IFNULL(ea.allowance,'') as allowances,cp.name as company_name,IFNULL(cp.logo,'') as company_logo FROM " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " es ON es.emp_id = um.id AND es.month_year = '" + month_year + "' INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " ed ON ed.emp_id = es.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = es.emp_id INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " cp ON cp.id = um.company_id WHERE um.company_id ='" + company_id + "' AND um.status = '1'";
                    var payslipData = await commonFunction.getQueryResults(query);
                    // console.log('Month & Year', query )
                    var allowance_type_query = "SELECT * FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE company_id = '" + company_id + "'";
                    var allowance_types = await commonFunction.getQueryResults(allowance_type_query);
            
                    var column_header = ["SNO", "Employee ID", "Employee Name", "Basic Pay"];
                    var column_header_end = ["Employer CPF", "Employee CPF", "Bonus", "Overtime", "Gross Salary", "Net Salary","Shg_deduction","sdl_payable_amount"];
            
                    var allowance_type_object = {};
                    if (allowance_types.length > 0) {
                        allowance_types.forEach(allowance => {
                            allowance_type_object[allowance.id] = allowance.allowance_name;
                            column_header.push(allowance.allowance_name);
                        });
                    }
                    column_header = column_header.concat(column_header_end);
            
                    var wb = XLSX.utils.book_new();
                    var ws_name = "Payroll Sheet";
                    var ws_data = [
                        column_header
                    ];
            
                    if (payslipData.length > 0) {
                        payslipData.forEach((employee, index) => {
                            var employeeName = employee.firstname + ' ' + employee.middlename + ' ' + employee.lastname;
                            var emp_ref_id = employee.emp_ref_id;
                            var basic_salary = employee.basic_salary;
                            var employer_contribution = employee.employer_contribution;
                            var employee_contribution = employee.employee_contribution;
                            var overtime_allowance = employee.overtime_allowance;
                            var gross_salary = employee.gross_salary;
                            var net_salary = employee.net_salary;
                            var shg_deduction=employee.shg_deduction
                            var sdl_payable=employee.sdl_payable
             
                            var bonus = 0;
                            var employeeData = [index + 1, emp_ref_id, employeeName, basic_salary];
            
                            try {
                                if (employee.allowances && employee.allowances.length > 0) {
            
                                    employee.allowances = phpunserialize(employee.allowances);
                                    bonus = (employee.allowances['bonus']) ? employee.allowances['bonus'] : 0;
            
                                    if (allowance_types.length > 0) {
                                        allowance_types.forEach(allowance => {
            
                                            if (employee.allowances[allowance.id] != undefined) {
                                                employeeData.push(employee.allowances[allowance.id]);
                                            } else {
                                                employeeData.push(0);
                                            }
                                        });
                                    }
                                } else {
                                    if (allowance_types.length > 0) {
                                        allowance_types.forEach(allowance => {
                                            employeeData.push(0);
                                        });
                                    }
                                }
                            } catch (ex) {
                                console.log('Parsing allowance object error...', ex);
                                if (allowance_types.length > 0) {
                                    allowance_types.forEach(allowance => {
                                        employeeData.push(0);
                                    });
                                }
                            }
                       
                            employeeData = employeeData.concat([employer_contribution, employee_contribution, bonus, overtime_allowance, gross_salary, net_salary,shg_deduction,sdl_payable]);
                            ws_data.push(employeeData);
                        });
            
                        var ws = XLSX.utils.aoa_to_sheet(ws_data);
                        XLSX.utils.book_append_sheet(wb, ws, ws_name);
                        XLSX.writeFile(wb, './public/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx');
            
                        // var filePath = ip.address() + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
                        var filePath = commonConfig.SERVER_URL_STATIC + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
             
                        var monthquery = "UPDATE " + tableConfig.HRM_PAYROLL_FOR_MONTH + " SET payroll_file_path = '"+filePath+"' WHERE year = '"+ yeartoyear +"' AND month = '"+ monthtomonth +"' ";
                    //    console.log("Monthtoyear query", monthquery)
                        sql.query(monthquery, function (err, approveResults) {
                            if (err) {
                                console.log(err);
                                deferred.resolve({ status: 0, message: "Failed to approve payroll" });
                            } else {
                               
                                deferred.resolve({ status: 1, message: "Employee payroll details", list: result, alreadyexist: alreadygenerated  });
                            }
                        }); 
            
                    } else {
                        deferred.resolve({ status: 0, message: "No data found to generate payslip" });
                    }
 
                } else {
                    deferred.resolve({ status: 0, message: "No Details found" });
                }
            }
            
        });
        return deferred.promise;
    },




    //live backup
//     generatePayrolltest: async (company_id, fromDate = '', toDate = '', isPreview = false) => {
//         var deferred = q.defer();
//        // var cpf_query = "SELECT * from " + tableConfig.HRM_EMPLOYEE_CPF;
//       var cpf_query = "SELECT * from hrm_cpf_regular_rates";
//       var cpf_data = await commonFunction.getQueryResults(cpf_query);
//         var totalSalaryAmount = 0;
//         var regular_rates=[];
     
//         var totalNumberOfDaysPerMonth = moment(toDate, "YYYY-MM").daysInMonth();
//         var month_year = moment(toDate).format('YYYY-MM');

//         var month = moment(toDate).format('MM');
//         var year = moment(toDate).format('YYYY');
//         var monthtomonth = month;
//         var yeartoyear = year;
//         var alreadygenerated = 0;
//         var ifPayrollGenerated = "SELECT count(*) as count FROM " + tableConfig.HRM_PAYROLL_FOR_MONTH + " WHERE company_id = '"+ company_id +"' AND month = '"+ monthtomonth +"' and  year = '"+ yeartoyear +"' and ( status = 1 or status = 2) ";
//         var ifGenerated = await commonFunction.getQueryResults(ifPayrollGenerated);
//         console.log('generate----------->', ifGenerated[0].count)
//         if(ifGenerated[0].count > 0){
//             alreadygenerated = 1;
//         }
//         var checkPayrollGenerated = "SELECT count(*) as count FROM " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " WHERE company_id = '"+ company_id +"' AND month_year = '"+ month_year +"'";
//         var isPayrollGenerated = await commonFunction.getQueryResults(checkPayrollGenerated);
//         var payrollGenerated = false;

//         if(isPayrollGenerated.length > 0) {
//             payrollGenerated = (isPayrollGenerated[0].count > 0)? true : false; 
//         }

//         if (isPreview == false && payrollGenerated == false) {
//            var addpayrollForMonthQuery = "INSERT INTO "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " (company_id,month,year,payroll_file_path) VALUES ('"+ company_id +"','"+ month +"','"+ year +"','')";
//            var addPayrollResult = await commonFunction.executeQueryAndRetunResults(addpayrollForMonthQuery);
//            var payroll_id = 0;

//            if(addPayrollResult.insertId != undefined && addPayrollResult.insertId != null) {
//             payroll_id = addPayrollResult.insertId;
//            }
//         }

//         var incometax_query = "SELECT * from " + tableConfig.HRM_INCOMETAX;
//         var incometax_data = await commonFunction.getQueryResults(incometax_query);

//         var leaveTypeQuery = "SELECT * FROM " + tableConfig.HRM_LEAVE_TYPE + " WHERE status = '1'";
//         var leaveType = await commonFunction.getQueryResults(leaveTypeQuery);
//         var cpg_age_object = {};
      
//         var numberOfWorkingDays = await commonFunction.getBusinessDatesCount(fromDate, toDate);
//         var holidayQuery = "SELECT from_date,to_date FROM " + tableConfig.HRM_HOLIDAYS + " WHERE company_id = '" + company_id + "' AND ((from_date BETWEEN '" + fromDate + "' AND '" + toDate + "') OR (to_date BETWEEN '" + fromDate + "' AND '" + toDate + "'))";
//         var holidayList = await commonFunction.getQueryResults(holidayQuery);

//         var approvedLeaveQuery = "SELECT um.id as employ_id,lr.from_date,lr.to_date FROM " + tableConfig.HRM_USER_MASTER + " as um INNER JOIN " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " as lr ON lr.emp_id = um.id  AND ((lr.from_date BETWEEN '" + fromDate + "' AND '" + toDate + "') or (lr.from_date < '" + fromDate + "' AND lr.to_date > '" + toDate + "')) AND lr.status = '2' WHERE um.company_id = '" + company_id + "'";
//         var approvedLeaveList = await commonFunction.getQueryResults(approvedLeaveQuery);

//         var approved_leave_object = {};
//         if (approvedLeaveList.length > 0) {
//             approvedLeaveList.forEach((leave, i) => {
//                 let fdate = moment(leave.from_date).format('YYYY-MM-DD');
//                 let edate = moment(leave.to_date).format('YYYY-MM-DD');
//                 let to_date = moment(toDate).format('YYYY-MM-DD');
//                 var from_date = moment(fromDate).format('YYYY-MM-DD');
//                 approvedLeaveList[i].approved_leaves = 0;

//                 if (edate < to_date) {
//                     approvedLeaveList[i].approved_leaves = approvedLeaveList[i].approved_leaves + moment(edate).diff(fdate, 'days') + 1;
//                 } else {
//                     approvedLeaveList[i].approved_leaves = approvedLeaveList[i].approved_leaves + moment(to_date).diff(fdate, 'days') + 1;
//                 }

//                 if (approved_leave_object[leave.employ_id] == undefined) {
//                     approved_leave_object[leave.employ_id] = 0;
//                 }
//                 approved_leave_object[leave.employ_id] = approved_leave_object[leave.employ_id] + approvedLeaveList[i].approved_leaves;
//             });
//         }

//         var numberOfHolidays = 0;

//         if (holidayList.length > 0) {
//             holidayList.forEach(holiday => {
//                 var fdate = moment(holiday.from_date).format('YYYY-MM-DD');
//                 var edate = moment(holiday.to_date).format('YYYY-MM-DD');
//                 var to_date = moment(toDate).format('YYYY-MM-DD');
//                 var from_date = moment(fromDate).format('YYYY-MM-DD');

//                 if (edate < to_date && from_date < fdate) {
//                     var count = 0;
//                     let holidayStartDate = new Date(fdate);
//                     let holidayEndDate = new Date(edate);

//                     var curDate = holidayStartDate;
//                     while (curDate <= holidayEndDate) {
//                         var dayOfWeek = curDate.getDay();
//                         if (((dayOfWeek == 6) || (dayOfWeek == 0)))
//                             count++;
//                         curDate.setDate(curDate.getDate() + 1);
//                     }
//                     numberOfHolidays = numberOfHolidays + moment(edate).diff(fdate, 'days') + 1;
//                     numberOfHolidays = numberOfHolidays - count;
//                 } else if (fdate < from_date) {

//                     var count = 0;
//                     let holidayStartDate = new Date(from_date);
//                     let holidayEndDate = new Date(edate);

//                     var curDate = holidayStartDate;
//                     while (curDate <= holidayEndDate) {
//                         var dayOfWeek = curDate.getDay();
//                         if (((dayOfWeek == 6) || (dayOfWeek == 0)))
//                             count++;
//                         curDate.setDate(curDate.getDate() + 1);
//                     }
//                     numberOfHolidays = numberOfHolidays + moment(edate).diff(from_date, 'days') + 1;
//                     numberOfHolidays = numberOfHolidays - count;
//                 } else {
//                     var count = 0;
//                     let holidayStartDate = new Date(fdate);
//                     let holidayEndDate = new Date(to_date);

//                     var curDate = holidayStartDate;
//                     while (curDate <= holidayEndDate) {
//                         var dayOfWeek = curDate.getDay();
//                         if (((dayOfWeek == 6) || (dayOfWeek == 0)))
//                             count++;
//                         curDate.setDate(curDate.getDate() + 1);
//                     }

//                     numberOfHolidays = numberOfHolidays + moment(to_date).diff(fdate, 'days') + 1;
//                     numberOfHolidays = numberOfHolidays - count;
//                 }
//             });
//         }

//         numberOfWorkingDays = numberOfWorkingDays - numberOfHolidays;
       
//         var query = "SELECT emp.shg_contribution,emp.native,emp.religion, FN_SHG_AMOUNT_NEW(native, religion) as shg_type, visa_status as emp_status,pr_date,pr_status,COUNT(att.emp_id) as present_days,IFNULL(SUM(overtime),0) as overtime,um.id,um.emp_id as employee_id,emp.birthday,emp.firstname,emp.middlename,emp.lastname,emp.basic_salary,emp.salary,emp.email,ea.allowance as allowances,FN_PAYROLL_ACTION(um.id) as action_status from " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp ON emp.emp_id = um.id AND um.status = '1' LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = emp.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " as att ON att.emp_id = emp.emp_id and att.check_in BETWEEN '" + fromDate + "'  AND '" + toDate + "' where um.company_id = '" + company_id + "' GROUP BY emp.emp_id";

//         sql.query(query, async function (err, result) {
//             if (err) {
//                 console.log(err);
//                 deferred.resolve({ status: 0, message: "Failed to get employee details" });
//             }
//             else {

//                 if (result.length > 0) {
//                     var amount_to_calculate_cpf = 0;
//                   //  var cpfInsertQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " (company_id,emp_id,ordinary_account,special_account,medisave_account,employer_contribution,employee_contribution,month_year,income_tax,net_salary,gross_salary,lop,overtime_allowance,lop_days,payroll_id,basic_salary,salary,bonus,hra,transport_allowance,food_allowance,phone_allowance) VALUES ";

//                     result.forEach(async (data, index) => {
//                         var employer_contribution_percent = 0;
//                         var employee_contribution_percent = 0;
//                         var income_tax_amount = 0;
//                         var totalAllowanceAmount = 0;
//                         result[index].total_allowance = 0;

//                         data.bonus = 0;
//                         result[index].hra = 0;
//                         result[index].transport_allowance = 0;
//                         result[index].food_allowance = 0;
//                         result[index].phone_allowance = 0;

//                         try {
//                             if (data.allowances && data.allowances.length > 0) {
//                                 data.allowances = phpunserialize(data.allowances);
//                                 Object.keys(data.allowances).forEach(function (key) {
//                                     var val = data.allowances[key];
//                                     if (key == 'bonus') {
//                                         data.bonus = parseInt(val);
//                                     } else {
//                                         totalAllowanceAmount = parseInt(totalAllowanceAmount) + parseInt(val);
//                                         if(key == '1') {
//                                             result[index].hra = parseInt(val);
//                                         } else if (key == '2') {
//                                             result[index].transport_allowance = parseInt(val);
//                                         } else if(key == '3') {
//                                             result[index].food_allowance = parseInt(val);
//                                         } else if(key == '4'){
//                                             result[index].phone_allowance = parseInt(val);
//                                         }
//                                     } 
//                                     result[index].total_allowance = parseInt(totalAllowanceAmount) + parseInt(result[index].bonus)
//                                 });
                                
//                                 delete data.allowances;
//                             }
//                         } catch (ex) {
//                             console.log('Parsing allowance object error...', ex);
//                         }

//                         var dob = (data.birthday) ? data.birthday : '';
//                         var emp_primary_ID = (data.id) ? data.id : 0;
//                         var present_days = data.present_days;
//                         var approved_leaves = approved_leave_object[emp_primary_ID] ? approved_leave_object[emp_primary_ID] : 0;
//                         present_days = present_days + approved_leaves;

//                         var lopDaysForEmployee = numberOfWorkingDays - present_days;
//                         if (lopDaysForEmployee < 0) {
//                             lopDaysForEmployee = 0;
//                         }

//                         var age = 0;
//                         var ordinary_amount = 0;
//                         var special_amount = 0;
//                         var medisave_amount = 0;
//                         var employer_contribution_amount = 0;
//                         var employee_contribution_amount = 0;
//                         var overTimeAllowance = 0;
//                         var employeeOverTime=0;
//                         employeeOverTime = (data.overtime!=0) ? parseInt(data.overtime / 60) : 0;
                      

//                         overTimeAllowance =Math.round( (result[index].basic_salary / (totalNumberOfDaysPerMonth * 8)) * employeeOverTime);
//                         console.log("overtimecal",overTimeAllowance)
//                         // var ordinary_acccount_percent = 0;
//                         // var special_account_percent = 0;
//                         // var medisave_account_percent = 0;
//                         var ordinary_wage=data.basic_salary+overTimeAllowance;
//                         var basic_salary=0
//                        if(ordinary_wage >= 6000)
//                        {
//                            console.log("hjvdfsjhsdf")
//                            basic_salary=6000;
//                        }
//                        if(ordinary_wage< 6000){
//                            console.log("sdasdas")
//                            basic_salary=ordinary_wage;
//                        }
//                        console.log("basic_salary",basic_salary)
                    
//                         amount_to_calculate_cpf = basic_salary + data.bonus;
                      
//                         if (dob != '') {
//                             age = moment().diff(dob, 'years', false);
//                         }

//                         age = parseInt(age);
//                         var minAge = 0;

// var total_wages=data.basic_salary+data.bonus+data.overtime;
// var OW=data.basic_salary+data.overtime;
// var AW=data.bonus;

// var year=(data.pr_date!='NaN')?data.pr_date:'';
// console.log("pr_datew",moment().format("YYYY"))
//                     var pr_years= (data.pr_date!=null)?moment().diff(year, 'years'):0;
//                   console.log("pr_yeays",pr_years)
                 
               
//                 var salary=0;
//                 var pr_emp_year=0;
//                 var pr_emp_status=0;
//                 var emptype=0;
//                 var maxage=0;
//                 var ageidentefied=false;
//                 var salaryidentified=false;
//                 async.each(cpf_data,function(cpfdata,callback)
//                 {
//                     salary=cpfdata.max_salary;
//                         pr_emp_year=parseInt(cpfdata.pr_year);
//                        pr_emp_visa_status=parseInt(cpfdata.emp_visa_status)
//                         pr_emp_status=parseInt(cpfdata.pr_status);
//                         emptype=parseInt(cpfdata.emp_type);
//                         maxage=parseInt(cpfdata.max_age);
//                         if(pr_emp_visa_status==data.emp_status && data.emp_status!=0&&pr_emp_visa_status!=1&&data.emp_status!=1)
//                             {
                                

//                                 if(pr_emp_year==pr_years||pr_years==0)
//                                 {
                                   
//                                     if(data.pr_status==pr_emp_status&&data.pr_status!=0)
//                                     {
//                                         if(age<maxage&&ageidentefied==false)
//                                       {
//                                         if(amount_to_calculate_cpf <=salary && salaryidentified==false && amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
//                                         {
                                        
                                             
//                                            console.log("asbbjhdsg",)
//                                           salaryidentified=true;
//                                               ageidentefied=true;
                                            
//                                                   employee_contribution_percent=cpfdata.employee_contribution,
//                                                   employer_contribution_percent=cpfdata.employer_contribution  
                                                
//                                         }
//                                         else if(amount_to_calculate_cpf <=salary && salaryidentified==false )
//                                         {
//                                             employee_contribution_percent=cpfdata.employee_contribution,
//                                                   employer_contribution_percent=cpfdata.employer_contribution  
                                                 
//                                                   salaryidentified=true;
//                                                   //ageidentefied=true;
//                                         }
//                                       }
//                                     }
//                                 }  
                                    
                                 
                                  
                                      
                                        
                                          
//                             }
//                             else if(pr_years>=3||data.emp_status==1)
//                             {
                              
//                                     if(age<maxage&&ageidentefied==false)
//                                 {
                                   
                                    
//                                   if(amount_to_calculate_cpf <=salary && salaryidentified==false && amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
//                                   {
//                                     console.log("meivanann")
//                                     //   if(amount_to_calculate_cpf!=element.annual_max_amount)
//                                     //   {
//                                        console.log("nandhini record  is not coming",pr_years)
                                     
                                   
                                       
//                                           console.log("3yrdlessthan750",cpfdata)
//                                             employee_contribution_percent=cpfdata.employee_contribution,
//                                             employer_contribution_percent=cpfdata.employer_contribution  
//                                             salaryidentified=true;
//                                             ageidentefied=true;
                                          
//                                   }
//                                   else if(amount_to_calculate_cpf <=salary && salaryidentified==false )
//                                   {
//                                     console.log("nandhini")
//                                       employee_contribution_percent=cpfdata.employee_contribution,
//                                             employer_contribution_percent=cpfdata.employer_contribution  
//                                             console.log("3yrd",cpfdata)
//                                             salaryidentified=true;
//                                             ageidentefied=true;
//                                   }
//                                 }
                             
                                
//                             }
                               
                                
                                                    
                                           
//                     callback();
               
//                 }, function(err)
//                 {

//                 }
//             )
                    
//                     employer_contribution_amount = amount_to_calculate_cpf * (employer_contribution_percent / 100);
//                     if(amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
//                     {
//                         console.log("jhasajsd")
//                         employee_contribution_amount=employee_contribution_percent*(amount_to_calculate_cpf-500)
//                     }
//                     else if(!(amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750))
//                     {
//                         console.log("meivannana")
//                         employee_contribution_amount = amount_to_calculate_cpf * (employee_contribution_percent / 100);
//                     }
//                    console.log("jaskkjsadc",employee_contribution_amount)

//                       ;
                     

                        
//                         var lopAmount = 0;

                      

//                         var sdlsalary=false                
//                         var renumeration=result[index].basic_salary + totalAllowanceAmount + result[index].bonus;
//                         var sdlQuery="select * from hrm_employee_sdl";
//                         var sdldata=await commonFunction.getQueryResults(sdlQuery);
//                          var sdlpercent=0;
//                         async.each(sdldata,function(sdldata,callback)
//                         { 
//                             if(sdldata.type==1)
//                             {
//                                 if( (sdldata.max_salary == null  || sdldata.max_salary == '') && (renumeration > sdldata.min_salary&&sdlsalary==false) ){
//                                     console.log("sdldata",sdldata)
//                                     sdlpayable=sdldata.amount
//                                     sdlsalary=true
//                                    }else if(renumeration > sdldata.min_salary && renumeration <= sdldata.max_salary&&sdlsalary==false){
//                                        console.log("2condition",sdldata)
//                                     sdlpayable=sdldata.amount 
//                                     sdlsalary=true  
//                                    }
                                
//                             }
//                             else if(sdldata.type==2)
                            
//                             {
//                                 if(renumeration > sdldata.min_salary && renumeration <= sdldata.max_salary&&sdlsalary==false)
//                                 {
//                                     sdlpercent=sdldata.amount
//                                     sdlpayable=(renumeration*sdlpercent)/100;
//                                 }
                              
//                             }
                          
                           
                            
//                             callback(); 
//                         },function(err)
//                         {
//                             console.log(err);
//                         }
//                         )
//                         //console.log("sdlpayable",sdlpayable)
                        
                  
                                        
                  
//                         result[index].sdlpayableamount=sdlpayable;
//                         result[index].employee_contribution_amount =   Math.round(employee_contribution_amount);
//                         result[index].employer_contribution_amount =  Math.round(employer_contribution_amount) ;
//                         result[index].gross_salary = result[index].basic_salary + totalAllowanceAmount + result[index].bonus;
//                         result[index].overamount=overTimeAllowance;
                    
//                         if (incometax_data.length > 0) {
//                             let calculated = false;
//                             incometax_data.forEach((taxdata) => {
//                                 if (taxdata.type == 1 && calculated == false) {
//                                     if ((result[index].basic_salary * 12) <= taxdata.income_upto) {
//                                         income_tax_amount = Math.ceil(taxdata.tax_amount / 12);
//                                         calculated = true;
//                                     }
//                                 } else if (calculated == false) {
//                                     income_tax_amount = result[index].basic_salary * (taxdata.tax_amount / 100);
//                                     income_tax_amount = Math.ceil(income_tax_amount);
//                                     calculated = true;
//                                 }
//                             });
//                         }
                        
//                         result[index].claims = 0;
//                         result[index].lop = 0; 
//                         result[index].income_tax_amount = income_tax_amount;
//                         // result[index].net_salary = (result[index].gross_salary - result[index].employee_contribution_amount - lopAmount) + data.bonus + overTimeAllowance - income_tax_amount;
                       
//                         var netSalaryFinal = ( parseInt(result[index].gross_salary) + parseInt(overTimeAllowance)) - ( parseInt(employer_contribution_amount) + parseInt(result[index].employee_contribution_amount)  + parseInt(income_tax_amount)); //parseInt(lopAmount)
                        
//                         var shgtype= data.shg_type;   
//                       var   sgh_amountdeducation=0;
//                         var shg_type_name=''
//                         if(shgtype==1)
//                         {
//                             shg_type_name="CDAC"
//                         }
//                         else if(shgtype==2)
//                         {
//                             shg_type_name="ECF"
//                         }
//                         else if(shgtype==3)
//                         {
//                             shg_type_name="SINDA"
//                         }
//                         else if(shgtype==4)
//                         {
//                             shg_type_name="MBMF"
//                         }
                       
//                         var sgh_query="select * from hrm_employee_shg where type="+shgtype+" ";
                                        
//                         var sghdata=await commonFunction.getQueryResults(sgh_query) 
                       
//                          async.each(sghdata,function(sgh_data,callback)
//                          { 
                           

//                             if( (sgh_data.max_salary == null  || sgh_data.max_salary == '') && (result[index].gross_salary > sgh_data.min_salary) ){
//                                 sgh_amountdeducation=sgh_data.amount
//                             }else if(result[index].gross_salary > sgh_data.min_salary && result[index].gross_salary <= sgh_data.max_salary){
//                                 console.log("sgh_amountdeducation",sgh_data)
//                                 sgh_amountdeducation=sgh_data.amount   
//                             }

                             
//                              callback(); 
//                          },function(err)
//                          {
//                              console.log(err);
//                          }
//                          )
                       
//                         result[index].shg_type=shg_type_name    
//                         if(data.shg_contribution!=0)
//                         {
//                             result[index].shg_deucation=sgh_amountdeducation;
//                         }   
//                         else
//                         {
//                             result[index].shg_deucation=0;
//                         }     
                      
                        
//                        var sgh_final=(result[index].shg_deucation)==undefined?0:result[index].shg_deucation;
//                        console.log("finalsalary",sgh_final)
//                        var finalnet=netSalaryFinal-sgh_final+result[index].sdlpayableamount;  
//                        console.log("finalnet",finalnet)
                         
//                        result[index].self_group_amount =sgh_final // sgh_amountdeducation==undefined?0:sgh_amountdeducation; 
//                         result[index].net_salary = (finalnet > 0) ? finalnet : 0; 
//                         totalSalaryAmount = totalSalaryAmount + parseInt(result[index].gross_salary);
//                         // console.log('Month and Year -------------->', monthtomonth + "-" + yeartoyear)
//                         var monthyear = yeartoyear + "-" + monthtomonth;
//                         var cpf_InsertQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " (company_id,emp_id,ordinary_account,special_account,medisave_account,employer_contribution,employee_contribution,month_year,income_tax,net_salary,gross_salary,lop,overtime_allowance,lop_days,payroll_id,basic_salary,salary,bonus,hra,transport_allowance,food_allowance,phone_allowance,shg_deduction,sdl_payable,shg_type)VALUES ('" + company_id + "','" + data.id + "','" + ordinary_amount + "','" + special_amount + "','" + medisave_amount + "','" + employer_contribution_amount + "','" + employee_contribution_amount + "','" + monthyear + "','" + income_tax_amount + "','" + result[index].net_salary + "','" + result[index].gross_salary + "','" + lopAmount + "','" + overTimeAllowance + "','" + lopDaysForEmployee + "','"+ payroll_id +"','"+ result[index].basic_salary +"','"+ result[index].salary +"','"+ result[index].bonus+"','"+ result[index].hra +"','"+ result[index].transport_allowance  +"','"+ result[index].food_allowance +"','"+ result[index].phone_allowance +"','"+result[index].shg_deucation+"','"+result[index].sdlpayableamount+"','"+shgtype+"')"
                        
//                         if (isPreview == false && payrollGenerated == false) {
//                             var cpfInsertResult = await commonFunction.executeQuery(cpf_InsertQuery);
                             
//                             var updateTotalSalaryExpense = "UPDATE "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " SET total_salary_amount = '"+ totalSalaryAmount +"' WHERE company_id = '"+ company_id +"' AND month = '"+ month +"' AND year = '"+ year +"' AND status = '1'";
//                             var updatePayrollResult = await commonFunction.executeQueryAndRetunResults(updateTotalSalaryExpense);
//                         }
//                         // cpfInsertQuery = cpfInsertQuery + " ('" + company_id + "','" + data.id + "','" + ordinary_amount + "','" + special_amount + "','" + medisave_amount + "','" + employer_contribution_amount + "','" + employee_contribution_amount + "','" + monthyear + "','" + income_tax_amount + "','" + result[index].net_salary + "','" + result[index].gross_salary + "','" + lopAmount + "','" + overTimeAllowance + "','" + lopDaysForEmployee + "','"+ payroll_id +"','"+ result[index].basic_salary +"','"+ result[index].salary +"','"+ result[index].bonus+"','"+ result[index].hra +"','"+ result[index].transport_allowance  +"','"+ result[index].food_allowance +"','"+ result[index].phone_allowance +"')";
//                         // if (isPreview == false && payrollGenerated == false) {
//                         //     var cpfInsertResult = await commonFunction.executeQuery(cpfInsertQuery);
//                         //     console.log("totalsalary",totalSalaryAmount)
                            
//                         //     var updateTotalSalaryExpense = "UPDATE "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " SET total_salary_amount = '"+ totalSalaryAmount +"' WHERE company_id = '"+ company_id +"' AND month = '"+ month +"' AND year = '"+ year +"' AND status = '1'";
//                         //     var updatePayrollResult = await commonFunction.executeQueryAndRetunResults(updateTotalSalaryExpense);
//                         // }
//                     })
                   
//                    // cpfInsertQuery = cpfInsertQuery.substring(0, cpfInsertQuery.length - 1);
//                     // console.log("salarydetails",cpfInsertQuery)
                  
//                     // console.log("inertresult",cpfInsertResult)
//                     // if (isPreview == false && payrollGenerated == false) {
//                     //     var cpfInsertResult = await commonFunction.executeQuery(cpfInsertQuery);
//                     //     console.log("totalsalary",totalSalaryAmount)
                        
//                     //     var updateTotalSalaryExpense = "UPDATE "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " SET total_salary_amount = '"+ totalSalaryAmount +"' WHERE company_id = '"+ company_id +"' AND month = '"+ month +"' AND year = '"+ year +"' AND status = '1'";
//                     //     var updatePayrollResult = await commonFunction.executeQueryAndRetunResults(updateTotalSalaryExpense);
//                     // }
              

                
                  
                 

                    


//                     //Generate xl file
//                     var month_year = yeartoyear+'-'+monthtomonth; 
//                     var month_year_new = monthtomonth+'-'+yeartoyear;
                   
                    
//                     var query = "SELECT es.sdl_payable,es.shg_deduction,um.company_id as company_id,um.emp_id as emp_ref_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.middlename,'') as middlename,IFNULL(ed.lastname,'') as lastname,ed.basic_salary,es.*,IFNULL(ea.allowance,'') as allowances,cp.name as company_name,IFNULL(cp.logo,'') as company_logo FROM " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " es ON es.emp_id = um.id AND es.month_year = '" + month_year + "' INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " ed ON ed.emp_id = es.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = es.emp_id INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " cp ON cp.id = um.company_id WHERE um.company_id ='" + company_id + "' AND um.status = '1'";
//                     var payslipData = await commonFunction.getQueryResults(query);
//                     // console.log('Month & Year', query )
//                     var allowance_type_query = "SELECT * FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE company_id = '" + company_id + "'";
//                     var allowance_types = await commonFunction.getQueryResults(allowance_type_query);
            
//                     var column_header = ["SNO", "Employee ID", "Employee Name", "Basic Pay"];
//                     var column_header_end = ["Employer CPF", "Employee CPF", "Bonus", "Overtime", "Gross Salary", "Net Salary","Shg_deduction","sdl_payable_amount"];
            
//                     var allowance_type_object = {};
//                     if (allowance_types.length > 0) {
//                         allowance_types.forEach(allowance => {
//                             allowance_type_object[allowance.id] = allowance.allowance_name;
//                             column_header.push(allowance.allowance_name);
//                         });
//                     }
//                     column_header = column_header.concat(column_header_end);
            
//                     var wb = XLSX.utils.book_new();
//                     var ws_name = "Payroll Sheet";
//                     var ws_data = [
//                         column_header
//                     ];
            
//                     if (payslipData.length > 0) {
//                         payslipData.forEach((employee, index) => {
//                             var employeeName = employee.firstname + ' ' + employee.middlename + ' ' + employee.lastname;
//                             var emp_ref_id = employee.emp_ref_id;
//                             var basic_salary = employee.basic_salary;
//                             var employer_contribution = employee.employer_contribution;
//                             var employee_contribution = employee.employee_contribution;
//                             var overtime_allowance = employee.overtime_allowance;
//                             var gross_salary = employee.gross_salary;
//                             var net_salary = employee.net_salary;
//                             var shg_deduction=employee.shg_deduction
//                             var sdl_payable=employee.sdl_payable
             
//                             var bonus = 0;
//                             var employeeData = [index + 1, emp_ref_id, employeeName, basic_salary];
            
//                             try {
//                                 if (employee.allowances && employee.allowances.length > 0) {
            
//                                     employee.allowances = phpunserialize(employee.allowances);
//                                     bonus = (employee.allowances['bonus']) ? employee.allowances['bonus'] : 0;
            
//                                     if (allowance_types.length > 0) {
//                                         allowance_types.forEach(allowance => {
            
//                                             if (employee.allowances[allowance.id] != undefined) {
//                                                 employeeData.push(employee.allowances[allowance.id]);
//                                             } else {
//                                                 employeeData.push(0);
//                                             }
//                                         });
//                                     }
//                                 } else {
//                                     if (allowance_types.length > 0) {
//                                         allowance_types.forEach(allowance => {
//                                             employeeData.push(0);
//                                         });
//                                     }
//                                 }
//                             } catch (ex) {
//                                 console.log('Parsing allowance object error...', ex);
//                                 if (allowance_types.length > 0) {
//                                     allowance_types.forEach(allowance => {
//                                         employeeData.push(0);
//                                     });
//                                 }
//                             }
                       
//                             employeeData = employeeData.concat([employer_contribution, employee_contribution, bonus, overtime_allowance, gross_salary, net_salary,shg_deduction,sdl_payable]);
//                             ws_data.push(employeeData);
//                         });
            
//                         var ws = XLSX.utils.aoa_to_sheet(ws_data);
//                         XLSX.utils.book_append_sheet(wb, ws, ws_name);
//                         XLSX.writeFile(wb, './public/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx');
            
//                         // var filePath = ip.address() + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
//                         var filePath = commonConfig.SERVER_URL_STATIC + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
             
//                         var monthquery = "UPDATE " + tableConfig.HRM_PAYROLL_FOR_MONTH + " SET payroll_file_path = '"+filePath+"' WHERE year = '"+ yeartoyear +"' AND month = '"+ monthtomonth +"' ";
//                     //    console.log("Monthtoyear query", monthquery)
//                         sql.query(monthquery, function (err, approveResults) {
//                             if (err) {
//                                 console.log(err);
//                                 deferred.resolve({ status: 0, message: "Failed to approve payroll" });
//                             } else {
                               
//                                 deferred.resolve({ status: 1, message: "Employee payroll details", list: result, alreadyexist: alreadygenerated  });
//                             }
//                         }); 
            
//                     } else {
//                         deferred.resolve({ status: 0, message: "No data found to generate payslip" });
//                     }
 
//                 } else {
//                     deferred.resolve({ status: 0, message: "No Details found" });
//                 }
//             }
            
//         });
//         return deferred.promise;
//     },

//ending live backup 
//     generatePayrolltest: async (company_id, fromDate = '', toDate = '', isPreview = false) => {
//         var deferred = q.defer();
//        // var cpf_query = "SELECT * from " + tableConfig.HRM_EMPLOYEE_CPF;
//       var cpf_query = "SELECT * from hrm_cpf_regular_rates";
//       var cpf_data = await commonFunction.getQueryResults(cpf_query);
//         var totalSalaryAmount = 0;
//         var regular_rates=[];
     
//         var totalNumberOfDaysPerMonth = moment(toDate, "YYYY-MM").daysInMonth();
//         var month_year = moment(toDate).format('YYYY-MM');

//         var month = moment(toDate).format('MM');
//         var year = moment(toDate).format('YYYY');
//         var monthtomonth = month;
//         var yeartoyear = year;
//         var alreadygenerated = 0;
//         var ifPayrollGenerated = "SELECT count(*) as count FROM " + tableConfig.HRM_PAYROLL_FOR_MONTH + " WHERE company_id = '"+ company_id +"' AND month = '"+ monthtomonth +"' and  year = '"+ yeartoyear +"' and ( status = 1 or status = 2) ";
//         var ifGenerated = await commonFunction.getQueryResults(ifPayrollGenerated);
//         console.log('generate----------->', ifGenerated[0].count)
//         if(ifGenerated[0].count > 0){
//             alreadygenerated = 1;
//         }
//         var checkPayrollGenerated = "SELECT count(*) as count FROM " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " WHERE company_id = '"+ company_id +"' AND month_year = '"+ month_year +"'";
//         var isPayrollGenerated = await commonFunction.getQueryResults(checkPayrollGenerated);
//         var payrollGenerated = false;

//         if(isPayrollGenerated.length > 0) {
//             payrollGenerated = (isPayrollGenerated[0].count > 0)? true : false; 
//         }

//         if (isPreview == false && payrollGenerated == false) {
//            var addpayrollForMonthQuery = "INSERT INTO "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " (company_id,month,year,payroll_file_path) VALUES ('"+ company_id +"','"+ month +"','"+ year +"','')";
//            var addPayrollResult = await commonFunction.executeQueryAndRetunResults(addpayrollForMonthQuery);
//            var payroll_id = 0;

//            if(addPayrollResult.insertId != undefined && addPayrollResult.insertId != null) {
//             payroll_id = addPayrollResult.insertId;
//            }
//         }

//         var incometax_query = "SELECT * from " + tableConfig.HRM_INCOMETAX;
//         var incometax_data = await commonFunction.getQueryResults(incometax_query);

//         var leaveTypeQuery = "SELECT * FROM " + tableConfig.HRM_LEAVE_TYPE + " WHERE status = '1'";
//         var leaveType = await commonFunction.getQueryResults(leaveTypeQuery);
//         var cpg_age_object = {};
      
//         var numberOfWorkingDays = await commonFunction.getBusinessDatesCount(fromDate, toDate);
//         var holidayQuery = "SELECT from_date,to_date FROM " + tableConfig.HRM_HOLIDAYS + " WHERE company_id = '" + company_id + "' AND ((from_date BETWEEN '" + fromDate + "' AND '" + toDate + "') OR (to_date BETWEEN '" + fromDate + "' AND '" + toDate + "'))";
//         var holidayList = await commonFunction.getQueryResults(holidayQuery);

//         var approvedLeaveQuery = "SELECT um.id as employ_id,lr.from_date,lr.to_date FROM " + tableConfig.HRM_USER_MASTER + " as um INNER JOIN " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " as lr ON lr.emp_id = um.id  AND ((lr.from_date BETWEEN '" + fromDate + "' AND '" + toDate + "') or (lr.from_date < '" + fromDate + "' AND lr.to_date > '" + toDate + "')) AND lr.status = '2' WHERE um.company_id = '" + company_id + "'";
//         var approvedLeaveList = await commonFunction.getQueryResults(approvedLeaveQuery);

//         var approved_leave_object = {};
//         if (approvedLeaveList.length > 0) {
//             approvedLeaveList.forEach((leave, i) => {
//                 let fdate = moment(leave.from_date).format('YYYY-MM-DD');
//                 let edate = moment(leave.to_date).format('YYYY-MM-DD');
//                 let to_date = moment(toDate).format('YYYY-MM-DD');
//                 var from_date = moment(fromDate).format('YYYY-MM-DD');
//                 approvedLeaveList[i].approved_leaves = 0;

//                 if (edate < to_date) {
//                     approvedLeaveList[i].approved_leaves = approvedLeaveList[i].approved_leaves + moment(edate).diff(fdate, 'days') + 1;
//                 } else {
//                     approvedLeaveList[i].approved_leaves = approvedLeaveList[i].approved_leaves + moment(to_date).diff(fdate, 'days') + 1;
//                 }

//                 if (approved_leave_object[leave.employ_id] == undefined) {
//                     approved_leave_object[leave.employ_id] = 0;
//                 }
//                 approved_leave_object[leave.employ_id] = approved_leave_object[leave.employ_id] + approvedLeaveList[i].approved_leaves;
//             });
//         }

//         var numberOfHolidays = 0;

//         if (holidayList.length > 0) {
//             holidayList.forEach(holiday => {
//                 var fdate = moment(holiday.from_date).format('YYYY-MM-DD');
//                 var edate = moment(holiday.to_date).format('YYYY-MM-DD');
//                 var to_date = moment(toDate).format('YYYY-MM-DD');
//                 var from_date = moment(fromDate).format('YYYY-MM-DD');

//                 if (edate < to_date && from_date < fdate) {
//                     var count = 0;
//                     let holidayStartDate = new Date(fdate);
//                     let holidayEndDate = new Date(edate);

//                     var curDate = holidayStartDate;
//                     while (curDate <= holidayEndDate) {
//                         var dayOfWeek = curDate.getDay();
//                         if (((dayOfWeek == 6) || (dayOfWeek == 0)))
//                             count++;
//                         curDate.setDate(curDate.getDate() + 1);
//                     }
//                     numberOfHolidays = numberOfHolidays + moment(edate).diff(fdate, 'days') + 1;
//                     numberOfHolidays = numberOfHolidays - count;
//                 } else if (fdate < from_date) {

//                     var count = 0;
//                     let holidayStartDate = new Date(from_date);
//                     let holidayEndDate = new Date(edate);

//                     var curDate = holidayStartDate;
//                     while (curDate <= holidayEndDate) {
//                         var dayOfWeek = curDate.getDay();
//                         if (((dayOfWeek == 6) || (dayOfWeek == 0)))
//                             count++;
//                         curDate.setDate(curDate.getDate() + 1);
//                     }
//                     numberOfHolidays = numberOfHolidays + moment(edate).diff(from_date, 'days') + 1;
//                     numberOfHolidays = numberOfHolidays - count;
//                 } else {
//                     var count = 0;
//                     let holidayStartDate = new Date(fdate);
//                     let holidayEndDate = new Date(to_date);

//                     var curDate = holidayStartDate;
//                     while (curDate <= holidayEndDate) {
//                         var dayOfWeek = curDate.getDay();
//                         if (((dayOfWeek == 6) || (dayOfWeek == 0)))
//                             count++;
//                         curDate.setDate(curDate.getDate() + 1);
//                     }

//                     numberOfHolidays = numberOfHolidays + moment(to_date).diff(fdate, 'days') + 1;
//                     numberOfHolidays = numberOfHolidays - count;
//                 }
//             });
//         }

//         numberOfWorkingDays = numberOfWorkingDays - numberOfHolidays;
        
//         var query = "SELECT emp.shg_contribution,emp.native,emp.religion, FN_SHG_AMOUNT_NEW(native, religion) as shg_type, visa_status as emp_status,pr_date,pr_status,COUNT(att.emp_id) as present_days,IFNULL(SUM(overtime),0) as overtime,um.id,um.emp_id as employee_id,emp.birthday,emp.firstname,emp.middlename,emp.lastname,emp.basic_salary,emp.salary,emp.email,ea.allowance as allowances,FN_PAYROLL_ACTION(um.id) as action_status from " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp ON emp.emp_id = um.id AND um.status = '1' LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = emp.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " as att ON att.emp_id = emp.emp_id and att.check_in BETWEEN '" + fromDate + "'  AND '" + toDate + "' where um.company_id = '" + company_id + "' GROUP BY emp.emp_id";

//         sql.query(query, async function (err, result) {
//             if (err) {
//                 console.log(err);
//                 deferred.resolve({ status: 0, message: "Failed to get employee details" });
//             }
//             else {

//                 if (result.length > 0) {
//                     var amount_to_calculate_cpf = 0;
//                   //  var cpfInsertQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " (company_id,emp_id,ordinary_account,special_account,medisave_account,employer_contribution,employee_contribution,month_year,income_tax,net_salary,gross_salary,lop,overtime_allowance,lop_days,payroll_id,basic_salary,salary,bonus,hra,transport_allowance,food_allowance,phone_allowance) VALUES ";

//                     result.forEach(async (data, index) => {
//                         var employer_contribution_percent = 0;
//                         var employee_contribution_percent = 0;
//                         var income_tax_amount = 0;
//                         var totalAllowanceAmount = 0;
//                         result[index].total_allowance = 0;

//                         data.bonus = 0;
//                         result[index].hra = 0;
//                         result[index].transport_allowance = 0;
//                         result[index].food_allowance = 0;
//                         result[index].phone_allowance = 0;

//                         try {
//                             if (data.allowances && data.allowances.length > 0) {
//                                 data.allowances = phpunserialize(data.allowances);
//                                 Object.keys(data.allowances).forEach(function (key) {
//                                     var val = data.allowances[key];
//                                     if (key == 'bonus') {
//                                         data.bonus = parseInt(val);
//                                     } else {
//                                         totalAllowanceAmount = parseInt(totalAllowanceAmount) + parseInt(val);
//                                         if(key == '1') {
//                                             result[index].hra = parseInt(val);
//                                         } else if (key == '2') {
//                                             result[index].transport_allowance = parseInt(val);
//                                         } else if(key == '3') {
//                                             result[index].food_allowance = parseInt(val);
//                                         } else if(key == '4'){
//                                             result[index].phone_allowance = parseInt(val);
//                                         }
//                                     } 
//                                     result[index].total_allowance = parseInt(totalAllowanceAmount) + parseInt(result[index].bonus)
//                                 });
                                
//                                 delete data.allowances;
//                             }
//                         } catch (ex) {
//                             console.log('Parsing allowance object error...', ex);
//                         }

//                         var dob = (data.birthday) ? data.birthday : '';
//                         var emp_primary_ID = (data.id) ? data.id : 0;
//                         var present_days = data.present_days;
//                         var approved_leaves = approved_leave_object[emp_primary_ID] ? approved_leave_object[emp_primary_ID] : 0;
//                         present_days = present_days + approved_leaves;

//                         var lopDaysForEmployee = numberOfWorkingDays - present_days;
//                         if (lopDaysForEmployee < 0) {
//                             lopDaysForEmployee = 0;
//                         }

//                         var age = 0;
//                         var ordinary_amount = 0;
//                         var special_amount = 0;
//                         var medisave_amount = 0;
//                         var employer_contribution_amount = 0;
//                         var employee_contribution_amount = 0;
//                         var overTimeAllowance = 0;
//                         var employeeOverTime=0;
//                         employeeOverTime = (data.overtime!=0) ? parseInt(data.overtime / 60) : 0;
                      

//                         overTimeAllowance =Math.round( (result[index].basic_salary / (totalNumberOfDaysPerMonth * 8)) * employeeOverTime);
//                         console.log("overtimecal",overTimeAllowance)
//                         // var ordinary_acccount_percent = 0;
//                         // var special_account_percent = 0;
//                         // var medisave_account_percent = 0;
//                         var ordinary_wage=data.basic_salary+overTimeAllowance;
//                         var basic_salary=0
//                        if(ordinary_wage >= 6000)
//                        {
//                            console.log("hjvdfsjhsdf")
//                            basic_salary=6000;
//                        }
//                        if(ordinary_wage< 6000){
//                            console.log("sdasdas")
//                            basic_salary=ordinary_wage;
//                        }
//                        console.log("basic_salary",basic_salary)
                    
//                         amount_to_calculate_cpf = basic_salary + data.bonus;
                      
//                         if (dob != '') {
//                             age = moment().diff(dob, 'years', false);
//                         }

//                         age = parseInt(age);
//                         var minAge = 0;

// var total_wages=data.basic_salary+data.bonus+data.overtime;
// var OW=data.basic_salary+data.overtime;
// var AW=data.bonus;

// var year=(data.pr_date!='NaN')?data.pr_date:'';
// console.log("pr_datew",moment().format("YYYY"))
//                     var pr_years= (data.pr_date!=null)?moment().diff(year, 'years'):0;
//                   console.log("pr_yeays",pr_years)
                 
               
//                 var salary=0;
//                 var pr_emp_year=0;
//                 var pr_emp_status=0;
//                 var emptype=0;
//                 var maxage=0;
//                 var ageidentefied=false;
//                 var salaryidentified=false;
//                 async.each(cpf_data,function(cpfdata,callback)
//                 {
//                     salary=cpfdata.max_salary;
//                         pr_emp_year=parseInt(cpfdata.pr_year);
//                        pr_emp_visa_status=parseInt(cpfdata.emp_visa_status)
//                         pr_emp_status=parseInt(cpfdata.pr_status);
//                         emptype=parseInt(cpfdata.emp_type);
//                         maxage=parseInt(cpfdata.max_age);
//                         if(pr_emp_visa_status==data.emp_status && data.emp_status!=0&&pr_emp_visa_status!=1&&data.emp_status!=1)
//                             {
                                

//                                 if(pr_emp_year==pr_years||pr_years==0)
//                                 {
                                   
//                                     if(data.pr_status==pr_emp_status&&data.pr_status!=0)
//                                     {
//                                         if(age<maxage&&ageidentefied==false)
//                                       {
//                                         if(amount_to_calculate_cpf <=salary && salaryidentified==false && amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
//                                         {
                                        
                                             
//                                            console.log("asbbjhdsg",)
//                                           salaryidentified=true;
//                                               ageidentefied=true;
                                            
//                                                   employee_contribution_percent=cpfdata.employee_contribution,
//                                                   employer_contribution_percent=cpfdata.employer_contribution  
                                                
//                                         }
//                                         else if(amount_to_calculate_cpf <=salary && salaryidentified==false )
//                                         {
//                                             employee_contribution_percent=cpfdata.employee_contribution,
//                                                   employer_contribution_percent=cpfdata.employer_contribution  
                                                 
//                                                   salaryidentified=true;
//                                                   //ageidentefied=true;
//                                         }
//                                       }
//                                     }
//                                 }  
                                    
                                 
                                  
                                      
                                        
                                          
//                             }
//                             else if(pr_years>=3||data.emp_status==1)
//                             {
                              
//                                     if(age<maxage&&ageidentefied==false)
//                                 {
                                   
                                    
//                                   if(amount_to_calculate_cpf <=salary && salaryidentified==false && amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
//                                   {
//                                     console.log("meivanann")
//                                     //   if(amount_to_calculate_cpf!=element.annual_max_amount)
//                                     //   {
//                                        console.log("nandhini record  is not coming",pr_years)
                                     
                                   
                                       
//                                           console.log("3yrdlessthan750",cpfdata)
//                                             employee_contribution_percent=cpfdata.employee_contribution,
//                                             employer_contribution_percent=cpfdata.employer_contribution  
//                                             salaryidentified=true;
//                                             ageidentefied=true;
                                          
//                                   }
//                                   else if(amount_to_calculate_cpf <=salary && salaryidentified==false )
//                                   {
//                                     console.log("nandhini")
//                                       employee_contribution_percent=cpfdata.employee_contribution,
//                                             employer_contribution_percent=cpfdata.employer_contribution  
//                                             console.log("3yrd",cpfdata)
//                                             salaryidentified=true;
//                                             ageidentefied=true;
//                                   }
//                                 }
                             
                                
//                             }
                               
                                
                                                    
                                           
//                     callback();
               
//                 }, function(err)
//                 {

//                 }
//             )
                    
//                     employer_contribution_amount = amount_to_calculate_cpf * (employer_contribution_percent / 100);
//                     if(amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
//                     {
//                         console.log("jhasajsd")
//                         employee_contribution_amount=employee_contribution_percent*(amount_to_calculate_cpf-500)
//                     }
//                     else if(!(amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750))
//                     {
//                         console.log("meivannana")
//                         employee_contribution_amount = amount_to_calculate_cpf * (employee_contribution_percent / 100);
//                     }
//                    console.log("jaskkjsadc",employee_contribution_amount)

//                       ;
                     

                        
//                         var lopAmount = 0;

                      

//                         var sdlsalary=false                
//                         var renumeration=result[index].basic_salary + totalAllowanceAmount + result[index].bonus;
//                         var sdlQuery="select * from hrm_employee_sdl";
//                         var sdldata=await commonFunction.getQueryResults(sdlQuery);
//                          var sdlpercent=0;
//                         async.each(sdldata,function(sdldata,callback)
//                         { 
//                             if(sdldata.type==1)
//                             {
//                                 if( (sdldata.max_salary == null  || sdldata.max_salary == '') && (renumeration > sdldata.min_salary&&sdlsalary==false) ){
//                                     console.log("sdldata",sdldata)
//                                     sdlpayable=sdldata.amount
//                                     sdlsalary=true
//                                    }else if(renumeration > sdldata.min_salary && renumeration <= sdldata.max_salary&&sdlsalary==false){
//                                        console.log("2condition",sdldata)
//                                     sdlpayable=sdldata.amount 
//                                     sdlsalary=true  
//                                    }
                                
//                             }
//                             else if(sdldata.type==2)
                            
//                             {
//                                 if(renumeration > sdldata.min_salary && renumeration <= sdldata.max_salary&&sdlsalary==false)
//                                 {
//                                     sdlpercent=sdldata.amount
//                                     sdlpayable=(renumeration*sdlpercent)/100;
//                                 }
                              
//                             }
                          
                           
                            
//                             callback(); 
//                         },function(err)
//                         {
//                             console.log(err);
//                         }
//                         )
//                         //console.log("sdlpayable",sdlpayable)
                        
                  
                                        
                  
//                         result[index].sdlpayableamount=sdlpayable;
//                         result[index].employee_contribution_amount =   Math.round(employee_contribution_amount);
//                         result[index].employer_contribution_amount =  Math.round(employer_contribution_amount) ;
//                         result[index].gross_salary = result[index].basic_salary + totalAllowanceAmount + result[index].bonus;
//                         result[index].overamount=overTimeAllowance;
                    
//                         if (incometax_data.length > 0) {
//                             let calculated = false;
//                             incometax_data.forEach((taxdata) => {
//                                 if (taxdata.type == 1 && calculated == false) {
//                                     if ((result[index].basic_salary * 12) <= taxdata.income_upto) {
//                                         income_tax_amount = Math.ceil(taxdata.tax_amount / 12);
//                                         calculated = true;
//                                     }
//                                 } else if (calculated == false) {
//                                     income_tax_amount = result[index].basic_salary * (taxdata.tax_amount / 100);
//                                     income_tax_amount = Math.ceil(income_tax_amount);
//                                     calculated = true;
//                                 }
//                             });
//                         }
                        
//                         result[index].claims = 0;
//                         result[index].lop = 0; 
//                         result[index].income_tax_amount = income_tax_amount;
//                         // result[index].net_salary = (result[index].gross_salary - result[index].employee_contribution_amount - lopAmount) + data.bonus + overTimeAllowance - income_tax_amount;
                       
//                         var netSalaryFinal = ( parseInt(result[index].gross_salary) + parseInt(overTimeAllowance)) - ( parseInt(employer_contribution_amount) + parseInt(result[index].employee_contribution_amount)  + parseInt(income_tax_amount)); //parseInt(lopAmount)
                        
//                         var shgtype= data.shg_type;   
//                         var shg_type_name=''
//                         if(shgtype==1)
//                         {
//                             shg_type_name="CDAC"
//                         }
//                         else if(shgtype==2)
//                         {
//                             shg_type_name="ECF"
//                         }
//                         else if(shgtype==3)
//                         {
//                             shg_type_name="SINDA"
//                         }
//                         else if(shgtype==4)
//                         {
//                             shg_type_name="MBMF"
//                         }
//                         var sgh_amountdeducation;
//                         var sgh_query="select * from hrm_employee_shg where type="+shgtype+" ";
                                        
//                         var sghdata=await commonFunction.getQueryResults(sgh_query) 
                       
//                          async.each(sghdata,function(sgh_data,callback)
//                          { 
//                             sgh_amountdeducation=0;

//                             if( (sgh_data.max_salary == null  || sgh_data.max_salary == '') && (result[index].gross_salary > sgh_data.min_salary) ){
//                                 sgh_amountdeducation=sgh_data.amount
//                             }else if(result[index].gross_salary > sgh_data.min_salary && result[index].gross_salary <= sgh_data.max_salary){
//                                 console.log("sgh_amountdeducation",sgh_data)
//                                 sgh_amountdeducation=sgh_data.amount   
//                             }

                             
//                              callback(); 
//                          },function(err)
//                          {
//                              console.log(err);
//                          }
//                          )

//                         result[index].shg_type=shg_type_name    
//                         if(data.shg_contribution!=0)
//                         {
//                             result[index].shg_deucation=sgh_amountdeducation;
//                         }   
//                         else{
//                             result[index].shg_deucation=0;
//                         }     
//                         //console.log('test',result[index].shg_deucation)
                        
//                        var sgh_final=(result[index].shg_deucation)==undefined?0:result[index].shg_deucation;
//                        var finalnet=netSalaryFinal-sgh_final+result[index].sdlpayableamount;  
                       
                         
//                        result[index].self_group_amount = sgh_amountdeducation==undefined?0:sgh_amountdeducation; 
//                         result[index].net_salary = (finalnet > 0) ? finalnet : 0; 
//                         totalSalaryAmount = totalSalaryAmount + parseInt(result[index].gross_salary);
//                         // console.log('Month and Year -------------->', monthtomonth + "-" + yeartoyear)
//                         var monthyear = yeartoyear + "-" + monthtomonth;
//                         var cpf_InsertQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " (company_id,emp_id,ordinary_account,special_account,medisave_account,employer_contribution,employee_contribution,month_year,income_tax,net_salary,gross_salary,lop,overtime_allowance,lop_days,payroll_id,basic_salary,salary,bonus,hra,transport_allowance,food_allowance,phone_allowance,shg_deduction,sdl_payable,shg_type)VALUES ('" + company_id + "','" + data.id + "','" + ordinary_amount + "','" + special_amount + "','" + medisave_amount + "','" + employer_contribution_amount + "','" + employee_contribution_amount + "','" + monthyear + "','" + income_tax_amount + "','" + result[index].net_salary + "','" + result[index].gross_salary + "','" + lopAmount + "','" + overTimeAllowance + "','" + lopDaysForEmployee + "','"+ payroll_id +"','"+ result[index].basic_salary +"','"+ result[index].salary +"','"+ result[index].bonus+"','"+ result[index].hra +"','"+ result[index].transport_allowance  +"','"+ result[index].food_allowance +"','"+ result[index].phone_allowance +"','"+result[index].shg_deucation+"','"+result[index].sdlpayableamount+"','"+shgtype+"')"
                        
//                         if (isPreview == false && payrollGenerated == false) {
//                             var cpfInsertResult = await commonFunction.executeQuery(cpf_InsertQuery);
                             
//                             var updateTotalSalaryExpense = "UPDATE "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " SET total_salary_amount = '"+ totalSalaryAmount +"' WHERE company_id = '"+ company_id +"' AND month = '"+ month +"' AND year = '"+ year +"' AND status = '1'";
//                             var updatePayrollResult = await commonFunction.executeQueryAndRetunResults(updateTotalSalaryExpense);
//                         }
//                         // cpfInsertQuery = cpfInsertQuery + " ('" + company_id + "','" + data.id + "','" + ordinary_amount + "','" + special_amount + "','" + medisave_amount + "','" + employer_contribution_amount + "','" + employee_contribution_amount + "','" + monthyear + "','" + income_tax_amount + "','" + result[index].net_salary + "','" + result[index].gross_salary + "','" + lopAmount + "','" + overTimeAllowance + "','" + lopDaysForEmployee + "','"+ payroll_id +"','"+ result[index].basic_salary +"','"+ result[index].salary +"','"+ result[index].bonus+"','"+ result[index].hra +"','"+ result[index].transport_allowance  +"','"+ result[index].food_allowance +"','"+ result[index].phone_allowance +"')";
//                         // if (isPreview == false && payrollGenerated == false) {
//                         //     var cpfInsertResult = await commonFunction.executeQuery(cpfInsertQuery);
//                         //     console.log("totalsalary",totalSalaryAmount)
                            
//                         //     var updateTotalSalaryExpense = "UPDATE "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " SET total_salary_amount = '"+ totalSalaryAmount +"' WHERE company_id = '"+ company_id +"' AND month = '"+ month +"' AND year = '"+ year +"' AND status = '1'";
//                         //     var updatePayrollResult = await commonFunction.executeQueryAndRetunResults(updateTotalSalaryExpense);
//                         // }
//                     })
                   
//                    // cpfInsertQuery = cpfInsertQuery.substring(0, cpfInsertQuery.length - 1);
//                     // console.log("salarydetails",cpfInsertQuery)
                  
//                     // console.log("inertresult",cpfInsertResult)
//                     // if (isPreview == false && payrollGenerated == false) {
//                     //     var cpfInsertResult = await commonFunction.executeQuery(cpfInsertQuery);
//                     //     console.log("totalsalary",totalSalaryAmount)
                        
//                     //     var updateTotalSalaryExpense = "UPDATE "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " SET total_salary_amount = '"+ totalSalaryAmount +"' WHERE company_id = '"+ company_id +"' AND month = '"+ month +"' AND year = '"+ year +"' AND status = '1'";
//                     //     var updatePayrollResult = await commonFunction.executeQueryAndRetunResults(updateTotalSalaryExpense);
//                     // }
              

                
                  
                 

                    


//                     //Generate xl file
//                     var month_year = yeartoyear+'-'+monthtomonth; 
//                     var month_year_new = monthtomonth+'-'+yeartoyear;
                   
                    
//                     var query = "SELECT es.sdl_payable,es.shg_deduction,um.company_id as company_id,um.emp_id as emp_ref_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.middlename,'') as middlename,IFNULL(ed.lastname,'') as lastname,ed.basic_salary,es.*,IFNULL(ea.allowance,'') as allowances,cp.name as company_name,IFNULL(cp.logo,'') as company_logo FROM " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " es ON es.emp_id = um.id AND es.month_year = '" + month_year + "' INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " ed ON ed.emp_id = es.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = es.emp_id INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " cp ON cp.id = um.company_id WHERE um.company_id ='" + company_id + "' AND um.status = '1'";
//                     var payslipData = await commonFunction.getQueryResults(query);
//                     // console.log('Month & Year', query )
//                     var allowance_type_query = "SELECT * FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE company_id = '" + company_id + "'";
//                     var allowance_types = await commonFunction.getQueryResults(allowance_type_query);
            
//                     var column_header = ["SNO", "Employee ID", "Employee Name", "Basic Pay"];
//                     var column_header_end = ["Employer CPF", "Employee CPF", "Bonus", "Overtime", "Gross Salary", "Net Salary","Shg_deduction","sdl_payable_amount"];
            
//                     var allowance_type_object = {};
//                     if (allowance_types.length > 0) {
//                         allowance_types.forEach(allowance => {
//                             allowance_type_object[allowance.id] = allowance.allowance_name;
//                             column_header.push(allowance.allowance_name);
//                         });
//                     }
//                     column_header = column_header.concat(column_header_end);
            
//                     var wb = XLSX.utils.book_new();
//                     var ws_name = "Payroll Sheet";
//                     var ws_data = [
//                         column_header
//                     ];
            
//                     if (payslipData.length > 0) {
//                         payslipData.forEach((employee, index) => {
//                             var employeeName = employee.firstname + ' ' + employee.middlename + ' ' + employee.lastname;
//                             var emp_ref_id = employee.emp_ref_id;
//                             var basic_salary = employee.basic_salary;
//                             var employer_contribution = employee.employer_contribution;
//                             var employee_contribution = employee.employee_contribution;
//                             var overtime_allowance = employee.overtime_allowance;
//                             var gross_salary = employee.gross_salary;
//                             var net_salary = employee.net_salary;
//                             var shg_deduction=employee.shg_deduction
//                             var sdl_payable=employee.sdl_payable
             
//                             var bonus = 0;
//                             var employeeData = [index + 1, emp_ref_id, employeeName, basic_salary];
            
//                             try {
//                                 if (employee.allowances && employee.allowances.length > 0) {
            
//                                     employee.allowances = phpunserialize(employee.allowances);
//                                     bonus = (employee.allowances['bonus']) ? employee.allowances['bonus'] : 0;
            
//                                     if (allowance_types.length > 0) {
//                                         allowance_types.forEach(allowance => {
            
//                                             if (employee.allowances[allowance.id] != undefined) {
//                                                 employeeData.push(employee.allowances[allowance.id]);
//                                             } else {
//                                                 employeeData.push(0);
//                                             }
//                                         });
//                                     }
//                                 } else {
//                                     if (allowance_types.length > 0) {
//                                         allowance_types.forEach(allowance => {
//                                             employeeData.push(0);
//                                         });
//                                     }
//                                 }
//                             } catch (ex) {
//                                 console.log('Parsing allowance object error...', ex);
//                                 if (allowance_types.length > 0) {
//                                     allowance_types.forEach(allowance => {
//                                         employeeData.push(0);
//                                     });
//                                 }
//                             }
                       
//                             employeeData = employeeData.concat([employer_contribution, employee_contribution, bonus, overtime_allowance, gross_salary, net_salary,shg_deduction,sdl_payable]);
//                             ws_data.push(employeeData);
//                         });
            
//                         var ws = XLSX.utils.aoa_to_sheet(ws_data);
//                         XLSX.utils.book_append_sheet(wb, ws, ws_name);
//                         XLSX.writeFile(wb, './public/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx');
            
//                         // var filePath = ip.address() + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
//                         var filePath = commonConfig.SERVER_URL_STATIC + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
             
//                         var monthquery = "UPDATE " + tableConfig.HRM_PAYROLL_FOR_MONTH + " SET payroll_file_path = '"+filePath+"' WHERE year = '"+ yeartoyear +"' AND month = '"+ monthtomonth +"' ";
//                     //    console.log("Monthtoyear query", monthquery)
//                         sql.query(monthquery, function (err, approveResults) {
//                             if (err) {
//                                 console.log(err);
//                                 deferred.resolve({ status: 0, message: "Failed to approve payroll" });
//                             } else {
                               
//                                 deferred.resolve({ status: 1, message: "Employee payroll details", list: result, alreadyexist: alreadygenerated  });
//                             }
//                         }); 
            
//                     } else {
//                         deferred.resolve({ status: 0, message: "No data found to generate payslip" });
//                     }
 
//                 } else {
//                     deferred.resolve({ status: 0, message: "No Details found" });
//                 }
//             }
            
//         });
//         return deferred.promise;
//     },
//     generatePayrolltest: async (company_id, fromDate = '', toDate = '', isPreview = false) => {
//         var deferred = q.defer();
//        // var cpf_query = "SELECT * from " + tableConfig.HRM_EMPLOYEE_CPF;
//       var cpf_query = "SELECT * from hrm_cpf_regular_rates";
//       var cpf_data = await commonFunction.getQueryResults(cpf_query);
//         var totalSalaryAmount = 0;
//         var regular_rates=[];
     
//         var totalNumberOfDaysPerMonth = moment(toDate, "YYYY-MM").daysInMonth();
//         var month_year = moment(toDate).format('YYYY-MM');

//         var month = moment(toDate).format('MM');
//         var year = moment(toDate).format('YYYY');
//         var monthtomonth = month;
//         var yeartoyear = year;
//         var alreadygenerated = 0;
//         var ifPayrollGenerated = "SELECT count(*) as count FROM " + tableConfig.HRM_PAYROLL_FOR_MONTH + " WHERE company_id = '"+ company_id +"' AND month = '"+ monthtomonth +"' and  year = '"+ yeartoyear +"' and ( status = 1 or status = 2) ";
//         var ifGenerated = await commonFunction.getQueryResults(ifPayrollGenerated);
//         console.log('generate----------->', ifGenerated[0].count)
//         if(ifGenerated[0].count > 0){
//             alreadygenerated = 1;
//         }
//         var checkPayrollGenerated = "SELECT count(*) as count FROM " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " WHERE company_id = '"+ company_id +"' AND month_year = '"+ month_year +"'";
//         var isPayrollGenerated = await commonFunction.getQueryResults(checkPayrollGenerated);
//         var payrollGenerated = false;

//         if(isPayrollGenerated.length > 0) {
//             payrollGenerated = (isPayrollGenerated[0].count > 0)? true : false; 
//         }

//         if (isPreview == false && payrollGenerated == false) {
//            var addpayrollForMonthQuery = "INSERT INTO "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " (company_id,month,year,payroll_file_path) VALUES ('"+ company_id +"','"+ month +"','"+ year +"','')";
//            var addPayrollResult = await commonFunction.executeQueryAndRetunResults(addpayrollForMonthQuery);
//            var payroll_id = 0;

//            if(addPayrollResult.insertId != undefined && addPayrollResult.insertId != null) {
//             payroll_id = addPayrollResult.insertId;
//            }
//         }

//         var incometax_query = "SELECT * from " + tableConfig.HRM_INCOMETAX;
//         var incometax_data = await commonFunction.getQueryResults(incometax_query);

//         var leaveTypeQuery = "SELECT * FROM " + tableConfig.HRM_LEAVE_TYPE + " WHERE status = '1'";
//         var leaveType = await commonFunction.getQueryResults(leaveTypeQuery);
//         var cpg_age_object = {};
      
//         var numberOfWorkingDays = await commonFunction.getBusinessDatesCount(fromDate, toDate);
//         var holidayQuery = "SELECT from_date,to_date FROM " + tableConfig.HRM_HOLIDAYS + " WHERE company_id = '" + company_id + "' AND ((from_date BETWEEN '" + fromDate + "' AND '" + toDate + "') OR (to_date BETWEEN '" + fromDate + "' AND '" + toDate + "'))";
//         var holidayList = await commonFunction.getQueryResults(holidayQuery);

//         var approvedLeaveQuery = "SELECT um.id as employ_id,lr.from_date,lr.to_date FROM " + tableConfig.HRM_USER_MASTER + " as um INNER JOIN " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " as lr ON lr.emp_id = um.id  AND ((lr.from_date BETWEEN '" + fromDate + "' AND '" + toDate + "') or (lr.from_date < '" + fromDate + "' AND lr.to_date > '" + toDate + "')) AND lr.status = '2' WHERE um.company_id = '" + company_id + "'";
//         var approvedLeaveList = await commonFunction.getQueryResults(approvedLeaveQuery);

//         var approved_leave_object = {};
//         if (approvedLeaveList.length > 0) {
//             approvedLeaveList.forEach((leave, i) => {
//                 let fdate = moment(leave.from_date).format('YYYY-MM-DD');
//                 let edate = moment(leave.to_date).format('YYYY-MM-DD');
//                 let to_date = moment(toDate).format('YYYY-MM-DD');
//                 var from_date = moment(fromDate).format('YYYY-MM-DD');
//                 approvedLeaveList[i].approved_leaves = 0;

//                 if (edate < to_date) {
//                     approvedLeaveList[i].approved_leaves = approvedLeaveList[i].approved_leaves + moment(edate).diff(fdate, 'days') + 1;
//                 } else {
//                     approvedLeaveList[i].approved_leaves = approvedLeaveList[i].approved_leaves + moment(to_date).diff(fdate, 'days') + 1;
//                 }

//                 if (approved_leave_object[leave.employ_id] == undefined) {
//                     approved_leave_object[leave.employ_id] = 0;
//                 }
//                 approved_leave_object[leave.employ_id] = approved_leave_object[leave.employ_id] + approvedLeaveList[i].approved_leaves;
//             });
//         }

//         var numberOfHolidays = 0;

//         if (holidayList.length > 0) {
//             holidayList.forEach(holiday => {
//                 var fdate = moment(holiday.from_date).format('YYYY-MM-DD');
//                 var edate = moment(holiday.to_date).format('YYYY-MM-DD');
//                 var to_date = moment(toDate).format('YYYY-MM-DD');
//                 var from_date = moment(fromDate).format('YYYY-MM-DD');

//                 if (edate < to_date && from_date < fdate) {
//                     var count = 0;
//                     let holidayStartDate = new Date(fdate);
//                     let holidayEndDate = new Date(edate);

//                     var curDate = holidayStartDate;
//                     while (curDate <= holidayEndDate) {
//                         var dayOfWeek = curDate.getDay();
//                         if (((dayOfWeek == 6) || (dayOfWeek == 0)))
//                             count++;
//                         curDate.setDate(curDate.getDate() + 1);
//                     }
//                     numberOfHolidays = numberOfHolidays + moment(edate).diff(fdate, 'days') + 1;
//                     numberOfHolidays = numberOfHolidays - count;
//                 } else if (fdate < from_date) {

//                     var count = 0;
//                     let holidayStartDate = new Date(from_date);
//                     let holidayEndDate = new Date(edate);

//                     var curDate = holidayStartDate;
//                     while (curDate <= holidayEndDate) {
//                         var dayOfWeek = curDate.getDay();
//                         if (((dayOfWeek == 6) || (dayOfWeek == 0)))
//                             count++;
//                         curDate.setDate(curDate.getDate() + 1);
//                     }
//                     numberOfHolidays = numberOfHolidays + moment(edate).diff(from_date, 'days') + 1;
//                     numberOfHolidays = numberOfHolidays - count;
//                 } else {
//                     var count = 0;
//                     let holidayStartDate = new Date(fdate);
//                     let holidayEndDate = new Date(to_date);

//                     var curDate = holidayStartDate;
//                     while (curDate <= holidayEndDate) {
//                         var dayOfWeek = curDate.getDay();
//                         if (((dayOfWeek == 6) || (dayOfWeek == 0)))
//                             count++;
//                         curDate.setDate(curDate.getDate() + 1);
//                     }

//                     numberOfHolidays = numberOfHolidays + moment(to_date).diff(fdate, 'days') + 1;
//                     numberOfHolidays = numberOfHolidays - count;
//                 }
//             });
//         }

//         numberOfWorkingDays = numberOfWorkingDays - numberOfHolidays;
        

//         // var query = "SELECT visa_status as emp_status,pr_date,pr_status,COUNT(att.emp_id) as present_days,IFNULL(SUM(overtime),0) as overtime,um.id,um.emp_id as employee_id,emp.birthday,emp.firstname,emp.middlename,emp.lastname,emp.basic_salary,emp.salary,emp.email,ea.allowance as allowances,FN_PAYROLL_ACTION(um.id) as action_status from " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp ON emp.emp_id = um.id AND um.status = '1' LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = emp.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " as att ON att.emp_id = emp.emp_id and att.check_in BETWEEN '" + fromDate + "'  AND '" + toDate + "' where um.company_id = '" + company_id + "' GROUP BY emp.emp_id";
//         var query = "SELECT emp.native,emp.religion, FN_GET_SHG_DEDUCT_AMT(native, religion) as shg_type, visa_status as emp_status,pr_date,pr_status,COUNT(att.emp_id) as present_days,IFNULL(SUM(overtime),0) as overtime,um.id,um.emp_id as employee_id,emp.birthday,emp.firstname,emp.middlename,emp.lastname,emp.basic_salary,emp.salary,emp.email,ea.allowance as allowances,FN_PAYROLL_ACTION(um.id) as action_status from " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp ON emp.emp_id = um.id AND um.status = '1' LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = emp.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " as att ON att.emp_id = emp.emp_id and att.check_in BETWEEN '" + fromDate + "'  AND '" + toDate + "' where um.company_id = '" + company_id + "' GROUP BY emp.emp_id";

//         sql.query(query, async function (err, result) {
//             if (err) {
//                 console.log(err);
//                 deferred.resolve({ status: 0, message: "Failed to get employee details" });
//             }
//             else {

//                 if (result.length > 0) {
//                     var amount_to_calculate_cpf = 0;
//                     var cpfInsertQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " (company_id,emp_id,ordinary_account,special_account,medisave_account,employer_contribution,employee_contribution,month_year,income_tax,net_salary,gross_salary,lop,overtime_allowance,lop_days,payroll_id,basic_salary,salary,bonus,hra,transport_allowance,food_allowance,phone_allowance) VALUES ";

//                     result.forEach(async (data, index) => {
//                         var employer_contribution_percent = 0;
//                         var employee_contribution_percent = 0;
//                         var income_tax_amount = 0;
//                         var totalAllowanceAmount = 0;
//                         result[index].total_allowance = 0;

//                         data.bonus = 0;
//                         result[index].hra = 0;
//                         result[index].transport_allowance = 0;
//                         result[index].food_allowance = 0;
//                         result[index].phone_allowance = 0;

//                         try {
//                             if (data.allowances && data.allowances.length > 0) {
//                                 data.allowances = phpunserialize(data.allowances);
//                                 Object.keys(data.allowances).forEach(function (key) {
//                                     var val = data.allowances[key];
//                                     if (key == 'bonus') {
//                                         data.bonus = parseInt(val);
//                                     } else {
//                                         totalAllowanceAmount = parseInt(totalAllowanceAmount) + parseInt(val);
//                                         if(key == '1') {
//                                             result[index].hra = parseInt(val);
//                                         } else if (key == '2') {
//                                             result[index].transport_allowance = parseInt(val);
//                                         } else if(key == '3') {
//                                             result[index].food_allowance = parseInt(val);
//                                         } else if(key == '4'){
//                                             result[index].phone_allowance = parseInt(val);
//                                         }
//                                     } 
//                                     result[index].total_allowance = parseInt(totalAllowanceAmount) + parseInt(result[index].bonus)
//                                 });
                                
//                                 delete data.allowances;
//                             }
//                         } catch (ex) {
//                             console.log('Parsing allowance object error...', ex);
//                         }

//                         var dob = (data.birthday) ? data.birthday : '';
//                         var emp_primary_ID = (data.id) ? data.id : 0;
//                         var present_days = data.present_days;
//                         var approved_leaves = approved_leave_object[emp_primary_ID] ? approved_leave_object[emp_primary_ID] : 0;
//                         present_days = present_days + approved_leaves;

//                         var lopDaysForEmployee = numberOfWorkingDays - present_days;
//                         if (lopDaysForEmployee < 0) {
//                             lopDaysForEmployee = 0;
//                         }

//                         var age = 0;
//                         var ordinary_amount = 0;
//                         var special_amount = 0;
//                         var medisave_amount = 0;
//                         var employer_contribution_amount = 0;
//                         var employee_contribution_amount = 0;
//                         var overTimeAllowance = 0;
//                         var employeeOverTime=0;
//                         employeeOverTime = (data.overtime!=0) ? parseInt(data.overtime / 60) : 0;
                      

//                         overTimeAllowance =Math.round( (result[index].basic_salary / (totalNumberOfDaysPerMonth * 8)) * employeeOverTime);
//                         console.log("overtimecal",overTimeAllowance)
//                         // var ordinary_acccount_percent = 0;
//                         // var special_account_percent = 0;
//                         // var medisave_account_percent = 0;
//                         var ordinary_wage=data.basic_salary+overTimeAllowance;
//                         var basic_salary=0
//                        if(ordinary_wage >= 6000)
//                        {
//                            console.log("hjvdfsjhsdf")
//                            basic_salary=6000;
//                        }
//                        if(ordinary_wage< 6000){
//                            console.log("sdasdas")
//                            basic_salary=ordinary_wage;
//                        }
//                        console.log("basic_salary",basic_salary)
                    
//                         amount_to_calculate_cpf = basic_salary + data.bonus;
                      
//                         if (dob != '') {
//                             age = moment().diff(dob, 'years', false);
//                         }

//                         age = parseInt(age);
//                         var minAge = 0;

// var total_wages=data.basic_salary+data.bonus+data.overtime;
// var OW=data.basic_salary+data.overtime;
// var AW=data.bonus;

// var year=(data.pr_date!='NaN')?data.pr_date:'';
// console.log("pr_datew",moment().format("YYYY"))
//                     var pr_years= (data.pr_date!=null)?moment().diff(year, 'years'):0;
//                   console.log("pr_yeays",pr_years)
                 
               
//                 var salary=0;
//                 var pr_emp_year=0;
//                 var pr_emp_status=0;
//                 var emptype=0;
//                 var maxage=0;
//                 var ageidentefied=false;
//                 var salaryidentified=false;
//                 async.each(cpf_data,function(cpfdata,callback)
//                 {
//                     salary=cpfdata.max_salary;
//                         pr_emp_year=parseInt(cpfdata.pr_year);
//                        pr_emp_visa_status=parseInt(cpfdata.emp_visa_status)
//                         pr_emp_status=parseInt(cpfdata.pr_status);
//                         emptype=parseInt(cpfdata.emp_type);
//                         maxage=parseInt(cpfdata.max_age);
//                         if(pr_emp_visa_status==data.emp_status && data.emp_status!=0&&pr_emp_visa_status!=1&&data.emp_status!=1)
//                             {
                                

//                                 if(pr_emp_year==pr_years||pr_years==0)
//                                 {
                                   
//                                     if(data.pr_status==pr_emp_status&&data.pr_status!=0)
//                                     {
//                                         if(age<maxage&&ageidentefied==false)
//                                       {
//                                         if(amount_to_calculate_cpf <=salary && salaryidentified==false && amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
//                                         {
                                        
                                             
//                                            console.log("asbbjhdsg",)
//                                           salaryidentified=true;
//                                               ageidentefied=true;
                                            
//                                                   employee_contribution_percent=cpfdata.employee_contribution,
//                                                   employer_contribution_percent=cpfdata.employer_contribution  
                                                
//                                         }
//                                         else if(amount_to_calculate_cpf <=salary && salaryidentified==false )
//                                         {
//                                             employee_contribution_percent=cpfdata.employee_contribution,
//                                                   employer_contribution_percent=cpfdata.employer_contribution  
                                                 
//                                                   salaryidentified=true;
//                                                   //ageidentefied=true;
//                                         }
//                                       }
//                                     }
//                                 }  
                                    
                                 
                                  
                                      
                                        
                                          
//                             }
//                             else if(pr_years>=3||data.emp_status==1)
//                             {
                              
//                                     if(age<maxage&&ageidentefied==false)
//                                 {
                                   
                                    
//                                   if(amount_to_calculate_cpf <=salary && salaryidentified==false && amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
//                                   {
//                                     console.log("meivanann")
//                                     //   if(amount_to_calculate_cpf!=element.annual_max_amount)
//                                     //   {
//                                        console.log("nandhini record  is not coming",pr_years)
                                     
                                   
                                       
//                                           console.log("3yrdlessthan750",cpfdata)
//                                             employee_contribution_percent=cpfdata.employee_contribution,
//                                             employer_contribution_percent=cpfdata.employer_contribution  
//                                             salaryidentified=true;
//                                             ageidentefied=true;
                                          
//                                   }
//                                   else if(amount_to_calculate_cpf <=salary && salaryidentified==false )
//                                   {
//                                     console.log("nandhini")
//                                       employee_contribution_percent=cpfdata.employee_contribution,
//                                             employer_contribution_percent=cpfdata.employer_contribution  
//                                             console.log("3yrd",cpfdata)
//                                             salaryidentified=true;
//                                             ageidentefied=true;
//                                   }
//                                 }
                             
                                
//                             }
                               
                                
                                                    
                                           
//                     callback();
               
//                 }, function(err)
//                 {

//                 }
//             )
                    
//                     employer_contribution_amount = amount_to_calculate_cpf * (employer_contribution_percent / 100);
//                     if(amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750)
//                     {
//                         console.log("jhasajsd")
//                         employee_contribution_amount=employee_contribution_percent*(amount_to_calculate_cpf-500)
//                     }
//                     else if(!(amount_to_calculate_cpf >500&&amount_to_calculate_cpf<=750))
//                     {
//                         console.log("meivannana")
//                         employee_contribution_amount = amount_to_calculate_cpf * (employee_contribution_percent / 100);
//                     }
//                    console.log("jaskkjsadc",employee_contribution_amount)

//                       ;
                     

                        
//                         var lopAmount = 0;

                      

                      

                        
                   
//                         result[index].employee_contribution_amount =   Math.round(employee_contribution_amount);
//                         result[index].employer_contribution_amount =  Math.round(employer_contribution_amount) ;
//                         result[index].gross_salary = result[index].basic_salary + totalAllowanceAmount + result[index].bonus;
//                         result[index].overamount=overTimeAllowance;

//                         if (incometax_data.length > 0) {
//                             let calculated = false;
//                             incometax_data.forEach((taxdata) => {
//                                 if (taxdata.type == 1 && calculated == false) {
//                                     if ((result[index].basic_salary * 12) <= taxdata.income_upto) {
//                                         income_tax_amount = Math.ceil(taxdata.tax_amount / 12);
//                                         calculated = true;
//                                     }
//                                 } else if (calculated == false) {
//                                     income_tax_amount = result[index].basic_salary * (taxdata.tax_amount / 100);
//                                     income_tax_amount = Math.ceil(income_tax_amount);
//                                     calculated = true;
//                                 }
//                             });
//                         }
                        
//                         result[index].claims = 0;
//                         result[index].lop = 0; 
//                         result[index].income_tax_amount = income_tax_amount;
//                         // result[index].net_salary = (result[index].gross_salary - result[index].employee_contribution_amount - lopAmount) + data.bonus + overTimeAllowance - income_tax_amount;
//                         // var netSalaryFinal = ( parseInt(result[index].gross_salary) + parseInt(overTimeAllowance)) - ( parseInt(employer_contribution_amount) + parseInt(result[index].employee_contribution_amount)  + parseInt(income_tax_amount)); //parseInt(lopAmount)
                        
                        
//                          var sgh_amountdeducation=0;
//                          var netSalaryFinal = ( parseInt(result[index].gross_salary) + parseInt(overTimeAllowance)) - ( parseInt(employer_contribution_amount) + parseInt(result[index].employee_contribution_amount)  + parseInt(income_tax_amount)); //parseInt(lopAmount)
                         
//                          var shgtype= data.shg_type;
 
//                             var sgh_query="select * from hrm_employee_shg where type="+shgtype+"";
                            
//                             var sghdata=await commonFunction.getQueryResults(sgh_query)
                            
//                             async.each(sghdata,function(sghdata,callback)
//                             { 
                                
//                                     if( sghdata.max_salary != null && (result[index].gross_salary > sghdata.min_salary && result[index].gross_salary <= sghdata.min_salary ))
//                                     {  
//                                         sgh_amountdeducation=sghdata.amount 
//                                     }else if( sghdata.max_salary == null  && (result[index].gross_salary > sghdata.min_salary) ){
//                                         sgh_amountdeducation=sghdata.amount
//                                     }
                                    
                                
//                                 callback(); 
//                             },function(err)
//                             {
//                                 console.log(err);
//                             }
//                             )
//                             console.log("sgh_amountdeducation",sgh_amountdeducation)
//                             result[index].shg_deucation=sgh_amountdeducation;
//                             var finalnet=netSalaryFinal-sgh_amountdeducation;    
//                             result[index].net_salary_shg = (finalnet !=undefined) ? finalnet : 0; 

                            
//                             result[index].net_salary = (netSalaryFinal > 0) ? netSalaryFinal : 0; 
//                             totalSalaryAmount = totalSalaryAmount + parseInt(result[index].gross_salary);
//                             // console.log('Month and Year -------------->', monthtomonth + "-" + yeartoyear)
//                             var monthyear = yeartoyear + "-" + monthtomonth;
//                             cpfInsertQuery = cpfInsertQuery + " ('" + company_id + "','" + data.id + "','" + ordinary_amount + "','" + special_amount + "','" + medisave_amount + "','" + employer_contribution_amount + "','" + employee_contribution_amount + "','" + monthyear + "','" + income_tax_amount + "','" + result[index].net_salary + "','" + result[index].gross_salary + "','" + lopAmount + "','" + overTimeAllowance + "','" + lopDaysForEmployee + "','"+ payroll_id +"','"+ result[index].basic_salary +"','"+ result[index].salary +"','"+ result[index].bonus+"','"+ result[index].hra +"','"+ result[index].transport_allowance  +"','"+ result[index].food_allowance +"','"+ result[index].phone_allowance +"'),";
//                     })

//                     console.log('cpfInsertQuery ----------------------->', cpfInsertQuery)
              

//                     cpfInsertQuery = cpfInsertQuery.substring(0, cpfInsertQuery.length - 1);
//                     if (isPreview == false && payrollGenerated == false) {
//                         console.log("totalsalary",totalSalaryAmount)
//                         var cpfInsertResult = await commonFunction.executeQuery(cpfInsertQuery);
//                         var updateTotalSalaryExpense = "UPDATE "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " SET total_salary_amount = '"+ totalSalaryAmount +"' WHERE company_id = '"+ company_id +"' AND month = '"+ month +"' AND year = '"+ year +"' AND status = '1'";
//                         var updatePayrollResult = await commonFunction.executeQueryAndRetunResults(updateTotalSalaryExpense);
//                     }

                    


//                     //Generate xl file
//                     var month_year = yeartoyear+'-'+monthtomonth; 
//                     var month_year_new = monthtomonth+'-'+yeartoyear;
                   
                    
//                     var query = "SELECT um.company_id as company_id,um.emp_id as emp_ref_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.middlename,'') as middlename,IFNULL(ed.lastname,'') as lastname,ed.basic_salary,es.*,IFNULL(ea.allowance,'') as allowances,cp.name as company_name,IFNULL(cp.logo,'') as company_logo FROM " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " es ON es.emp_id = um.id AND es.month_year = '" + month_year + "' INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " ed ON ed.emp_id = es.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = es.emp_id INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " cp ON cp.id = um.company_id WHERE um.company_id ='" + company_id + "' AND um.status = '1'";
//                     var payslipData = await commonFunction.getQueryResults(query);
//                     // console.log('Month & Year', query )
//                     var allowance_type_query = "SELECT * FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE company_id = '" + company_id + "'";
//                     var allowance_types = await commonFunction.getQueryResults(allowance_type_query);
            
//                     var column_header = ["SNO", "Employee ID", "Employee Name", "Basic Pay"];
//                     var column_header_end = ["Employer CPF", "Employee CPF", "Bonus", "Overtime", "Gross Salary", "Net Salary"];
            
//                     var allowance_type_object = {};
//                     if (allowance_types.length > 0) {
//                         allowance_types.forEach(allowance => {
//                             allowance_type_object[allowance.id] = allowance.allowance_name;
//                             column_header.push(allowance.allowance_name);
//                         });
//                     }
//                     column_header = column_header.concat(column_header_end);
            
//                     var wb = XLSX.utils.book_new();
//                     var ws_name = "Payroll Sheet";
//                     var ws_data = [
//                         column_header
//                     ];
            
//                     if (payslipData.length > 0) {
//                         payslipData.forEach((employee, index) => {
//                             var employeeName = employee.firstname + ' ' + employee.middlename + ' ' + employee.lastname;
//                             var emp_ref_id = employee.emp_ref_id;
//                             var basic_salary = employee.basic_salary;
//                             var employer_contribution = employee.employer_contribution;
//                             var employee_contribution = employee.employee_contribution;
//                             var overtime_allowance = employee.overtime_allowance;
//                             var gross_salary = employee.gross_salary;
//                             var net_salary = employee.net_salary;
            
//                             var bonus = 0;
//                             var employeeData = [index + 1, emp_ref_id, employeeName, basic_salary];
            
//                             try {
//                                 if (employee.allowances && employee.allowances.length > 0) {
            
//                                     employee.allowances = phpunserialize(employee.allowances);
//                                     bonus = (employee.allowances['bonus']) ? employee.allowances['bonus'] : 0;
            
//                                     if (allowance_types.length > 0) {
//                                         allowance_types.forEach(allowance => {
            
//                                             if (employee.allowances[allowance.id] != undefined) {
//                                                 employeeData.push(employee.allowances[allowance.id]);
//                                             } else {
//                                                 employeeData.push(0);
//                                             }
//                                         });
//                                     }
//                                 } else {
//                                     if (allowance_types.length > 0) {
//                                         allowance_types.forEach(allowance => {
//                                             employeeData.push(0);
//                                         });
//                                     }
//                                 }
//                             } catch (ex) {
//                                 console.log('Parsing allowance object error...', ex);
//                                 if (allowance_types.length > 0) {
//                                     allowance_types.forEach(allowance => {
//                                         employeeData.push(0);
//                                     });
//                                 }
//                             }
//                             employeeData = employeeData.concat([employer_contribution, employee_contribution, bonus, overtime_allowance, gross_salary, net_salary]);
//                             ws_data.push(employeeData);
//                         });
            
//                         var ws = XLSX.utils.aoa_to_sheet(ws_data);
//                         XLSX.utils.book_append_sheet(wb, ws, ws_name);
//                         XLSX.writeFile(wb, './public/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx');
            
//                         // var filePath = ip.address() + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
//                         var filePath = commonConfig.SERVER_URL_STATIC + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
             
//                         var monthquery = "UPDATE " + tableConfig.HRM_PAYROLL_FOR_MONTH + " SET payroll_file_path = '"+filePath+"' WHERE year = '"+ yeartoyear +"' AND month = '"+ monthtomonth +"' ";
//                     //    console.log("Monthtoyear query", monthquery)
//                         sql.query(monthquery, function (err, approveResults) {
//                             if (err) {
//                                 console.log(err);
//                                 deferred.resolve({ status: 0, message: "Failed to approve payroll" });
//                             } else {
                               
//                                 deferred.resolve({ status: 1, message: "Employee payroll details", list: result, alreadyexist: alreadygenerated  });
//                             }
//                         }); 
            
//                     } else {
//                         deferred.resolve({ status: 0, message: "No data found to generate payslip" });
//                     }
 
//                 } else {
//                     deferred.resolve({ status: 0, message: "No Details found" });
//                 }
//             }
            
//         });
//         return deferred.promise;
//     },
    generateLevyStatement: async (company_id, fromDate = '', toDate = '', isPreview = false) => {
        var deferred = q.defer();
        var query = "SELECT com.tier1,com.tier2,com.tier3,com.sector_type,um.id,um.emp_id as employee_id,emp.firstname,emp.middlename,emp.lastname,emp.basic_salary,emp.salary,emp.visa_status as visa_status,emp.wp_skill as wp_skill,emp.tier as tier from " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp ON emp.emp_id = um.id AND um.status = '1' INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " as com ON com.id = um.company_id where um.company_id = '" + company_id + "' and (emp.visa_status=3 || emp.visa_status=4) order by emp.tier asc";
        console.log('query', query)
        sql.query(query, function (err, levystatement) {
            console.log("err", query)
            if (err) {
                console.log(err)
                deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
            } else {
                if (levystatement.length > 0) {
                    var response = [];
                    var totalamounts = [];
                    var tier1total=0;
                    var tier2total=0;
                    var tier3total=0;
                    
                    levystatement.forEach((data, index) => {
                        if(data.visa_status==3)
                        {
                            visa_status='S Pass';
                        }
                        if(data.visa_status==4)
                        {
                            visa_status='Work Permit';
                        }

                        if(data.sector_type==1)
                        {
                            sector_type='Service';
                        }
                        if(data.sector_type==2)
                        {
                            sector_type='Manufacturing';
                        }
                        if(data.sector_type==3)
                        {
                            sector_type='Construction';
                        }
                        if(data.sector_type==4)
                        {
                            sector_type='Process';
                        }
                        if(data.sector_type==5)
                        {
                            sector_type='Marine Shipyard';
                        }

                        if(data.wp_skill==1)
                        {
                            wp_skill='Higher Skilled';
                        }
                        else if(data.wp_skill==2)
                        {
                            wp_skill='Basic Skilled';
                        }
                        else
                        {
                            wp_skill='-';
                        }

                        if(data.tier==1)
                        {
                            emp_tier='Basic Tier/Tier 1';
                        }
                        else if(data.tier==2)
                        {
                            emp_tier='Tier 2';
                        }
                       else if(data.tier==3)
                        {
                            emp_tier='Tier 3';
                        }
                        else
                        {
                            emp_tier='-';
                        }

                        levyamount=0;
                        //Levy Amount display
                        //S Pass
                        (data.visa_status==3 && data.tier==1) ? levyamount='330' : '0';
                        
                        (data.visa_status==3 && data.tier==2) ? levyamount='650' : '0';
                       

                        //Wp pass Service Sector Tier1
                        (data.sector_type==1 && data.visa_status==4 && data.tier==1 && data.wp_skill==1) ? levyamount='300' : '0';
                        (data.sector_type==1 && data.visa_status==4 && data.tier==1 && data.wp_skill==2) ? levyamount='450' : '0';

                        //Wp pass Service Sector Tier2
                        (data.sector_type==1 && data.visa_status==4 && data.tier==2 && data.wp_skill==1) ? levyamount='400' : '0';
                        (data.sector_type==1 && data.visa_status==4 && data.tier==2 && data.wp_skill==2) ? levyamount='600' : '0';

                        //Wp pass Service Sector Tier3
                        (data.sector_type==1 && data.visa_status==4 && data.tier==3 && data.wp_skill==1) ? levyamount='600' : '0';
                        (data.sector_type==1 && data.visa_status==4 && data.tier==3 && data.wp_skill==2) ? levyamount='800' : '0';

                        //Wp pass Manufacturing Sector Tier1
                        (data.sector_type==2 && data.visa_status==4 && data.tier==1 && data.wp_skill==1) ? levyamount='250' : '0';
                        (data.sector_type==2 && data.visa_status==4 && data.tier==1 && data.wp_skill==2) ? levyamount='370' : '0';

                        //Wp pass Manufacturing Sector Tier2
                        (data.sector_type==2 && data.visa_status==4 && data.tier==2 && data.wp_skill==1) ? levyamount='350' : '0';
                        (data.sector_type==2 && data.visa_status==4 && data.tier==2 && data.wp_skill==2) ? levyamount='470' : '0';

                        //Wp pass Manufacturing Sector Tier3
                        (data.sector_type==2 && data.visa_status==4 && data.tier==3 && data.wp_skill==1) ? levyamount='550' : '0';
                        (data.sector_type==2 && data.visa_status==4 && data.tier==3 && data.wp_skill==2) ? levyamount='650' : '0';

                        //Wp pass Marine Shipyard Sector
                        (data.sector_type==2 && data.visa_status==4 &&  data.wp_skill==1) ? levyamount='300' : '0';
                        (data.sector_type==2 && data.visa_status==4 &&  data.wp_skill==2) ? levyamount='400' : '0';
                        
                        
                        //Tier1 Calculation
                        var tier1loop=0;
                        var tier2loop=0;
                        var tier3loop=0;
                        (data.tier==1 && data.visa_status==3) ?  tier1loop = 330 : 0;
                        
                        (data.tier==2 && data.visa_status==3) ? tier2loop = 650 : 0 ;


                         //Wp pass Service Sector Tier1
                         (data.sector_type==1 && data.visa_status==4 && data.tier==1 && data.wp_skill==1) ? tier1loop=300 : '0';
                         (data.sector_type==1 && data.visa_status==4 && data.tier==1 && data.wp_skill==2) ? tier1loop=450 : '0';
 
                         //Wp pass Service Sector Tier2
                         (data.sector_type==1 && data.visa_status==4 && data.tier==2 && data.wp_skill==1) ? tier2loop=400 : '0';
                         (data.sector_type==1 && data.visa_status==4 && data.tier==2 && data.wp_skill==2) ? tier2loop=600 : '0';
 
                         //Wp pass Service Sector Tier3
                         (data.sector_type==1 && data.visa_status==4 && data.tier==3 && data.wp_skill==1) ? tier3loop=600 : '0';
                         (data.sector_type==1 && data.visa_status==4 && data.tier==3 && data.wp_skill==2) ? tier3loop=800 : '0';
 
                         //Wp pass Manufacturing Sector Tier1
                         (data.sector_type==2 && data.visa_status==4 && data.tier==1 && data.wp_skill==1) ? tier1loop=250 : '0';
                         (data.sector_type==2 && data.visa_status==4 && data.tier==1 && data.wp_skill==2) ? tier1loop=370 : '0';
 
                         //Wp pass Manufacturing Sector Tier2
                         (data.sector_type==2 && data.visa_status==4 && data.tier==2 && data.wp_skill==1) ? tier2loop=350 : '0';
                         (data.sector_type==2 && data.visa_status==4 && data.tier==2 && data.wp_skill==2) ? tier2loop=470 : '0';
 
                         //Wp pass Manufacturing Sector Tier3
                         (data.sector_type==2 && data.visa_status==4 && data.tier==3 && data.wp_skill==1) ? tier3loop=550 : '0';
                         (data.sector_type==2 && data.visa_status==4 && data.tier==3 && data.wp_skill==2) ? tier3loop=650 : '0';
 
                         
                        
                        tier1total +=tier1loop;
                        tier2total +=tier2loop;
                        tier3total +=tier3loop;
                        
                        response.push({
                            firstname: data.firstname +' '+data.lastname,
                            employee_id: data.employee_id,
                            sector_type: sector_type,
                            visa_status: visa_status,
                            wp_skill: wp_skill,
                            emp_tier: emp_tier,
                            levy_amount: levyamount,
                        });
                    });
                    //console.log('valuetot',tier1total)
                    var tottier1query = "SELECT sum(case when tier = 1 then 1 else 0 end)as tottier1count,sum(case when tier = 2 then 1 else 0 end) AS tottier2count,sum(case when tier = 3 then 1 else 0 end) AS tottier3count from " + tableConfig.HRM_EMPLOYEE_DETAILS + "  ";
                    console.log('ass',tottier1query)
                    console.log('query', query)
                    sql.query(tottier1query, function (err, tottier1res) {
                        console.log("err", query)
                        if (err) {
                            console.log(err)
                            deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                        } else {
                            var levytotal=0;
                            var levytotal=tier1total+tier2total+tier3total;
                            totalamounts.push({
                                tier1total:tier1total,
                                tier2total:tier2total,
                                tier3total:tier3total,
                                totallevybill:levytotal, 
                                tottier1count:tottier1res[0].tottier1count,
                                tottier2count:tottier1res[0].tottier2count,
                                tottier3count:tottier1res[0].tottier3count,
                            });
                            deferred.resolve({ status: 1, message: "Levy Statement", list: response, total:totalamounts })
                        }
                    });
                    
                    
                    

                    
                    
                }
                else {
                    deferred.resolve({ status: 1, message: "No data Found", list: [] })
                }
            }
        });
                      
        return deferred.promise;
    },

    foreignLevylist: (company_id) => {
        var deferred = q.defer();

        var query = "SELECT * from hrm_comp_profile where id='"+company_id+"'";
        sql.query(query, function (err, user) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
            } else {
              
                if (user.length > 0) {
                    var response = [];
                    var employee_query="select * from hrm_employee_details where visa_status=3 "
                    sql.query(employee_query,function(err,result)
                    {
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            console.log("emploueecount",result)
                            var total_count=result.length;
                            var sPassempId=[];
                            result.forEach((data)=>
                            {
                                sPassempId.push(data.emp_id);
                            })
                            console.log("jhdshh",sPassempId)
                            var value=0;
                            user.forEach((element)=>
                            {
                                if(total_count==element.tier1)
                                {
                                    value=total_count;
                                }
                                else if(total_count>element.tier1||total_count<element.tier1)
                                {
                                    value=element.tier1;
                                }
                                
                            })
                            console.log("value",value)
                            var reduceValue=0;
                            var empids=0
                            for(var i=0;i<value;i++)
                            {
                                reduceValue=i-(i-1);
                                console.log("jkchdjv",reduceValue);
                             empids=sPassempId.join(',')
                           var limitvalue=sPassempId.substring(0,3)
                           console.log("limitvalue",limitvalue)
                             console.log("empids",empids)
                                var updateQuery="Update hrm_employee_details set tier='"+reduceValue+"' where emp_id In("+limitvalue+") ";
                                sql.query(updateQuery,function(err,updateddata)
                                {
                                    console.log("updateQuery",updateQuery)
                                    if(err)
                                    {
                                        console.log(err)

                                    }
                                    else
                                    {
                                        if(updateddata.affectedRows > 0)
                                        {
                                            console.log("updated successdully")
                                        }

                                    }
                                }) 
                            }


                        }
                    })
                }
            }
        })
        
                                    
        return deferred.promise;
    },

   


    generatePayroll: async (company_id, fromDate = '', toDate = '', isPreview = false) => {
        var deferred = q.defer();
        var cpf_query = "SELECT * from " + tableConfig.HRM_EMPLOYEE_CPF;
        var cpf_data = await commonFunction.getQueryResults(cpf_query);
        var totalSalaryAmount = 0;

        var totalNumberOfDaysPerMonth = moment(toDate, "YYYY-MM").daysInMonth();
        var month_year = moment(toDate).format('YYYY-MM');

        var month = moment(toDate).format('MM');
        var year = moment(toDate).format('YYYY');
        var monthtomonth = month;
        var yeartoyear = year;
        var alreadygenerated = 0;
        var ifPayrollGenerated = "SELECT count(*) as count FROM " + tableConfig.HRM_PAYROLL_FOR_MONTH + " WHERE company_id = '"+ company_id +"' AND month = '"+ monthtomonth +"' and  year = '"+ yeartoyear +"' and ( status = 1 or status = 2) ";
        var ifGenerated = await commonFunction.getQueryResults(ifPayrollGenerated);
        console.log('generate----------->', ifGenerated[0].count)
        if(ifGenerated[0].count > 0){
            alreadygenerated = 1;
        }
        var checkPayrollGenerated = "SELECT count(*) as count FROM " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " WHERE company_id = '"+ company_id +"' AND month_year = '"+ month_year +"'";
        var isPayrollGenerated = await commonFunction.getQueryResults(checkPayrollGenerated);
        var payrollGenerated = false;

        if(isPayrollGenerated.length > 0) {
            payrollGenerated = (isPayrollGenerated[0].count > 0)? true : false; 
        }

        if (isPreview == false && payrollGenerated == false) {
           var addpayrollForMonthQuery = "INSERT INTO "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " (company_id,month,year,payroll_file_path) VALUES ('"+ company_id +"','"+ month +"','"+ year +"','')";
           var addPayrollResult = await commonFunction.executeQueryAndRetunResults(addpayrollForMonthQuery);
           var payroll_id = 0;

           if(addPayrollResult.insertId != undefined && addPayrollResult.insertId != null) {
            payroll_id = addPayrollResult.insertId;
           }
        }

        var incometax_query = "SELECT * from " + tableConfig.HRM_INCOMETAX;
        var incometax_data = await commonFunction.getQueryResults(incometax_query);

        var leaveTypeQuery = "SELECT * FROM " + tableConfig.HRM_LEAVE_TYPE + " WHERE status = '1'";
        var leaveType = await commonFunction.getQueryResults(leaveTypeQuery);
        var cpg_age_object = {};
      
        var numberOfWorkingDays = await commonFunction.getBusinessDatesCount(fromDate, toDate);
        var holidayQuery = "SELECT from_date,to_date FROM " + tableConfig.HRM_HOLIDAYS + " WHERE company_id = '" + company_id + "' AND ((from_date BETWEEN '" + fromDate + "' AND '" + toDate + "') OR (to_date BETWEEN '" + fromDate + "' AND '" + toDate + "'))";
        var holidayList = await commonFunction.getQueryResults(holidayQuery);

        var approvedLeaveQuery = "SELECT um.id as employ_id,lr.from_date,lr.to_date FROM " + tableConfig.HRM_USER_MASTER + " as um INNER JOIN " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " as lr ON lr.emp_id = um.id  AND ((lr.from_date BETWEEN '" + fromDate + "' AND '" + toDate + "') or (lr.from_date < '" + fromDate + "' AND lr.to_date > '" + toDate + "')) AND lr.status = '2' WHERE um.company_id = '" + company_id + "'";
        var approvedLeaveList = await commonFunction.getQueryResults(approvedLeaveQuery);

        var approved_leave_object = {};
        if (approvedLeaveList.length > 0) {
            approvedLeaveList.forEach((leave, i) => {
                let fdate = moment(leave.from_date).format('YYYY-MM-DD');
                let edate = moment(leave.to_date).format('YYYY-MM-DD');
                let to_date = moment(toDate).format('YYYY-MM-DD');
                var from_date = moment(fromDate).format('YYYY-MM-DD');
                approvedLeaveList[i].approved_leaves = 0;

                if (edate < to_date) {
                    approvedLeaveList[i].approved_leaves = approvedLeaveList[i].approved_leaves + moment(edate).diff(fdate, 'days') + 1;
                } else {
                    approvedLeaveList[i].approved_leaves = approvedLeaveList[i].approved_leaves + moment(to_date).diff(fdate, 'days') + 1;
                }

                if (approved_leave_object[leave.employ_id] == undefined) {
                    approved_leave_object[leave.employ_id] = 0;
                }
                approved_leave_object[leave.employ_id] = approved_leave_object[leave.employ_id] + approvedLeaveList[i].approved_leaves;
            });
        }

        var numberOfHolidays = 0;

        if (holidayList.length > 0) {
            holidayList.forEach(holiday => {
                var fdate = moment(holiday.from_date).format('YYYY-MM-DD');
                var edate = moment(holiday.to_date).format('YYYY-MM-DD');
                var to_date = moment(toDate).format('YYYY-MM-DD');
                var from_date = moment(fromDate).format('YYYY-MM-DD');

                if (edate < to_date && from_date < fdate) {
                    var count = 0;
                    let holidayStartDate = new Date(fdate);
                    let holidayEndDate = new Date(edate);

                    var curDate = holidayStartDate;
                    while (curDate <= holidayEndDate) {
                        var dayOfWeek = curDate.getDay();
                        if (((dayOfWeek == 6) || (dayOfWeek == 0)))
                            count++;
                        curDate.setDate(curDate.getDate() + 1);
                    }
                    numberOfHolidays = numberOfHolidays + moment(edate).diff(fdate, 'days') + 1;
                    numberOfHolidays = numberOfHolidays - count;
                } else if (fdate < from_date) {

                    var count = 0;
                    let holidayStartDate = new Date(from_date);
                    let holidayEndDate = new Date(edate);

                    var curDate = holidayStartDate;
                    while (curDate <= holidayEndDate) {
                        var dayOfWeek = curDate.getDay();
                        if (((dayOfWeek == 6) || (dayOfWeek == 0)))
                            count++;
                        curDate.setDate(curDate.getDate() + 1);
                    }
                    numberOfHolidays = numberOfHolidays + moment(edate).diff(from_date, 'days') + 1;
                    numberOfHolidays = numberOfHolidays - count;
                } else {
                    var count = 0;
                    let holidayStartDate = new Date(fdate);
                    let holidayEndDate = new Date(to_date);

                    var curDate = holidayStartDate;
                    while (curDate <= holidayEndDate) {
                        var dayOfWeek = curDate.getDay();
                        if (((dayOfWeek == 6) || (dayOfWeek == 0)))
                            count++;
                        curDate.setDate(curDate.getDate() + 1);
                    }

                    numberOfHolidays = numberOfHolidays + moment(to_date).diff(fdate, 'days') + 1;
                    numberOfHolidays = numberOfHolidays - count;
                }
            });
        }

        numberOfWorkingDays = numberOfWorkingDays - numberOfHolidays;
        if (cpf_data.length > 0) {
            cpf_data.forEach(cpf => {
                cpg_age_object[cpf.min_age] = {
                    ordinary_account: cpf.ordinary_account,
                    special_account: cpf.special_account,
                    medisave_account: cpf.medisave_account,
                    employer_contribution: cpf.employer_contribution,
                    employee_contribution: cpf.employee_contribution
                }
            });
        }

        var query = "SELECT COUNT(att.emp_id) as present_days,IFNULL(SUM(overtime),0) as overtime,um.id,um.emp_id as employee_id,emp.birthday,emp.firstname,emp.middlename,emp.lastname,emp.basic_salary,emp.salary,emp.email,ea.allowance as allowances,FN_PAYROLL_ACTION(um.id) as action_status from " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " as emp ON emp.emp_id = um.id AND um.status = '1' LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = emp.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " as att ON att.emp_id = emp.emp_id and att.check_in BETWEEN '" + fromDate + "'  AND '" + toDate + "' where um.company_id = '" + company_id + "' GROUP BY emp.emp_id";

        sql.query(query, async function (err, result) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to get employee details" });
            }
            else {

                if (result.length > 0) {
                    var amount_to_calculate_cpf = 0;
                    var cpfInsertQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " (company_id,emp_id,ordinary_account,special_account,medisave_account,employer_contribution,employee_contribution,month_year,income_tax,net_salary,gross_salary,lop,overtime_allowance,lop_days,payroll_id,basic_salary,salary,bonus,hra,transport_allowance,food_allowance,phone_allowance) VALUES ";

                    result.forEach((data, index) => {
                        
                        var income_tax_amount = 0;
                        var totalAllowanceAmount = 0;
                        result[index].total_allowance = 0;

                        data.bonus = 0;
                        result[index].hra = 0;
                        result[index].transport_allowance = 0;
                        result[index].food_allowance = 0;
                        result[index].phone_allowance = 0;

                        try {
                            if (data.allowances && data.allowances.length > 0) {
                                data.allowances = phpunserialize(data.allowances);
                                Object.keys(data.allowances).forEach(function (key) {
                                    var val = data.allowances[key];
                                    if (key == 'bonus') {
                                        data.bonus = parseInt(val);
                                    } else {
                                        totalAllowanceAmount = parseInt(totalAllowanceAmount) + parseInt(val);
                                        if(key == '1') {
                                            result[index].hra = parseInt(val);
                                        } else if (key == '2') {
                                            result[index].transport_allowance = parseInt(val);
                                        } else if(key == '3') {
                                            result[index].food_allowance = parseInt(val);
                                        } else if(key == '4'){
                                            result[index].phone_allowance = parseInt(val);
                                        }
                                    } 
                                    result[index].total_allowance = parseInt(totalAllowanceAmount) + parseInt(result[index].bonus)
                                });
                                delete data.allowances;
                            }
                           
                        } catch (ex) {
                            console.log('Parsing allowance object error...', ex);
                        }
                        console.log('totalallow',totalAllowanceAmount)

                        var dob = (data.birthday) ? data.birthday : '';
                        var emp_primary_ID = (data.id) ? data.id : 0;
                        var present_days = data.present_days;
                        var approved_leaves = approved_leave_object[emp_primary_ID] ? approved_leave_object[emp_primary_ID] : 0;
                        present_days = present_days + approved_leaves;

                        var lopDaysForEmployee = numberOfWorkingDays - present_days;
                        if (lopDaysForEmployee < 0) {
                            lopDaysForEmployee = 0;
                        }

                        var age = 0;
                        var ordinary_amount = 0;
                        var special_amount = 0;
                        var medisave_amount = 0;
                        var employer_contribution_amount = 0;
                        var employee_contribution_amount = 0;
                        var ordinary_acccount_percent = 0;
                        var special_account_percent = 0;
                        var medisave_account_percent = 0;
                        var employer_contribution_percent = 0;
                        var employee_contribution_percent = 0;
                        amount_to_calculate_cpf = data.basic_salary + data.bonus;

                        if (dob != '') {
                            age = moment().diff(dob, 'years', false);
                        }

                        age = parseInt(age);
                        var minAge = 0;

                        if (cpf_data.length > 0) {
                            var age_identified = false;
                            cpf_data.forEach(cpf => {
                                if (age <= cpf.min_age && age_identified == false) {
                                    minAge = cpf.min_age;
                                    ordinary_acccount_percent = cpg_age_object[minAge]['ordinary_account'];
                                    special_account_percent = cpg_age_object[minAge]['special_account'];
                                    medisave_account_percent = cpg_age_object[minAge]['medisave_account'];
                                    employer_contribution_percent = cpg_age_object[minAge]['employer_contribution'];
                                    employee_contribution_percent = cpg_age_object[minAge]['employee_contribution'];
                                    age_identified = true;
                                }
                            });
                        }

                        ordinary_amount = (amount_to_calculate_cpf * ordinary_acccount_percent) / 100;
                        special_amount = (amount_to_calculate_cpf * special_account_percent) / 100;
                        medisave_amount = (amount_to_calculate_cpf * medisave_account_percent) / 100;
                        employer_contribution_amount = (amount_to_calculate_cpf * employer_contribution_percent) / 100;
                        employee_contribution_amount = (amount_to_calculate_cpf * employee_contribution_percent) / 100;

                        var overTimeAllowance = 0;
                        var lopAmount = 0;

                        // lopAmount = lopDaysForEmployee * (result[index].basic_salary / totalNumberOfDaysPerMonth);
                        // lopAmount = Math.floor(lopAmount);

                        employeeOverTime = (data.overtime) ? parseInt(data.overtime / 60) : 0;
                        overTimeAllowance = (result[index].basic_salary / (totalNumberOfDaysPerMonth * 8)) * employeeOverTime;

                        result[index].cpf = ordinary_amount + special_amount + medisave_amount;
                        result[index].employee_contribution_amount = employee_contribution_amount;
                        result[index].employer_contribution_amount = employer_contribution_amount;
                        result[index].gross_salary = result[index].basic_salary + totalAllowanceAmount + result[index].bonus;

                        if (incometax_data.length > 0) {
                            let calculated = false;
                            incometax_data.forEach((taxdata) => {
                                if (taxdata.type == 1 && calculated == false) {
                                    if ((result[index].basic_salary * 12) <= taxdata.income_upto) {
                                        income_tax_amount = Math.ceil(taxdata.tax_amount / 12);
                                        calculated = true;
                                    }
                                } else if (calculated == false) {
                                    income_tax_amount = result[index].basic_salary * (taxdata.tax_amount / 100);
                                    income_tax_amount = Math.ceil(income_tax_amount);
                                    calculated = true;
                                }
                            });
                        }
                        
                        result[index].claims = 0;
                        result[index].lop = 0; 
                        result[index].income_tax_amount = income_tax_amount;
                        // result[index].net_salary = (result[index].gross_salary - result[index].employee_contribution_amount - lopAmount) + data.bonus + overTimeAllowance - income_tax_amount;
                        var netSalaryFinal = ( parseInt(result[index].gross_salary) + parseInt(overTimeAllowance)) - ( parseInt(employer_contribution_amount) + parseInt(result[index].employee_contribution_amount)  + parseInt(income_tax_amount)); //parseInt(lopAmount)
                        result[index].net_salary = (netSalaryFinal > 0) ? netSalaryFinal : 0; 
                        totalSalaryAmount = totalSalaryAmount + parseInt(result[index].gross_salary);
                        // console.log('Month and Year -------------->', monthtomonth + "-" + yeartoyear)
                        var monthyear = yeartoyear + "-" + monthtomonth;
                        cpfInsertQuery = cpfInsertQuery + " ('" + company_id + "','" + data.id + "','" + ordinary_amount + "','" + special_amount + "','" + medisave_amount + "','" + employer_contribution_amount + "','" + employee_contribution_amount + "','" + monthyear + "','" + income_tax_amount + "','" + result[index].net_salary + "','" + result[index].gross_salary + "','" + lopAmount + "','" + overTimeAllowance + "','" + lopDaysForEmployee + "','"+ payroll_id +"','"+ result[index].basic_salary +"','"+ result[index].salary +"','"+ result[index].bonus+"','"+ result[index].hra +"','"+ result[index].transport_allowance  +"','"+ result[index].food_allowance +"','"+ result[index].phone_allowance +"'),";
                    });

                    cpfInsertQuery = cpfInsertQuery.substring(0, cpfInsertQuery.length - 1);
                    if (isPreview == false && payrollGenerated == false) {
                        var cpfInsertResult = await commonFunction.executeQuery(cpfInsertQuery);
                        var updateTotalSalaryExpense = "UPDATE "+ tableConfig.HRM_PAYROLL_FOR_MONTH + " SET total_salary_amount = '"+ totalSalaryAmount +"' WHERE company_id = '"+ company_id +"' AND month = '"+ month +"' AND year = '"+ year +"' AND status = '1'";
                        var updatePayrollResult = await commonFunction.executeQueryAndRetunResults(updateTotalSalaryExpense);
                    }

                    


                    //Generate xl file
                    var month_year = yeartoyear+'-'+monthtomonth; 
                    var month_year_new = monthtomonth+'-'+yeartoyear;
                   
                    
                    var query = "SELECT um.company_id as company_id,um.emp_id as emp_ref_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.middlename,'') as middlename,IFNULL(ed.lastname,'') as lastname,ed.basic_salary,es.*,IFNULL(ea.allowance,'') as allowances,cp.name as company_name,IFNULL(cp.logo,'') as company_logo FROM " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " es ON es.emp_id = um.id AND es.month_year = '" + month_year + "' INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " ed ON ed.emp_id = es.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = es.emp_id INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " cp ON cp.id = um.company_id WHERE um.company_id ='" + company_id + "' AND um.status = '1'";
                    var payslipData = await commonFunction.getQueryResults(query);
                    // console.log('Month & Year', query )
                    var allowance_type_query = "SELECT * FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE company_id = '" + company_id + "'";
                    var allowance_types = await commonFunction.getQueryResults(allowance_type_query);
            
                    var column_header = ["SNO", "Employee ID", "Employee Name", "Basic Pay"];
                    var column_header_end = ["Employer CPF", "Employee CPF", "Bonus", "Overtime", "Gross Salary", "Net Salary"];
            
                    var allowance_type_object = {};
                    if (allowance_types.length > 0) {
                        allowance_types.forEach(allowance => {
                            allowance_type_object[allowance.id] = allowance.allowance_name;
                            column_header.push(allowance.allowance_name);
                        });
                    }
                    column_header = column_header.concat(column_header_end);
            
                    var wb = XLSX.utils.book_new();
                    var ws_name = "Payroll Sheet";
                    var ws_data = [
                        column_header
                    ];
            
                    if (payslipData.length > 0) {
                        payslipData.forEach((employee, index) => {
                            var employeeName = employee.firstname + ' ' + employee.middlename + ' ' + employee.lastname;
                            var emp_ref_id = employee.emp_ref_id;
                            var basic_salary = employee.basic_salary;
                            var employer_contribution = employee.employer_contribution;
                            var employee_contribution = employee.employee_contribution;
                            var overtime_allowance = employee.overtime_allowance;
                            var gross_salary = employee.gross_salary;
                            var net_salary = employee.net_salary;
            
                            var bonus = 0;
                            var employeeData = [index + 1, emp_ref_id, employeeName, basic_salary];
            
                            try {
                                if (employee.allowances && employee.allowances.length > 0) {
            
                                    employee.allowances = phpunserialize(employee.allowances);
                                    bonus = (employee.allowances['bonus']) ? employee.allowances['bonus'] : 0;
            
                                    if (allowance_types.length > 0) {
                                        allowance_types.forEach(allowance => {
            
                                            if (employee.allowances[allowance.id] != undefined) {
                                                employeeData.push(employee.allowances[allowance.id]);
                                            } else {
                                                employeeData.push(0);
                                            }
                                        });
                                    }
                                } else {
                                    if (allowance_types.length > 0) {
                                        allowance_types.forEach(allowance => {
                                            employeeData.push(0);
                                        });
                                    }
                                }
                            } catch (ex) {
                                console.log('Parsing allowance object error...', ex);
                                if (allowance_types.length > 0) {
                                    allowance_types.forEach(allowance => {
                                        employeeData.push(0);
                                    });
                                }
                            }
                            employeeData = employeeData.concat([employer_contribution, employee_contribution, bonus, overtime_allowance, gross_salary, net_salary]);
                            ws_data.push(employeeData);
                        });
            
                        var ws = XLSX.utils.aoa_to_sheet(ws_data);
                        XLSX.utils.book_append_sheet(wb, ws, ws_name);
                        XLSX.writeFile(wb, './public/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx');
            
                        // var filePath = ip.address() + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
                        var filePath = commonConfig.SERVER_URL_STATIC + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
             
                        var monthquery = "UPDATE " + tableConfig.HRM_PAYROLL_FOR_MONTH + " SET payroll_file_path = '"+filePath+"' WHERE year = '"+ yeartoyear +"' AND month = '"+ monthtomonth +"' ";
                    //    console.log("Monthtoyear query", monthquery)
                        sql.query(monthquery, function (err, approveResults) {
                            if (err) {
                                console.log(err);
                                deferred.resolve({ status: 0, message: "Failed to approve payroll" });
                            } else {
                               
                                deferred.resolve({ status: 1, message: "Employee payroll details", list: result, alreadyexist: alreadygenerated  });
                            }
                        }); 
            
                    } else {
                        deferred.resolve({ status: 0, message: "No data found to generate payslip" });
                    }
 
                } else {
                    deferred.resolve({ status: 0, message: "No Details found" });
                }
            }
            
        });
        return deferred.promise;
    },

    addAllowanceType: async (company_id, allowance_name, emp_id, amount) => {
        var deferred = q.defer();

        var allowanceName = allowance_name.toLowerCase();
        var checkAllowanceNameExists = "SELECT id from " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE company_id = '" + company_id + "' AND LOWER(allowance_name) = '" + allowanceName + "' AND status = '1'";
        var allowance_data = await commonFunction.getQueryResults(checkAllowanceNameExists);

        if (allowance_data.length == 0) {
            var query = "INSERT INTO " + tableConfig.HRM_ALLOWANCE_TYPES + " (company_id,allowance_name,emp_id,amount) VALUES ('" + company_id + "','" + allowance_name + "','" + emp_id + "','" + amount + "')";
            sql.query(query, function (err, result) {
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: "Failed to add allowance type" });
                } else {
                    deferred.resolve({ status: 1, message: "Allowance type added successfully" });
                }
            });

        } else {
            deferred.resolve({ status: 0, message: "Allowance type already exists" });
        }
        return deferred.promise;
    },

    getAllowanceTypes: (company_id) => {
        var deferred = q.defer();

        var query = "SELECT id,allowance_name,emp_id,amount,FN_ALLOWANCE_LIST_ACTION(id) as action_status from " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE company_id = '" + company_id + "' AND status = '1'";
        sql.query(query, function (err, result) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to get allowance types" });
            } else {

                if (result.length > 0) {
                    deferred.resolve({ status: 1, message: "Allowance types fetched successfully", list: result });
                } else {
                    deferred.resolve({ status: 0, message: "No allowance types found", list: [] });
                }
            }
        });

        return deferred.promise;
    },

    deleteAllowanceType: (allowance_id) => {
        var deferred = q.defer();
        var query = "UPDATE " + tableConfig.HRM_ALLOWANCE_TYPES + " SET status = '0' WHERE id = '" + allowance_id + "'";

        sql.query(query, function (err, result) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to delete allowance type" });
            } else {
                deferred.resolve({ status: 1, message: "Allowance type deleted successfully" });
            }
        });

        return deferred.promise;
    },

    updateAllowanceType: (allowance_id, allowance_name, emp_id, amount) => {
        var deferred = q.defer();
        var query = "UPDATE " + tableConfig.HRM_ALLOWANCE_TYPES + " SET allowance_name = '" + allowance_name + "',emp_id = '" + emp_id + "',amount = '" + amount + "' WHERE id = '" + allowance_id + "'";

        sql.query(query, function (err, result) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to update allowance type" });
            } else {
                deferred.resolve({ status: 1, message: "Allowance type updated successfully" });
            }
        });

        return deferred.promise;
    },
    
    addEmployeeAllowance: (allowance_array, emp_id, month_year,bonus) => {
        var deferred = q.defer();

        var allowance = {};
        allowance_array.forEach((a,i)=>{
            Object.assign(allowance, a);
        });

        if(bonus > 0){
            Object.assign(allowance, {"bonus":bonus});
        }
        allowance = serialize(allowance);
        var updateQuery = "UPDATE " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " SET allowance = '" + allowance + "' WHERE emp_id = '" + emp_id + "'";
        sql.query(updateQuery, function (err, updateResult) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to add allowance to employee" });
            } else {
                if (updateResult.affectedRows == 0) {
                    var query = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " (allowance,emp_id,month_year) VALUES ('" + allowance + "','" + emp_id + "','')";
                    sql.query(query, function (err, result) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Failed to add allowance to employee" });
                        } else {
                            deferred.resolve({ status: 1, message: "Employee allowance added successfully" });
                        }
                    });
                } else {
                    deferred.resolve({ status: 1, message: "Employee allowance added successfully" });
                }
            }
        });
        return deferred.promise;
    },

    getAllowanceById: (allowance_id) => {
        var deferred = q.defer();
        var query = "SELECT id,allowance_name,amount FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE id = '" + allowance_id + "'";

        sql.query(query, function (err, result) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to get allowance type details" });
            } else {
                if (result.length > 0) {
                    deferred.resolve({ status: 1, message: "Allowance type details fetched successfully", details: result[0] });
                } else {
                    deferred.resolve({ status: 0, message: "Allowance type not found", details: [] });
                }
            }
        });
        return deferred.promise;
    },
 







    exportEmployeePayslipPdf: async (req, res, employee_id, month_year) => {
        var deferred = q.defer();

        var yearStartDate = moment(month_year).startOf('year').format('YYYY-MM-DD');
        var yearEndDate = moment(month_year).endOf('year').format('YYYY-MM-DD');

        var month_year_new = moment(month_year).format('MMM - YYYY');
        var totalNumberOfDaysInMonth = moment(month_year_new, "YYYY-MM").daysInMonth();

        var leaveTypeQuery = "SELECT leave_type,duration,month_day FROM " + tableConfig.HRM_LEAVE_TYPE + " WHERE status = '1' AND (leave_type = 'Paid Annual' OR leave_type = 'sick')";
        var leaveTypeData = await commonFunction.getQueryResults(leaveTypeQuery);
        var leaveTypeObject = {
            'Paid Annual': 0,
            'sick': 0
        };

        leaveTypeData.forEach(leaveType => {
            if (leaveType.month_day == 'days') {
                leaveTypeObject[leaveType.leave_type] = leaveType.duration;
            } else if (leaveType.month_day == 'months') {
                leaveTypeObject[leaveType.leave_type] = (leaveType.duration * 30);
            }
        });

        var leaveCountQuery = "SELECT * FROM " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " WHERE emp_id = '" + employee_id + "' AND status = '2' AND (leave_type = 'Paid Annual' OR leave_type = 'sick') AND from_date >= '" + yearStartDate + "' AND to_date <= '" + yearEndDate + "'";
        var leaveCountData = await commonFunction.getQueryResults(leaveCountQuery);
      
        var availedLeaveObject = {
            'Paid Annual': 0,
            'sick': 0
        };

        leaveCountData.forEach(leave => {
            if (leave.leave_type == 'Paid Annual') {
                availedLeaveObject['Paid Annual'] = availedLeaveObject['Paid Annual'] + moment(leave.to_date).diff(leave.from_date, 'days') + 1;
            } else if (leave.leave_type == 'sick') {
                availedLeaveObject['sick'] = availedLeaveObject['sick'] + moment(leave.to_date).diff(leave.from_date, 'days') + 1;
            }
        });

        var remaining_annual_leave = leaveTypeObject['Paid Annual'] - availedLeaveObject['Paid Annual'];
        var remaining_sick_leave = leaveTypeObject['sick'] - availedLeaveObject['sick'];
        if(remaining_sick_leave < 10) {
            remaining_sick_leave = '0'+remaining_sick_leave;
        }

        if(remaining_annual_leave < 10) {
            remaining_annual_leave = '0'+remaining_annual_leave;
        }

        var query = "SELECT um.company_id as company_id,um.emp_id as emp_ref_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.middlename,'') as middlename,IFNULL(ed.lastname,'') as lastname,ed.basic_salary,es.*,IFNULL(ea.allowance,'') as allowances,cp.name as company_name,IFNULL(cp.logo,'') as company_logo,acc.acc_no FROM " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " es ON es.emp_id = um.id AND es.month_year = '" + month_year + "' INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " ed ON ed.emp_id = es.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = es.emp_id INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " cp ON cp.id = um.company_id LEFT JOIN "+ tableConfig.HRM_EMPLOYEE_ACCOUNT_DETAILS +" acc ON um.id = acc.emp_id WHERE um.id ='" + employee_id + "'";
        var payslipData = await commonFunction.getQueryResults(query);
        console.log("payslipData",payslipData)
        if (payslipData.length > 0) {
            var data = payslipData[0];
            var company_id = data.company_id;
            var bonus = 0;
            var employeeName = data.firstname + ' ' + data.middlename + ' ' + data.lastname;
            var total_allowances = 0;
            var allowances_text = ``;
            var totalEarnings = 0;
            var totalDeductions = 0;
            var netSalary = 0;
            var overtimeAllowance = 0;
            var lopDays = (data.lop_days) ? data.lop_days : 0;
            var numberOfPayableDays = data.present_days;//totalNumberOfDaysInMonth - lopDays;
            var numberOfPayableDaysText = (numberOfPayableDays < 10) ? "0" + numberOfPayableDays : numberOfPayableDays;
            var account_number = (data.acc_no)?data.acc_no:'';

            var allowance_type_query = "SELECT * FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE company_id = '" + company_id + "'";
            var allowance_types = await commonFunction.getQueryResults(allowance_type_query);

            var allowance_type_object = {};
            if (allowance_types.length > 0) {
                allowance_types.forEach(allowance => {
                    allowance_type_object[allowance.id] = allowance.allowance_name;
                });
            }

            try {
                if (data.allowances && data.allowances.length > 0) {

                    data.allowances = phpunserialize(data.allowances);
                    Object.keys(data.allowances).forEach(function (key) {
                        var val = data.allowances[key];
                        if (key == 'bonus') {
                            bonus = parseInt(bonus) + parseInt(val);
                        } else {
                            total_allowances = parseInt(total_allowances) + parseInt(val);
                            allowances_text = allowances_text + `
                            <tr>
                            <td style="font-size:13px">`+ allowance_type_object[key] + `</td>
                            <td style="text-align:right;padding-right:5px;font-size:13px">`+ val + `</td> 
                          </tr>
                            `
                        }
                    });
                }
            } catch (ex) {
                console.log('Parsing allowance object error...', ex);
            }

            if (data.overtime_allowance && data.overtime_allowance > 0) {
                overtimeAllowance = overtimeAllowance + data.overtime_allowance;
                allowances_text = allowances_text + `
                <tr>
                <td>Overtime Allowance</td>
                <td style="text-align:right;padding-right:5px;font-size:13px">`+ overtimeAllowance + `</td> 
              </tr>
                `
            }

            totalEarnings = parseInt(data.basic_salary) + parseInt(bonus) + parseInt(total_allowances) + parseInt(data.overtime_allowance);
            // totalDeductions = data.lop;
            console.log("totalEarnings",totalEarnings)
            totalDeductions = parseInt(data.employee_contribution)+parseInt(data.employer_contribution)+parseInt(data.shg_deduction)+parseInt(data.lop);
            console.log("totalDeductions",totalDeductions)
            netSalary = (totalEarnings - totalDeductions);
            var netSalaryInWords = toWords(netSalary);
           // var finalnetsalary=(totalEarnings-data.shg_deduction-data.employer_contribution-data.employee_contribution)+data.sdl_payable;
            let  dataset=[];
 dataset.push({
    name:employeeName,
    company_name:data.company_name,
    employee_id:data.emp_ref_id,
    payslip_month:month_year_new,
    no_of_workingdays:totalNumberOfDaysInMonth,
    no_of_yourworkingdays:numberOfPayableDaysText,
    basic_salary:data.basic_salary,
    bonus:bonus,
    shg_deducation:data.shg_deduction,
    
    grosssalary:data.gross_salary,
    netsalary:data.net_salary,
    lop_amount:data.lop,
    hra:data.hra,
    transport_allowance:data.transport_allowance,
    food_allowance:data.food_allowance,
    phone_allowance:data.phone_allowance,
    employee_contribution_amount:data.employee_contribution,
    employer_contribution_amount:data.employer_contribution,
    accountnumber:account_number



 })

            var html = `<html>
            <body>
            <h2 style= "text-align:center">`+ data.company_name + `</h2>
            <h4 style="text-align:center">Payslip for the month of  : `+ month_year_new +`</h4>
            <div> 
            <table>
            <tr>
            <td >
            <p style="padding-top:20px;font-size:13px;">Name: `+ employeeName + `</p>
            <p style="font-size:13px;">Employee ID: `+ data.emp_ref_id + `</p>
            <p style="font-size:13px;">Dept: General </p> 
            <p style="font-size:13px;">Payslip for  : ` + month_year_new + `</p>
            <p style="font-size:13px;">No of Days : `+ totalNumberOfDaysInMonth + ` </p>
            <p style="font-size:13px;"> No of days Payable   : ` + numberOfPayableDaysText + `</p>
            <p style="font-size:13px;"> No of lop days : ` + data.lop_days+ `</p>
            </td>
            </tr>
            </table>
            </div>

            <div style="float:left;clear:both;width:50%;border-top:1px solid black;">
            <table style="width:100%;border-right:1px solid black;">
              <tr>
                <th style="font-size:13px;text-align:left;">Details</th>
                <th style="font-size:13px;text-align:right;">Amount</th> 
              </tr>
              <tr>
                <td style="font-size:13px;">Basic Pay</td>
                <td style="text-align:right;padding-right:5px;font-size:13px;">`+ data.basic_salary + `</td> 
              </tr>
                <tr>
                <td style="font-size:13px;">Bonus</td>
                <td style="text-align:right;padding-right:5px;font-size:13px;">`+ bonus + `</td> 
                
              </tr> `+ allowances_text + `
            </table>
            </div>
            
            <div style="float:right;width:50%;border-top:1px solid black;">
            <table style="width:100%">
              <tr>
                <th style="font-size:13px;text-align:left;">Details</th>
                <th style="font-size:13px;text-align:right;">Amount</th> 
              </tr>
              <tr>
                <td style="font-size:13px;">Employee CPF</td>
                <td style="text-align:right;font-size:13px;">`+ data.employee_contribution + `</td>
                </tr>
                <tr>
                <td style="font-size:13px;">Employer CPF</td>
                <td style="text-align:right;font-size:13px;">`+ data.employer_contribution + `</td>  
                </tr>
                <tr>
                <td style="font-size:13px;">SHG deduction</td>
                <td style="text-align:right;font-size:13px;">`+ data.shg_deduction + `</td>  

              </tr>
              <tr>
              <td style="font-size:13px;">LOP amount</td>
              <td style="text-align:right;font-size:13px;">`+ data.lop + `</td>  

            </tr>
            </table>
            
            </div>
            <div style="clear:both">
            <hr>
            </div>
            
             <div style="float:left;clear:both;width:50%">
            <table style="width:100%;">
              <tr>
                <td style="font-size:13px;">Gross salary</td>
                <td style="text-align:right;padding-right:5px;font-size:13px;">`+ totalEarnings + `</td> 
              </tr>
            </table>
            </div>
            
            <div style="float:right;width:50%">
            <table style="width:100%;">
               <tr>
                <td style="font-size:13px;">Total Deductions</td>
                <td style="text-align:right;font-size:13px;">`+ totalDeductions + `</td> 
              </tr>
            </table>
            </div>
            <div style="clear:both">
            <hr>
            </div>

            <div style="float:left;width:50%">
            <table style="width:100%;">
               <tr>
                <td style="font-size:13px;">Account Number</td>
                <td style="text-align:right;padding-right:5px;font-size:13px;">`+ account_number + `</td>
              </tr>
            </table>
            </div>
            
            <div style="float:right;width:50%">
            <table style="width:100%;">
               <tr>
                <td style="font-size:13px;">Net Salary</td>
                <td style="text-align:right;font-size:13px;">`+ netSalary + `</td> 
              </tr>
              <tr>
              <td style="text-align:left;font-size:9px;">Amount in words : </td>
              <td style="text-align:right;font-size:9px;">`+ netSalaryInWords + `</td> 
            </tr>
            </table>
            </div>
            
            <div style="clear:both">
            <hr>
            </div>

            <div style="float:left;width:100%">
            <table style="width:100%">
               <tr>
               <th style="font-size:13px;">Sno</th>
                <th style="font-size:13px;">Leave type</th>
                <th style="font-size:13px;">Entitlemant</th>
                <th style="font-size:13px;">Current Taken</th>
                <th style="font-size:13px;">Balance</th>
              </tr>

              <tr>
              <td style="text-align:center;font-size:13px">1</td>
              <td style="text-align:center;font-size:13px">Sick leave</td>
              <td style="text-align:center;font-size:13px">`+ leaveTypeObject['sick'] + `</td> 
              <td style="text-align:center;font-size:13px">`+ availedLeaveObject['sick'] + `</td>
              <td style="text-align:center;font-size:13px">`+ remaining_sick_leave + `</td> 
            </tr>

            <tr>
            <td style="text-align:center;font-size:13px">2</td>
            <td style="text-align:center;font-size:13px">Annual leave</td>
            <td style="text-align:center;font-size:13px">`+ leaveTypeObject['Paid Annual'] + `</td>
            <td style="text-align:center;font-size:13px">`+ availedLeaveObject['Paid Annual'] + `</td>
            <td style="text-align:center;font-size:13px">`+ remaining_annual_leave + `</td> 
          </tr>

            </table>
            </div>
            <div style="clear:both">
            <hr>
            </div>

            </body>
            </html>`

            var options = { format: 'Letter' };

            pdf.create(html, options).toFile('../hrm_react/hrm_v1/public/uploads/payslip-emp-' + employee_id + '-' + month_year + '.pdf', function (err, results) {
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: "Failed to generate payslip" });
                } else {
                    // var filePath = ip.address() + ':' + commonConfig.SERVER_PORT + '/uploads/payslip-emp-' + employee_id + '-' + month_year + '.pdf';
                    var filePath = commonConfig.SERVER_URL_STATIC + ':' + commonConfig.SERVER_PORT + '/uploads/payslip-emp-' + employee_id + '-' + month_year + '.pdf';
                    deferred.resolve({ status: 1, message: 'Payslip generated successfully', path: '/uploads/payslip-emp-' + employee_id + '-' + month_year + '.pdf',dataset:dataset });
                }
            });

        } else {
            deferred.resolve({ status: 0, message: "No data found to generate payslip" });
        }
        return deferred.promise;
    },
    // exportEmployeePayslipPdf: async (req, res, employee_id, month_year) => {
    //     var deferred = q.defer();

    //     var yearStartDate = moment(month_year).startOf('year').format('YYYY-MM-DD');
    //     var yearEndDate = moment(month_year).endOf('year').format('YYYY-MM-DD');

    //     var month_year_new = moment(month_year).format('MMM - YYYY');
    //     var totalNumberOfDaysInMonth = moment(month_year_new, "YYYY-MM").daysInMonth();

    //     var leaveTypeQuery = "SELECT leave_type,duration,month_day FROM " + tableConfig.HRM_LEAVE_TYPE + " WHERE status = '1' AND (leave_type = 'Paid Annual' OR leave_type = 'sick')";
    //     var leaveTypeData = await commonFunction.getQueryResults(leaveTypeQuery);
    //     var leaveTypeObject = {
    //         'Paid Annual': 0,
    //         'sick': 0
    //     };

    //     leaveTypeData.forEach(leaveType => {
    //         if (leaveType.month_day == 'days') {
    //             leaveTypeObject[leaveType.leave_type] = leaveType.duration;
    //         } else if (leaveType.month_day == 'months') {
    //             leaveTypeObject[leaveType.leave_type] = (leaveType.duration * 30);
    //         }
    //     });

    //     var leaveCountQuery = "SELECT * FROM " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " WHERE emp_id = '" + employee_id + "' AND status = '2' AND (leave_type = 'Paid Annual' OR leave_type = 'sick') AND from_date >= '" + yearStartDate + "' AND to_date <= '" + yearEndDate + "'";
    //     var leaveCountData = await commonFunction.getQueryResults(leaveCountQuery);
      
    //     var availedLeaveObject = {
    //         'Paid Annual': 0,
    //         'sick': 0
    //     };

    //     leaveCountData.forEach(leave => {
    //         if (leave.leave_type == 'Paid Annual') {
    //             availedLeaveObject['Paid Annual'] = availedLeaveObject['Paid Annual'] + moment(leave.to_date).diff(leave.from_date, 'days') + 1;
    //         } else if (leave.leave_type == 'sick') {
    //             availedLeaveObject['sick'] = availedLeaveObject['sick'] + moment(leave.to_date).diff(leave.from_date, 'days') + 1;
    //         }
    //     });

    //     var remaining_annual_leave = leaveTypeObject['Paid Annual'] - availedLeaveObject['Paid Annual'];
    //     var remaining_sick_leave = leaveTypeObject['sick'] - availedLeaveObject['sick'];
    //     if(remaining_sick_leave < 10) {
    //         remaining_sick_leave = '0'+remaining_sick_leave;
    //     }

    //     if(remaining_annual_leave < 10) {
    //         remaining_annual_leave = '0'+remaining_annual_leave;
    //     }

    //     var query = "SELECT um.company_id as company_id,um.emp_id as emp_ref_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.middlename,'') as middlename,IFNULL(ed.lastname,'') as lastname,ed.basic_salary,es.*,IFNULL(ea.allowance,'') as allowances,cp.name as company_name,IFNULL(cp.logo,'') as company_logo,acc.acc_no FROM " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " es ON es.emp_id = um.id AND es.month_year = '" + month_year + "' INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " ed ON ed.emp_id = es.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = es.emp_id INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " cp ON cp.id = um.company_id LEFT JOIN "+ tableConfig.HRM_EMPLOYEE_ACCOUNT_DETAILS +" acc ON um.id = acc.emp_id WHERE um.id ='" + employee_id + "'";
    //     var payslipData = await commonFunction.getQueryResults(query);

    //     if (payslipData.length > 0) {
    //         var data = payslipData[0];
    //         var company_id = data.company_id;
    //         var bonus = 0;
    //         var employeeName = data.firstname + ' ' + data.middlename + ' ' + data.lastname;
    //         var total_allowances = 0;
    //         var allowances_text = ``;
    //         var totalEarnings = 0;
    //         var totalDeductions = 0;
    //         var netSalary = 0;
    //         var overtimeAllowance = 0;
    //         var lopDays = (data.lop_days) ? data.lop_days : 0;
    //         var numberOfPayableDays = totalNumberOfDaysInMonth - lopDays;
    //         var numberOfPayableDaysText = (numberOfPayableDays < 10) ? "0" + numberOfPayableDays : numberOfPayableDays;
    //         var account_number = (data.acc_no)?data.acc_no:'';

    //         var allowance_type_query = "SELECT * FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE company_id = '" + company_id + "'";
    //         var allowance_types = await commonFunction.getQueryResults(allowance_type_query);

    //         var allowance_type_object = {};
    //         if (allowance_types.length > 0) {
    //             allowance_types.forEach(allowance => {
    //                 allowance_type_object[allowance.id] = allowance.allowance_name;
    //             });
    //         }

    //         try {
    //             if (data.allowances && data.allowances.length > 0) {

    //                 data.allowances = phpunserialize(data.allowances);
    //                 Object.keys(data.allowances).forEach(function (key) {
    //                     var val = data.allowances[key];
    //                     if (key == 'bonus') {
    //                         bonus = parseInt(bonus) + parseInt(val);
    //                     } else {
    //                         total_allowances = parseInt(total_allowances) + parseInt(val);
    //                         allowances_text = allowances_text + `
    //                         <tr>
    //                         <td style="font-size:13px">`+ allowance_type_object[key] + `</td>
    //                         <td style="text-align:right;padding-right:5px;font-size:13px">`+ val + `</td> 
    //                       </tr>
    //                         `
    //                     }
    //                 });
    //             }
    //         } catch (ex) {
    //             console.log('Parsing allowance object error...', ex);
    //         }

    //         if (data.overtime_allowance && data.overtime_allowance > 0) {
    //             overtimeAllowance = overtimeAllowance + data.overtime_allowance;
    //             allowances_text = allowances_text + `
    //             <tr>
    //             <td>Overtime Allowance</td>
    //             <td style="text-align:right;padding-right:5px;font-size:13px">`+ overtimeAllowance + `</td> 
    //           </tr>
    //             `
    //         }

    //         totalEarnings = parseInt(data.basic_salary) + parseInt(bonus) + parseInt(total_allowances) + parseInt(data.overtime_allowance);
    //         // totalDeductions = data.lop;
    //         totalDeductions = data.employee_contribution;
    //         netSalary = totalEarnings - totalDeductions;
    //         var netSalaryInWords = toWords(netSalary);

    //         var html = `<html>
    //         <body>
    //         <h2 style= "text-align:center">`+ data.company_name + `</h2>
    //         <div> 
    //         <table>
    //         <tr>
    //         <td >
    //         <p style="padding-top:20px;font-size:13px;">Name: `+ employeeName + `</p>
    //         <p style="font-size:13px;">Employee ID: `+ data.emp_ref_id + `</p>
    //         <p style="font-size:13px;">Dept: General </p> 
    //         <p style="font-size:13px;">Payslip for  : ` + month_year_new + `</p>
    //         <p style="font-size:13px;">No of working Days : `+ totalNumberOfDaysInMonth + ` </p>
    //         <p style="font-size:13px;"> No of days Payable   : ` + numberOfPayableDaysText + `</p>
    //         </td>
    //         </tr>
    //         </table>
    //         </div>

    //         <div style="float:left;clear:both;width:50%;border-top:1px solid black;">
    //         <table style="width:100%;border-right:1px solid black;">
    //           <tr>
    //             <th style="font-size:13px;text-align:left;">Details</th>
    //             <th style="font-size:13px;text-align:right;">Amount</th> 
    //           </tr>
    //           <tr>
    //             <td style="font-size:13px;">Basic Pay</td>
    //             <td style="text-align:right;padding-right:5px;font-size:13px;">`+ data.basic_salary + `</td> 
    //           </tr>
    //             <tr>
    //             <td style="font-size:13px;">Bonus</td>
    //             <td style="text-align:right;padding-right:5px;font-size:13px;">`+ bonus + `</td> 
    //           </tr> `+ allowances_text + `
    //         </table>
    //         </div>
            
    //         <div style="float:right;width:50%;border-top:1px solid black;">
    //         <table style="width:100%">
    //           <tr>
    //             <th style="font-size:13px;text-align:left;">Details</th>
    //             <th style="font-size:13px;text-align:right;">Amount</th> 
    //           </tr>
    //           <tr>
    //             <td style="font-size:13px;">Employee CPF</td>
    //             <td style="text-align:right;font-size:13px;">`+ data.employee_contribution + `</td> 
    //           </tr>
    //         </table>
            
    //         </div>
    //         <div style="clear:both">
    //         <hr>
    //         </div>
            
    //          <div style="float:left;clear:both;width:50%">
    //         <table style="width:100%;">
    //           <tr>
    //             <td style="font-size:13px;">Gross salary</td>
    //             <td style="text-align:right;padding-right:5px;font-size:13px;">`+ totalEarnings + `</td> 
    //           </tr>
    //         </table>
    //         </div>
            
    //         <div style="float:right;width:50%">
    //         <table style="width:100%;">
    //            <tr>
    //             <td style="font-size:13px;">Total Deductions</td>
    //             <td style="text-align:right;font-size:13px;">`+ totalDeductions + `</td> 
    //           </tr>
    //         </table>
    //         </div>
    //         <div style="clear:both">
    //         <hr>
    //         </div>

    //         <div style="float:left;width:50%">
    //         <table style="width:100%;">
    //            <tr>
    //             <td style="font-size:13px;">Account Number</td>
    //             <td style="text-align:right;padding-right:5px;font-size:13px;">`+ account_number + `</td>
    //           </tr>
    //         </table>
    //         </div>
            
    //         <div style="float:right;width:50%">
    //         <table style="width:100%;">
    //            <tr>
    //             <td style="font-size:13px;">Net Salary</td>
    //             <td style="text-align:right;font-size:13px;">`+ netSalary + `</td> 
    //           </tr>
    //           <tr>
    //           <td style="text-align:left;font-size:10px;">Amount in words : </td>
    //           <td style="text-align:right;font-size:10px;">`+ netSalaryInWords + `</td> 
    //         </tr>
    //         </table>
    //         </div>
            
    //         <div style="clear:both">
    //         <hr>
    //         </div>

    //         <div style="float:left;width:100%">
    //         <table style="width:100%">
    //            <tr>
    //            <th style="font-size:13px;">Sno</th>
    //             <th style="font-size:13px;">Leave type</th>
    //             <th style="font-size:13px;">Entitlemant</th>
    //             <th style="font-size:13px;">Current Taken</th>
    //             <th style="font-size:13px;">Balance</th>
    //           </tr>

    //           <tr>
    //           <td style="text-align:center;font-size:13px">1</td>
    //           <td style="text-align:center;font-size:13px">Sick leave</td>
    //           <td style="text-align:center;font-size:13px">`+ leaveTypeObject['sick'] + `</td> 
    //           <td style="text-align:center;font-size:13px">`+ availedLeaveObject['sick'] + `</td>
    //           <td style="text-align:center;font-size:13px">`+ remaining_sick_leave + `</td> 
    //         </tr>

    //         <tr>
    //         <td style="text-align:center;font-size:13px">2</td>
    //         <td style="text-align:center;font-size:13px">Annual leave</td>
    //         <td style="text-align:center;font-size:13px">`+ leaveTypeObject['Paid Annual'] + `</td>
    //         <td style="text-align:center;font-size:13px">`+ availedLeaveObject['Paid Annual'] + `</td>
    //         <td style="text-align:center;font-size:13px">`+ remaining_annual_leave + `</td> 
    //       </tr>

    //         </table>
    //         </div>
    //         <div style="clear:both">
    //         <hr>
    //         </div>

    //         </body>
    //         </html>`

    //         var options = { format: 'Letter' };

    //         pdf.create(html, options).toFile('../hrm_react/hrm_v1/public/uploads/payslip-emp-' + employee_id + '-' + month_year + '.pdf', function (err, results) {
    //             if (err) {
    //                 console.log(err);
    //                 deferred.resolve({ status: 0, message: "Failed to generate payslip" });
    //             } else {
    //                 // var filePath = ip.address() + ':' + commonConfig.SERVER_PORT + '/uploads/payslip-emp-' + employee_id + '-' + month_year + '.pdf';
    //                 var filePath = commonConfig.SERVER_URL_STATIC + ':' + commonConfig.SERVER_PORT + '/uploads/payslip-emp-' + employee_id + '-' + month_year + '.pdf';
    //                 deferred.resolve({ status: 1, message: 'Payslip generated successfully', path: '/uploads/payslip-emp-' + employee_id + '-' + month_year + '.pdf' });
    //             }
    //         });

    //     } else {
    //         deferred.resolve({ status: 0, message: "No data found to generate payslip" });
    //     }
    //     return deferred.promise;
    // },

    excelExportPayroll: async (company_id, fromDate, toDate) => {
        var deferred = q.defer();

        var month_year = moment(toDate).format('YYYY-MM');
        var month_year_new = moment(month_year).format('MMM - YYYY');
      
        var monthtomonth = moment(fromDate).format('MM');
        var yeartoyear = moment(fromDate).format('YYYY');
        console.log('Month & Year', monthtomonth +" " +yeartoyear )
        var query = "SELECT um.company_id as company_id,um.emp_id as emp_ref_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.middlename,'') as middlename,IFNULL(ed.lastname,'') as lastname,ed.basic_salary,es.*,IFNULL(ea.allowance,'') as allowances,cp.name as company_name,IFNULL(cp.logo,'') as company_logo FROM " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " es ON es.emp_id = um.id AND es.month_year = '" + month_year + "' INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " ed ON ed.emp_id = es.emp_id LEFT JOIN " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " ea ON ea.emp_id = es.emp_id INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " cp ON cp.id = um.company_id WHERE um.company_id ='" + company_id + "' AND um.status = '1'";
        var payslipData = await commonFunction.getQueryResults(query);

        var allowance_type_query = "SELECT * FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE company_id = '" + company_id + "'";
        var allowance_types = await commonFunction.getQueryResults(allowance_type_query);

        var column_header = ["SNO", "Employee ID", "Employee Name", "Basic Pay"];
        var column_header_end = ["Employer CPF", "Employee CPF", "Bonus", "Overtime", "Gross Salary", "Net Salary"];

        var allowance_type_object = {};
        if (allowance_types.length > 0) {
            allowance_types.forEach(allowance => {
                allowance_type_object[allowance.id] = allowance.allowance_name;
                column_header.push(allowance.allowance_name);
            });
        }
        column_header = column_header.concat(column_header_end);

        var wb = XLSX.utils.book_new();
        var ws_name = "Payroll Sheet";
        var ws_data = [
            column_header
        ];

        if (payslipData.length > 0) {
            payslipData.forEach((employee, index) => {
                var employeeName = employee.firstname + ' ' + employee.middlename + ' ' + employee.lastname;
                var emp_ref_id = employee.emp_ref_id;
                var basic_salary = employee.basic_salary;
                var employer_contribution = employee.employer_contribution;
                var employee_contribution = employee.employee_contribution;
                var overtime_allowance = employee.overtime_allowance;
                var gross_salary = employee.gross_salary;
                var net_salary = employee.net_salary;

                var bonus = 0;
                var employeeData = [index + 1, emp_ref_id, employeeName, basic_salary];

                try {
                    if (employee.allowances && employee.allowances.length > 0) {

                        employee.allowances = phpunserialize(employee.allowances);
                        bonus = (employee.allowances['bonus']) ? employee.allowances['bonus'] : 0;

                        if (allowance_types.length > 0) {
                            allowance_types.forEach(allowance => {

                                if (employee.allowances[allowance.id] != undefined) {
                                    employeeData.push(employee.allowances[allowance.id]);
                                } else {
                                    employeeData.push(0);
                                }
                            });
                        }
                    } else {
                        if (allowance_types.length > 0) {
                            allowance_types.forEach(allowance => {
                                employeeData.push(0);
                            });
                        }
                    }
                } catch (ex) {
                    console.log('Parsing allowance object error...', ex);
                    if (allowance_types.length > 0) {
                        allowance_types.forEach(allowance => {
                            employeeData.push(0);
                        });
                    }
                }
                employeeData = employeeData.concat([employer_contribution, employee_contribution, bonus, overtime_allowance, gross_salary, net_salary]);
                ws_data.push(employeeData);
            });

            var ws = XLSX.utils.aoa_to_sheet(ws_data);
            XLSX.utils.book_append_sheet(wb, ws, ws_name);
            XLSX.writeFile(wb, './public/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx');

            // var filePath = ip.address() + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
            var filePath = commonConfig.SERVER_URL_STATIC + ':' + commonConfig.SERVER_PORT + '/uploads/payroll-comp-' + company_id + '-' + month_year + '.xlsx';
 
            var monthquery = "UPDATE " + tableConfig.HRM_PAYROLL_FOR_MONTH + " SET payroll_file_path = '"+filePath+"' WHERE year = '"+ yeartoyear +"' AND month = '"+ monthtomonth +"' ";
           console.log("Monthtoyear query", monthquery)
            sql.query(monthquery, function (err, approveResults) {
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: "Failed to approve payroll" });
                } else {
                    deferred.resolve({ status: 1, message: "Payroll exported successfully", path: filePath });
                }
            }); 

        } else {
            deferred.resolve({ status: 0, message: "No data found to generate payslip" });
        }
        return deferred.promise;
    },

    cpfStatement: async (company_id, month_year,employee_id) => {
        var deferred = q.defer();
        var month_year_new = moment(month_year).format('MMM - YYYY');

        var query = "SELECT um.company_id as company_id,um.emp_id as emp_ref_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.middlename,'') as middlename,IFNULL(ed.lastname,'') as lastname,IFNULL(ed.cpf_number,'') as cpf_number,IFNULL(es.employee_contribution,0) as employee_contribution,IFNULL(es.employer_contribution,0) as employer_contribution,cp.name as company_name,IFNULL(cp.logo,'') as company_logo,IFNULL(cp.addrline1,'') as addrline1,IFNULL(cp.addrline2,'') as addrline2,IFNULL(cp.city,'') as city,IFNULL(cp.state,'') as state,IFNULL(cp.country,'') as country,IFNULL(cp.postcode,'') as postcode FROM " + tableConfig.HRM_USER_MASTER + " um INNER JOIN " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " es ON es.emp_id = um.id AND es.month_year = '" + month_year + "' INNER JOIN " + tableConfig.HRM_EMPLOYEE_DETAILS + " ed ON ed.emp_id = es.emp_id INNER JOIN " + tableConfig.HRM_COMP_PROFILE + " cp ON cp.id = um.company_id WHERE um.company_id ='" + company_id + "'";
        var cpfData = await commonFunction.getQueryResults(query);
        var rows = ``;
        if (cpfData.length > 0) {

            var company_name = cpfData[0].company_name;
            var company_logo = cpfData[0].company_logo;
            var companyAddress = ``;

            companyAddress = (cpfData[0].addrline1 != '') ? companyAddress + cpfData[0].addrline1 + `,<br>` : companyAddress;
            companyAddress = (cpfData[0].addrline2 != '') ? companyAddress + cpfData[0].addrline2 + `,<br>` : companyAddress;
            companyAddress = (cpfData[0].city != '') ? companyAddress + cpfData[0].city + `,<br>` : companyAddress;
            companyAddress = (cpfData[0].state != '') ? companyAddress + cpfData[0].state + `, ` : companyAddress;
            companyAddress = (cpfData[0].country != '') ? companyAddress + cpfData[0].country : companyAddress;
            companyAddress = (cpfData[0].postcode != '') ? companyAddress + ` - ` + cpfData[0].postcode : companyAddress;

            cpfData.forEach((pfdata, index) => {
                var employeeName = pfdata.firstname + ' ' + pfdata.middlename + ' ' + pfdata.lastname;
                var cpf_number = pfdata.cpf_number;

                var sno = index + 1;
                var totalContribution = pfdata.employee_contribution + pfdata.employer_contribution;

                rows = rows + `<tr>
                <td style="text-align:center">`+ sno + `</td>
                <td style="text-align:left;padding-left:5px">`+ employeeName + `</td>
                <td style="text-align:center">`+ cpf_number + `</td>
                <td style="text-align:center;padding-right:5px">`+ pfdata.employee_contribution + `</td> 
                <td style="text-align:center;padding-right:5px">`+ pfdata.employer_contribution + `</td> 
                <td style="text-align:center;padding-right:5px">`+ totalContribution + `</td> 
              </tr>`
            });

            var html = `<html>
            <body>
            <div>
            <div style="float:left;width:20%;">
            <img src=`+ company_logo + ` alt="Logo" style="float:left;width:80px;height:80px;padding:10px">
            </div>
            
            <div style="float:left;width:65%;">
            <h2>`+ company_name + `</h2>
            <p>`+ companyAddress + `</p>
            </div>
            
            <div style="float:right;width:15%;padding-top:10px">
            <h1 style="color:green">CPF</h1>
            </div>
            </div>

            <div style="clear:both;width:100%;border-top:1px solid black">
            <p style="text-align:center"><b>CPF Statement for the month of `+ month_year_new + ` </b></p>
            </div>
 
            <div style="width:100%">
            <table border="1" style="width:100%;">
              <tr>
                <th style="text-align:center">S.NO</th>
                <th style="text-align:center">Name</th>
                <th style="text-align:center">CPF Number</th>
                <th style="text-align:center">Employee<br>Contribution</th> 
                <th style="text-align:center">Employer<br>Contribution</th> 
                <th style="text-align:center">Total</th> 
              </tr>` + rows + `
            </table>
            </div>
            </body
            </html>`

            var options = { format: 'Letter' };
            

             pdf.create(html, options).toFile('../hrm_react/hrm_v1/public/uploads/cpf-com-' + company_id + '.pdf', function (err, results) {
                
           // pdf.create(html, options).toFile(commonConfig.CLIENT_URL_STATIC+':'+ commonConfig.CLIENT_PORT +'/assets/cpf-com-' + company_id + '.pdf', function (err, results) {
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: "Failed to generate payslip" });
                } else {

                    var notifyQuery = "INSERT INTO "+ tableConfig.HRM_NOTIFICATION +" (from_emp_id,to_role_id,filter,message,isRead,url) VALUES ('"+ employee_id +"','7','cpf','Cpf generated successfully','0','/cpf_statement')";
                    sql.query(notifyQuery, function (err, notifyResults) {
                        if (err) {
                            console.log("Failed to add notification" ,err);
                        } 
                });
                    // var filePath = ip.address() + ':' + commonConfig.SERVER_PORT + '/uploads/cpf-com-' + company_id + '.pdf';
                    var filePath =commonConfig.SERVER_URL_STATIC + ':' + commonConfig.SERVER_PORT + '/uploads/cpf-com-' + company_id + '.pdf';
                  //  var filePath = commonConfig.CLIENT_URL_STATIC + ':'+ commonConfig.CLIENT_PORT + '/assets/cpf-com-' + company_id + '.pdf';
                    deferred.resolve({ status: 1, message: 'CPF statement generated successfully', path: '/uploads/cpf-com-' + company_id + '.pdf' });
                }
            });

        } else {
            deferred.resolve({ status: 0, message: "No data found to generate CPF statement" });
        }
        return deferred.promise;
    },

    approvePayroll: async (employee_id,paymonth,payyear,company_id,url) => {
        var deferred = q.defer();

        var query = "UPDATE " + tableConfig.HRM_PAYROLL_FOR_MONTH + " SET status = 1 WHERE company_id = '"+ company_id +"' AND month = '"+ paymonth +"' AND year = '"+ payyear +"'";
        sql.query(query, function (err, approveResults) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to approve payroll" });
            } else {
                var notifyQuery = "INSERT INTO "+ tableConfig.HRM_NOTIFICATION +" (from_emp_id,to_role_id,filter,message,isRead,url) VALUES ('"+ employee_id +"','7','Payroll','Payroll approved successfully','0','"+ url +"')";
                sql.query(notifyQuery, function (err, notifyResults) {
                    if (err) {
                        console.log(err);
                        deferred.resolve({ status: 0, message: "Failed to add notification" });
                    } else {
                        deferred.resolve({ status: 1, message: "Payroll approved succesfully" });
                    } 
            });
            }
        });
        return deferred.promise;
    },

    getPayrollDetailsById: async (payroll_id,salary_id) => {
        var deferred = q.defer();
        
        if(salary_id != ''){
          var  where = 'es.id = '+salary_id;
        }else{
          var  where = 'payroll_id = '+payroll_id;
        }
        var query = "SELECT es.emp_id,es.claims,es.id,es.payroll_id, es.lop,es.basic_salary,es.bonus,es.hra,es.transport_allowance,es.food_allowance,es.phone_allowance,es.employee_contribution as employee_contribution_amount,es.employer_contribution as employer_contribution_amount,es.gross_salary,es.net_salary,um.emp_id as employee_id, IFNULL(ed.firstname,'') as firstname, IFNULL(ed.middlename,'') as middlename,  IFNULL(ed.lastname,'') as lastname, overtime_allowance as overtime, income_tax, FN_SALARY_UPDATE_ACTION(es.id) as action_status FROM " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " es INNER JOIN "+ tableConfig.HRM_USER_MASTER +" um ON um.id = es.emp_id INNER JOIN "+ tableConfig.HRM_EMPLOYEE_DETAILS +" ed ON ed.emp_id = es.emp_id WHERE "+where;
        sql.query(query, function (err, payrollDetails) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "No data found" });
            } else {
                if(payrollDetails.length > 0) {
                    deferred.resolve({ status: 1, message: "Employee payroll details", list: payrollDetails });
                } else {
                    deferred.resolve({ status: 0, message: "No data found" });
                }
            }
        });

        return deferred.promise;
    },

    payrollList: (company_id, role) => {
        var deferred = q.defer();
        var statusonedata='<small class="label label-danger" > Waiting for Approval</small>';
        var statustwodata='<small class="label label-success">Approved</small>';
        var elsestatus='<small class="label label-default">Payroll generated</small>';
        var where = '';
        if(role == 'FINANCE'){
            where += ' and status != 0';
        }
        var query ="SELECT *,FN_PAYROLL_LIST_ACTION(id, payroll_file_path, '"+role+"') as paction,(CASE WHEN status = 1 THEN '"+statusonedata+"' WHEN status = 2 THEN  '"+statustwodata+"' ELSE '"+elsestatus+"' END) as pstatus FROM hrm_payroll_for_month WHERE company_id = "+company_id + where;
      
        sql.query(query, function (err, result) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to reterive" });
            } else {
                var formattedMonth='';
                result.forEach((data,index)=>
                {
                    formattedMonth = moment(data.month, 'MM').format('MMMM');
                    result[index].payroll_id=data.id;
                    result[index].company_id=data.company_id;
                    result[index].payroll_month=formattedMonth;
                    result[index].payroll_year=data.year;
                    result[index].action_status=data.paction;
                    result[index].status=data.pstatus;
                    delete data.id;
                    delete data.company_id;
                    delete data.month;
                    delete data.year;
                    delete data.paction;
                    delete data.pstatus;
                    delete data.payroll_file_path;
                });
                deferred.resolve({ status: 1, message: "Payroll list",list:result });
            }
        });
        return deferred.promise;
    },

    updatesalarydetails:(updateData, bonus) => {
        var deferred = q.defer();
        // console.log('salary id', updateData) 
        var allowance_array = updateData[0].allowances;
        var allowance = {};
        allowance_array.forEach((a,i)=>{
            Object.assign(allowance, a);
        });

        if(bonus > 0){
            Object.assign(allowance, {"bonus":bonus});
        }
        allowance = serialize(allowance);



        var query ="SELECT * FROM " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS +" WHERE id = "+updateData[0].salary_id;
      
        sql.query(query, function (err, result) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to reterive" });
            } else {
                console.log('Data Exist', result)
                 if(result.length > 0){

                    var squery = "UPDATE " + tableConfig.HRM_EMPLOYEE_SALARY_DETAILS + " SET gross_salary = '"+updateData[0].grosssalary+"', net_salary = '"+updateData[0].netsalary+"', bonus = '"+updateData[0].bonus+"', hra = '"+updateData[0].hra+"', transport_allowance = '"+updateData[0].transport+"', food_allowance = '"+updateData[0].food+"', phone_allowance = '"+updateData[0].phone+"', overtime_allowance = '"+updateData[0].overtime+"'  WHERE id = " + updateData[0].salary_id ;
                    sql.query(squery, function (err, uresult) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Failed to Update the salary details" });
                        } else {

                            var allowancequery = "UPDATE " + tableConfig.HRM_EMPLOYEE_ALLOWANCES + " SET allowance = '"+allowance+"'  WHERE emp_id = " + updateData[0].emp_id ;
                                sql.query(allowancequery, function (err, uresult) {
                            if (err) {
                                console.log(err);
                                deferred.resolve({ status: 0, message: "Failed to Update the salary details" });
                            } else {
                                deferred.resolve({ status: 1, message: "Salary Details Updated" });
                            }
                        }); 
                        }
                    });
 
                 }else{
                    deferred.resolve({ status: 0, message: "Salary Details Not Exist for this Emmployee"});
                 }
               
            }
        });
        return deferred.promise;
    },

    finalapprovalofpayroll:(payrollid) => {
        var deferred = q.defer();
         
        var query ="SELECT * FROM " + tableConfig.HRM_PAYROLL_FOR_MONTH +" WHERE id = "+payrollid;
      
        sql.query(query, function (err, result) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to reterive" });
            } else {
                console.log('Data Exist', result)
                 if(result.length > 0){

                    var squery = "UPDATE " + tableConfig.HRM_PAYROLL_FOR_MONTH + " SET status = 2  WHERE id = " + payrollid;
                    sql.query(squery, function (err, uresult) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Failed to Update the Payroll status" });
                        } else {
                            deferred.resolve({ status: 1, message: "Payroll Approved" });
                        }
                    });
 
                 }else{
                    deferred.resolve({ status: 0, message: "Payroll does not Exist "});
                 }
               
            }
        });
        return deferred.promise;
    },
    generateshglist: async (company_id,month,year) => {
        var deferred = q.defer();
                    var amount_to_calculate_cpf = 0;
                    var payroll_query="select * from hrm_payroll_for_month where company_id="+company_id+" and month='"+month+"'and year='"+year+"'"
                    console.log("datas",payroll_query)
                    var payroll_data=await commonFunction.getQueryResults(payroll_query);
                    if(payroll_data.length > 0)
                    {
                        var month_number=0;
                        if(month >9)
                        {
                            month_number=month
                        }
                        else
                        {
                            month_number="0"+month
                        }
                        var monthyear=year+"-"+month_number
                        var salary_query="select FN_SGH_ACTION(um.id) as action_status,sm.shg_type,um.id,um.emp_id,IFNULL(em.firstname,'') as firstname,IFNULL(em.middlename,'')as middlename,IFNULL(em.lastname,'')as lastname,sm.net_salary,sm.shg_deduction,sm.gross_salary from hrm_employee_salary_details as sm  inner join hrm_employee_details  as em on em.emp_id=sm.emp_id inner join hrm_user_master as um on um.id=em.emp_id and um.role_id!=1 and um.company_id="+company_id+" and sm.month_year='"+monthyear+"'and shg_type!=0";
                        console.log("result data",salary_query)
                        var salary_data=await commonFunction.getQueryResults(salary_query);
                        console.log("result data",salary_data)
                        var response=[];
                    var name='';
                     var shg_type_name=''
                        salary_data.forEach((element,index)=>
                        {
                            console.log("data",element.shg_type)
                            if(element.shg_type==1)
                            {
                                shg_type_name="CDAC"
                            }
                            else if(element.shg_type==2)
                            {
                                shg_type_name="ECF"
                            }
                            else if(element.shg_type==3)
                            {
                                shg_type_name="SINDA"
                            }
                            else if(element.shg_type==4)
                            {
                                shg_type_name="MBMF"
                            }
                            else
                            {
                                shg_type_name=''
                            }
                            name=element.firstname+" "+element.middlename+" "+element.lastname;
                            response.push({
                                employee_name:name,
                                employee_primary_id:element.id,
                                employee_id:element.emp_id,
                                employee_netsalary:element.net_salary,
                                employee_shg_deducation:element.shg_deduction,
                                employee_gross_salary:element.gross_salary,
                                shg_type:shg_type_name,
                                action_status:element.action_status
                            })
                        })
                        deferred.resolve({status:1,message:"Shg list ",response})
                    }
                    else
                    {
                        deferred.resolve({status:0,message:"Payroll not generated  "})
                    }
        return deferred.promise;
    },

    generatesdllist: async (company_id,month,year) => {
        var deferred = q.defer();
       
                    var amount_to_calculate_cpf = 0;
                    var payroll_query="select * from hrm_payroll_for_month where company_id="+company_id+" and month='"+month+"'and year='"+year+"'"
                    console.log("datas",payroll_query)
                    var payroll_data=await commonFunction.getQueryResults(payroll_query);
                  
                    if(payroll_data.length > 0)
                    {
                        var month_number=0;
                        if(month >9)
                        {
                            month_number=month
                        }
                        else
                        {
                            month_number="0"+month
                        }
                        var monthyear=year+"-"+month_number
                        var salary_query="select sm.sdl_payable,um.id,um.emp_id,IFNULL(em.firstname,'') as firstname,IFNULL(em.middlename,'')as middlename,IFNULL(em.lastname,'')as lastname,sm.net_salary,sm.shg_deduction,sm.gross_salary from hrm_employee_salary_details as sm  inner join hrm_employee_details  as em on em.emp_id=sm.emp_id inner join hrm_user_master as um on um.id=em.emp_id and um.role_id!=1 and um.company_id="+company_id+" and sm.month_year='"+ monthyear+"'";
                      
                        var salary_data=await commonFunction.getQueryResults(salary_query);
                        var response=[]
                    var name='';
                        salary_data.forEach((element,index)=>
                        {
                            name=element.firstname+" "+element.middlename+" "+element.lastname;
                            response.push({
                                employee_name:name,
                                employee_primary_id:element.id,
                                employee_id:element.emp_id,
                                employee_netsalary:element.net_salary,
                                employee_shg_deducation:element.shg_deduction,
                                employee_gross_salary:element.gross_salary,
                                employee_sdl_payable:element.sdl_payable
                            

                            })
                        })
                        deferred.resolve({status:1,message:"Shg list ",response})
                    }
                    else
                    {
                        deferred.resolve({status:0,message:"Payroll not generated  "})
                    }
                  
        return deferred.promise;
    }

}
