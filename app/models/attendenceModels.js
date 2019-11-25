var sql = require('../../config/database.config');
var tableConfig = require('../config/table_config');
var q = require('q');
var sql = require('../../config/database.config');
var moment = require('moment');
var serialize = require('locutus/php/var/serialize');
var Validator = require('jsonschema').Validator;
var forEach = require('asyncforeach-promise');
var multer = require('multer');
var commonFunction = require('../models/commonfunction');

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
}).single('work_list');
var uploads = multer({
    storage: storage
}).single('attendence_list');

var XLSX = require('xlsx');

module.exports = {

    saveShift: (req) => {
        var deferred = q.defer();

        var shift_name = req.body.shift_name;
        var descripation = req.body.descripation;
        var begin_time = req.body.begin_time;
        var end_time = req.body.end_time;

        var saveshiftQuery = "INSERT INTO hrm_shift_type(shift_name,description,begin_time,end_time) VALUES ('" + shift_name + "','" + descripation + "','" + begin_time + "','" + end_time + "')";
        sql.query(saveshiftQuery, function (err, data) {

            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to add shift" });
            } else {
                if (data.affectedRows > 0) {
                    deferred.resolve({ status: 1, message: "Shift saved successfully" });
                } else {
                    deferred.resolve({ status: 0, message: "Failed to add shift" });
                }
            }
        });
        return deferred.promise;
    },

    saveAttendence: (emp_id, check_in, check_out) => {
        var deferred = q.defer();

        var getcheckintime = moment.utc(check_in).format("HH:mm:ss");
        var getcheckouttime = moment.utc(check_out).format("HH:mm:ss");
        var getcheckintimediffernce = moment.duration(getcheckintime, "HH:mm:ss");
        var getcheckouttimediffernce = moment.duration(getcheckouttime, "HH:mm:ss");
        var diff = getcheckouttimediffernce.subtract(getcheckintimediffernce);
        var over_time = "00:00:00";

        if (diff.hours() > 9) {
            var start = moment.duration("09:00:00", "HH:mm:ss");
            var end = moment.duration(diff, "HH:mm:ss");
            overtimework = end.subtract(start);
            over_time = overtimework.hours() + ":" + overtimework.minutes() + ":" + overtimework.seconds();
        }

        var office_hours = "09:30:00";
        var late_time = 0;
        if (getcheckintime > office_hours) {
            late_time = 1;
        }

        var saveattendenceQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " (emp_id,check_in,check_out,total_working,late_time,overtime) VALUES (" + emp_id + ",'" + check_in + "','" + check_out + "', timediff('" + check_out + "','" + check_in + "')," + late_time + ", '" + over_time + "')";
        sql.query(saveattendenceQuery, function (err, data) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to save attenanace" });
            } else {
                if (data.affectedRows > 0) {
                    deferred.resolve({ status: 1, message: "attendence created successfully" });
                } else {
                    deferred.resolve({ status: 0, message: "Failed to save attenanace" });
                }
            }
        });
        return deferred.promise;
    },

    updateAttendence: (emp_id, check_out) => {
        var deferred = q.defer();
        var get_checkout_date = moment.utc(check_out).format("YYYY-MM-DD");
        var alreadylogged=0;
        var checkingQuery = "select MAX(check_in) as check_in from " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " where  emp_id=" + emp_id + " order by id desc limit 1";
        sql.query(checkingQuery, function (err, result) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to update" });
            }
            else {
                if (result.length > 0) {
                    var get_check_in = (result[0].check_in) ? result[0].check_in : '';
                    var get_checkin_time = moment(get_check_in).format("YYYY-MM-DD HH:mm:ss");
                    var get_check_out = moment(check_out).format("HH:mm:ss")
                        ;
                        var start = moment(get_checkin_time).format("YYYY-MM-DD HH:mm:ss");
                        console.log("start",start)
                     
                        var end = moment(check_out).format();
                        var difference =  moment.duration(moment(end).diff(start));
                        console.log("diff",difference.asHours())
                    var over_time = "";
                    var overtimeduty = ''
                    var checktime = moment.duration(difference, "HH:mm:ss");;
                    var checkminutes = moment.duration(checktime).asMinutes()
                    var workhours = "8:00:00"
                    var workminutes = moment.duration(workhours).asMinutes()
                    if (checkminutes > workminutes) {
                        var working_hours = moment.duration("08:00:00", "HH:mm:ss");
                        var user_check_outime = moment.duration(difference, "HH:mm:ss");
                        overtimework = checktime.subtract(working_hours);
                        over_time = moment.duration(overtimework).asMinutes();
                        overtimeduty = Math.round(over_time);
                    }
                    // var checking_query="select * from hrm_employee_attendence where DATE(check_in)=DATE('"+check_out+"') and emp_id="+emp_id+"";
                    // sql.query(checking_query,function(err,cdata)
                    // {
                    //     if(err)
                    //     {
                    //         console.log(err);
                    //         deferred.resolve({status:0,messsage:"Something went wrong"})
                    //     }
                       
                    //     else
                    //     {
                    //         if(cdata.length > 0)
                    //         {
                    //             alreadylogged=1;
                    //         }
                    //         console.log("data",cdata)
                            
                    //     }
                        
                            var updateQuery = "Update " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " set check_out='" + check_out + "',total_working=TIMEDIFF('" + check_out + "','"+get_checkin_time+"'),overtime='" + overtimeduty + "', status = 0 where emp_id=" + emp_id + " order by check_in desc limit 1";
                            // console.log('Check out Query', updateQuery)
                            sql.query(updateQuery, function (err, data) {
                                if (err) {
                                    console.log(err);
                                    deferred.resolve({ status: 0, message: "Something Went Wrong" });
                                } else {
                                    if (data.affectedRows > 0) {
                                        deferred.resolve({ status: 1, message: "Update attendence Successfully", alreadylogged: alreadylogged });
                                    } else {
                                        deferred.resolve({ status: 0, message: "Failed to update" });
                                    }
                                }
                            })
                        
                   

                    // });
                } else {
                    deferred.resolve({ status: 0, message: "No data found" });
              
                }
                
            }
            
        });
        return deferred.promise;
    },
    Biometerattendencelist:  async (emp_id) => {
        var deferred = q.defer();

        var response = [];
    
         var getAttendencedataquery="select *,um.emp_id as employee_id  from hrm_employee_attendence as ea  inner join hrm_user_master as um  on um.id=ea.emp_id inner join hrm_employee_details as ed on ea.emp_id=ed.emp_id  ";
        if(emp_id!=""&&emp_id!=undefined)
        {
            var getAttendencedataquery="select ea.*,um.emp_id as employee_id,ed.* from hrm_employee_attendence  as ea inner join hrm_user_master as um on um.id=ea.emp_id inner join hrm_employee_details as ed on ea.emp_id=ed.emp_id where um.id='"+emp_id+"' ";
        }
         var getAttendencedata= await commonFunction.getQueryResults(getAttendencedataquery);
       
    if(getAttendencedata.length  > 0)
    {
        let checkindate='';
        let checkoutdata='';
        let name='';
        getAttendencedata.forEach((data)=>
        {
            name=data.firstname+" "+data.middlename+" "+data.lastname;
           
                checkindate=moment(data.check_in).format("DD-MMMM-YYYY HH:mm:ss");
                checkoutdata=(data.check_out!=undefined && data.check_out!=''&& data.check_out!="0000-00-00 00:00:00")?moment(data.check_out).format("DD-MMMM-YYYY HH:mm:ss"):''
            response.push({
                employee_name:name,
                emp_id:data.employee_id,
                employee_primary_id:data.emp_id,
                check_in:checkindate,
                check_out:checkoutdata,
                working_hours:(data.total_working!=undefined &&data.total_working!='')?data.total_working:'',
                overtime:(data.overtime!=''&&data.overtime!=undefined)?data.overtime:''
            })
        })

            //let lastattendencedata=getAttendencedata;
            
            deferred.resolve({status:1,message:"Biometer attendence list ",attendencelist:response})
        
    }
    else
    {
        deferred.resolve({status:0,message:"No data found"})
    }
        return deferred.promise;
    },
    attendence_report:  async (from_date,to_date,company_id) => {
        var deferred = q.defer();
        var response = [];
        let data='';
        if(from_date!=to_date&&to_date!=from_date)
        {
        var result= getDatesDiff(from_date,to_date)
        var attendence_query="select v.gen_date,COUNT(ad.check_in) as present_days,((select COUNT(id) from  hrm_user_master um where um.role_id!=1 and um.status=1 )-COUNT(ad.check_in)-(select COUNT(id) from hrm_holidays where company_id=1 and (DATE(from_date)=DATE(v.gen_date) ) or (DATE(to_date)=DATE(v.gen_date))) )as absent_count from"+
        "(select adddate('1970-01-01',t4*10000 + t3*1000 + t2*100 + t1*10 + t0) gen_date from"+
        "(select 0 t0 union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0,"+
       "(select 0 t1 union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t1,"+
        "(select 0 t2 union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t2,"+
        "(select 0 t3 union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t3,"+
        "(select 0 t4 union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t4)  v left join hrm_employee_attendence ad  on DATE(v.gen_date)=DATE(ad.check_in)"+
       " Where gen_date between '"+from_date+"' and '"+to_date+"' group by v.gen_date"
       var attendencedata=await commonFunction.getQueryResults(attendence_query)
        // for(var i=0;i<result.length;i++)
        // {
        //     var getQuery="SELECT COUNT(ad.check_in) as present_days,((select COUNT(id) from  hrm_user_master) -COUNT(ad.check_in)-(select COUNT(id) from hrm_holidays where company_id='"+company_id+"' and (DATE(from_date)=DATE('"+result[i]+"') ) or (DATE(to_date)=DATE('"+result[i]+"'))) )as absent_count from hrm_employee_attendence  as ad  where DATE(ad.check_in)=DATE('"+result[i]+"')"
        //     console.log("getQuery",getQuery)
        //     var getdata=await commonFunction.getQueryResults(getQuery);
        //     response.push({
        //         attendence_date:result[i],
        //         present_days:getdata[0].present_days,
        //         absent_days:getdata[0].absent_count
        //         })
        // }
        deferred.resolve({status:1,message:"attendence list",attendencedata})
    }
    else
    {
        deferred.resolve({status:0,message:"Please date should br greater than from_date and to_date"})
    }
        return deferred.promise;
    },
    // Biometerattendencelist:  async (emp_id) => {
    //     var deferred = q.defer();

    //     var response = [];
    
    //      var getAttendencedataquery="select *  from hrm_employee_attendence ";
    //     if(emp_id!=""&&emp_id!=undefined)
    //     {
    //         var getAttendencedataquery="select ea.*,um.emp_id  as employee_id from hrm_employee_attendence  as ea inner join hrm_user_master as um on um.id=ea.emp_id where um.emp_id='"+emp_id+"' ";
    //     }
    //      var getAttendencedata= await commonFunction.getQueryResults(getAttendencedataquery);
       
    // if(getAttendencedata.length  > 0)
    // {
    //     let checkindate='';
    //     let checkoutdata='';
    //     getAttendencedata.forEach((data)=>
    //     {
           
    //             checkindate=moment(data.check_in).format("DD-MMMM-YYYY HH:mm:ss");
    //             checkoutdata=(data.check_out!=undefined)?moment(data.check_out).format("DD-MMMM-YYYY HH:mm:ss"):''
    //         response.push({
    //             emp_id:data.employee_id,
    //             check_in:checkindate,
    //             check_out:checkoutdata,
    //             working_hours:(data.total_working!=undefined &&data.total_working!='')?data.total_working:'',
    //             overtime:(data.overtime!=''&&data.overtime!=undefined)?data.overtime:''
    //         })
    //     })

    //         //let lastattendencedata=getAttendencedata;
            
    //         deferred.resolve({status:1,message:"Biometer attendence list ",attendencelist:response})
        
    // }
    // else
    // {
    //     deferred.resolve({status:0,message:"No data found"})
    // }
    //     return deferred.promise;
    // },
    attendenceDetailsbyId: (emp_id) => {
        var deferred = q.defer();

        var response = [];
        var attendenceQuery = "select check_in,check_out,total_working,late_time,overtime,emp_id from " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " where emp_id=" + emp_id + "";

        sql.query(attendenceQuery, function (err, attendenceData) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Something Went Wrong" });
            } else {
                if (attendenceData.length > 0) {
                    var check_in_date = '';
                    var attendance_date = '';

                    attendenceData.forEach((rows) => {
                        check_in_date = rows.check_in;
                        attendance_date = moment(check_in_date).format("YYYY-MM-DD");
                        var timein = moment(rows.check_in).format("YYYY-MM-DD HH:mm:ss");
                        var timeout = moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss");

                        response.push({
                            attendence_date: attendance_date,
                            time_in: timein,
                            time_out: timeout,
                            working_hours: rows.total_working,
                            over_time: rows.overtime,
                            late_time: rows.late_time,
                            emp_id: rows.emp_id
                        });

                    });
                    deferred.resolve({ status: 1, message: "attendence details", attendence_details: response });
                } else {
                    deferred.resolve({ status: 0, message: "No data found", attendence_details: [] });
                }
            }
        });

        return deferred.promise;
    },

    attendenceDetailsbydate: (date) => {
        var deferred = q.defer();
        var response = [];
        var attendenceQuery = " select check_in,check_out,total_working,late_time,overtime,emp_id from " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " where check_in LIKE '%" + date + "%'";
        sql.query(attendenceQuery, function (err, attendenceData) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Something Went Wrong" });
            } else {
                if (attendenceData.length > 0) {
                    var check_in_date = '';
                    var attendance_date = '';
                    attendenceData.forEach((rows) => {
                        check_in_date = rows.check_in;
                        attendance_date = moment(check_in_date).format("YYYY-MM-DD");
                        var timein = moment(rows.check_in).format("YYYY-MM-DD HH:mm:ss");
                        var timeout = moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss");
                        response.push({
                            attendence_date: attendance_date,
                            time_in: timein,
                            time_out: timeout,
                            working_hours: rows.total_working,
                            over_time: rows.overtime,
                            late_time: rows.late_time,
                            emp_id: rows.emp_id
                        })
                    })
                    deferred.resolve({ status: 1, message: "attendence details", attendence_details: response });
                } else {
                    deferred.resolve({ status: 0, message: "No data found", attendence_details: [] });
                }
            }
        });
        return deferred.promise;
    },

    addAttendencebyrole: (emp_id, check_in) => {

        var deferred = q.defer();
        var checkingQuery = "select * from hrm_user_master as um  inner join hrm_employee_details as ed on um.id=" + emp_id + "";
        sql.query(checkingQuery, function (err, checkdata) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Something went wrong" });
            }
            else {
                
                if (checkdata.length > 0) {
                    var role_id = checkdata[0].role_id;
                    var rolequery = "select * from hrm_user_role where id =" + role_id;
                    sql.query(rolequery, function (err, roledata) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Something went wrong" });
                        }
                        else {
                            if (roledata.length > 0) {
                                var role_key = roledata[0].role_key
                                if (role_key == 'WORKERS' || role_key == 'SVISIOR') {
                                    var shiftCheckingQuery = "select * from hrm_employee_shift_details as sd inner join hrm_shift_type as st on sd.shift_id=st.shift_id where sd.emp_id=" + emp_id + "";
                                    sql.query(shiftCheckingQuery, function (err, data) {
                                        if (err) {
                                            console.log(err);
                                            deferred.resolve({ status: 0, message: "Something went Wrong" })
                                        } else {

                                            if (data.length > 0) {
                                                var office_hours = "";
                                                var getcheckintime = "00:00:00";
                                                var getcheckouttime = "00:00:00";
                                                var getcheckintimediffernce = "00:00:00";
                                                var getcheckouttimediffernce = "00:00:00";
                                                var late_time = 0;
                                                var checkin = '';
                                                var check_out = '';
                                        
                                                data.forEach((shiftdata) => {
                                                    checkin = moment(check_in).format("YYYY-MM-DD HH:mm:ss");
                                                    getcurrent_date = moment().format("YYYY-MM-DD");
                                                    shift_end_time = shiftdata.end_time;
                                                    getcheckintime = moment.utc(checkin).format("HH:mm:ss");
                                                    getcheckouttime = moment.utc(check_out).format("HH:mm:ss");

                                                    getcheckintimediffernce = moment.duration(getcheckintime, "HH:mm:ss");
                                                    getcheckouttimediffernce = moment.duration(getcheckouttime, "HH:mm:ss");
                                                    diff = getcheckouttimediffernce.subtract(getcheckintimediffernce);

                                                    office_hours = shiftdata.begin_time;
                                                    if (getcheckintime > office_hours) {
                                                        late_time = 1;
                                                    }
                                                });

                                                var checklogged = "select count(*) as logged from "  + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " where DATE_FORMAT(check_in, '%Y-%m-%d') = DATE_FORMAT('"+check_in+"',  '%Y-%m-%d')  and emp_id = "+emp_id;
                                          console.log("sqlquery",checklogged)
                                                sql.query(checklogged, function (err, lresult) {
                                                    if (err) {
                                                        console.log(err);
                                                        deferred.resolve({ status: 0, message: "Something Went Wrong" })
                                                    }
                                                     else {
                                                        console.log("result",lresult);
                                                        if(lresult[0].logged > 0){
                                                            deferred.resolve({ status: 0, message: "Employee Already Logged In" })
                                                        }else{
                                                            var saveQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " (emp_id,check_in,late_time) VALUES (" + emp_id + ",'" + check_in + "'," + late_time + ")";
                                                            sql.query(saveQuery, function (err, result) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    deferred.resolve({ status: 0, message: "Somethinh Went Wrong" })
                                                                } else {
                                                                    if (result.affectedRows > 0) {
                                                                        deferred.resolve({ status: 1, message: "employee Shift attendence created ", alreadylogged : 1 })
                                                                    } else {
                                                                        deferred.resolve({ status: 0, message: "Fail to create shift attendence " })
                                                                    }
                                                                }
                                                            });
                                                        }

                                                    }
                                                });

                                               
                                            } else {
                                                deferred.resolve({ status: 0, message: "Please Allocate a shift for the Employee" });
                                            }
                                        }
                                    });
                                } else {

                                    var office_hours = "";
                                    var getcheckintime = "00:00:00";
                                    var getcheckouttime = "00:00:00";
                                    var getcheckintimediffernce = "00:00:00";
                                    var getcheckouttimediffernce = "00:00:00"
                                    var late_time = 0;
                                    var checkin = '';
                                    var check_out = '';

                                    checkin = moment(check_in).format("YYYY-MM-DD HH:mm:ss");
                                    check_out = moment().format("YYYY-MM-DD HH:mm:ss");

                                    getcheckintime = moment.utc(checkin).format("HH:mm:ss");
                                    getcheckouttime = moment.utc(check_out).format("HH:mm:ss");
                                    getcheckintimediffernce = moment.duration(getcheckintime, "HH:mm:ss");
                                    getcheckouttimediffernce = moment.duration(getcheckouttime, "HH:mm:ss");
                                    diff = getcheckouttimediffernce.subtract(getcheckintimediffernce);
                                    office_hours = "09:30:00"
                                
                                    if (getcheckintime > office_hours) {
                                        late_time = 1;
                                    }

                                    var checklogged = "select count(*) as logged from "  + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " where DATE(check_in) = DATE('"+check_in+"')  and emp_id = "+emp_id;
                                   console.log("checklogged",checklogged)
                                    sql.query(checklogged, function (err, lresult) {
                                        if (err) {
                                            console.log(err);
                                            deferred.resolve({ status: 0, message: "Somethinh Went Wrong" })
                                        } else {
                                            console.log("lresult",lresult[0].logged)
                                            if(lresult[0].logged==0)
                                            {
                                                var saveQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " (emp_id,check_in,late_time) VALUES (" + emp_id + ",'" + check_in + "'," + late_time + ")";
                                                console.log("saveQuery",saveQuery)
                                                sql.query(saveQuery, function (err, result) {
                                                    if (err) {
                                                        console.log(err);
                                                        deferred.resolve({ status: 0, message: "Somethinh Went Wrong" });
                                                    }
                                                    else {
                                                        if (result.affectedRows > 0) {
                                                            deferred.resolve({ status: 1, message: "Attendence created ", alreadylogged : 1 });
                                                        }
                                                        else {
                                                            deferred.resolve({ status: 0, message: "Fail to create shift attendence " });
                                                        }
                                                    }
                                                });
                                            }
                                            else
                                            {
                                                deferred.resolve({ status: 0, message: "Employee Already Logged In" })
                                            }
                                            // if(lresult[0].logged > 0){
                                            //     deferred.resolve({ status: 0, message: "Employee Already Logged In" })
                                            }
                                            // }else{
                                            //     var saveQuery = "INSERT INTO " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + " (emp_id,check_in,late_time) VALUES (" + emp_id + ",'" + check_in + "'," + late_time + ")";
                                            //     sql.query(saveQuery, function (err, result) {
                                            //         if (err) {
                                            //             console.log(err);
                                            //             deferred.resolve({ status: 0, message: "Somethinh Went Wrong" });
                                            //         }
                                            //         else {
                                            //             if (result.affectedRows > 0) {
                                            //                 deferred.resolve({ status: 1, message: "Attendence created ", alreadylogged : 1 });
                                            //             }
                                            //             else {
                                            //                 deferred.resolve({ status: 0, message: "Fail to create shift attendence " });
                                            //             }
                                            //         }
                                            //     });
                                            // }

                                       
                                    });

                                    
                                }
                            }
                        }
                    });
                }
            }
        });

        return deferred.promise;
    },

    excelImportWorklist: (req, res) => {
        var deferred = q.defer();
        var v = new Validator();

        var workSchema = {
            "id": "/work_list",
            "type": "object",
            "properties": {
                "emp_type": { "type": "number" },
                "work_start_time": { "type": "string" },
                "work_end_time": { "type": "string" },
                "review_by": { "type": "number" },
                "confirmation_from": { "type": "number" },
                "task_description": { "type": "string" },
                "employee_list": { "type": "string" },
                "company_ids": { "type": "number" },
                "shift_type": { "type": "number" },
                "outlet_name": { "type": "string" }

            },

            "required": ["emp_type", "work_start_time", "work_end_time", "review_by", "confirmation_from", "company_ids", "shift_type"]
        };

        upload(req, res, async function (err) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to import data" });
            } else {
                if (!req.file) {
                    deferred.resolve({ status: 0, message: "Please choose file" });
                } else {

                    if (req.body.company_ids != undefined && req.body.company_ids != '') {
                        var workbook = XLSX.readFile(__dirname + '/uploads/work_list.xlsx');
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
                                var ValidatorResult = v.validate(d, workSchema);
                                if (ValidatorResult.errors.length > 0) {
                                    rows.push(index + 1);
                                }
                                errors = errors.concat(ValidatorResult.errors);
                            });
                          
                            if (errors.length == 0) {

                                forEach(data, async (e_detail, index, next) => {
                                    var emp_type = (e_detail.emp_type) ? e_detail.emp_type : 0;
                                    var work_start_time = (e_detail.work_start_time) ? e_detail.work_start_time : '';
                                    var work_end_time = (e_detail.work_end_time) ? e_detail.work_end_time : '';
                                    var review_by = (e_detail.review_by) ? e_detail.review_by : 0;
                                    var confirmation_from = (e_detail.confirmation_from) ? e_detail.confirmation_from : 0;
                                    var task_description = (e_detail.task_description) ? e_detail.task_description : '';
                                    var employee_list = (e_detail.employee_list) ? e_detail.employee_list : '';
                                    var company_ids = (e_detail.company_ids) ? e_detail.company_ids : 0;
                                    var shift_type = (e_detail.shift_type) ? e_detail.shift_type : '';
                                    var outlet_name = (e_detail.outlet_name) ? e_detail.outlet_name : '';
                                  
                                    var workmasterQuery = "INSERT INTO hrm_work_details(emp_type,work_start_time, work_end_time,review_by,confirmation_from,task_description,employee_list,company_id,shift_type, outlet_name) VALUES (" + emp_type + ",'" + work_start_time + "','" + work_end_time + "','" + review_by + "','" + confirmation_from + "','" + task_description + "','" + employee_list + "','" + company_ids + "','" + shift_type + "','" + outlet_name + "')"
                                    sql.query(workmasterQuery, function (err, masterData) {
                                        if (err) {
                                            console.log(err);
                                            next();
                                        }
                                        else {
                                            if (masterData) {
                                                employeePrimaryID = masterData.insertId;
                                            } else {
                                                deferred.resolve({ status: 0, message: "Failed to add employee" });
                                            }
                                        }
                                    });
                                    next();
                                }).then(() => {
                                    deferred.resolve({ status: 1, message: "Work added successfully", duplicate_email_ids: duplicate_mail_ids, total_given_employees: total_number_of_employees_given });
                                })
                                    .catch((error) => {
                                        deferred.resolve({ status: 0, message: "Failed to add work" })
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

    attendenceDetails: (emp_id, date, checkoutime) => {
        var deferred = q.defer();
        var response = [];
        if (checkoutime == '') {
            checkoutime = new Date();
        }
        var condition = ' ';
        if (date != '' && emp_id == '') {
            condition += "where check_in LIKE '%" + date + "%'";
        } else if (date == '' && emp_id != '') {
            condition += "where emp_id=" + emp_id;
        } else if (date != '' && emp_id != '') {
            condition += "where emp_id=" + emp_id + " and check_in LIKE '%" + date + "%'";
        }
        var attendence_Query = " select check_in,check_out,total_working,late_time,overtime,emp_id,FN_EMPID(emp_id) as empid, FN_EMPLOYEE_NAME(emp_id) as empname, FN_ATTENDANCE_ACTION(emp_id,id, status) as action from " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + condition;
       console.log('attendence_Query', attendence_Query)
        sql.query(attendence_Query, function (err, attendenceData) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Something Went Wrong" });
            } else {
                if (attendenceData.length > 0) {
                    var check_in_date = '';
                    var attendance_date = '';
                    var overtimehours = "00:00:00";
                    
                    attendenceData.forEach((rows) => {
                        check_in_date = rows.check_in;
                        attendance_date = moment(check_in_date).format("YYYY-MM-DD");
                        var timein = moment(rows.check_in).format("YYYY-MM-DD HH:mm:ss");
                       console.log("timein",timein)
                        var timeout = (rows.check_out != '') ? moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") : checkoutime;
                        console.log("timeout",timeout)
                        var getcheckintime = moment.utc(timein).format("HH:mm:ss");
                        var getcheckouttime = moment.utc(timeout).format("HH:mm:ss");
                        var getcheckintimediffernce = moment.duration(getcheckintime, "HH:mm:ss");
                        var getcheckouttimediffernce = moment.duration(getcheckouttime, "HH:mm:ss");
                        var diff = moment.duration(moment(timeout).diff(timein));
                        //var diff = getcheckouttimediffernce.subtract(getcheckintimediffernce);
                        var work = "0" + diff.hours() + ":0" + diff.minutes() + ":" + diff.seconds() + "0";
                        var hours=moment.duration(diff,"HH:mm:ss")
                        var officehours="8:00:00"
                        var  remainhours;
                        var overtimevalue="00:00:00"
                        //var overtime="00:00:00"
                   console.log("hvjh",diff.asHours())
                        // var hours = moment(work).format("HH:mm:ss")
                       // overtimehours = timeConvert(rows.overtime != undefined ? rows.overtime : "00:00:00")
                       if(diff.asHours() > 8)
                       {
                        //overtimehours = timeConvert(rows.overtime != undefined ? rows.overtime : "00:00:00")
                        var workdate=(rows.total_working).split(":");
                        var officehoursdate=officehours.split(":");
                        var overtimevalue=(((workdate[0]-officehoursdate[0]) <=9)?"0"+(workdate[0]-officehoursdate[0]):workdate[0]-officehoursdate[0])+":"+((workdate[1]-officehoursdate[1]<=9)?"0"+(workdate[1]-officehoursdate[1]):workdate[1]-officehoursdate[1])+":"+((workdate[2]-officehoursdate[2])<=9?"0"+(workdate[2]-officehoursdate[2]):workdate[2]-officehoursdate[2])
                        console.log("overtime",overtimevalue)
                        remainhours=hours.subtract(officehours)
                        
                        // overtime=(remainhours.hours() <= 9 ?"0"+remainhours.hours():remainhours.hours())+":"+(remainhours.minutes() <= 9?"0"+remainhours.minutes():remainhours.minutes())+":"+(remainhours.seconds() <= 9? "0"+remainhours.seconds():remainhours.seconds())
                        // console.log("shjsj",overtime)
                       
                       }
                        var timeoutshow = (moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") != 'Invalid date') ? moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") : '';
                        response.push({
                            attendence_date: attendance_date,
                            time_in: timein,
                            time_out: timeoutshow,
                            working_hours: (rows.total_working != null) ? rows.total_working : "00:00:00",
                            over_time: (rows.check_out != undefined) ? overtimevalue : '00:00:00',
                            late_time: (rows.late_time) ? "Yes" : "No",
                            emp_id: rows.emp_id,
                            empid: rows.empid,
                            empname: (rows.empname) ? rows.empname : 'SuperAdmin',
                            action: rows.action
                        });
                    });

                    deferred.resolve({ status: 1, message: "attendence details",attendence_details: response });
                } else {
                    deferred.resolve({ status: 0, message: "No data found", attendence_details: [] });
                }
            }
        });
        return deferred.promise;
    },

 
    
    getattendancelistbyfilter: (emp_id, date, checkoutime) => {
        var deferred = q.defer();
        var response = [];
        if (checkoutime == '') {
            checkoutime = new Date();
        }
     
        var condition = '';
        if (emp_id != '') { 
            condition += " and b.emp_id=" + emp_id;
        }  
        if (date != '') { 
            condition += " and DATE_FORMAT(b.check_in, '%Y-%m-%d') = '" + date+"'";
        }  
  
            var Emplist_Query = "select b.*, FN_EMPID(b.emp_id) as empid, CONCAT(firstname,' ',middlename,' ',lastname) as empname, FN_ATTENDANCE_ACTION(b.emp_id,b.id, b.status) as action, FN_ATTENDANCESTATUS(b.emp_id, DATE_FORMAT(b.check_in, '%Y-%m-%d')) as astatus from hrm_employee_details a, hrm_employee_attendence b WHERE a.emp_id = b.emp_id "+condition+" and DATE_FORMAT(`check_in`, '%Y-%m-%d') >= DATE_SUB(CURDATE(), INTERVAL 31 DAY) GROUP by b.emp_id, DATE_FORMAT(check_in, '%Y-%m-%d') ";
        
            sql.query(Emplist_Query, function (err, EmpDetails) {
                console.log("Emplist_Query",Emplist_Query)
                console.log("Emplist_reuslt",EmpDetails)
                if (err) {
                    console.log(err);
                    deferred.resolve({ status: 0, message: "Something Went Wrong in Attendance Selection" });
                } else { 
                     
                if(EmpDetails.length > 0){
                    
                    EmpDetails.forEach((rows) => {
                        check_in_date = rows.check_in;
                        attendance_date = moment(check_in_date).format("YYYY-MM-DD");
                        var timein = moment(rows.check_in).format("YYYY-MM-DD HH:mm:ss");
                        var timeout = (rows.check_out != '') ? moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") : checkoutime;
                        var getcheckintime = moment.utc(timein).format("HH:mm:ss");
                        var getcheckouttime = moment.utc(timeout).format("HH:mm:ss");
                        var getcheckintimediffernce = moment.duration(getcheckintime, "HH:mm:ss");
                        var getcheckouttimediffernce = moment.duration(getcheckouttime, "HH:mm:ss");
                        var diff = moment.duration(moment(timeout).diff(timein));
                        // var diff = getcheckouttimediffernce.subtract(getcheckintimediffernce);
                        var work = "0" + diff.hours() + ":0" + diff.minutes() + ":" + diff.seconds() + "0";
                        var hours=moment.duration(diff,"HH:mm:ss");
                        var officehours="8:00:00";
                        var  remainhours;
                       //var overtime="00:00:00";
                       var overtimevalue="00:00:00"
                        //var hours = moment(work).format("HH:mm:ss")
                       // overtimehours = timeConvert(rows.overtime != undefined ? rows.overtime : "00:00:00")
                       if(diff.asHours() > 8)
                       {
                        var workdate=(rows.total_working).split(":");
                        var officehoursdate=officehours.split(":");
                         overtimevalue=(((workdate[0]-officehoursdate[0]) <=9)?"0"+(workdate[0]-officehoursdate[0]):workdate[0]-officehoursdate[0])+":"+((workdate[1]-officehoursdate[1]<=9)?"0"+(workdate[1]-officehoursdate[1]):workdate[1]-officehoursdate[1])+":"+((workdate[2]-officehoursdate[2])<=9?"0"+(workdate[2]-officehoursdate[2]):workdate[2]-officehoursdate[2])
                       //  remainhours=hours.subtract(officehours)
                        
                       // overtime=(remainhours.hours() <= 9 ?"0"+remainhours.hours():remainhours.hours())+":"+(remainhours.minutes() <= 9?"0"+remainhours.minutes():remainhours.minutes())+":"+(remainhours.seconds() <= 9? "0"+remainhours.seconds():remainhours.seconds())
                        
                       
                       } 
                       var timeoutshow = (moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") != 'Invalid date') ? moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") : '';
                        response.push({
                            attendence_date: attendance_date,
                            time_in: timein,
                            time_out: timeoutshow,
                            working_hours: (rows.total_working != null) ? rows.total_working : "00:00:00",
                            over_time: (rows.check_out != undefined) ? overtimevalue : '00:00:00',
                            late_time:  "00:00:00",
                            emp_id: rows.emp_id,
                            empid: rows.empid,
                            empname: (rows.empname) ? rows.empname : 'SuperAdmin',
                            active: rows.astatus,
                            action: rows.action
                        });
                    });  
                  
                    deferred.resolve({ status: 1, message: "attendence details",attendence_details: response });
                } 
            }
         });  
      
        return deferred.promise;
    },

    getattendanceabsentlistbyfilter: (emp_id, date, checkoutime) => {
        var deferred = q.defer();

        if (checkoutime == '') {
            checkoutime = new Date();
        }
        
        var condition = '';
        if (date == '' && emp_id != '') { 
            condition += (condition != '') ? " and emp_id=" + emp_id : " where emp_id=" + emp_id ;
        }  
           
        // if (date != '') { 
        //     condition += (condition != '') ? " and DATE_FORMAT(b.check_in, '%Y-%m-%d')='" + date+"'" : " where DATE_FORMAT(b.check_in, '%Y-%m-%d')= '" + date+"'" ;
        // }  
       
        var sixmonthcond = (date != '') ? " where year_month_date LIKE '%" + date + "%' " : "  where year_month_date > DATE_SUB(now(), INTERVAL 31 DAY) and year_month_date <= DATE_FORMAT(now(), '%Y-%m-%d') "
        var Monthquery = " select * from  hrm_months "+ sixmonthcond; 
        var response = [];
        sql.query(Monthquery, function (err, months) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Something Went Wrong in Months" });
            }else{
                var loopcount = months.length;
                months.forEach((month, index) => {
                    var dmyear = moment(month.year_month_date).format("YYYY-MM-DD")
                   
                    var attendence_Query = " select emp_id,FN_EMPID(emp_id) as empid, FN_EMPLOYEE_NAME(emp_id) as empname from " + tableConfig.HRM_EMPLOYEE_DETAILS + condition ;
                  
                    sql.query(attendence_Query, function (err, EmpDetails) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: "Something Went Wrong in getting Attendance" });
                        } else {
                           
                            EmpDetails.forEach((empdata) => {
                                response.push({
                                    attendence_date: dmyear,
                                    time_in: '00:00:00',
                                    time_out: '00:00:00',
                                    working_hours: '00:00:00',
                                    over_time: '00:00:00',
                                    late_time: '00:00:00',
                                    emp_id: empdata.emp_id,
                                    empid: empdata.empid,
                                    empname: (empdata.empname) ? empdata.empname : 'SuperAdmin',
                                    active: '<small class="label label-warning"> Absent</small>',
                                    action: '-'
                                }); 
                            });

                            // console.log('index ---->', index + ''+ loopcount)
                                
                            if(loopcount == (parseInt(index)+1)){
                                deferred.resolve({ status: 1, message: "attendence details", attendence_details: response });    
                            }

                            
                        }
                        
                    });

                });
            }

        });
  
      
        return deferred.promise;
    },
    excelImportAttendence: (req, res) => {
        var deferred = q.defer();
        var v = new Validator();
        var datetimeformat = /^[0-9]{4}\-(?:0[1-9]|1[0-2])\-(?:0[1-9]|[1-2][0-9]|3[0-1])\s+(?:2[0-3]|[0-1][0-9]):[0-5][0-9]:[0-5][0-9]$/gm;
        //var timeformat=/(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/       
        var employeeSchema = {
            "id": "/attendenceDetails",
            "type": "object",
            "properties": {
                "check_in": { "type": "string", "pattern": datetimeformat },
                "check_out": { "type": "string", "pattern": datetimeformat },


                "emp_id": { "type": "string" },

            },

            "required": ["check_in", "emp_id"]
        };

        uploads(req, res, async function (err) {
            var getcheckintimediffernce = 0;
            var getcheckouttimediffernce = 0;
            console.log("workbook", req.body)
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: "Failed to import data" });
            } else {
                if (!req.file) {
                    deferred.resolve({ status: 0, message: "Please choose file" });
                } else {

                    if (req.body.company_id != undefined && req.body.company_id != '') {

                        var company_id = req.body.company_id;
                        var workbook = XLSX.readFile(__dirname + "/uploads/attendence_list.xlsx");

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
                                    console.log(employeeSchema)
                                    rows.push(index + 1);

                                }
                                errors = errors.concat(ValidatorResult.errors);
                                console.log("error", errors)
                            });

                            if (errors.length == 0) {

                                 var currentdate=moment.utc().format("YYYY-MM-DD")
                                forEach(data, async (e_detail, index, next) => {
                                    console.log("rows", index)
                                    var check_in = (e_detail.check_in) ? moment(e_detail.check_in).format("YYYY-MM-DD HH:mm:ss") : '';
                                    var check_out = (e_detail.check_out != undefined && check_out != '') ? e_detail.check_out : '';

                                    var total_working = (e_detail.total_working) ? e_detail.total_working : '';


                                    var overtime = (e_detail.overtime) ? e_detail.overtime : '';
                                    var status = (check_out != undefined && check_out != '') ? 0 : 1;

                                    console.log("check_out", check_out)
                                    var emp_id = (e_detail.emp_id) ? e_detail.emp_id : '';
                                    var get_check_in = moment(check_in).format("HH:mm:ss");
                                    var get_check_out = moment(check_out != undefined && check_out != '').format("HH:mm:ss") ? moment(check_out).format("HH:mm:ss") : '';
                                    console.log("DDSSD", get_check_out)
                                    getcheckintimediffernce = moment(check_in).format("HH:mm:ss");
                                    getcheckouttimediffernce = moment.duration(check_out, "HH:mm:ss");
                                    diff = getcheckouttimediffernce.subtract(getcheckintimediffernce);
                                    var office_hours = "09:30:00";
                                    var latetime = 0;
                                    var getcheckdate = moment(check_in).format("YYYY-MM-DD")

                                    var working_hours = "8:00:00";// time-format

                                    var start = moment(check_in).format();
                                    var end = moment(check_out).format();


                                    var difference = moment.duration(moment(end).diff(start));
                                    var dutyhours=moment.duration(difference,"HH:mm:ss")
                                    console.log("dutyhours",dutyhours.asHours())
                                    var over_time = 0;
                                    var overtimeduty = 0
                               
                                   // var checktime = difference.hours() + ":0" + difference.minutes() + ":0" + difference.seconds();
                                    var checkminutes = moment.duration(dutyhours).asMinutes()
                                    var workhours = "8:00:00"
                                    var workminutes = moment.duration(workhours).asMinutes()
                                  
                                   
                                    if (check_out != '' && check_out != undefined) {
                                       
                                        // var working_hours = moment.duration("08:00:00", "HH:mm:ss");
                                        
                                        //var user_check_outime = moment.duration(checktime, "HH:mm:ss");
                                       if(checkminutes > workminutes)
                                       {
                                          
                                        overtimework = dutyhours.subtract(workhours);
                                       
                                        
                                        over_time = moment.duration(overtimework).asMinutes();
                                        overtimeduty = Math.round(over_time);
                                       }

                                    }
                                    console.log("fdatetype", typeof (getcheckintimediffernce))
                                    console.log("datetype", getcheckintimediffernce > office_hours)
                                    console.log("getcheckin", getcheckintimediffernce)
                                    if (getcheckintimediffernce > office_hours) {

                                        latetime = 1;
                                    }

                                    var employee_query = "select um.id from hrm_user_master as um inner join hrm_employee_details as em on em.emp_id=um.id where um.status=1 and um.role_id!=1 and um.emp_id ='" + emp_id + "'"
                                    sql.query(employee_query, async function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            deferred.resolve({ status: 0, message: "Something went wrong" })
                                        }
                                        else {
                                            if (result.length > 0) {
                                                var empid = result[0].id;
                                                var checkEmailQuery = "SELECT id FROM hrm_employee_attendence WHERE DATE(check_in) = DATE('" + getcheckdate + "') AND emp_id =" + empid + "";
                                                var emailResult = await commonFunction.getQueryResults(checkEmailQuery);
                                                console.log("employeequery", checkEmailQuery)
                                                if (emailResult.length > 0) {
                                                    console.log("jksdhasdfjhEF")
                                                    deferred.resolve({ status: 0, message: "Already logged in " })
                                                    next();
                                                } else {







                                                    var employeePrimaryID = 0;

                                                    if( moment(e_detail.check_in).format("YYYY-MM-DD") <= currentdate)
                                                    {
                                                    var save_employee = "INSERT INTO hrm_employee_attendence(emp_id,check_in,check_out,total_working,overtime,late_time,status) VALUES ('" + empid + "','" + check_in + "',IFNULL('" + check_out + "',''),TIMEDIFF('" + check_out + "','" + check_in + "'),'" + overtimeduty + "','" + latetime + "','" + status + "')";
                                                    sql.query(save_employee, async function (err, insertResults) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            if (insertResults.affectedRows > 0) {
                                                                deferred.resolve({ status: 1, message: "Attendence add successfully" })
                                                            }
                                                        }
                                                    });
                                                }

                                                    // } else {
                                                    //     deferred.resolve({ status: 0, message: "Failed to add employee" });
                                                    // }

                                                    next();
                                                    // }
                                                }
                                            }
                                            else {
                                                deferred.resolve({ status: 0, message: "Employee does not exist" })
                                                next();
                                            }
                                        }
                                    })

                                }).then(() => {
                                    deferred.resolve({ status: 1, message: "Attendence  added successfully", duplicate_email_ids: duplicate_mail_ids, total_given_employees: total_number_of_employees_given });
                                }).catch((error) => {
                                    deferred.resolve({ status: 0, message: "Failed to add attendence" });
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
    lastAttendencesummary:  async (emp_id,limit) => {
        var deferred = q.defer();

        var response = [];
         var getAttendencedataquery="select check_in,check_out from hrm_employee_attendence where emp_id="+emp_id+" order by id desc LIMIT 5";
         var getAttendencedata= await commonFunction.getQueryResults(getAttendencedataquery);
       
    if(getAttendencedata.length  > 0)
    {
        let checkindate='';
        let checkoutdata='';
        getAttendencedata.forEach((data)=>
        {
           
                checkindate=moment(data.check_in).format("DD-MMMM-YYYY HH:mm:ss");
                checkoutdata=(data.check_out!=undefined)?moment(data.check_out).format("DD-MMMM-YYYY HH:mm:ss"):''
            response.push({
                check_in:checkindate,
                check_out:checkoutdata
            })
        })

            //let lastattendencedata=getAttendencedata;
            
            deferred.resolve({status:1,message:"Attendence Summary ",attendencelist:response})
        
    }
    else
    {
        deferred.resolve({status:0,message:"No data found"})
    }
        return deferred.promise;
    },

    // getattendancelistbyfilter: (emp_id, date, checkoutime) => {
    //     var deferred = q.defer();
    //     var response = [];
    //     if (checkoutime == '') {
    //         checkoutime = new Date();
    //     }
    //     var condition = '';
    //     var condition2 = '';
    //     if ( (date != '' && emp_id == '') || (date != '' && emp_id != '')) {
    //         condition += " where check_in LIKE '%" + date + "%'";
    //     } else if (date == '' && emp_id != '') { 
    //         condition2 += " where emp_id=" + emp_id;
    //     }  

    //     var Emplist_Query = " select emp_id,FN_EMPID(emp_id) as empid, FN_EMPLOYEE_NAME(emp_id) as empname from " + tableConfig.HRM_EMPLOYEE_DETAILS + condition2;
        
    //      sql.query(Emplist_Query, function (err, EmpDetails) {
    //         if (err) {
    //             console.log(err);
    //             deferred.resolve({ status: 0, message: "Something Went Wrong in Attendance Selection" });
    //         } else {
    //                  console.log('attendence_Query', Emplist_Query)
    //             if(EmpDetails.length > 0){
    //                 EmpDetails.forEach((empdata) => {
    //                     var addempid = (condition != '') ? ' and emp_id ='+empdata.emp_id : '';
    //                     var sixmonthcond = (date != '') ? " where year_month_date LIKE '%" + date + "%' " : "  where year_month_date > DATE_SUB(now(), INTERVAL 6 MONTH)"
    //                     var Monthquery = " select * from  hrm_months "+ sixmonthcond; 
                       
    //                     sql.query(Monthquery, function (err, months) {
    //                        if (err) {
    //                            console.log(err);
    //                            deferred.resolve({ status: 0, message: "Something Went Wrong in Months" });
    //                        }else{
                               
    //                            months.forEach((month) => {
    //                                var dmyear = moment(month.year_month_date).format("YYYY-MM-DD")
    //                                var datecond = " where DATE(check_in) = '" + dmyear + "'";
    //                                var attendence_Query = " select check_in,check_out,total_working,late_time,overtime,emp_id,FN_EMPID(emp_id) as empid, FN_EMPLOYEE_NAME(emp_id) as empname, FN_ATTENDANCE_ACTION(emp_id,id, status) as action from " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + datecond + addempid + " group by emp_id order by check_in desc ";
    //                                console.log('Another Query', attendence_Query)
    //                                sql.query(attendence_Query, function (err, attendenceData) {
    //                                    if (err) {
    //                                        console.log(err);
    //                                        deferred.resolve({ status: 0, message: "Something Went Wrong in getting Attendance" });
    //                                    } else {
    //                                     //    console.log('attendenceData=====>', attendenceData)
    //                                        if (attendenceData.length > 0) {
    //                                            var check_in_date = '';
    //                                            var attendance_date = '';
    //                                            var overtimehours = "00:00:00";
                                               
                                               
    //                                            attendenceData.forEach((rows) => {
    //                                                check_in_date = rows.check_in;
    //                                                attendance_date = moment(check_in_date).format("YYYY-MM-DD");
    //                                                var timein = moment(rows.check_in).format("YYYY-MM-DD HH:mm:ss");
    //                                                var timeout = (rows.check_out != '') ? moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") : checkoutime;
    //                                                var getcheckintime = moment.utc(timein).format("HH:mm:ss");
    //                                                var getcheckouttime = moment.utc(timeout).format("HH:mm:ss");
    //                                                var getcheckintimediffernce = moment.duration(getcheckintime, "HH:mm:ss");
    //                                                var getcheckouttimediffernce = moment.duration(getcheckouttime, "HH:mm:ss");
    //                                                var diff = getcheckouttimediffernce.subtract(getcheckintimediffernce);
    //                                                var work = "0" + diff.hours() + ":0" + diff.minutes() + ":" + diff.seconds() + "0";
    //                                                var hours = moment(work).format("HH:mm:ss")
    //                                                overtimehours = timeConvert(rows.overtime != undefined ? rows.overtime : "00:00:00")
    //                                                var timeoutshow = (moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") != 'Invalid date') ? moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") : '';
    //                                                response.push({
    //                                                    attendence_date: attendance_date,
    //                                                    time_in: timein,
    //                                                    time_out: timeoutshow,
    //                                                    working_hours: (rows.total_working != null) ? rows.total_working : "00:00:00",
    //                                                    over_time: (rows.check_out != undefined) ? overtimehours : '00:00:00',
    //                                                    late_time:  "00:00:00",
    //                                                    emp_id: rows.emp_id,
    //                                                    empid: rows.empid,
    //                                                    empname: (rows.empname) ? rows.empname : 'SuperAdmin',
    //                                                    active: '<small class="label label-success"> Present</small>',
    //                                                    action: rows.action
    //                                                });
    //                                            });  
                                               
    //                                            deferred.resolve({ status: 1, message: "attendence details",attendence_details: response });    
                                                                                      
    //                                        } 
    //                                        else {
    //                                            response.push({
    //                                                attendence_date: dmyear,
    //                                                time_in: '00:00:00',
    //                                                time_out: '00:00:00',
    //                                                working_hours: '00:00:00',
    //                                                over_time: '00:00:00',
    //                                                late_time: '00:00:00',
    //                                                emp_id: empdata.emp_id,
    //                                                empid: empdata.empid,
    //                                                empname: (empdata.empname) ? empdata.empname : 'SuperAdmin',
    //                                                active: '<small class="label label-warning"> Absent</small>',
    //                                                action: '-'
    //                                            }); 
    //                                        }
    
    //                                        deferred.resolve({ status: 1, message: "attendence details",attendence_details: response });    
    //                                    }
                                       
    //                                });
   
    //                            });
    //                        }
   
    //                    }); 
   
    //                });
    //             }else{

    //             }

                

               

    //         }
    //      });

         
      
    //     return deferred.promise;
    // },

    // getattendancelistbyfilter: (emp_id, date, checkoutime) => {
    //     var deferred = q.defer();
    //     var response = [];
    //     if (checkoutime == '') {
    //         checkoutime = new Date();
    //     }
    //     var condition = ' ';
    //     if (date != '' && emp_id == '') {
    //         condition += "where check_in LIKE '%" + date + "%'";
    //     } else if (date == '' && emp_id != '') {
    //         condition += "where emp_id=" + emp_id;
    //     } else if (date != '' && emp_id != '') {
    //         condition += "where emp_id=" + emp_id + " and check_in LIKE '%" + date + "%'";
    //     }
    //     var attendence_Query = " select check_in,check_out,total_working,late_time,overtime,emp_id,FN_EMPID(emp_id) as empid, FN_EMPLOYEE_NAME(emp_id) as empname, FN_ATTENDANCE_ACTION(emp_id,id, status) as action from " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + condition;
    //    console.log('attendence_Query', attendence_Query)
    //     sql.query(attendence_Query, function (err, attendenceData) {
    //         if (err) {
    //             console.log(err);
    //             deferred.resolve({ status: 0, message: "Something Went Wrong" });
    //         } else {
    //             if (attendenceData.length > 0) {
    //                 var check_in_date = '';
    //                 var attendance_date = '';
    //                 var overtimehours = "00:00:00";
                    
    //                 attendenceData.forEach((rows) => {
    //                     check_in_date = rows.check_in;
    //                     attendance_date = moment(check_in_date).format("YYYY-MM-DD");
    //                     var timein = moment(rows.check_in).format("YYYY-MM-DD HH:mm:ss");
    //                     var timeout = (rows.check_out != '') ? moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") : checkoutime;
    //                     var getcheckintime = moment.utc(timein).format("HH:mm:ss");
    //                     var getcheckouttime = moment.utc(timeout).format("HH:mm:ss");
    //                     var getcheckintimediffernce = moment.duration(getcheckintime, "HH:mm:ss");
    //                     var getcheckouttimediffernce = moment.duration(getcheckouttime, "HH:mm:ss");
    //                     var diff = getcheckouttimediffernce.subtract(getcheckintimediffernce);
    //                     var work = "0" + diff.hours() + ":0" + diff.minutes() + ":" + diff.seconds() + "0";
    //                     var hours = moment(work).format("HH:mm:ss")
    //                     overtimehours = timeConvert(rows.overtime != undefined ? rows.overtime : "00:00:00")
    //                     var timeoutshow = (moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") != 'Invalid date') ? moment(rows.check_out).format("YYYY-MM-DD HH:mm:ss") : '';
    //                     response.push({
    //                         attendence_date: attendance_date,
    //                         time_in: timein,
    //                         time_out: timeoutshow,
    //                         working_hours: (rows.total_working != null) ? rows.total_working : "00:00:00",
    //                         over_time: (rows.check_out != undefined) ? overtimehours : '00:00:00',
    //                         late_time: (rows.late_time) ? "Yes" : "No",
    //                         emp_id: rows.emp_id,
    //                         empid: rows.empid,
    //                         empname: (rows.empname) ? rows.empname : 'SuperAdmin',
    //                         action: rows.action
    //                     });
    //                 });

    //                 deferred.resolve({ status: 1, message: "attendence details",attendence_details: response });
    //             } else {
    //                 deferred.resolve({ status: 0, message: "No data found", attendence_details: [] });
    //             }
    //         }
    //     });
    //     return deferred.promise;
    // }
}

function timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    var second = hours % 3600
    var seconds = Math.round(second % 60);
    var overtimehours = (rhours != 'NaN' ? rhours : '0')
    var overtimeminutes = (rminutes != 'NaN' ? rminutes : "0");
    var overtimeseconds = (seconds != 'NaN' ? seconds : "0")
    var timeformat = "0"+overtimehours + ":0" + overtimeminutes + ":0" + overtimeseconds
    if(overtimehours > 9 && overtimeminutes > 9 && overtimeseconds > 9)
    {
       
        timeformat = overtimehours + ":" + overtimeminutes + ":" + overtimeseconds
    }
    return timeformat
}
function getDatesDiff  (start_date, end_date, date_format = "YYYY-MM-DD")  {
    const getDateAsArray = date => {
      return moment(date.split(/\D+/), date_format);
    }
    const diff = getDateAsArray(end_date).diff(getDateAsArray(start_date), "days") + 1;
    const dates = [];
    for (let i = 0; i < diff; i++) {
      const nextDate = getDateAsArray(start_date).add(i, "day");
    //   const isWeekEndDay = nextDate.isoWeekday() > 5;
    //   if (!isWeekEndDay)
        dates.push(nextDate.format(date_format))
    }
    return dates;
  }


function getabsentresult(months, empdata, addempid){
    var response = attendancedata = [];
    months.forEach((month) => {
        var dmyear = moment(month.year_month_date).format("YYYY-MM-DD")
        var datecond = " where DATE(check_in) = '" + dmyear + "'";
        var attendence_Query = " select check_in,check_out,total_working,late_time,overtime,emp_id,FN_EMPID(emp_id) as empid, FN_EMPLOYEE_NAME(emp_id) as empname, FN_ATTENDANCE_ACTION(emp_id,id, status) as action from " + tableConfig.HRM_EMPLOYEE_ATTENDENCE + datecond + addempid;
        sql.query(attendence_Query, function (err, attendenceData) {
            attendancedata = attendenceData;   
            attendancedata.forEach((month) => {
                response.push({
                    attendence_date: dmyear,
                    time_in: '',
                    time_out: '',
                    working_hours: '-',
                    over_time: '-',
                    late_time: '-',
                    emp_id: empdata.emp_id,
                    empid: empdata.empid,
                    empname: (empdata.empname) ? empdata.empname : 'SuperAdmin',
                    active: '<small class="label label-warning"> Absent</small>',
                    action: '-'
                }); 
            });   
            console.log('Absent result ========>', response)
            return response;      
        });

    });

  
    
}