var sql = require('../../config/database.config');
var tableConfig = require('../config/table_config');
var q = require('q');
var randomstring = require("randomstring");
var mail = require('../common/mail');
var md5 = require('md5');
var commonFunction = require('../models/commonfunction');
var moment = require('moment');
module.exports={
   applyHoilday: (company_id,from_date,to_date,title) => {
       var deferred = q.defer();
        var checkingQuery="select company_id from "+ tableConfig.HRM_HOLIDAYS +" where company_id="+company_id+" and (DATE(from_date) <='"+from_date+"' AND DATE(to_date) >= '"+to_date+"')";
       sql.query(checkingQuery,function(err,result)
       {
        //    console.log('checkingQuery', checkingQuery)
           if(err)
           {
               console.log(err);
               deferred.resolve({status:0,message:"something went wrong"})
           }
           else
           {
               if(result.length > 0 )
               {
                   deferred.resolve({status:0,message:"Leave has been created already"  })
               }
               else{
                   var get_year=moment(from_date).format("YYYY");
                   var hoildayQuery = "INSERT INTO "+ tableConfig.HRM_HOLIDAYS +" (year,title,from_date,to_date,company_id) VALUES ('"+ get_year +"','"+ title +"','"+ from_date +"','"+ from_date+"','"+company_id+"')";
                   console.log('hoildayQuery', hoildayQuery)
                   sql.query(hoildayQuery, function (err, masterData) {
                   if (err) {
                       console.log(err);
                       deferred.resolve({ status: 0, message: "Failed to apply hoildays" });
                   } else {
                       if (masterData.affectedRows > 0) {
                           deferred.resolve({ status: 1, message: "Successfully to  add hoilday" });
                       } else {
                           deferred.resolve({ status: 0, message: "Failed to add hoilday" });
                       }
                   }
               });
               }
           }
       })
       return deferred.promise;
   },
   hoildayListByYear: (company_id,year) => {
       var deferred = q.defer();7
       var list=[];
      var current_year='""';
       var colour_list=['lawn green','green','yellow','red','brown','deep pink']
      if(year == '0000')
      {
          current_year = "YEAR(CURDATE())"
      }
      else
      {
        current_year = year//"YEAR("+year+")"
      }
       var hoilday_query="select * from  hrm_holidays where company_id="+company_id+" and (year="+current_year+") group by id";
       sql.query(hoilday_query,function(err,data)
       {
           if(err)
           {
               console.log(err);
               deferred.resolve({status:0,message:"Something Went wrong"})
           }
           else
           {
            var start_date='';
            var end_date='';
               if(data.length > 0)
               {
                   var colour=random_item(colour_list) ;
                   data.forEach((result)=>
                   {
                       start_date=(moment(result.from_date).format("YYYY-MM-DD")!= 'Invalid date') ?moment(result.from_date).format('YYYY-MM-DD'):''
                       end_date=(moment(result.to_date).format("YYYY-MM-DD")!= 'Invalid date') ?moment(result.to_date).format('YYYY-MM-DD'):''
                           list.push({
                               title : result.title,
                               start :start_date,
                               end :end_date  ,
                               backgroundColor:colour ,
                               borderColor:colour
                            })
                   })
                   deferred.resolve({status:1,message:"Hoildays list ",list:list})
               }
               else
               {
                   deferred.resolve({status:1,message:"No hoildays  ",list:[]})
               }
           }
       })
       return deferred.promise;
   }
}
function random_item(items)
{
return items[Math.floor(Math.random()*items.length)];
}