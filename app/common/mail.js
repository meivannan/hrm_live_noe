const sgMail = require('@sendgrid/mail');
var common_config = require('../config/common_config.json');
var q= require('q');
module.exports = {

    sendMail:(userdata)=>{
        sgMail.setApiKey(common_config.SENDGRID_API_KEY);
        const msg = {
          to: userdata.to,
          from:"HRM Support <"+ common_config.MAIL_FROM_ADDRESS +">",
          subject: userdata.subject,
          html: userdata.html,
        };
      
        sgMail.send(msg);
    }
}