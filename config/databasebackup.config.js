'user strict';

var mysql = require('mysql');

// var HOSTNAME = 'localhost';
// var USER = 'root';
// var PASSWORD = '';
// var DB_NAME = 'hrm_staging_updates';

var HOSTNAME = 'smitiv.net';
var USER = 'hRmsmitiv';
var PASSWORD = 'Hrm$mitiv!123';
var DB_NAME = 'hrm_staging_updates';

// var HOSTNAME = 'guardsappdev.clt6g6huqccp.ap-southeast-1.rds.amazonaws.com';
// var USER = 'guardsAppAdmin';
// var PASSWORD = 'govind123';
// var DB_NAME = 'hrm_node_db';


var PORT = 3306;

//mysql db connection
var connection = mysql.createConnection({
    host     : HOSTNAME,
    user     : USER,
    password : PASSWORD,
    database : DB_NAME,
    port:PORT,
    charset : 'utf8mb4'
});

connection.connect(function(err){
    if(!err){
        console.log('DB connected successfully');
        setInterval(function () {
            connection.query('SELECT 1');
        }, 56000);
        
    }
    else{
        console.log('Cannot connect to DATABASE...',err);
    }
 });

module.exports = connection;
