'user strict';

var mysql = require('mysql');

// var HOSTNAME = 'localhost';
// var USER = 'root';
// var PASSWORD = '';
// var DB_NAME = 'hrm_backup_live';

var HOSTNAME = 'smitiv.net';
var USER = 'hRmsmitiv';
var PASSWORD = 'Hrm$mitiv!123';
var DB_NAME = 'hrm_staging_updates';
var TIMEZONE='utc'
// var HOSTNAME = 'guardsappdev.clt6g6huqccp.ap-southeast-1.rds.amazonaws.com';
// var USER = 'guardsAppAdmin';
// var PASSWORD = 'govind123';
// var DB_NAME = 'hrm_node_db';


var PORT = 3306;

//mysql db connection
var pool  = mysql.createPool({
  connectionLimit : 1000,
  connectTimeout  : 60 * 60 * 1000,
  acquireTimeout  : 60 * 60 * 1000,
  timeout         : 60 * 60 * 1000,
    host            : HOSTNAME,
    user            : USER,
    password        :PASSWORD,
    database        : DB_NAME,
   timezone        :TIMEZONE
  });
pool.getConnection(function(err, connection) {
    if (err) throw err; // not connected!
  
    // Use the connection
    connection.query('SELECT 1', function (error, results, fields) {
      // When done with the connection, release it.
      if(!error)
      {
          console.log("DB connected successfully")
        connection.release();
      }
     
  
      // Handle error after the release.
     if (error) throw error;
     

      // Don't use the connection here, it has been returned to the pool.
    });
  })
// connection.connect(function(err){
//     if(!err){
//         console.log('DB connected successfully');
//         setInterval(function () {
//             connection.query('SELECT 1');
//         }, 56000);
        
//     }
//     else{
//         console.log('Cannot connect to DATABASE...',err);
//     }
//  });

module.exports = pool;
