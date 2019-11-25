const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const commonConfig = require('../config/common_config');

aws.config.update({
  accessKeyId: commonConfig.AWS_ACCESS_KEY,
  secretAccessKey: commonConfig.AWS_SECRET_ACCESS_KEY,
  region: commonConfig.REGION,
});

const s3 = new aws.S3();
const employee_upload = multer({
  storage: multerS3({
    bucket: commonConfig.BUCKET,
    s3: s3,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    metadata: function (req, file, callback) {

      callback(null, { fieldName: file.fieldname });
    },
    key: function (req, file, callback) {
        if(file.fieldname=='bankcrypt_file')
        {
            var newFileName = Date.now() + '_' + file.originalname;
            var fullPath = 'bankcrypt_file/' + newFileName;
            callback(null, fullPath);
        }
        else if(file.fieldname=='criminal_file')
        {
            var newFileName = Date.now() + '_' + file.originalname;
            var fullPath = 'criminal_file/' + newFileName;
            callback(null, fullPath);
        }
        else if(file.fieldname=='dispenary_file')
        {
            var newFileName = Date.now() + '_' + file.originalname;
            var fullPath = 'Warming_letter/' + newFileName;
            callback(null, fullPath);
        }
    //   var newFileName = Date.now() + '_' + file.originalname;
    //   var fullPath = 'company_logo/' + newFileName;
     
    }
  })
});

// const employee_upload= multer({
//   storage: multerS3({
//     bucket: commonConfig.BUCKET,
//     s3: s3,
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     acl: 'public-read',
//     metadata: function (req, file, callback) {

//       callback(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, callback) {

//       var newFileName = Date.now() + '_' + file.originalname;
//       var fullPath = 'company_logo/' + newFileName;
//       callback(null, fullPath);
//     }
//   })
// });


module.exports = employee_upload;