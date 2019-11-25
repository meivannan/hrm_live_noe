var moment = require('moment');
var sql = require('../../config/database.config');
var q = require('q');

module.exports = {
    getTimeZoneDate: (dateparam, timezone, format) => {
        var timezone = (timezone != undefined && timezone != '') ? timezone : '+00:00';
        var date = new Date();
        if (dateparam != undefined && dateparam != '') {
            date = new Date(dateparam);
        }
        var dateformat = (format) ? format : 'YYYY-MM-DD';
        return moment(date).utcOffset(timezone).format(dateformat);
    },

    getTimeZoneDateWithoutFormat: (dateparam, timezone) => {
        var timezone = (timezone != undefined && timezone != '') ? timezone : '+00:00';
        var date = new Date();
        if (dateparam != undefined && dateparam != '') {
            date = new Date(dateparam);
        }
        return moment(date).utcOffset(timezone);
    },

    executeQuery: async query => {
        var deferred = q.defer();
        var result = false;
        sql.query(query, function (err, results) {
            if (err) {
                console.log(err);
                deferred.resolve(result);
            } else {
                deferred.resolve(true);
            }
        });
        return deferred.promise;
    },

    executeQueryAndRetunResults: async query => {
        var deferred = q.defer();
        var result = [];
        sql.query(query, function (err, results) {
            if (err) {
                console.log(err);
                deferred.resolve(result);
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    },

    getQueryResults: async query => {
        var deferred = q.defer();
        var result = [];
        sql.query(query, function (err, results) {
            if (err) {
                console.log(err);
                deferred.resolve(result);
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    },

    getBusinessDatesCount:async (startDate, endDate)=> {
        var deferred = q.defer();
        var count = 0;
        if(startDate != '' && endDate != '') {
            startDate =  new Date(startDate);
            endDate =  new Date(endDate);

        var curDate = startDate;
        while (curDate <= endDate) {
            var dayOfWeek = curDate.getDay();
            if(!((dayOfWeek == 6) || (dayOfWeek == 0)))
               count++;
            curDate.setDate(curDate.getDate() + 1);
        }
        deferred.resolve(count);
    } else {
        deferred.resolve(count);
    }
        return deferred.promise;
    }
}