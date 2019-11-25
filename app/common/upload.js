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
const image = multer({
  storage: multerS3({
    bucket: commonConfig.BUCKET,
    s3: s3,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    metadata: function (req, file, callback) {
      callback(null, { fieldName: file.fieldname });
    },
    key: function (req, file, callback) {
      var newFileName = Date.now() + '_' + file.originalname;
      if(req.body.type != undefined && req.body.type == 'claims'){
        fullPath = 'claims/' + newFileName;
      } else {
        fullPath = 'company_logo/' + newFileName;
      }
      callback(null, fullPath);
    }
  })
});

module.exports = image;