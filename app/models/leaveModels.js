var sql = require('../../config/database.config');
var tableConfig = require('../config/table_config');
var q = require('q');
var sql = require('../../config/database.config');
var moment = require('moment');
var commonFunction = require('./commonfunction');

module.exports = {
    addLeavetype: async (company_id,leavetype_id,days,duration) => {
        var deferred = q.defer();
        var checkingQuery="select * from hrm_user_master where company_id='"+company_id+"'"
        var checkdata=await commonFunction.getQueryResults(checkingQuery);
        
        if(checkdata.length > 0)
        {
            var UpdateQuery="UPDATE hrm_leave_type SET duration="+duration+",month_day='"+days+"' WHERE `l_id`="+leavetype_id+ ""
            var Updatedata=await commonFunction.getQueryResults(UpdateQuery);
           
            if(Updatedata.affectedRows > 0)
            {
                deferred.resolve({status:1,message:"Updated Successfully"})
            }
            else
            {
                deferred.resolve({status:0,message:"Updated failed "})
                
                
               
            }
           

        }
        else
        {
            deferred.resolve({status:0,message:"Company is not found"})
        }
       
       
        return deferred.promise;
    },

    applyLeaves: (req) => {
        var deferred = q.defer();
console.log("req.body",req.body)
        var emp_id = req.body.emp_id;
        var leave_type = req.body.leave_type;
        var from_date = req.body.from_date;
        var to_date = req.body.to_date;
        var from_time = '';
        var to_time = '';
        var reason = req.body.reason;
        var leave_type_id = leave_type
        var url = (req.body.url != undefined) ? req.body.url : '';
        var roles = (req.body.roles != undefined) ? req.body.roles : 0;
        var isTodateAfterFromDate = moment(to_date).isSameOrAfter(from_date, 'day');

        if (isTodateAfterFromDate) {
            if (leave_type == 9) {
                from_time = req.body.from_time;
                to_time = req.body.to_time;
            }

            var getleavetypeQuery = "select leave_type as leavetypestring  from hrm_leave_type where l_id=" + leave_type + "";
            sql.query(getleavetypeQuery, function (err, data) {
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, mesage: "Something Went Wrong" });
                }
                else {
                    var leavetype = data[0].leavetypestring;
                    var checkingQuery = "select emp_id from " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " where emp_id=" + emp_id + " and leave_type='" + leavetype + "'and (DATE(from_date) <='" + from_date + "' AND DATE(to_date) >= '" + to_date + "')";

                    sql.query(checkingQuery, function (err, result) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "something went wrong" });
                        } else {
                            if (result.length > 0) {
                                deferred.resolve({ status: 0, message: "Your already apply leave" });
                            } else {
                                var leaveQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " (emp_id,leave_type,from_date,to_date,from_time,to_time,reason,leave_type_id) VALUES ('" + emp_id + "','" + leavetype + "','" + from_date + "','" + to_date + "','" + from_time + "','" + to_time + "','" + reason + "','" + leave_type_id + "')";
                                sql.query(leaveQuery, function (err, masterData) {
                                    if (err) {
                                        console.log(err);
                                        deferred.resolve({ status: 0, message: "Failed to apply leave" });
                                    } else {
                                        if (masterData.affectedRows > 0) {
                                            var noticationQuery = "INSERT INTO hrm_notication(from_emp_id,to_role_id,filter,message,url) VALUES (" + emp_id + ",'" + roles + "','leave','new leave has requested','" + url + "') "
                                            sql.query(noticationQuery, function (err, noticationdata) {
                                                if (err) {
                                                    console.log(err);
                                                    deferred.resolve({ status: 0, message: "Something Went Wrong" });
                                                } else {
                                                    if (noticationdata.affectedRows > 0) {
                                                        deferred.resolve({ status: 1, message: "Successfully to apply leave" });
                                                    } else {
                                                        deferred.resolve({ status: 0, message: "Failed to add" });
                                                    }
                                                }
                                            });
                                        } else {
                                            deferred.resolve({ status: 0, message: "Failed to apply leave" });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
        } else {
            deferred.resolve({ status: 0, message: "to_date should be greater than from_date" });
        }
        return deferred.promise;
    },

    CurrentUpdatedleave: (company_id) => {
        var deferred = q.defer();
        var getcurrent_month=moment.utc().format("YYYY-MM-DD");
       
        var query = "Select  n.*,um.emp_id as empid,CONCAT(IFNULL(em.firstname,''),' ',IFNULL(em.middlename,''),' ',IFNULL(em.lastname,'')) as employeename FROM hrm_notication as n inner join  hrm_employee_details  as em  on n.from_emp_id=em.emp_id inner join hrm_user_master as um  on um.id=.n.from_emp_id WHERE um.status='1' and um.company_id=" + company_id + " and MONTH(n.created_on) = MONTH('"+getcurrent_month+"') AND YEAR(n.created_on) = YEAR('"+getcurrent_month+"') order by n.id desc LIMIT 10";
        sql.query(query, function (err, user) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
            } else {
                if (user.length > 0) {
                    deferred.resolve({ status: 0, message: 'list Successfully', list: user });
                } else {
                    deferred.resolve({ status: 0, message: "No data Found", details: [] });
                }
            }
        });
        return deferred.promise;
    },

    leavePermission: (req) => {
        var deferred = q.defer();
        var emp_id = (req.body.emp_id) ? req.body.emp_id : 0;
        var status = req.body.leave_status;
        var decline_descripation = '';
        var leave_id = req.body.leave_id;
        var leave_type = req.body.leave_type_id;
let url=(req.body.url!=undefined)?req.body.url:''
var curdate=moment().format("YYYY-MM-DD HH:mm:ss");
var curdatToutc=moment.utc(curdate).format("YYYY-MM-DD HH:mm:ss");
var utcTolocal=moment(curdatToutc).local();
var created_on=moment(curdatToutc).format("YYYY-MM-DD HH:mm:ss")
 
        if (status == 3) {
            decline_descripation = req.body.decline_descripation;
        }
        var yeardate = new Date();
        var current_year = yeardate.getFullYear();
        var CheckingQuery = "select from_date,to_date from hrm_leave_request where leave_type_id=" + leave_type + "  and status=2 and emp_id=" + emp_id; //and YEAR(from_date) = " + current_year + "
        console.log('leave_type_query', CheckingQuery)
        sql.query(CheckingQuery, function (err, approvedLeaves) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Something Went wrong" });
            } else {
                
                var numberOfDaysLeaveTaken = 0;
                // if (approvedLeaves.length > 0) {
                    
                    approvedLeaves.forEach((leave, i) => {
                        let fdate = moment(leave.from_date).format('YYYY-MM-DD');
                        let edate = moment(leave.to_date).format('YYYY-MM-DD');
                        numberOfDaysLeaveTaken = numberOfDaysLeaveTaken + moment(edate).diff(fdate, 'days') + 1;
                    });

                    var leave_type_query = "select duration,month_day from hrm_leave_type where l_id=" + leave_type;
                    sql.query(leave_type_query, function (err, leave_typedata) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Something went wrong" });
                        } else {
                            
                            if (leave_typedata.length > 0) {
                                var leave_peroid = leave_typedata[0].month_day;
                                var leave_days = leave_typedata[0].duration;
                                var number_of_days = leave_days;

                                if (leave_peroid == 'months') {
                                    number_of_days = (leave_days) * 30;
                                }

                                if (numberOfDaysLeaveTaken < number_of_days) {
                                    var approvelQuery = "Update   " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + "  set status='" + status + "' ,decline_descripation='" + decline_descripation + "' where leave_id='" + leave_id + "'";
                                    sql.query(approvelQuery, function (err, masterData) {
                                        if (err) {
                                            console.log(err);
                                            deferred.resolve({ status: 0, message: "Failed to apply leave" });
                                        } else {
                                            var message = 'Leave request rejected';
                                            if (masterData) {
                                                if (status == 2) {
                                                    message = "Leave Approved successfully";
                                                }

                                                var noticationQuery = "INSERT INTO hrm_notication(from_emp_id,to_role_id,filter,message,url,created_on) VALUES (" + emp_id + ",4,'leave','" + message + "','"+url+"','"+created_on+"') "
                                                sql.query(noticationQuery, function (err, noticationdata) {
                                                    if (err) {
                                                        console.log(err);
                                                        deferred.resolve({ status: 0, message: "Something Went Wrong" });
                                                    } else {
                                                        if (noticationdata.affectedRows > 0) {
                                                            deferred.resolve({ status: 1, message: message });
                                                        }
                                                        else {
                                                            deferred.resolve({ status: 0, message: "Failed to add" });
                                                        }
                                                    }
                                                });

                                            } else {
                                                deferred.resolve({ status: 0, message: "Failed to apply leave" });
                                            }
                                        }
                                    });

                                } else {
                                    deferred.resolve({ status: 0, message: "Leave limit exceed for the employee" });
                                }

                            } else {
                                deferred.resolve({ status: 0, message: "No leave found" });
                            }
                        }
                    });

                // } else {
                //     deferred.resolve({ status: 0, message: "No leave found" });
                // }
            }
        });
        return deferred.promise;
    },
    workStatus: (req) => {
        var deferred = q.defer();
       
        var work_id = req.body.work_id;
        var company_id = req.body.company_id;
        var status_id=req.body.status_id
        var confirmation_id=req.body.confirmation_id
      var emp_id=req.body.emp_id;
      var confirmation_ids=[];
       var checkingQuery="select * from hrm_work_details where id="+work_id+" and company_id="+company_id+"";
      console.log(checkingQuery)
       sql.query(checkingQuery,function(err,checkdata)
       {
           if(err)
           {
               console.log(err)
               deferred.resolve({status:0,message:"Something went wrong"})
           }
           else
           {
               if(checkdata.length > 0)
               {
                var approvelQuery = "Update   " + tableConfig.HRM_WORK_DETAILS + "  set status='" + status_id + "'  where id='" + work_id + "' and company_id="+company_id+"";
                sql.query(approvelQuery, function (err, masterData) {
                    if (err) {
                        console.log(err);
                        deferred.resolve({ status: 0, message: "Failed to update status" });
                    } else {
                        var message = '';
                        if (masterData.affectedRows > 0) {
                            if (status_id == 2) {
                                message = "Work Reviewed in Approval";
                            }
                            else if(status_id == 1)
                            {
                                message = "Work has been reviewed";
                            }
                            else if(status_id==0)
                            {
                                message = "New Work has been assigned"
                            }
                            else if(status_id==3)
                            {
                                message = " Work has  been cancelled in approval stage "
                            }
                            else if(status_id==4)
                            {
                                message = "Work Approved in confirmation stage"

                            }
                            else if(status_id==5)
                            {
                                message = "Work reviewed in confirmation stage"
                            }
                            else if(status_id==6)
                            {
                                message = "Work  has been  cancelled In confirmation stage"
                            }
                            confirmation_ids.push(confirmation_id)
                            var noticationQuery = "INSERT INTO hrm_notication(from_emp_id,to_role_id,filter,message) VALUES (" + emp_id + ",'"+confirmation_ids+"','work','" + message + "') "
                            console.log(noticationQuery)
                            sql.query(noticationQuery, function (err, noticationdata) {
                                if (err) {
                                    console.log(err);
                                    deferred.resolve({ status: 0, message: "Something Went Wrong" });
                                } else {
                                    if (noticationdata.affectedRows > 0) {
                                        deferred.resolve({ status: 1, message: message });
                                    }
                                    else {
                                        deferred.resolve({ status: 0, message: "Failed to add" });
                                    }
                                }
                            });

                        } else {
                            deferred.resolve({ status: 0, message: "Failed to update status" });
                        }
                    }
                });
               }
               else
               {
                   deferred.resolve({status:0,message:"No work data found"})
               }
           }
       })
return deferred.promise;
    },

    leaveHistory: (leave_type, from_date, to_date, status, emp_id) => {
        var deferred = q.defer();
        var response = [];
        // var condition = "where (leave_type='" + leave_type + "' or from_date='" + from_date + "' or to_date='" + to_date + "' or status='" + status + "' or emp_id=" + emp_id + ")";
       var formatfromDate=moment(from_date).format("YYYY-MM-DD")
        var condition = '';
        if(leave_type != ''){
            condition +=  ' leave_type_id = '+leave_type 
        }
        if(from_date != ''){
            condition += (condition != '') ? ' and from_date = "'+formatfromDate+'" ' : ' from_date = "'+formatfromDate+'" '
        }
       
        if(emp_id != ''){
            condition += (condition != '') ? ' and emp_id ='+emp_id : ' emp_id ='+emp_id  
        }
        if(condition == ''){
            condition = 1
        }

        console.log('where  condition ------------->', condition)
 
        var leaveQuery = "select emp_id as employee_id,FN_STATUS(leave_id, 'leave') as leave_status,status as statuscode,leave_id,FN_EMPID(emp_id) as emp_id,leave_type,from_date,to_date,from_time,to_time,FN_LEAVE_DETAILS_ACTION(leave_id,emp_id)as action_status,IFNULL(FN_EMPLOYEE_NAME(emp_id),'Super Admin') as employee_name from " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " where " + condition+" order by  leave_id desc";

        console.log('leave query =====> ', leaveQuery)

        sql.query(leaveQuery, function (err, masterData) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Something Went Wrong" });
            } else {

                if (masterData.length > 0) {
                    masterData.forEach((data) => {
                        var dbleavefrom_date = moment.utc(data.from_date).format();
                        var dbleaveto_date = moment.utc(data.to_date).format();
                        var from_date = moment(dbleavefrom_date).local();
                        var to_date = moment(dbleaveto_date).local();
                        var getfromdate = moment(from_date).format("DD MMM YYYY");
                        var gettodate = moment(to_date).format("DD MMM YYYY");

                        response.push({
                            emp_id: data.emp_id,
                            leave_type: data.leave_type,
                            from_date: getfromdate,
                            to_date: gettodate,
                            from_time: data.from_time,
                            to_time: data.to_time,
                            action_status: data.action_status,
                            employee_primary_id: data.employee_id,
                            employee_name: (data.employee_name != undefined) ? data.employee_name : 'Super admin',
                            status: data.leave_status,
                            status_code:data.statuscode
                        });
                        deferred.resolve({ status: 1, message: "Leave details", leave_details: response });
                    });

                } else {
                    deferred.resolve({ status: 0, message: "No data found", leave_details: [] });
                }
            }
        });

        return deferred.promise;
    },

//     dashboardExpenseNew: (company_id,year) => {
//         var deferred = q.defer();
//         var current_date=moment().format("YYYY-MM-DD")
//        var lastsix_month= moment(current_date).subtract(6, 'months').format('MM')
//   var currentMonthexpense=0;
//    var cuurentyear=moment().format("YYYY")
//    var currentmonth=moment().format("MM")
//    var expensequery="select pm.total_salary_amount as payroll_salary,cd.amount as claim_amount ,(pm.total_salary_amount + cd.amount) as total_expense_month ,pm.month,pm.total_salary_amount as amount from hrm_payroll_for_month as pm inner join hrm_claim_details as  cd  on pm.month >= "+lastsix_month+" and pm.month <= "+currentmonth+" and pm.year="+year+"  and cd.status=2 and pm.status=2   where cd.month >= "+lastsix_month+" and cd.month <= "+currentmonth+" and cd.year="+year+"  and cd.company_id="+company_id+" and cd.status=2 and pm.status=2 group  by pm.id order by month asc";
//    sql.query(expensequery,function(err,data)
//    {
// console.log("expense",expensequery)
//        if(err)
//        {
//            console.log(err)
//            deferred.resolve({status:0,message:"Something went wrong"})
//        }
//        else
//        {
//         var differnce='';
//         var month_days=0
//         var months=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//         // console.log('benfits_data => ',data)
//         // console.log('benfits_query =========> ',expensequery)
//            if(data.length > 0)
//            {
//                console.log("data",data)
//                 var benfits_query="SELECT pay.total_salary_amount as payroll_salary,cd.amount as claim_amount ,(pay.total_salary_amount + cd.amount) as total_expense FROM hrm_claim_details as cd inner join hrm_payroll_for_month as pay on cd.month <= '"+currentmonth+"' and pay.month <= '"+currentmonth+"' and cd.year='"+cuurentyear+"' and cd.status=2 and pay.status=2 where pay.company_id="+company_id+" and pay.year='"+cuurentyear+"' group by pay.id";
//                     sql.query(benfits_query,function(err,benfitsdata)
//                     {
                        
//                     if(err)
//                     {
//                         console.log(err);
//                         deferred.resolve({status:0,message:"SOmething went wrong"})
//                     }
//                     else
//                     {
//                         console.log("benfits_query ==>",benfits_query)
//                         var total_expenses=(benfitsdata.length > 0)?benfitsdata[0].total_expense:0;
//                         data.forEach((result,index)=>
//                         {
//                             benfitsdata.forEach((result2)=>
//                             {
//                                 months.forEach((value)=>
//                                 {
                                   
//                                     var month_name= (result.month!=undefined)?parseInt(result.month)-1:''
                   
//                                              console.log("value",month_name)
//                                     data[index].payroll_salary=(result.payroll_salary!=0)?result.payroll_salary:0,
//                                     data[index].claim_amount= (result.claim_amount!=0)?result.claim_amount:0;
//                                     data[index].month= month_name;
//                                    // data[index].amount=0;
//                                    // data[index].monthindex=result; 
//                                     data[index].total_expense_amount=result.total_expense_month

//                                 })
//                             })
//                         })
                      

//            }
//            console.log("dataif",data)
//            deferred.resolve({status:1,message:"Company expense ",expense_list:data})
//            })
//                 // for(k=0;k<data.length;k++){
//                 //     var benfits_query="SELECT pay.total_salary_amount as payroll_salary,cd.amount as claim_amount ,(pay.total_salary_amount + cd.amount) as total_expense FROM hrm_claim_details as cd inner join hrm_payroll_for_month as pay on cd.month <= '"+data[k].month+"' and pay.month <= '"+data[k].month+"' and cd.year='"+cuurentyear+"' and cd.status=2 and pay.status=2 where pay.company_id="+company_id+" and pay.year='"+cuurentyear+"' group by pay.id";
//                 //     sql.query(benfits_query,function(err,benfitsdata)
//                 //     {
                        
//                 //     if(err)
//                 //     {
//                 //         console.log(err);
//                 //         deferred.resolve({status:0,message:"SOmething went wrong"})
//                 //     }
//                 //     else
//                 //     {
//                 //         console.log("benfits_query ==>",benfits_query)
//                 //         var total_expenses=(benfitsdata.length > 0)?benfitsdata[0].total_expense:0
//                 //         var expense=[];
//                 //         expense.push({total_expenses})
//                 //         var monthcount = data.length;
//                 //         i=0;
//                 //         data.forEach((result,index)=>
//                 //         { 
//                 //             var month_name=  parseInt(result.month) - 1
                   
//                 //              data[index].month= months[month_name];
//                 //              data[index].monthindex= month_name;
//                 //             // data[index].payroll_month=moment([cuurentyear,0,month_days]).month(result.month).format("MMMM");
                           
                            
//                 //              data[index].amount=(result.total_expense_month!=undefined)?result.total_expense_month:0
                             
//                 //             i++;
//                 //         })
//                 //         var cmonth = new Date();
//                 //         console.log("cureent month",cmonth)
//                 //         var limitmonth = cmonth.getMonth();
//                 //         console.log("j",limitmonth)
//                 //         var newdetails;
//                 //         var j = parseInt(limitmonth)-6;
                       
//                 //         for(i=0; i <=months.length; i++){
//                 //             if(i < limitmonth && i >= j){
                                
//                 //                 console.log("monthindex",i)
//                 //                 var  found = data.some(el => el.month === months[i]);
                             

//                 //                 if(!found) { 

//                 //                     // data.forEach((row,index)=>
//                 //                     // {
//                 //                     //     data[index].payroll_salary= 0,
//                 //                     //     data[index].claim_amount=0;
//                 //                     //     data[index].month=months[i];
//                 //                     //     data[index].amount=0;
//                 //                     //     data[index].monthindex=i;
//                 //                     //     //     claim_amount:0,
//                 //                     //     //     total_expense_month: 0,
//                 //                     //     //     month: months[i],
//                 //                     //     //     amount: 0,
//                 //                     //     //     monthindex: i
//                 //                     //}) 
//                 //                     newdetails= {
//                 //                         payroll_salary: 0,
//                 //                         claim_amount:0,
//                 //                         total_expense_month: 0,
//                 //                         month: months[i],
//                 //                         amount: 0,
//                 //                         monthindex: i
//                 //                     }  
//                 //                     // console.log("respone",newdetails) 
//                 //                     data.unshift(newdetails) 
//                 //                 }
                               

                                 
//                 //             }
                             
//                 //         }
//                 //         var current_month_total_expense="SELECT FN_CURRENT_MONTH_TOTAL_EXPENSE("+company_id+") as current_month_total_expense"
//                 //                                 sql.query(current_month_total_expense,function(err,cexpensedata)
//                 //                                 {
//                 //                                     console.log(current_month_total_expense)
//                 //                                     if(err)
//                 //                                     {
//                 //                                         console.log(err);
//                 //                                     }
//                 //                                     else
//                 //                                     {
//                 //                                         currentMonthexpense=cexpensedata[0].current_month_total_expense
//                 //         //                             //  cexpensedata.forEach((result,index)=>
//                 //         //                             //  {
//                 //         //                             //     cexpensedata[index].currentmonth_expense=(cexpensedata.length>0)?result.current_total_expense:0;
//                 //         //                             //     delete result.payroll_salary;
//                 //         //                             //     delete result.claim_amount;
//                 //         //                             //     delete result.current_total_expense
//                 //         //                             //  })
//                 //         //                                 //currentMonthexpense=(cexpensedata.length>0)?cexpensedata[1]:0;
                        
//                 //                                 }
//                 //                                 deferred.resolve({status:1,message:"Company expense ",expense_list:data,total_expense_month:expense,currentMonthexpense:currentMonthexpense})
//                 //                                    // deferred.resolve({status:1,message:"Company expense ",expense_list:data,total_expense_month:expense,currentMonthexpense:currentMonthexpense})
//                 //                         })
                                                
                        
                        
                        
//                 //     }
//                 // })
//                 // }
 
//            }
//            else
//            {
//             var cmonth = new Date();
//             var limitmonth = cmonth.getMonth();
//             var newdetails;
//            var j=0;
//            console.log("jelse",j)
//             for(i=0; i < months.length; i++){
//                 if(i < limitmonth && i >= j){                   
                   
//                         newdetails= {
//                             payroll_salary: 0,
//                             claim_amount:0,
//                             total_expense_month: 0,
//                             month: months[i],
//                             amount: 0,
//                             monthindex: i
//                         }   
//                         data.unshift(newdetails)                     
//                 }                 
//             }
//             deferred.resolve({status:1,message:"Company expense ",expense_list:data,total_expense_month:0})
//            }
//        }
//    })     
//         // var condition = "where (leave_type='" + leave_type + "' or from_date='" + from_date + "' or to_date='" + to_date + "' or status='" + status + "' or emp_id=" + emp_id + ")";
//         // var leave_Query = '';
//         // var leaveQuery = "select emp_id as employee_id,FN_STATUS(leave_id, 'leave') as leave_status,leave_id,FN_EMPID(emp_id) as emp_id,leave_type,from_date,to_date,from_time,to_time,FN_LEAVE_DETAILS_ACTION(leave_id,emp_id)as action_status,IFNULL(FN_EMPLOYEE_NAME(emp_id),'Super Admin') as employee_name from " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + "  ";
//         // if (leave_type != '' || status != 0 || from_date != '0000-00-00' || to_date != '0000-00-00' || emp_id != 0) {
//         //     leave_Query = leaveQuery + " " + condition;
//         // } else {
//         //     leave_Query = leaveQuery;
//         // }
//         // sql.query(leave_Query, function (err, masterData) {
//         //     if (err) {
//         //         console.log(err);
//         //         deferred.resolve({ status: 0, message: "Something Went Wrong" });
//         //     } else {
//         //         if (masterData.length > 0) {
//         //             masterData.forEach((data) => {
//         //                 var dbleavefrom_date = moment.utc(data.from_date).format();
//         //                 var dbleaveto_date = moment.utc(data.to_date).format();
//         //                 var from_date = moment(dbleavefrom_date).local();
//         //                 var to_date = moment(dbleaveto_date).local();
//         //                 var getfromdate = moment(from_date).format("DD MMM YYYY");
//         //                 var gettodate = moment(to_date).format("DD MMM YYYY");
//         //                 response.push({
//         //                     emp_id: data.emp_id,
//         //                     leave_type: data.leave_type,
//         //                     from_date: getfromdate,
//         //                     to_date: gettodate,
//         //                     from_time: data.from_time,
//         //                     to_time: data.to_time,
//         //                     action_status: data.action_status,
//         //                     employee_primary_id: data.employee_id,
//         //                     employee_name: (data.employee_name != undefined) ? data.employee_name : 'Super admin',
//         //                     status: data.leave_status,
//         //                 });
//         //                 deferred.resolve({ status: 1, message: "Leave details", leave_details: response });
//         //             });
//         //         } else {
//         //             deferred.resolve({ status: 0, message: "No data found", leave_details: [] });
//         //         }
//         //     }
//         // });
//         return deferred.promise;
//     },
dashboardExpense: (company_id,year) => {
    var deferred = q.defer();
    var current_date=moment().format("YYYY-MM-DD")
   var lastsix_month= moment(current_date).subtract(6, 'months').format('MM')
var currentMonthexpense=0;
var cuurentyear=moment().format("YYYY")
var currentmonth=moment().format("MM")
var expensequery="select pm.total_salary_amount as payroll_salary,SUM(cd.amount) as claim_amount ,(pm.total_salary_amount + SUM(cd.amount)) as total_expense_month ,IFNULL(pm.month,0) as month_value,pm.total_salary_amount as amount from hrm_payroll_for_month as pm inner join hrm_claim_details as  cd  on pm.company_id=cd.company_id and pm.month=cd.month and pm.month >= "+lastsix_month+" and pm.month <= "+currentmonth+" and pm.year="+year+"  and cd.status=2 and pm.status=2   where cd.month >= "+lastsix_month+" and cd.month <= "+currentmonth+" and cd.year="+year+"  and cd.company_id="+company_id+" and cd.status=2 and pm.status=2 group  by pm.id order by pm.month asc";
// var expensequery="select pm.total_salary_amount as payroll_salary,cd.amount as claim_amount ,(pm.total_salary_amount + cd.amount) as total_expense_month ,IFNULL(pm.month,0) as month_value,pm.total_salary_amount as amount from hrm_payroll_for_month as pm inner join hrm_claim_details as  cd  on  pm.month >= "+lastsix_month+" and pm.month <= "+currentmonth+" and pm.year="+year+"  and cd.status=2 and pm.status=2   where cd.month >= "+lastsix_month+" and cd.month <= "+currentmonth+" and cd.year="+year+"  and cd.company_id="+company_id+" and cd.status=2 and pm.status=2 group  by pm.id order by pm.month asc";
console.log("expense",expensequery)
sql.query(expensequery,function(err,data)
{
console.log("expense",data)
   if(err)
   {
       console.log(err)
       deferred.resolve({status:0,message:"Something went wrong"})
   }
   else
   {
    var differnce='';
    var month_days=0
    var months=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    // console.log('benfits_data => ',data)
    // console.log('benfits_query =========> ',expensequery)
       if(data.length > 0)
       {
            for(k=0;k<data.length;k++){
                var benfits_query="SELECT pay.total_salary_amount as payroll_salary,cd.amount as claim_amount ,(pay.total_salary_amount + cd.amount) as total_expense FROM hrm_claim_details as cd inner join hrm_payroll_for_month as pay on cd.month <= '"+data[k].month+"' and pay.month <= '"+data[k].month+"' and cd.year='"+cuurentyear+"' and cd.status=2 and pay.status=2 where pay.company_id="+company_id+" and pay.year='"+cuurentyear+"' group by pay.id";
                sql.query(benfits_query,function(err,benfitsdata)
                {
                    
                if(err)
                {
                    console.log(err);
                    deferred.resolve({status:0,message:"SOmething went wrong"})
                }
                else
                {
                    console.log("benfits_query ==>",benfits_query)
                    var total_expenses=(benfitsdata.length > 0)?benfitsdata[0].total_expense:0
                    var expense=[];
                    expense.push({total_expenses})
                    var monthcount = data.length;
                    i=0;
                    data.forEach((result,index)=>
                    { 
                        var month_name=  parseInt(result.month_value) - 1
               
                         data[index].month= months[month_name];
                         data[index].monthindex= month_name;
                        // data[index].payroll_month=moment([cuurentyear,0,month_days]).month(result.month).format("MMMM");
                       
                        
                         data[index].amount=(result.total_expense_month!=undefined)?result.total_expense_month:0
                         
                        i++;
                    })
                    var cmonth = new Date();
                    console.log("cureent month",cmonth)
                    var limitmonth = cmonth.getMonth();
                    console.log("j",limitmonth)
                    var newdetails;
                    var j = parseInt(limitmonth)-6;
                   
                    for(i=0; i < months.length; i++){
                        if(i < limitmonth && i >= j){
                            console.log("monthindex",i)
                            var  found = data.some(el => el.month_value === months[i]);
                            console.log("found",found)
                            if(!found) { 
                                newdetails= {
                                    payroll_salary: 0,
                                    claim_amount:0,
                                    total_expense_month: 0,
                                    month: months[i],
                                    amount: 0,
                                    monthindex: i
                                }   
                                data.unshift(newdetails) 
                            }
                             
                        }
                         
                    }
                    var current_month_total_expense="SELECT FN_CURRENT_MONTH_TOTAL_EXPENSE("+company_id+") as current_month_total_expense"
                                            sql.query(current_month_total_expense,function(err,cexpensedata)
                                            {
                                                console.log(current_month_total_expense)
                                                if(err)
                                                {
                                                    console.log(err);
                                                }
                                                else
                                                {
                                                    currentMonthexpense=cexpensedata[0].current_month_total_expense
                    //                             //  cexpensedata.forEach((result,index)=>
                    //                             //  {
                    //                             //     cexpensedata[index].currentmonth_expense=(cexpensedata.length>0)?result.current_total_expense:0;
                    //                             //     delete result.payroll_salary;
                    //                             //     delete result.claim_amount;
                    //                             //     delete result.current_total_expense
                    //                             //  })
                    //                                 //currentMonthexpense=(cexpensedata.length>0)?cexpensedata[1]:0;
                    
                                            }
                                            deferred.resolve({status:1,message:"Company expense ",expense_list:data,total_expense_month:expense,currentMonthexpense:currentMonthexpense})
                                               // deferred.resolve({status:1,message:"Company expense ",expense_list:data,total_expense_month:expense,currentMonthexpense:currentMonthexpense})
                                    })
                                            
                    
                    
                    
                }
            })
            }

       }
       else
       {
        var cmonth = new Date();
        var limitmonth = cmonth.getMonth();
        var newdetails;
       var j=0;
       console.log("jelse",j)
        for(i=0; i < months.length; i++){
            if(i < limitmonth && i >= j){                   
               
                    newdetails= {
                        payroll_salary: 0,
                        claim_amount:0,
                        total_expense_month: 0,
                        month: months[i],
                        amount: 0,
                        monthindex: i
                    }   
                    data.unshift(newdetails)                     
            }                 
        }
        deferred.resolve({status:1,message:"Company expense ",expense_list:data,total_expense_month:0})
       }
   }
})     
    // var condition = "where (leave_type='" + leave_type + "' or from_date='" + from_date + "' or to_date='" + to_date + "' or status='" + status + "' or emp_id=" + emp_id + ")";
    // var leave_Query = '';
    // var leaveQuery = "select emp_id as employee_id,FN_STATUS(leave_id, 'leave') as leave_status,leave_id,FN_EMPID(emp_id) as emp_id,leave_type,from_date,to_date,from_time,to_time,FN_LEAVE_DETAILS_ACTION(leave_id,emp_id)as action_status,IFNULL(FN_EMPLOYEE_NAME(emp_id),'Super Admin') as employee_name from " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + "  ";
    // if (leave_type != '' || status != 0 || from_date != '0000-00-00' || to_date != '0000-00-00' || emp_id != 0) {
    //     leave_Query = leaveQuery + " " + condition;
    // } else {
    //     leave_Query = leaveQuery;
    // }
    // sql.query(leave_Query, function (err, masterData) {
    //     if (err) {
    //         console.log(err);
    //         deferred.resolve({ status: 0, message: "Something Went Wrong" });
    //     } else {
    //         if (masterData.length > 0) {
    //             masterData.forEach((data) => {
    //                 var dbleavefrom_date = moment.utc(data.from_date).format();
    //                 var dbleaveto_date = moment.utc(data.to_date).format();
    //                 var from_date = moment(dbleavefrom_date).local();
    //                 var to_date = moment(dbleaveto_date).local();
    //                 var getfromdate = moment(from_date).format("DD MMM YYYY");
    //                 var gettodate = moment(to_date).format("DD MMM YYYY");
    //                 response.push({
    //                     emp_id: data.emp_id,
    //                     leave_type: data.leave_type,
    //                     from_date: getfromdate,
    //                     to_date: gettodate,
    //                     from_time: data.from_time,
    //                     to_time: data.to_time,
    //                     action_status: data.action_status,
    //                     employee_primary_id: data.employee_id,
    //                     employee_name: (data.employee_name != undefined) ? data.employee_name : 'Super admin',
    //                     status: data.leave_status,
    //                 });
    //                 deferred.resolve({ status: 1, message: "Leave details", leave_details: response });
    //             });
    //         } else {
    //             deferred.resolve({ status: 0, message: "No data found", leave_details: [] });
    //         }
    //     }
    // });
    return deferred.promise;
},





// new dashboard function
//     dashboardExpense: (company_id,year) => {
//         var deferred = q.defer();
//         var current_date=moment().format("YYYY-MM-DD")
//        var lastsix_month= moment(current_date).subtract(6, 'months').format('MM')
//        var currentMonthexpense=0;

//    var cuurentyear=moment().format("YYYY")
//    var currentmonth=moment().format("MM")
//    var expensequery="select pm.total_salary_amount as payroll_salary,cd.amount as claim_amount ,(pm.total_salary_amount + cd.amount) as total_expense_month ,pm.month,pm.total_salary_amount as amount from hrm_payroll_for_month as pm inner join hrm_claim_details as  cd  on pm.month >= "+lastsix_month+" and pm.month <= "+currentmonth+" and pm.year="+year+"  and cd.status=2 and pm.status=2   where cd.month >= "+lastsix_month+" and cd.month <= "+currentmonth+" and cd.year="+year+"  and cd.company_id="+company_id+" and cd.status=2 and pm.status=2 group  by pm.id order by month asc";
//    sql.query(expensequery,function(err,data)
//    {
// // console.log(expensequery)

//        if(err)
//        {
//            console.log(err)
//            deferred.resolve({status:0,message:"Something went wrong"})
//        }
//        else
//        {
//         var differnce='';
//         var month_days=0
//         var months=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//         // console.log('benfits_data => ',data)
//         // console.log('benfits_query =========> ',expensequery)
//            if(data.length > 0)
//            {
//                 for(k=0;k<data.length;k++){
//                     var benfits_query="SELECT pay.total_salary_amount as payroll_salary,cd.amount as claim_amount ,(pay.total_salary_amount + cd.amount) as total_expense FROM hrm_claim_details as cd inner join hrm_payroll_for_month as pay on cd.month <= '"+data[k].month+"' and pay.month <= '"+data[k].month+"' and cd.year='"+cuurentyear+"' and cd.status=2 and pay.status=2 where pay.company_id="+company_id+" and pay.year='"+cuurentyear+"' group by pay.id";
//                     sql.query(benfits_query,function(err,benfitsdata)
//                     {
                        
//                     if(err)
//                     {
//                         console.log(err);
//                         deferred.resolve({status:0,message:"SOmething went wrong"})
//                     }
//                     else
//                     {
//                         console.log("benfits_query ==>",benfits_query)
//                         var total_expenses=(benfitsdata.length > 0)?benfitsdata[0].total_expense:0
//                         var expense=[];
//                         expense.push({total_expenses})
//                         var monthcount = data.length;
//                         i=0;
//                         data.forEach((result,index)=>
//                         { 
//                             var month_name=  parseInt(result.month) - 1
                   
//                              data[index].month= months[month_name];
//                              data[index].monthindex= month_name;
//                             // data[index].payroll_month=moment([cuurentyear,0,month_days]).month(result.month).format("MMMM");
                           
                            
//                              data[index].amount=(result.total_expense_month!=undefined)?result.total_expense_month:0
                             
//                             i++;
//                         })

//                         var cmonth = new Date();
//                         var limitmonth = cmonth.getMonth();
//                         var newdetails;
//                         var j = parseInt(limitmonth)-6;
//                         for(i=0; i < months.length; i++){
//                             if(i < limitmonth && i >= j){
//                                 var  found = data.some(el => el.month === months[i]);
//                                 if(!found) { 
//                                     newdetails= {
//                                         payroll_salary: 0,
//                                         claim_amount:0,
//                                         total_expense_month: 0,
//                                         month: months[i],
//                                         amount: 0,
//                                         monthindex: i
//                                     }   
//                                     data.unshift(newdetails) 
//                                 }
                                 
//                             }
                             
//                         }
                      
                       
//                         var current_month_total_expense="SELECT FN_CURRENT_MONTH_TOTAL_EXPENSE("+company_id+") as current_month_total_expense"
//                         sql.query(current_month_total_expense,function(err,cexpensedata)
//                         {
//                             console.log(current_month_total_expense)
//                             if(err)
//                             {
//                                 console.log(err);
//                             }
//                             else
//                             {
//                                 currentMonthexpense=cexpensedata[0].current_month_total_expense
//                             //  cexpensedata.forEach((result,index)=>
//                             //  {
//                             //     cexpensedata[index].currentmonth_expense=(cexpensedata.length>0)?result.current_total_expense:0;
//                             //     delete result.payroll_salary;
//                             //     delete result.claim_amount;
//                             //     delete result.current_total_expense
//                             //  })
//                                 //currentMonthexpense=(cexpensedata.length>0)?cexpensedata[1]:0;

//                             }
//                             deferred.resolve({status:1,message:"Company expense ",expense_list:data,total_expense_month:expense,currentMonthexpense:currentMonthexpense})
//                         })
                        
//                     }
//                 })
//                 }
 
//            }
//            else
//            {
//             var cmonth = new Date();
//             var limitmonth = cmonth.getMonth();
//             var newdetails;
//             var j = parseInt(limitmonth)-6;;
//             for(i=0; i < months.length; i++){
//                 if(i < limitmonth && i >=j ){                   
                   
//                         newdetails= {
//                             payroll_salary: 0,
//                             claim_amount:0,
//                             total_expense_month: 0,
//                             month: months[i],
//                             amount: 0,
//                             monthindex: i
//                         }   
//                         data.unshift(newdetails)                     
//                 }                 
//             }
//             deferred.resolve({status:1,message:"Company expense ",expense_list:data,total_expense_month:0,currentMonthexpense:currentMonthexpense})
//            }
//        }
//    })     
//         // var condition = "where (leave_type='" + leave_type + "' or from_date='" + from_date + "' or to_date='" + to_date + "' or status='" + status + "' or emp_id=" + emp_id + ")";
//         // var leave_Query = '';
//         // var leaveQuery = "select emp_id as employee_id,FN_STATUS(leave_id, 'leave') as leave_status,leave_id,FN_EMPID(emp_id) as emp_id,leave_type,from_date,to_date,from_time,to_time,FN_LEAVE_DETAILS_ACTION(leave_id,emp_id)as action_status,IFNULL(FN_EMPLOYEE_NAME(emp_id),'Super Admin') as employee_name from " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + "  ";

//         // if (leave_type != '' || status != 0 || from_date != '0000-00-00' || to_date != '0000-00-00' || emp_id != 0) {
//         //     leave_Query = leaveQuery + " " + condition;
//         // } else {
//         //     leave_Query = leaveQuery;
//         // }

//         // sql.query(leave_Query, function (err, masterData) {
//         //     if (err) {
//         //         console.log(err);
//         //         deferred.resolve({ status: 0, message: "Something Went Wrong" });
//         //     } else {

//         //         if (masterData.length > 0) {
//         //             masterData.forEach((data) => {
//         //                 var dbleavefrom_date = moment.utc(data.from_date).format();
//         //                 var dbleaveto_date = moment.utc(data.to_date).format();
//         //                 var from_date = moment(dbleavefrom_date).local();
//         //                 var to_date = moment(dbleaveto_date).local();
//         //                 var getfromdate = moment(from_date).format("DD MMM YYYY");
//         //                 var gettodate = moment(to_date).format("DD MMM YYYY");

//         //                 response.push({
//         //                     emp_id: data.emp_id,
//         //                     leave_type: data.leave_type,
//         //                     from_date: getfromdate,
//         //                     to_date: gettodate,
//         //                     from_time: data.from_time,
//         //                     to_time: data.to_time,
//         //                     action_status: data.action_status,
//         //                     employee_primary_id: data.employee_id,
//         //                     employee_name: (data.employee_name != undefined) ? data.employee_name : 'Super admin',
//         //                     status: data.leave_status,
//         //                 });
//         //                 deferred.resolve({ status: 1, message: "Leave details", leave_details: response });
//         //             });

//         //         } else {
//         //             deferred.resolve({ status: 0, message: "No data found", leave_details: [] });
//         //         }
//         //     }
//         // });

//         return deferred.promise;
//     },
// dashboardNewchangedExpense: (company_id,year) => {
//         var deferred = q.defer();
//         var current_date=moment().format("YYYY-MM-DD")
//        var lastsix_month= moment(current_date).subtract(6, 'months').format('MM')
//   var currentMonthexpense=0;
//    var cuurentyear=moment().format("YYYY")
//    var currentmonth=moment().format("MM")
//    var expensequery="select pm.total_salary_amount as payroll_salary,cd.amount as claim_amount ,(pm.total_salary_amount + cd.amount) as total_expense_month,IFNULL(pm.month,0) as month_value ,pm.total_salary_amount as amount from hrm_payroll_for_month as pm inner join hrm_claim_details as  cd  on pm.month >= "+lastsix_month+" and pm.month <= "+currentmonth+" and pm.year="+year+"  and cd.status=2 and pm.status=2   where cd.month >= "+lastsix_month+" and cd.month <= "+currentmonth+" and cd.year="+year+"  and cd.company_id="+company_id+" and cd.status=2 and pm.status=2 group  by pm.id order by pm.month desc";
//    sql.query(expensequery,function(err,data)
//    {
// console.log("expense",data)
//        if(err)
//        {
//            console.log(err)
//            deferred.resolve({status:0,message:"Something went wrong"})
//        }
//        else
//        {
//         var differnce='';
//         var month_days=0
//         var months=['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
//         // console.log('benfits_data => ',data)
//         // console.log('benfits_query =========> ',expensequery)
//            if(data.length > 0)
//            {
//                 for(k=0;k<data.length;k++){
//                     var benfits_query="SELECT pay.total_salary_amount as payroll_salary,cd.amount as claim_amount ,(pay.total_salary_amount + cd.amount) as total_expense FROM hrm_claim_details as cd inner join hrm_payroll_for_month as pay on cd.month <= '"+data[k].month+"' and pay.month <= '"+data[k].month+"' and cd.year='"+cuurentyear+"' and cd.status=2 and pay.status=2 where pay.company_id="+company_id+" and pay.year='"+cuurentyear+"' group by pay.id";
//                     sql.query(benfits_query,function(err,benfitsdata)
//                     {
                        
//                     if(err)
//                     {
//                         console.log(err);
//                         deferred.resolve({status:0,message:"SOmething went wrong"})
//                     }
//                     else
//                     {
//                         console.log("benfits_query ==>",benfits_query)
//                         var total_expenses=(benfitsdata.length > 0)?benfitsdata[0].total_expense:0
//                         var expense=[];
//                         expense.push({total_expenses})
//                         var monthcount = data.length;
//                         i=0;
//                         data.forEach((result,index)=>
//                         { 
//                             var month_name= (result.month_value!='NaN')?parseInt(result.month_value) - 1 : ''
                   
//                              data[index].month= months[month_name];
//                              data[index].monthindex= month_name;
//                             // data[index].payroll_month=moment([cuurentyear,0,month_days]).month(result.month).format("MMMM");
                           
                            
//                              data[index].amount=(result.total_expense_month!=undefined)?result.total_expense_month:0
                             
//                             i++;
                     
//                         var cmonth = new Date();
//                         console.log("cureent month",cmonth)
//                         var limitmonth = cmonth.getMonth();
//                         console.log("j",limitmonth)
//                         var newdetails;
//                         var j = parseInt(limitmonth)-6;
                       
//                         for(i=0; i < months.length; i++){
//                             if(i < limitmonth && i >= j){
//                                 console.log("monthindex",i)
//                                 var  found = data.some(el => el.month_value === months[i]);
//                                 console.log("found",found)
//                                 if(!found) { 
//                                     newdetails= {
//                                         payroll_salary:(result.payroll_salary!=undefined)?result.payroll_salary:0,
//                                         claim_amount:0,
//                                         total_expense_month: 0,
//                                         month: (months[i]!=null)?months[i]:'',
//                                         amount: 0,
//                                         monthindex: (i!=null)?i +1:0
//                                     }   
//                                     data.unshift(newdetails) 
//                                 }
                                 
//                             }
                             
//                         }
//                     })
//                         var current_month_total_expense="SELECT FN_CURRENT_MONTH_TOTAL_EXPENSE("+company_id+") as current_month_total_expense"
//                                                 sql.query(current_month_total_expense,function(err,cexpensedata)
//                                                 {
//                                                     console.log(current_month_total_expense)
//                                                     if(err)
//                                                     {
//                                                         console.log(err);
//                                                     }
//                                                     else
//                                                     {
//                                                         currentMonthexpense=cexpensedata[0].current_month_total_expense
//                         //                             //  cexpensedata.forEach((result,index)=>
//                         //                             //  {
//                         //                             //     cexpensedata[index].currentmonth_expense=(cexpensedata.length>0)?result.current_total_expense:0;
//                         //                             //     delete result.payroll_salary;
//                         //                             //     delete result.claim_amount;
//                         //                             //     delete result.current_total_expense
//                         //                             //  })
//                         //                                 //currentMonthexpense=(cexpensedata.length>0)?cexpensedata[1]:0;
                        
//                                                 }
//                                                 deferred.resolve({status:1,message:"Company expense ",expense_list:data,total_expense_month:expense,currentMonthexpense:currentMonthexpense})
//                                                    // deferred.resolve({status:1,message:"Company expense ",expense_list:data,total_expense_month:expense,currentMonthexpense:currentMonthexpense})
//                                         })
                                                
                        
                        
                        
//                     }
//                 })
//                 }
 
//            }
//            else
//            {
//             var cmonth = new Date();
//             var limitmonth = cmonth.getMonth();
//             var newdetails;
//            var j=0;
//            console.log("jelse",j)
//             for(i=0; i < months.length; i++){
//                 if(i < limitmonth && i >= j){                   
                   
//                         newdetails= {
//                             payroll_salary: 0,
//                             claim_amount:0,
//                             total_expense_month: 0,
//                             month: months[i],
//                             amount: 0,
//                             monthindex: i
//                         }   
//                         data.unshift(newdetails)                     
//                 }                 
//             }
//             deferred.resolve({status:1,message:"Company expense ",expense_list:data,total_expense_month:0})
//            }
//        }
//    })     
//         // var condition = "where (leave_type='" + leave_type + "' or from_date='" + from_date + "' or to_date='" + to_date + "' or status='" + status + "' or emp_id=" + emp_id + ")";
//         // var leave_Query = '';
//         // var leaveQuery = "select emp_id as employee_id,FN_STATUS(leave_id, 'leave') as leave_status,leave_id,FN_EMPID(emp_id) as emp_id,leave_type,from_date,to_date,from_time,to_time,FN_LEAVE_DETAILS_ACTION(leave_id,emp_id)as action_status,IFNULL(FN_EMPLOYEE_NAME(emp_id),'Super Admin') as employee_name from " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + "  ";
//         // if (leave_type != '' || status != 0 || from_date != '0000-00-00' || to_date != '0000-00-00' || emp_id != 0) {
//         //     leave_Query = leaveQuery + " " + condition;
//         // } else {
//         //     leave_Query = leaveQuery;
//         // }
//         // sql.query(leave_Query, function (err, masterData) {
//         //     if (err) {
//         //         console.log(err);
//         //         deferred.resolve({ status: 0, message: "Something Went Wrong" });
//         //     } else {
//         //         if (masterData.length > 0) {
//         //             masterData.forEach((data) => {
//         //                 var dbleavefrom_date = moment.utc(data.from_date).format();
//         //                 var dbleaveto_date = moment.utc(data.to_date).format();
//         //                 var from_date = moment(dbleavefrom_date).local();
//         //                 var to_date = moment(dbleaveto_date).local();
//         //                 var getfromdate = moment(from_date).format("DD MMM YYYY");
//         //                 var gettodate = moment(to_date).format("DD MMM YYYY");
//         //                 response.push({
//         //                     emp_id: data.emp_id,
//         //                     leave_type: data.leave_type,
//         //                     from_date: getfromdate,
//         //                     to_date: gettodate,
//         //                     from_time: data.from_time,
//         //                     to_time: data.to_time,
//         //                     action_status: data.action_status,
//         //                     employee_primary_id: data.employee_id,
//         //                     employee_name: (data.employee_name != undefined) ? data.employee_name : 'Super admin',
//         //                     status: data.leave_status,
//         //                 });
//         //                 deferred.resolve({ status: 1, message: "Leave details", leave_details: response });
//         //             });
//         //         } else {
//         //             deferred.resolve({ status: 0, message: "No data found", leave_details: [] });
//         //         }
//         //     }
//         // });
//         return deferred.promise;
//     },
    leavedetailsbyId: (emp_id, leave_id) => {
        var deferred = q.defer();
        var response = [];
        var leaveQuery = "select emp_id,leave_type,from_date,to_date,from_time,to_time,reason,FN_EMPID(emp_id) as empid from " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " where (emp_id=" + emp_id + " or leave_id=" + leave_id + ") ";
        sql.query(leaveQuery, function (err, masterData) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Something Went Wrong" });
            } else {

                if (masterData.length > 0) {
                    var leavetype = masterData[0].leave_type;

                    var leave_typeQuery = "select * from hrm_leave_type where leave_type='" + leavetype + "'";
                    sql.query(leave_typeQuery, function (err, leavetypedata) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Something Went Wrong" });
                        }
                        else {
                            if (leavetypedata.length > 0) {
                                var empid = masterData[0].emp_id
                                var employeeName = "select firstname,middlename,lastname from hrm_employee_details where emp_id=" + empid + "";
                                sql.query(employeeName, function (err, employeedata) {
                                    if (err) {
                                        console.log(err);
                                        deferred.resolve({ status: 0, message: "Something Went Wrong" });
                                    } else {
                                        if (employeedata.length > 0) {
                                            var name = ''
                                            var first_name = '';
                                            var middle_name = '';
                                            var last_name = '';
                                            masterData.forEach((data) => {
                                                var dbleavefrom_date = moment.utc(data.from_date).format();
                                                var dbleaveto_date = moment.utc(data.to_date).format();
                                                var from_date = moment(dbleavefrom_date).local();
                                                var to_date = moment(dbleaveto_date).local();
                                                var getfromdate = moment(from_date).format("DD MMM YYYY");
                                                var gettodate = moment(to_date).format("DD MMM YYYY");

                                                first_name = (employeedata[0].firstname != undefined || employeedata[0].firstname != '') ? employeedata[0].firstname : '';
                                                last_name = (employeedata[0].lastname != undefined || employeedata[0].lastname != '') ? employeedata[0].lastname : '';
                                                middle_name = (employeedata[0].middlename != undefined || employeedata[0].middlename != '') ? employeedata[0].middlename : ''
                                                name = first_name + " " + middle_name + " " + last_name;

                                                response.push({
                                                    leave_type: leavetypedata[0].l_id,
                                                    from_date: getfromdate,
                                                    to_date: gettodate,
                                                    from_time: data.from_time,
                                                    to_time: data.to_time,
                                                    reason: data.reason,
                                                    emp_id: data.emp_id,
                                                    employee_name: name,
                                                    empid: data.empid
                                                });

                                                deferred.resolve({ status: 1, message: "Leave details", leave_details: response });
                                            });
                                        } else {
                                            deferred.resolve({ status: 0, message: "Employee not found" });
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else {
                    deferred.resolve({ status: 0, message: "No data found", leave_details: [] });
                }
            }
        });

        return deferred.promise;
    },
    

    holidayListByYear: (year, company_id) => {
        var deferred = q.defer();

        var checkingQuery = "SELECT * from " + tableConfig.HRM_HOLIDAYS + " WHERE year = '" + year + "' AND company_id = '" + company_id + "'";
        sql.query(checkingQuery, function (err, result) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to get holiday list" });
            }
            else {
                if (result.length > 0) {
                    result.forEach((holiday, index) => {
                        result[index].from_date = moment(holiday.from_date).format("YYYY-MM-DD");
                        result[index].to_date = (holiday.to_date != undefined && holiday.to_date != '') ? moment(holiday.to_date).format("YYYY-MM-DD") : '';
                    });
                    deferred.resolve({ status: 1, message: "Holiday list", list: result });
                } else {
                    deferred.resolve({ status: 0, message: "No holidays found" });
                }
            }
        });
        return deferred.promise;
    },

    assignWork: (company_id, emp_type, work_start_time, work_end_time, review_by, confirmation_from, task_description, employee_list, shift_type, outlet_name,login_id) => {
        var deferred = q.defer();
        console.log("empy_type",emp_type)
 if(emp_type==5 || emp_type==6)
 {
    var insertQuery = "INSERT INTO " + tableConfig.HRM_WORK_DETAILS + " (company_id,emp_type,work_start_time,work_end_time,review_by,confirmation_from,task_description,employee_list,shift_type,outlet_name,from_emp_id) VALUES ('" + company_id + "','" + emp_type + "','" + work_start_time + "','" + work_end_time + "','" + review_by + "','" + confirmation_from + "','" + task_description + "','" + employee_list + "','" + shift_type + "','" + outlet_name + "','"+login_id+"')";
    sql.query(insertQuery, function (err, result) {
        if (err) {
            console.log(err);
            deferred.resolve({ status: 0, message: "Failed to assign work" });
        } else {
            if(result.affectedRows > 0)
            {
                 var emp_list=employee_list.split(',')
                console.log("emp_list",emp_list)
                for(i=0;i<emp_list.length;i++)
                {
                    console.log("emplist",emp_list[i])
                    var Shiftquery="Insert into hrm_employee_shift_details(emp_id,shift_id,shift_from_date,shift_to_date)VALUES('"+emp_list[i]+"',"+shift_type+",'"+work_start_time+"','"+work_end_time+"')"
                    sql.query(Shiftquery,function(err,shiftdata)
                    {
                        console.log("Shiftquery",Shiftquery)
                        if(err)
                        {
                            console.log(err);
                            deferred.resolve({status:0,message:"Something went wrong"})
                        }
                        else
                        {
                            deferred.resolve({ status: 1, message: "Task assigned successfully" });
                        }
                    })
                }
            }
        }
    });
 }
 else
 {
    var insertQuery = "INSERT INTO " + tableConfig.HRM_WORK_DETAILS + " (company_id,emp_type,work_start_time,work_end_time,review_by,confirmation_from,task_description,employee_list,shift_type,outlet_name,from_emp_id) VALUES ('" + company_id + "','" + emp_type + "','" + work_start_time + "','" + work_end_time + "','" + review_by + "','" + confirmation_from + "','" + task_description + "','" + employee_list + "','" + shift_type + "','" + outlet_name + "','"+login_id+"')";
    sql.query(insertQuery, function (err, result) {
        if (err) {
            console.log(err);
            deferred.resolve({ status: 0, message: "Failed to assign work" });
        } else {
            deferred.resolve({ status: 1, message: "Task assigned successfully" });
        }
    });
 }
        return deferred.promise;
    },
    // assignWork: (company_id, emp_type, work_start_time, work_end_time, review_by, confirmation_from, task_description, employee_list, shift_type, outlet_name,login_id) => {
    //     var deferred = q.defer();

    //     var insertQuery = "INSERT INTO " + tableConfig.HRM_WORK_DETAILS + " (company_id,emp_type,work_start_time,work_end_time,review_by,confirmation_from,task_description,employee_list,shift_type,outlet_name,from_emp_id) VALUES ('" + company_id + "','" + emp_type + "','" + work_start_time + "','" + work_end_time + "','" + review_by + "','" + confirmation_from + "','" + task_description + "','" + employee_list + "','" + shift_type + "','" + outlet_name + "','"+login_id+"')";
    //     sql.query(insertQuery, function (err, result) {

    //         if (err) {
    //             console.log(err);
    //             deferred.resolve({ status: 0, message: "Failed to assign work" });
    //         } else {
    //             deferred.resolve({ status: 1, message: "Task assigned successfully" });
    //         }
    //     });
    //     return deferred.promise;
    // },
    workUpdate: (company_id, emp_type, work_start_time, work_end_time, review_by, confirmation_from, task_description, employee_list, shift_type,outlet_name,work_id) => {
        var deferred = q.defer();
console.log("Ed")
var checkingQuery="select * from hrm_work_details where id="+work_id+" and company_id="+company_id+""
sql.query(checkingQuery,function(err,checkdata)
{
    if(err)
    {
        console.log(err)
    }
    else
    {
        if(checkdata.length > 0)
        {
            var updateQuery = "Update " + tableConfig.HRM_WORK_DETAILS + " SET  company_id="+company_id+",emp_type='"+emp_type+"',work_start_time='"+work_start_time+"',work_end_time='"+work_end_time+"',review_by='"+review_by+"',confirmation_from='"+confirmation_from+"',task_description='"+task_description+"',employee_list='"+employee_list+"',shift_type='"+shift_type+"',outlet_name='"+outlet_name+"'where id="+work_id+" and company_id="+company_id+"";
            console.log(updateQuery)
            sql.query(updateQuery, function (err, result) {
                
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: "Failed to Update work" });
                } else {
                    deferred.resolve({ status: 1, message: "Update task successfully" });
                }
            });
        }
        else
        {
            deferred.resolve({status:0,message:"No work data found"})
        }
    }
})
      
        return deferred.promise;
    },

    updateLeave: (leave_id, leave_type, from_date, to_date, from_time, to_time, reason) => {
        var deferred = q.defer();
        var getleavetypeQuery = "select leave_type as leavetypestring  from hrm_leave_type where l_id=" + leave_type;
        sql.query(getleavetypeQuery, function (err, data) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, mesage: "Something Went Wrong" });
            }
            else {
                var leavetype = data[0].leavetypestring
                var UpdateQuery = "UPDATE  " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " set leave_type='" + leavetype + "',from_date='" + from_date + "',to_date='" + to_date + "',from_time='" + from_time + "',to_time='" + to_time + "',reason='" + reason + "' where leave_id =" + leave_id + "";
                sql.query(UpdateQuery, function (err, masterData) {

                    if (err) {
                        console.log(err);
                        deferred.resolve({ status: 0, message: "Failed to update leave" });
                    } else {

                        if (masterData.affectedRows > 0) {
                            deferred.resolve({ status: 1, message: "Successfully to update leave" });
                        } else {
                            deferred.resolve({ status: 0, message: "Failed to update leave" });
                        }
                    }
                });
            }
        });

        return deferred.promise;
    },
    dropDownList: async (req) => {
        var deferred = q.defer();
        var response = [];
        var role_list = [];
        var role_ids = [];
        var role_keys = [];
        var workers_list = [];
        var employeelist =[];
        if (req.body.company_id != undefined && req.body.company_id != '') {
            var company_id = req.body.company_id;
            var role_id=(req.body.role_id!=undefined)?req.body.role_id:0;
            var month=(req.body.month!=undefined)?req.body.month:0;
            var year =moment().format("YYYY");
            console.log("req.body",req.body)
            var allowance_type_query = "SELECT allowance_name,id,amount FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE status = '1' AND company_id = '" + company_id + "'";
            var allowanceTypedata = await commonFunction.getQueryResults(allowance_type_query);
            var leave_type = "select leave_type,l_id from hrm_leave_type";
            sql.query(leave_type, function (err, data) {
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: "Something Went wrong" });
                }
                else {
                    if (data.length > 0) {
                        data.forEach((result) => {
                            response.push({
                                id: result.l_id,
                                leave_name: result.leave_type
                            })
                        });
                        var role_query = "select * from hrm_user_role where role_key!='SADMIN'";
                        sql.query(role_query, function (err, list) {
                            if (err) {
                                console.log(err);
                                deferred.resolve({ status: 0, message: "Something Went Wrong" });
                            } else {
                                if (list.length > 0) {
                                    list.forEach((rows) => {
                                        role_list.push({ role_id: rows.id, empolyee_type: rows.role });
                                        role_ids.push(rows.id);
                                        var role_key_new = "'" + rows.role_key + "'";
                                        role_keys.push(role_key_new);
                                    });
                                    var shift_query = "select shift_id,shift_name from hrm_shift_type";
                                    sql.query(shift_query, function (err, shift_list) {
                                        if (err) {
                                            console.log(err);
                                            deferred.resolve({ status: 0, message: "Something Went Wrong" });
                                        } else {
                                            if (shift_list.length > 0) {
                                             //  var employee_query="select um.emp_id as emp_id,um.id as id,IFNULL(em.firstname,'') as firstname,IFNULL(em.lastname,'') as lastname,IFNULL(em.middlename,'') as middlename   from hrm_employee_details  as em inner join hrm_user_master as um  ON em.emp_id=um.id and um.role_id!=1 and um.role_id="+role_id+" and um.company_id="+company_id+" and um.status=1 "
                                                var employee_query = "select ed.emp_id as employee_id ,um.emp_id as emp_id ,um.role_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.lastname,'') as lastname,IFNULL(ed.middlename,'') as middlename,um.emp_id,ur.role_key from hrm_user_master as um left join hrm_user_role as ur on ur.id=um.role_id inner join hrm_employee_details as ed ON ed.emp_id=um.id where ur.role_key IN(" + role_keys + ") AND um.role_id  IN("+role_ids+") AND um.company_id = '" + company_id + "'  and um.status=1 group by ed.emp_id";
                                                sql.query(employee_query, function (err, employee_list) {
                                                    console.log("employee",employee_query)
                                                    if (err) {
                                                        console.log(err);
                                                        deferred.resolve({ status: 0, message: "Something Went Wrong" });
                                                    } else {
                                                        var name = '';
                                                        employee_list.forEach((result, index) => {
                                                            name = (result.firstname + " " + result.middlename + " " + result.lastname)
                                                            workers_list.push({ emp_id: result.emp_id, id: result.employee_id, name: name })
                                                        });
                                                        var outlet_query = "select id,branch_details from hrm_comp_branches where company_id=" + company_id + "";
                                                        sql.query(outlet_query, function (err, outletdata) {
                                                            if (err) {
                                                                console.log(err);
                                                                deferred.resolve({ status: 0, message: "Something went wrong" });
                                                            } else {
                                                                
                                                                var branch_details = JSON.parse(outletdata[0].branch_details)
                                                                //branch_response.push({branch_primary_id,branch_details})
                                                           // var payroll_detailsQuery="select um.emp_id,um.id as id,CONCAT(em.firstname,'',em.middlename,'',em.lastname) as name from hrm_employee_details  as em inner join hrm_user_master as um   on um.id=em.emp_id and um.status=1 and um.company_id="+company_id+" where MONTH(joined_date)<='"+month+"' and YEAR(joined_date)<=YEAR(CURDATE())";
                                                        var payroll_detailsQuery="select um.emp_id,um.id as id,CONCAT(em.firstname,' ',em.middlename,' ',em.lastname) as name from hrm_employee_details  as em inner join hrm_user_master as um   on um.id=em.emp_id and um.status=1 and um.company_id="+company_id+" where  DATE_FORMAT(joined_date, '%Y-%m')<='"+year+"-"+month+"'";
                                                         // console.log('checkquery',payroll_detailsQuery)
                                                            sql.query(payroll_detailsQuery,function(err,data)
                                                            {
                                                                console.log("payroll_detailsQuery",payroll_detailsQuery)
                                                                if(err)
                                                                {
                                                                    console.log(err);
                                                                    deferred.resolve({status:0,message:"Something went wrong"})
                                                                }
                                                                else
                                                                {
                                                                    console.log(data)
                                                                    var payroll_emp_name=''
                                                                    payroll_emp_name=data
                                                                    var employee_listQuery="select um.emp_id as emp_id,um.id as id,IFNULL(em.firstname,'') as firstname,IFNULL(em.lastname,'') as lastname,IFNULL(em.middlename,'') as middlename   from hrm_employee_details  as em inner join hrm_user_master as um  ON em.emp_id=um.id and um.role_id!=1 and um.role_id="+role_id+" and um.company_id="+company_id+" and um.status=1 "
                                                                    sql.query(employee_listQuery,function(err,result)
                                                                    {
                                                                        if(err)
                                                                        {
                                                                            console.log(err);
                                                                            deferred.resolve({status:0,message:"Something went wrong"})
                                                                        }
                                                                        else
                                                                        {
                                                                            console.log("result",result)
                                                                            var employee_name = '';
                                                        result.forEach((row, index) => {
                                                            employee_name = (row.firstname + " " + row.middlename + " " + row.lastname)
                                                            employeelist.push({ emp_id: row.emp_id, id: row.id, name: employee_name })
                                                        });                 
                                                        console.log("employee_list",employeelist)
                                                        var country_query="select id,nicename from hrm_country";
                                                        sql.query(country_query,function(err,country_data)
                                                        {
                                                            if(err)
                                                            {
                                                                console.log(err);
                                                                deferred.resolve({status:0,message:"Something went wrong"})
                                                            }
                                                            else
                                                            {
                                                                deferred.resolve({ status: 1, message: "Leave_type list", leave_type: response, role_list, shiftlist: shift_list, workers_list, allowance_type: allowanceTypedata, outlet_list: branch_details,payroll_drop_down:payroll_emp_name,employeelist:employeelist,country_data });
                                                            }
                                                        })
                                                        
                                                                        }
                                                                       
                                                                    })
                                                                   
                                                                }
                                                            })
                                                                
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        } else {
            deferred.resolve({ status: 0, message: "Please enter company_id" });
        }
        return deferred.promise;
    },
    // dropDownList: async (req) => {
    //     var deferred = q.defer();
    //     var response = [];
    //     var role_list = [];
    //     var role_ids = [];
    //     var role_keys = [];
    //     var workers_list = [];

    //     if (req.body.company_id != undefined && req.body.company_id != '') {
    //         var company_id = req.body.company_id;
    //         var month=(req.body.month!=undefined)?req.body.month:0;
    //         var year =(req.body.year!=undefined)?req.body.year:0;
    //         var allowance_type_query = "SELECT allowance_name,id,amount FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE status = '1' AND company_id = '" + company_id + "'";
    //         var allowanceTypedata = await commonFunction.getQueryResults(allowance_type_query);

    //         var leave_type = "select leave_type,l_id from hrm_leave_type";
    //         sql.query(leave_type, function (err, data) {
    //             if (err) {
    //                 console.log(err);
    //                 deferred.resolve({ status: 0, message: "Something Went wrong" });
    //             }
    //             else {
    //                 if (data.length > 0) {
    //                     data.forEach((result) => {
    //                         response.push({
    //                             id: result.l_id,
    //                             leave_name: result.leave_type
    //                         })
    //                     });

    //                     var role_query = "select * from hrm_user_role where role_key!='SADMIN'";
    //                     sql.query(role_query, function (err, list) {
    //                         if (err) {
    //                             console.log(err);
    //                             deferred.resolve({ status: 0, message: "Something Went Wrong" });
    //                         } else {
    //                             if (list.length > 0) {
    //                                 list.forEach((rows) => {
    //                                     role_list.push({ role_id: rows.id, empolyee_type: rows.role });
    //                                     role_ids.push(rows.id);
    //                                     var role_key_new = "'" + rows.role_key + "'";
    //                                     role_keys.push(role_key_new);
    //                                 });

    //                                 var shift_query = "select shift_id,shift_name from hrm_shift_type";
    //                                 sql.query(shift_query, function (err, shift_list) {
    //                                     if (err) {
    //                                         console.log(err);
    //                                         deferred.resolve({ status: 0, message: "Something Went Wrong" });
    //                                     } else {
    //                                         if (shift_list.length > 0) {
    //                                             var employee_query = "select ed.emp_id as employee_id ,um.emp_id as emp_id ,um.role_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.lastname,'') as lastname,IFNULL(ed.middlename,'') as middlename,um.emp_id,ur.role_key from hrm_user_master as um left join hrm_user_role as ur on ur.id=um.role_id inner join hrm_employee_details as ed ON ed.emp_id=um.id where ur.role_key IN(" + role_keys + ") AND um.role_id In(" + role_ids + ") AND um.company_id = '" + company_id + "' group by ed.emp_id";
    //                                             sql.query(employee_query, function (err, employee_list) {

    //                                                 if (err) {
    //                                                     console.log(err);
    //                                                     deferred.resolve({ status: 0, message: "Something Went Wrong" });
    //                                                 } else {
    //                                                     var name = '';
    //                                                     employee_list.forEach((result, index) => {
    //                                                         name = (result.firstname + " " + result.middlename + " " + result.lastname)
    //                                                         workers_list.push({ emp_id: result.emp_id, id: result.employee_id, name: name })
    //                                                     });

    //                                                     var outlet_query = "select id,branch_details from hrm_comp_branches where company_id=" + company_id + "";
    //                                                     sql.query(outlet_query, function (err, outletdata) {
    //                                                         if (err) {
    //                                                             console.log(err);
    //                                                             deferred.resolve({ status: 0, message: "Something went wrong" });
    //                                                         } else {
                                                                
    //                                                             var branch_details = JSON.parse(outletdata[0].branch_details)
    //                                                             //branch_response.push({branch_primary_id,branch_details})
    //                                                         var payroll_detailsQuery="select CONCAT(em.firstname,'',em.middlename,'',em.lastname) as emp_name from hrm_employee_details  as em inner join hrm_user_master as um   on um.id=em.emp_id and um.status=1 and um.company_id="+company_id+" where MONTH(joined_date)='"+month+"' and YEAR(joined_date)='"+year+"'";
    //                                                         sql.query(payroll_detailsQuery,function(err,data)
    //                                                         {
    //                                                             if(err)
    //                                                             {
    //                                                                 console.log(err);
    //                                                                 deferred.resolve({status:0,message:"Something went wrong"})
    //                                                             }
    //                                                             else
    //                                                             {
    //                                                                 console.log(data)
    //                                                                 var payroll_emp_name=''
    //                                                                 payroll_emp_name=data
                                                                    
    //                                                                 deferred.resolve({ status: 1, message: "Leave_type list", leave_type: response, role_list, shiftlist: shift_list, workers_list, allowance_type: allowanceTypedata, outlet_list: branch_details,payroll_drop_down:payroll_emp_name });
    //                                                             }
    //                                                         })
                                                                
    //                                                         }
    //                                                     });
    //                                                 }
    //                                             });
    //                                         }
    //                                     }
    //                                 });
    //                             }
    //                         }
    //                     });
    //                 }
    //             }
    //         });
    //     } else {
    //         deferred.resolve({ status: 0, message: "Please enter company_id" });
    //     }
    //     return deferred.promise;
    // },
    // dropDownList: async (req) => {
    //     var deferred = q.defer();
    //     var response = [];
    //     var role_list = [];
    //     var role_ids = [];
    //     var role_keys = [];
    //     var workers_list = [];

    //     if (req.body.company_id != undefined && req.body.company_id != '') {
    //         var company_id = req.body.company_id;

    //         var allowance_type_query = "SELECT allowance_name,id,amount FROM " + tableConfig.HRM_ALLOWANCE_TYPES + " WHERE status = '1' AND company_id = '" + company_id + "'";
    //         var allowanceTypedata = await commonFunction.getQueryResults(allowance_type_query);

    //         var leave_type = "select leave_type,l_id from hrm_leave_type";
    //         sql.query(leave_type, function (err, data) {
    //             if (err) {
    //                 console.log(err);
    //                 deferred.resolve({ status: 0, message: "Something Went wrong" });
    //             }
    //             else {
    //                 if (data.length > 0) {
    //                     data.forEach((result) => {
    //                         response.push({
    //                             id: result.l_id,
    //                             leave_name: result.leave_type
    //                         })
    //                     });

    //                     var role_query = "select * from hrm_user_role where role_key!='SADMIN'";
    //                     sql.query(role_query, function (err, list) {
    //                         if (err) {
    //                             console.log(err);
    //                             deferred.resolve({ status: 0, message: "Something Went Wrong" });
    //                         } else {
    //                             if (list.length > 0) {
    //                                 list.forEach((rows) => {
    //                                     role_list.push({ role_id: rows.id, empolyee_type: rows.role });
    //                                     role_ids.push(rows.id);
    //                                     var role_key_new = "'" + rows.role_key + "'";
    //                                     role_keys.push(role_key_new);
    //                                 });

    //                                 var shift_query = "select shift_id,shift_name from hrm_shift_type";
    //                                 sql.query(shift_query, function (err, shift_list) {
    //                                     if (err) {
    //                                         console.log(err);
    //                                         deferred.resolve({ status: 0, message: "Something Went Wrong" });
    //                                     } else {
    //                                         if (shift_list.length > 0) {
    //                                             var employee_query = "select ed.emp_id as employee_id ,um.emp_id as emp_id ,um.role_id,IFNULL(ed.firstname,'') as firstname,IFNULL(ed.lastname,'') as lastname,IFNULL(ed.middlename,'') as middlename,um.emp_id,ur.role_key from hrm_user_master as um left join hrm_user_role as ur on ur.id=um.role_id inner join hrm_employee_details as ed ON ed.emp_id=um.id where ur.role_key IN(" + role_keys + ") AND um.role_id In(" + role_ids + ") AND um.company_id = '" + company_id + "' group by ed.emp_id";
    //                                             sql.query(employee_query, function (err, employee_list) {

    //                                                 if (err) {
    //                                                     console.log(err);
    //                                                     deferred.resolve({ status: 0, message: "Something Went Wrong" });
    //                                                 } else {
    //                                                     var name = '';
    //                                                     employee_list.forEach((result, index) => {
    //                                                         name = (result.firstname + " " + result.middlename + " " + result.lastname)
    //                                                         workers_list.push({ emp_id: result.emp_id, id: result.employee_id, name: name })
    //                                                     });

    //                                                     var outlet_query = "select id,branch_details from hrm_comp_branches where company_id=" + company_id + "";
    //                                                     sql.query(outlet_query, function (err, outletdata) {
    //                                                         if (err) {
    //                                                             console.log(err);
    //                                                             deferred.resolve({ status: 0, message: "Something went wrong" });
    //                                                         } else {
                                                                
    //                                                             var branch_details = JSON.parse(outletdata[0].branch_details)
    //                                                             //branch_response.push({branch_primary_id,branch_details})
    //                                                             deferred.resolve({ status: 1, message: "Leave_type list", leave_type: response, role_list, shiftlist: shift_list, workers_list, allowance_type: allowanceTypedata, outlet_list: branch_details });
    //                                                         }
    //                                                     });
    //                                                 }
    //                                             });
    //                                         }
    //                                     }
    //                                 });
    //                             }
    //                         }
    //                     });
    //                 }
    //             }
    //         });
    //     } else {
    //         deferred.resolve({ status: 0, message: "Please enter company_id" });
    //     }
    //     return deferred.promise;
    // },

    dashbordlist: (company_id) => {
        var deferred = q.defer();

        var permission_count = 0;
        var attendence_count = 0;
        var curr = moment.utc().format("YYYY-MM-DD");
        var first = moment(curr).date()- moment(curr).day();
        var last = first + 6
        var curdate=moment().format("YYYY-MM-DD");
        var curdatToutc=moment.utc(curdate).format("YYYY-MM-DD");
        var utcTolocal=moment(curdatToutc).local();
        var normalutc=moment(curdatToutc).format("YYYY-MM-DD")
        console.log("currentdate",normalutc)
        var firstday = moment.utc().date(first).format("YYYY-MM-DD")// new Date(curr.setDate(first)).toUTCString();
        var lastday = moment.utc().date(last).format("YYYY-MM-DD")
        // var firstday = new Date(curr.setDate(first)).toUTCString();
        // var lastday = new Date(curr.setDate(last)).toUTCString();
        var leave_type = "select leave_type,l_id from hrm_leave_type where l_id=9";

        sql.query(leave_type, function (err, data) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Something Went wrong" })
            } else {

                var leave_type = (data.length > 0) ? data[0].leave_type : '';
                var permission_query = "select count(ld.emp_id) as count from hrm_leave_request as ld  inner join hrm_user_master as um on ld.emp_id=um.id where ld.leave_type='" + leave_type + "'  and um.role_id!=1 and um.company_id=" + company_id + " and (ld.status=1 or ld.status=2 ) and from_date='"+normalutc+"'";
                console.log("permission_query",permission_query)
                sql.query(permission_query, function (err, result) {

                    if (err) {
                        console.log(err);
                        deferred.resolve({ status: 0, message: "Something went wrong" });
                    } else {
                        permission_count = (result.length == 0) ? 0 : result[0].count;
                        var employee_count = "select count(um.id) as total_count, GROUP_CONCAT(um.emp_id) as emp_ids from hrm_user_master as um inner join hrm_employee_details as em on em.emp_id=um.id  where um.status=1 and um.role_id!=1 and um.company_id=" + company_id + "";
                        sql.query(employee_count, function (err, employeedata) {
                            if (err) {
                                console.log(err);
                                deferred.resolve({ status: 0, message: "Something went wrong" });
                            } else {
                                console.log('employee_count', employee_count)
                                if (employeedata.length > 0) {
                                    employee_count = employeedata[0].total_count;
                                    var attendence_query = "select   count(ad.emp_id) as present_count from hrm_employee_attendence as ad inner join hrm_user_master as um  on um.id=ad.emp_id where um.role_id!=1 and um.company_id=" + company_id + " and um.status=1 and DATE(check_in)='"+normalutc+"'"
                                   console.log("attendence_query",attendence_query)
                                    sql.query(attendence_query, function (err, attendencedata) {
                                        if (err) {
                                            console.log(err);
                                            deferred.resolve({ status: 0, message: "Something Went wrong" });

                                        }
                                        else {

                                            attendence_count = attendencedata[0].present_count;
                                            attendence_count = 0
                                            attendence_count = attendencedata[0].present_count;
                                            var absent_count = 0;
                                            absent_count = employee_count - attendence_count

                                            var first_day = moment(firstday).format("YYYY-MM-DD");
                                            var last_day = moment(lastday).format("YYYY-MM-DD")
                                            var leave_request = "select count(lr.emp_id) as new_request_count from hrm_leave_request as lr inner join hrm_user_master as um on um.id=lr.emp_id where lr.status=1 and um.status=1 and um.role_id!=1 and from_date  between '" + first_day + "' and '" + last_day + "'";
                                            sql.query(leave_request, function (err, new_count) {
                                                if (err) {
                                                    console.log(err)
                                                    deferred.resolve({ status: 0, message: "Something Went wrong" })
                                                }
                                                else {
                                                    var leave_new_request_count = 0;
                                                    leave_new_request_count = new_count[0].new_request_count
                                                    var percentage = Math.round(attendence_count * 100 / employee_count) + " % "
                                                    var newemployeeQuery="select COUNT(em.emp_id) as newemployee_count from hrm_employee_details as em inner join hrm_user_master  as um on um.id=em.emp_id where um.status=1 and um.role_id!=1 and um.company_id="+company_id+" and MONTH(em.joined_date)=MONTH('"+normalutc+"')"
                                                 console.log("newemployeeQuery",newemployeeQuery)
                                                    sql.query(newemployeeQuery,function(err,newjoindata)
                                                    {
                                                        if(err)
                                                        {
                                                            console.log(err)
                                                            deferred.resolve({status:0,message:"Something went wrong"})
                                                        }
                                                        else
                                                        {
                                                            var newjoined_count=0
                                                            newjoined_count=newjoindata[0].newemployee_count
                                                            var employee_countquery="SELECT firstset.perment_count, secondset.temp FROM (SELECT COUNT(em.employment_type) as perment_count FROM hrm_employee_details as em inner join hrm_user_master as um on um.id=em.emp_id inner join hrm_employment_status as es on em.employment_type=es.emps_id and em.employment_type=7 and es.type=2 where um.role_id!=1 and um.status=1 and um.company_id="+company_id+") as firstset inner join (SELECT count(hrm_employee_details.emp_id) as temp FROM hrm_employee_details left join hrm_employment_status on hrm_employee_details.employment_type=hrm_employment_status.emps_id and hrm_employment_status.type=2 INNER JOIN hrm_user_master as um ON um.id = hrm_employee_details.emp_id where hrm_employee_details.employment_type!=7 and um.role_id!=1 and um.status=1 and um.company_id="+company_id+") as secondset"
                                                            sql.query(employee_countquery,async function(err,employee_data){
                                                                if(err)
                                                                {
                                                                    console.log(err)
                                                                }
                                                                else{
                                                                    var perment_count=0;
                                                                    var tempory_count=0;
                                                                    perment_count=employee_data[0].perment_count;
                                                                    tempory_count=employee_data[0].temp
                                                                    var getmonth=moment.utc().format("MM")

                                                                    var claim_query="select Count(*) as new_claim_count from  hrm_claim_details where month='"+getmonth+"' and status=1 and isdelete=0"
                                                                    var claimdata= await commonFunction.getQueryResults(claim_query);
                                                                    console.log("claim_query",claim_query)
                                                                    var claim_count=claimdata[0].new_claim_count;
                                                                    deferred.resolve({ status: 1, message: "Dashboard successfully", present_count: attendence_count, permission_count: permission_count, employee_count: employee_count, absent_count: absent_count, leave_new_request_count: leave_new_request_count, percenatge: percentage,newjoined_count:newjoined_count,perment_count:perment_count,tempory_count:tempory_count,claimcount:claim_count })
                                                                }
                                                            })
                                                            
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        })
        return deferred.promise;
    },

    remainingLeaveDetails: async (emp_id, month_year) => {
        var deferred = q.defer();

        var leaveTypeQuery = "SELECT * FROM " + tableConfig.HRM_LEAVE_TYPE + " WHERE status = '1'";
        var leaveType = await commonFunction.getQueryResults(leaveTypeQuery);
        var leaveTypeObject = {};
        var remainingLeaveObject = {};
        var list = [];

        if(leaveType.length > 0) {

        leaveType.forEach(leave_type => {
            if (leave_type.month_day == 'days') {
                leaveTypeObject[leave_type.l_id] = leave_type.duration;
            } else {
                leaveTypeObject[leave_type.l_id] = leave_type.duration * 30;
            }
        });

        var current_year = "YEAR(CURDATE())";
        var query = "SELECT from_date,to_date,leave_type_id from " + tableConfig.HRM_EMPLOYEE_LEAVE_REQUEST + " WHERE status = '2' AND YEAR(from_date) = " + current_year + " AND emp_id=" + emp_id;

        sql.query(query, function (err, approvedLeaves) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Something Went wrong" });
            } else {
                var numberOfDaysLeaveTaken = {};
                if (approvedLeaves.length > 0) {

                    approvedLeaves.forEach((leave, i) => {
                        let fdate = moment(leave.from_date).format('YYYY-MM-DD');
                        let edate = moment(leave.to_date).format('YYYY-MM-DD');
                        if (numberOfDaysLeaveTaken[leave.leave_type_id] == undefined) {
                            numberOfDaysLeaveTaken[leave.leave_type_id] = 0;
                        }
                        numberOfDaysLeaveTaken[leave.leave_type_id] = numberOfDaysLeaveTaken[leave.leave_type_id] + moment(edate).diff(fdate, 'days') + 1;
                    });
                }
                let  remaindays;
                leaveType.forEach(leave => {
                    var currentTaken = (numberOfDaysLeaveTaken[leave.l_id])?numberOfDaysLeaveTaken[leave.l_id]:0;
                    if(currentTaken>leaveTypeObject[leave.l_id])
                    {
                        remaindays=0
                    }
                    else
                    {
                        remaindays=(leaveTypeObject[leave.l_id] - currentTaken)
                    }
                    let details = {
                        id:leave.l_id,
                        leave_type: leave.leave_type,
                        total_days: leaveTypeObject[leave.l_id] ,
                        current_taken: currentTaken,
                        remaining_days:remaindays,
                        duration:'Days'
                    }
                    list.push(details);
                });

                deferred.resolve({ status: 1, message: "Remaining leave details for the employee fetched successfully",list:list });
            }
        });

    } else {
        deferred.resolve({ status: 0, message: "No leave types found",list:[] });
    }
        return deferred.promise;
    },

    Exportleave_details: (company_id) => {
        var deferred = q.defer();
        var query = "Select  lr.*,um.emp_id as empid,CONCAT(IFNULL(em.firstname,''),'',IFNULL(em.middlename,''),'',IFNULL(em.lastname,'')) as employeename,FN_STATUS_NAME(lr.status) as leave_status FROM hrm_leave_request as lr inner join  hrm_employee_details  as em  on lr.emp_id=em.emp_id inner join hrm_user_master as um  on um.id=lr.emp_id WHERE um.status='1' and um.company_id=" + company_id + " group by lr.leave_id  ";
        sql.query(query, function (err, user) {
console.log("query",query)
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
            } else {
                if (user.length > 0) {
                    deferred.resolve(user);
                }
                else {
                    deferred.resolve({ status: 0, message: "No data Found", details: [] });
                }
            }
        });
        return deferred.promise;
    },
    workList: (company_id,login_id,role_id) => {
        var deferred = q.defer();
        var shift_id = [];
        var employe_list = [];
        var condition="and  (FIND_IN_SET("+login_id+", work.employee_list) OR work.from_emp_id=" +login_id+ " OR work.review_by=" +role_id+ " OR work.confirmation_from=" +role_id+ ") "
        var  checking_Query='';
        var checkingQuery = "SELECT wd.role_key as review_role_key,d.role_key as confirmation_role_key,work.from_emp_id as login_id,work.status,FN_WORKLIST_LIST_ACTION(work.id,work.confirmation_from) as action_status,work.id,wd.role as review_role,d.role as confirmation_role,work.review_by,work.confirmation_from,work.outlet_name,work.emp_type,work.work_start_time,work.work_end_time,work.task_description,work.employee_list,work.shift_type from " + tableConfig.HRM_WORK_DETAILS + "  as work left join hrm_user_role as wd on wd.id=work.review_by left join hrm_user_role as d on d.id=work.confirmation_from where work.company_id=" + company_id+" group by work.id";
       console.log("checkingQuery",checkingQuery)
        //var checkingQuery = "SELECT work.from_emp_id as login_id,work.status,FN_WORKLIST_LIST_ACTION(work.id,work.confirmation_from) as action_status,work.id,work.outlet_name,work.emp_type,work.work_start_time,work.work_end_time,work.task_description,work.employee_list,work.shift_type from " + tableConfig.HRM_WORK_DETAILS + "  as work  where work.company_id=" + company_id+" group by work.id";
        if(login_id!=1) 
        {
           
            checkingQuery="SELECT wd.role_key as review_role_key,d.role_key as confirmation_role_key,work.from_emp_id as login_id,work.status,FN_WORKLIST_LIST_ACTION(work.id,work.confirmation_from) as action_status,work.id,wd.role as review_role,d.role as confirmation_role,work.review_by,work.confirmation_from,work.outlet_name,work.emp_type,work.work_start_time,work.work_end_time,work.task_description,work.employee_list,work.shift_type from " + tableConfig.HRM_WORK_DETAILS + "  as work left join hrm_user_role as wd on wd.id=work.review_by left join hrm_user_role as d on d.id=work.confirmation_from where work.company_id=" + company_id+" "+condition+"group by work.id"
        }
        // else
        // {
        //     checking_Query=checkingQuery+" "+condition;
           
        // }
     
       
        sql.query(checkingQuery, function (err, workdata) {
         console.log("query",checking_Query)
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to get Worklist" });
            } else {
                if (workdata.length > 0) {
                    workdata.forEach((row) => {
                        shift_id.push(row.shift_type);
                        employe_list.push(row.employee_list);
                    })
                    var employeelist = employe_list.join();
                    var employeenamequery = "select em.emp_id,CONCAT(em.firstname,'',em.middlename,'',em.lastname) as employee_name from hrm_employee_details as em  left join  hrm_user_master as um on um.id=em.emp_id where um.status=1 and um.role_id!=1 and em.emp_id in(" + employeelist + ")"
                    sql.query(employeenamequery, function (err, employee_data) {
                        if (err) {
                            console.log(err)
                            deferred.resolve({ status: 0, message: "Something went wrong " });
                        }
                        else {
                            var employee_object = {};
                            var employeename = [];
                            console.log("employeename",employee_data)
                            workdata.forEach((wd) => {
                                employee_data.forEach((datas) => {
                                    employee_object[datas.emp_id] = datas.employee_name
                                });
                            });

                            var shift_typeQuery = "select * from hrm_shift_type where shift_id in(" + shift_id + ") ";
                            sql.query(shift_typeQuery, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    deferred.resolve({ status: 0, message: "Something went wrong" });
                                } else {
                                    console.log("shift_query",shift_typeQuery)
                                    var shiftname_object = {};
                                    result.forEach((data) => {
                                        shiftname_object[data.shift_id] = data.shift_name;
                                    });
                                        console.log("shift_object",shiftname_object)
                                    var employeelist = '';
                                    var lists = '';
                                    var list = '';
                                
                                    result.forEach((row) => {
                                      
                                        workdata.forEach((datas, index) => {
                                            console.log("stipped")
                                            employee_data.forEach((results) => {
                                                console.log("2loop")
                                                var em = [];
                                                list = datas.employee_list.split(',');
                                               
                                                list.forEach((l) => {
                                                    em.push(employee_object[l]);
                                                });

                                                var work_startdate = moment(datas.work_start_time).format("YYYY-MM-DD");
                                                employeelist = (datas.employee_list != undefined && datas.employee_list != '') ? datas.employee_list : '';
                                                lists = employeelist.split(',')
                                                console.log("workdata[index].shift_type",workdata[index].shift_type)
                                                workdata[index].shiftname = (shiftname_object[workdata[index].shift_type] != undefined) ? shiftname_object[workdata[index].shift_type] : ''
                                                workdata[index].employee_count = (lists.length > 0) ? lists.length : 0
                                                workdata[index].employee_name = em.join("<br>");
                                                workdata[index].work_start_date = work_startdate;
                                                workdata[index].outlet_name = datas.outlet_name;
                                                workdata[index].work_start_time = moment(datas.work_start_time).format("YYYY-MM-DD");
                                                workdata[index].work_end_time = moment(datas.work_end_time).format("YYYY-MM-DD ");
                                                workdata[index].work_descripation = datas.task_descripation;
                                            });
                                        });
                                    });
                                    deferred.resolve({ status: 1, message: "Workslist", workdata });
                                }
                            });
                        }
                    });

                } else {
                    deferred.resolve({ status: 0, message: "No Work list Found" });
                }
            }
        });
        return deferred.promise;
    },
    // workList: (company_id,login_id) => {
    //     var deferred = q.defer();
    //     var shift_id = [];
    //     var employe_list = [];
    //     var condition="and  FIND_IN_SET("+login_id+", work.employee_list)"
    //     var  checking_Query='';
    //     var checkingQuery = "SELECT wd.role_key as review_role_key,d.role_key as confirmation_role_key,work.from_emp_id as login_id,work.status,FN_WORKLIST_LIST_ACTION(work.id,work.confirmation_from) as action_status,work.id,wd.role as review_role,d.role as confirmation_role,work.review_by,work.confirmation_from,work.outlet_name,work.emp_type,work.work_start_time,work.work_end_time,work.task_description,work.employee_list,work.shift_type from " + tableConfig.HRM_WORK_DETAILS + "  as work left join hrm_user_role as wd on wd.id=work.review_by left join hrm_user_role as d on d.id=work.confirmation_from where work.company_id=" + company_id+" group by work.id";
    //     if(login_id==1) 
    //     {
           
    //        checking_Query=checkingQuery
    //     }
    //     else
    //     {
    //         checking_Query=checkingQuery+" "+condition
    //     }
     
       
    //     sql.query(checking_Query, function (err, workdata) {
    //      console.log(checking_Query)
    //         if (err) {
    //             console.log(err);
    //             deferred.resolve({ status: 0, message: "Failed to get Worklist" });
    //         } else {
    //             if (workdata.length > 0) {
    //                 workdata.forEach((row) => {
    //                     shift_id.push(row.shift_type);
    //                     employe_list.push(row.employee_list);
    //                 })
    //                 var employeelist = employe_list.join();
    //                 var employeenamequery = "select em.emp_id,CONCAT(em.firstname,'',em.middlename,'',em.lastname) as employee_name from hrm_employee_details as em  left join  hrm_user_master as um on um.id=em.emp_id where um.status=1 and um.role_id!=1 and em.emp_id in(" + employeelist + ")"
    //                 sql.query(employeenamequery, function (err, employee_data) {
    //                     if (err) {
    //                         console.log(err)
    //                         deferred.resolve({ status: 0, message: "Something went wrong " });
    //                     }
    //                     else {
    //                         var employee_object = {};
    //                         var employeename = [];
    //                         workdata.forEach((wd) => {
    //                             employee_data.forEach((datas) => {
    //                                 employee_object[datas.emp_id] = datas.employee_name
    //                             });
    //                         });

    //                         var shift_typeQuery = "select * from hrm_shift_type where shift_id in(" + shift_id + ") ";
    //                         sql.query(shift_typeQuery, function (err, result) {
    //                             if (err) {
    //                                 console.log(err);
    //                                 deferred.resolve({ status: 0, message: "Something went wrong" });
    //                             } else {
    //                                 var shiftname_object = {};
    //                                 result.forEach((data) => {
    //                                     shiftname_object[data.shift_id] = data.shift_name;
    //                                 });

    //                                 var employeelist = '';
    //                                 var lists = '';
    //                                 var list = '';
                                  
    //                                 result.forEach((row) => {
    //                                     workdata.forEach((datas, index) => {
    //                                         employee_data.forEach((results) => {
    //                                             var em = [];
    //                                             list = datas.employee_list.split(',');
                                             
    //                                             list.forEach((l) => {
    //                                                 em.push(employee_object[l]);
    //                                             });

    //                                             var work_startdate = moment(datas.work_start_time).format("YYYY-MM-DD");
    //                                             employeelist = (datas.employee_list != undefined && datas.employee_list != '') ? datas.employee_list : '';
    //                                             lists = employeelist.split(',')
    //                                             workdata[index].shiftname = (shiftname_object[workdata[index].shift_type] != undefined) ? shiftname_object[workdata[index].shift_type] : ''
    //                                             workdata[index].employee_count = (lists.length > 0) ? lists.length : 0
    //                                             workdata[index].employee_name = em.join("<br>");
    //                                             workdata[index].work_start_date = work_startdate;
    //                                             workdata[index].outlet_name = datas.outlet_name;
    //                                             workdata[index].work_start_time = moment(datas.work_start_time).format("YYYY-MM-DD");
    //                                             workdata[index].work_end_time = moment(datas.work_end_time).format("YYYY-MM-DD ");
    //                                             workdata[index].work_descripation = datas.task_descripation;
    //                                         });
    //                                     });
    //                                 });
    //                                 deferred.resolve({ status: 1, message: "Workslist", workdata });
    //                             }
    //                         });
    //                     }
    //                 });

    //             } else {
    //                 deferred.resolve({ status: 0, message: "No Work list Found" });
    //             }
    //         }
    //     });
    //     return deferred.promise;
    // },
    worklistByid: (company_id,work_id) => {
        var deferred = q.defer();
        var shift_id = [];
        var employe_list = [];
        var checkingQuery = "SELECT work.from_emp_id,work.status,work.id,wd.role as review_role,d.role as confirmation_role,work.review_by,work.confirmation_from,work.outlet_name,work.emp_type,work.work_start_time,work.work_end_time,work.task_description,work.employee_list,work.shift_type from " + tableConfig.HRM_WORK_DETAILS + "  as work left join hrm_user_role as wd on wd.id=work.review_by left join hrm_user_role as d on d.id=work.confirmation_from where work.company_id=" + company_id + " and work.id='"+work_id+"' group by work.id";
        sql.query(checkingQuery, function (err, workdata) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to get Worklist" });
            } else {
                if (workdata.length > 0) {
                    workdata.forEach((row) => {
                        shift_id.push(row.shift_type);
                        employe_list.push(row.employee_list);
                    })
                    var employeelist = employe_list.join();
                    var employeenamequery = "select em.emp_id,CONCAT(em.firstname,'',em.middlename,'',em.lastname) as employee_name from hrm_employee_details as em  left join  hrm_user_master as um on um.id=em.emp_id where um.status=1 and um.role_id!=1 and em.emp_id in(" + employeelist + ")"
                    sql.query(employeenamequery, function (err, employee_data) {
                        if (err) {
                            console.log(err)
                            deferred.resolve({ status: 0, message: "Something went wrong " });
                        }
                        else {
                            var employee_object = {};
                            var employeename = [];
                            workdata.forEach((wd) => {
                                employee_data.forEach((datas) => {
                                    employee_object[datas.emp_id] = datas.employee_name
                                });
                            });

                            var shift_typeQuery = "select * from hrm_shift_type where shift_id in(" + shift_id + ") ";
                            sql.query(shift_typeQuery, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    deferred.resolve({ status: 0, message: "Something went wrong" });
                                } else {
                                    var shiftname_object = {};
                                    result.forEach((data) => {
                                        shiftname_object[data.shift_id] = data.shift_name;
                                    });

                                    var employeelist = '';
                                    var lists = '';
                                    var list = '';
                                    var work_startdate = moment(workdata[0].work_start_time).format("YYYY-MM-DD");
                                    console.log("ed",work_startdate)
                                    var work_enddate = moment(workdata[0].work_end_time).format("YYYY-MM-DD");
                                    result.forEach((row) => {
                                        workdata.forEach((datas, index) => {
                                            employee_data.forEach((results) => {
                                                var em = [];
                                                list = datas.employee_list.split(',');
                                             
                                                list.forEach((l) => {
                                                    em.push(employee_object[l]);
                                                });
                                                console.log(datas.work_start_time)
                                               
                                                employeelist = (datas.employee_list != undefined && datas.employee_list != '') ? datas.employee_list : '';
                                                lists = employeelist.split(',')
                                                workdata[index].shiftname = (shiftname_object[workdata[index].shift_type] != undefined) ? shiftname_object[workdata[index].shift_type] : ''
                                                workdata[index].employee_count = (lists.length > 0) ? lists.length : 0
                                                workdata[index].employee_name = em.join("<br>");
                                                workdata[index].work_start_date = work_startdate;
                                                workdata[index].outlet_name = datas.outlet_name;
                                                //workdata[index].work_start_time = moment(datas.work_start_time).format("YYYY-MM-DD");
                                                workdata[index].work_end_date = work_enddate//moment(datas.work_end_time).format("YYYY-MM-DD ");
                                                workdata[index].work_descripation = datas.task_descripation;
                                                delete datas.work_start_time;
                                                delete datas.work_end_time;
                                            });
                                        });
                                    });
                                    deferred.resolve({ status: 1, message: "Workslist", workdata });
                                }
                            });
                        }
                    });

                } else {
                    deferred.resolve({ status: 0, message: "No Work list Found" });
                }
            }
        });
        return deferred.promise;
    },


    notificationList: (company_id,role_id,emp_id) => {
        
        var deferred = q.defer();
        var curdate=moment().format("YYYY-MM-DD");
        var curdatToutc=moment.utc(curdate).format("YYYY-MM-DD");
        var utcTolocal=moment(curdatToutc).local();
        var normalutc=moment(curdatToutc).format("YYYY-MM-DD")
        if(role_id==1 || role_id==4)
        {
         var query = "Select  n.*,um.emp_id as empid,CONCAT(IFNULL(em.firstname,''),' ',IFNULL(em.middlename,''),' ',IFNULL(em.lastname,'')) as employeename FROM hrm_notication as n inner join  hrm_employee_details  as em  on n.from_emp_id=em.emp_id inner join hrm_user_master as um  on um.id=n.from_emp_id WHERE um.status='1' and um.company_id=" + company_id + " and  n.isRead=0 and MONTH(n.created_on) = MONTH('"+normalutc+"') AND YEAR(n.created_on) = YEAR('"+normalutc+"') order by n.id desc ";
        }
        else if(role_id==3||role_id==7 || role_id==2)
        {
         var query = "Select  n.*,um.emp_id as empid,CONCAT(IFNULL(em.firstname,''),' ',IFNULL(em.middlename,''),' ',IFNULL(em.lastname,'')) as employeename FROM hrm_notication as n inner join  hrm_employee_details  as em  on n.from_emp_id=em.emp_id inner join hrm_user_master as um  on um.id=n.from_emp_id WHERE um.status='1' and um.company_id=" + company_id + " and  n.isRead=0 and FIND_IN_SET('"+role_id+"',n.to_role_id) and MONTH(n.created_on) = MONTH('"+normalutc+"') AND YEAR(n.created_on) = YEAR('"+normalutc+"') UNION Select  n.*,um.emp_id as empid,CONCAT(IFNULL(em.firstname,''),' ',IFNULL(em.middlename,''),' ',IFNULL(em.lastname,'')) as employeename FROM hrm_notication as n inner join  hrm_employee_details  as em  on n.from_emp_id=em.emp_id inner join hrm_user_master as um  on um.id=n.from_emp_id WHERE um.status='1' and um.company_id=" + company_id + " and  n.isRead=0 and from_emp_id='"+emp_id+"' and MONTH(n.created_on) = MONTH('"+normalutc+"') AND YEAR(n.created_on) = YEAR('"+normalutc+"') order by n.id desc  ";
        }
        else 
        {
         var query = "Select  n.*,um.emp_id as empid,CONCAT(IFNULL(em.firstname,''),' ',IFNULL(em.middlename,''),' ',IFNULL(em.lastname,'')) as employeename FROM hrm_notication as n inner join  hrm_employee_details  as em  on n.from_emp_id=em.emp_id inner join hrm_user_master as um  on um.id=n.from_emp_id WHERE um.status='1' and um.company_id=" + company_id + " and  n.isRead=0 and n.from_emp_id='"+emp_id+"' and MONTH(n.created_on) = MONTH('"+normalutc+"') AND YEAR(n.created_on) = YEAR('"+normalutc+"') order by n.id desc";
        }
        // if(role_id==1)
        // {
        //  var query = "Select  n.*,um.emp_id as empid,CONCAT(IFNULL(em.firstname,''),'',IFNULL(em.middlename,''),'',IFNULL(em.lastname,'')) as employeename FROM hrm_notication as n inner join  hrm_employee_details  as em  on n.from_emp_id=em.emp_id inner join hrm_user_master as um  on um.id=n.from_emp_id WHERE um.status='1' and um.company_id=" + company_id + " and  n.isRead=0 and MONTH(n.created_on) = MONTH('"+normalutc+"') AND YEAR(n.created_on) = YEAR('"+normalutc+"')  ";
        // }
        // else if(role_id!=5)
        // {
        //  var query = "Select  n.*,um.emp_id as empid,CONCAT(IFNULL(em.firstname,''),'',IFNULL(em.middlename,''),'',IFNULL(em.lastname,'')) as employeename FROM hrm_notication as n inner join  hrm_employee_details  as em  on n.from_emp_id=em.emp_id inner join hrm_user_master as um  on um.id=n.from_emp_id WHERE um.status='1' and um.company_id=" + company_id + " and  n.isRead=0 and FIND_IN_SET('"+role_id+"',n.to_role_id) and MONTH(n.created_on) = MONTH('"+normalutc+"') AND YEAR(n.created_on) = YEAR('"+normalutc+"')  ";
        // }
        // else 
        // {
        //  var query = "Select  n.*,um.emp_id as empid,CONCAT(IFNULL(em.firstname,''),'',IFNULL(em.middlename,''),'',IFNULL(em.lastname,'')) as employeename FROM hrm_notication as n inner join  hrm_employee_details  as em  on n.from_emp_id=em.emp_id inner join hrm_user_master as um  on um.id=n.from_emp_id WHERE um.status='1' and um.company_id=" + company_id + " and  n.isRead=0 and n.from_emp_id='"+emp_id+"' and MONTH(n.created_on) = MONTH('"+normalutc+"') AND YEAR(n.created_on) = YEAR('"+normalutc+"')  ";
        // }
        
      //  var query = "Select  n.*,um.emp_id as empid,CONCAT(IFNULL(em.firstname,''),'',IFNULL(em.middlename,''),'',IFNULL(em.lastname,'')) as employeename FROM hrm_notication as n inner join  hrm_employee_details  as em  on n.from_emp_id=em.emp_id inner join hrm_user_master as um  on um.id=n.from_emp_id WHERE um.status='1' and um.company_id=" + company_id + " and  n.isRead=0 and MONTH(n.created_on) = MONTH('"+normalutc+"') AND YEAR(n.created_on) = YEAR('"+normalutc+"')  ";
       console.log("query",query)
        sql.query(query, function (err, user) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
            } else {
                if (user.length > 0) {
                    deferred.resolve({ status: 0, message: 'Notification list ',notication_count:user.length,list:user });
                } else {
                    deferred.resolve({ status: 0, message: "No data Found", details: [] });
                }
            }
        });
        return deferred.promise;
    },

    updateNotification: (notification_id) => {
        var deferred = q.defer();
        var curdate=moment().format("YYYY-MM-DD HH:mm:ss");
var curdatToutc=moment.utc(curdate).format("YYYY-MM-DD HH:mm:ss");
var utcTolocal=moment(curdatToutc).local();
var updated_on=moment(curdatToutc).format("YYYY-MM-DD HH:mm:ss");
console.log("updatedon",updated_on)
        var checkQuery="select * from hrm_notication where id="+notification_id+"";
        sql.query(checkQuery,function(err,data)
        {
            if(err)
            {
                console.log(err);
                deferred.resolve({status:0,message:"Something Went wrong"})
            }
            else
            {
                if(data.length > 0)
                {
                    var query = "Update hrm_notication SET isRead=1,updated_on='"+updated_on+"' where id="+notification_id+"";
                    console.log("updatednot",query)
                     sql.query(query, function (err, user) {
                         if (err) {
                             console.log(err);
                             deferred.resolve({ status: 0, message: 'Something  Went Wrong' });
                         } else {
                             if (user.affectedRows > 0) {
                                 deferred.resolve({ status: 1, message: 'Notification Viewed' });
                             } else {
                                 deferred.resolve({ status: 0, message: "Fail to updated "});
                             }
                         }
                     });
                }
                else
                {
                    deferred.resolve({status:0,message:"No notication found"})
                }
            }
        })
        return deferred.promise;
    },

}
