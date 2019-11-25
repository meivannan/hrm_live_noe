var sql = require('../../config/database.config');
var tableConfig = require('../config/table_config');
var q = require('q');
var sql = require('../../config/database.config');
var moment = require('moment');
// var serialize = require('locutus/php/var/serialize');
var phpunserialize = require('phpunserialize');
var commonFunction = require('./commonfunction');
module.exports = {

    getMenusaccess:async (company_id, emp_id) => {
        var deferred = q.defer(); 
        
        var EmpQuery = "Select role_id from " + tableConfig.HRM_USER_MASTER +" where  company_id = "+company_id+" and id = "+ emp_id +" and status = 1" ;
        sql.query(EmpQuery, function (err, masterData) {
            if (err) {
                console.log(err);
                deferred.resolve({ status: 0, message: err });
            } else {
                 
                if (masterData) { 
                      
                    var permissionQuery = "Select permission from " + tableConfig.HRM_ROLE + " where id = "+ masterData[0].role_id  ;
                    sql.query(permissionQuery, function (err, privilages) {
                        if (err) {
                            console.log(err);
                            deferred.resolve({ status: 0, message: err });
                        } else { 

                            if(privilages){
                                var PmenuQuery = "Select id, menu_name, namekey, link, icon,parent_id, is_parent, is_module, sort_order, status from " + tableConfig.HRM_MENUS + " where id in ("+ privilages[0].permission+")  and status = 1 and parent_id = 0";
                                sql.query(PmenuQuery, async function (err, Pmenulist) {
                                    if (err) {
                                        console.log(err);
                                        deferred.resolve({ status: 0, message: err });
                                    } else{
    
                                        var CmenuQuery = "Select id, menu_name, namekey, link, icon,parent_id, is_parent, is_module, sort_order, status from " + tableConfig.HRM_MENUS + " where id in ("+ privilages[0].permission+")  and status = 1 and parent_id != 0";
                                        sql.query(CmenuQuery, async function (err, Cmenulist) {
                                            if (err) {
                                                console.log(err);
                                                deferred.resolve({ status: 0, message: err });
                                            }else{
                                                deferred.resolve({ status: 1, message: 'Menu List', parentnode: Pmenulist, childnode: Cmenulist });
                                            }
                                        }); 
                                    } 
                                });
                            }else{
                                deferred.resolve({ status: 0, message: "No Privilages found" }); 
                            }  
                        }
                    });
                } else {
                    deferred.resolve({ status: 0, message: "Un-Authorized User" });
                }
            }
        });
        return deferred.promise;
    }
}
