var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var validation = require('../common/validation');
var payrollModels = require('../models/payrollModels');
var fs = require('fs')
var path=require('path')
var commonFunction = require('../models/commonfunction');
 var moment=require('moment');
 var commonConfig = require('../config/common_config');

module.exports = {
    generatePayrolltest: (req, res) => {

        validation.validateGeneratePayroll(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var company_id = req.body.company_id;
                var from_date = req.body.from_date;
                var to_date = req.body.to_date;

                payrollModels.generatePayrolltest(company_id, from_date, to_date).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },
    generateLevyStatement: (req, res) => {

        validation.validateLevyStatement(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var company_id = req.body.company_id;
                var from_date = req.body.from_date;
                var to_date = req.body.to_date;

                payrollModels.generateLevyStatement(company_id, from_date, to_date).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },
    generatePayroll: (req, res) => {

        validation.validateGeneratePayroll(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var company_id = req.body.company_id;
                var from_date = req.body.from_date;
                var to_date = req.body.to_date;

                payrollModels.generatePayroll(company_id, from_date, to_date).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },

    approvePayroll: (req, res) => {

        validation.validateApprovePayroll(req).then((validationResults) => {

            if (validationResults.length == 0) {
                var employee_id = req.body.employee_id;
                var paymonth = req.body.paymonth;
                var payyear = req.body.payyear;
                var company_id = req.body.company_id;
                var url = req.body.url;

                payrollModels.approvePayroll(employee_id,paymonth,payyear,company_id,url).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },

    getPayrollDetailsById: (req, res) => {
            // console.log('Body Request', req.body)
            if (req.body) {
                var payroll_id = req.body.payroll_id;
                var salary_id = req.body.salary_id;
                payrollModels.getPayrollDetailsById(payroll_id, salary_id).then(results => {
                    res.json(results);
                });

            } else{
                res.json({ status: 0, message: 'Invalid Parameter' });
            }
    },

    generatePayrollPreview: (req, res) => {

        validation.validateGeneratePayroll(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var company_id = req.body.company_id;
                var from_date = req.body.from_date;
                var to_date = req.body.to_date;

                payrollModels.generatePayroll(company_id, from_date, to_date,true).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },

    excelExportPayroll: (req, res) => {

        validation.validateGeneratePayroll(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var company_id = req.body.company_id;
                var from_date = req.body.from_date;
                var to_date = req.body.to_date;

                payrollModels.excelExportPayroll(company_id, from_date, to_date).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },

    cpfStatement: (req, res) => {

        validation.validateCreateCpfStatement(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var company_id = req.body.company_id;
                var month_year = req.body.month_year;
                var employee_id = req.body.employee_id;
    
                payrollModels.cpfStatement(company_id, month_year,employee_id).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },

    addAllowanceType: (req, res) => {

        validation.validateAddAllowanceType(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var company_id = req.body.company_id;
                var allowance_name = req.body.allowance_name;
                var emp_id = req.body.emp_id;
                var amount = req.body.amount;

                payrollModels.addAllowanceType(company_id, allowance_name, emp_id, amount).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },

    getAllowanceTypes: (req, res) => {

        if (req.body.company_id != undefined && req.body.company_id != '') {
            var company_id = req.body.company_id;

            payrollModels.getAllowanceTypes(company_id).then(results => {
                res.json(results);
            });

        } else {
            res.json({ status: 0, message: 'Please enter company_id' });
        }
    },

    deleteAllowanceType: (req, res) => {

        validation.validateDeleteAllowanceType(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var allowance_id = req.body.allowance_id;

                payrollModels.deleteAllowanceType(allowance_id).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },

    updateAllowanceType: (req, res) => {

        validation.validateUpdateAllowanceType(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var allowance_id = req.body.allowance_id;
                var allowance_name = req.body.allowance_name;
                var emp_id = req.body.emp_id;
                var amount = req.body.amount;

                payrollModels.updateAllowanceType(allowance_id, allowance_name, emp_id, amount).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },

    addEmployeeAllowance: (req, res) => {

        validation.validateAddEmployeeAllowance(req).then((validationResults) => {
            if (validationResults.length == 0) {

                var allowance = req.body.allowance;
                var emp_id = req.body.emp_id;
                var month_year = req.body.month_year;
                var bonus = (req.body.bonus)?req.body.bonus:0;

                payrollModels.addEmployeeAllowance(allowance, emp_id, month_year,bonus).then(results => {
                    res.json(results);
                });

            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });

    },

    getAllowanceById: (req, res) => {

        if (req.body.allowance_id != undefined && req.body.allowance_id != '') {

            var allowance_id = req.body.allowance_id;
            payrollModels.getAllowanceById(allowance_id).then(results => {
                res.json(results);
            });

        } else {
            res.json({ status: 0, message: 'allowance_id cannot be empty' });
        }

    },
    payrollList: (req, res) => {

        if (req.body.company_id != undefined && req.body.company_id != '') {

            var company_id = req.body.company_id;
            var role = req.body.role;
            payrollModels.payrollList(company_id, role).then(results => {
                res.json(results);
            });

        } else {
            res.json({ status: 0, message: 'Company_id cannot be empty' });
        }

    },

    exportEmployeePayslipPdf: (req, res) => {

        if (req.body.emp_id != undefined && req.body.emp_id != '') {
            if (req.body.month_year != undefined && req.body.month_year != '') {

                var employee_id = req.body.emp_id;
                var month_year = req.body.month_year;

                payrollModels.exportEmployeePayslipPdf(req, res, employee_id, month_year).then(results => {
                    res.send(results);
                });

            } else {
                res.json({ status: 0, message: 'month_year cannot be empty' });
            }

        } else {
            res.json({ status: 0, message: 'emp_id cannot be empty' });
        }

    },

    updateSalaryDetails: (req, res) => {
        if(req.body.salary_id != undefined && req.body.salary_id != ''){
            var updateData = [
                {
                    salary_id: req.body.salary_id,
                    grosssalary: req.body.grosssalary,
                    netsalary: req.body.netsalary,
                    hra: req.body.hra,
                    transport: req.body.transport,
                    food: req.body.food,
                    phone: req.body.phone,
                    bonus: req.body.bonus,
                    overtime: req.body.overtime,
                    allowances: req.body.allowances,
                    emp_id: req.body.emp_id
                }
            ]
            payrollModels.updatesalarydetails(updateData, req.body.bonus).then(results => {
                res.send(results); 
            });
        }else{
            res.json({ status: 0, message: 'salary_id cannot be empty' });
        }
    },

    finalapprovalofpayroll: (req, res) => {
        if(req.body.payrollid != undefined && req.body.payrollid != ''){
            
            payrollModels.finalapprovalofpayroll(req.body.payrollid).then(results => {
                res.send(results); 
            });
        }else{
            res.json({ status: 0, message: 'salary_id cannot be empty' });
        }
    },

    generatePayrollsghlist: (req, res) => {
        validation.validateshglist(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var company_id = req.body.company_id;
                var month =req.body.month;
                var year=req.body.year;
                // var from_date = req.body.from_date;
                // var to_date = req.body.to_date;
                payrollModels.generateshglist(company_id, month,year).then(results => {
                    res.json(results);
                });
            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },
    generatePayrollsdllist: (req, res) => {
        validation.validatesdllist(req).then((validationResults) => {
            if (validationResults.length == 0) {
                var company_id = req.body.company_id;
                var month =req.body.month;
                var year=req.body.year;
                // var from_date = req.body.from_date;
                // var to_date = req.body.to_date;
                payrollModels.generatesdllist(company_id, month,year).then(results => {
                    res.json(results);
                });
            } else {
                res.json({ status: 0, message: validationResults[0].msg });
            }
        });
    },
    generateftpfile: async (req, res) => {
        // let company_id=req.body.company_id;
        // let cpfmonthContribute=req.body.cpfmonthContribute
        // let paymentcategory=req.body.paymentcategory;
        let { company_id, cpfmonthContribute, paymentcategory } = req.body;
        let getCpf = "select * from hrm_comp_profile where id=" + company_id + ""
        let getCpfdata = await commonFunction.getQueryResults(getCpf);
        let removedCpfmonth = cpfmonthContribute.replace(/-|\s/g, "");
        let dateformatCpfmonth = moment(cpfmonthContribute).format('MMMYYYY').toUpperCase();



        const space = ' ';

        //Common Fileds
        const submissionMode = 'F';
        const recordType = space;
        const UEN_NRIC_FIN = getCpfdata[0].registartion_number; //'234567891A';
        const paymentType = paymentcategory; //`${true}`?'PTE':'AMS';
        const sNo = '01';
        const filler = space;
        const adviceCode = '01' //01-99
        const relevantMonth = removedCpfmonth;  //CCYYMM 
        const fillers103 = space; //103 - spaces

        const CSN = `${UEN_NRIC_FIN}${paymentType}01`; //CPF Submission Number (CSN) = UEN / NRIC / FIN + Payment Type + Sno
        const fileName = `${CSN}${dateformatCpfmonth}01`; //<CSN><Month Paid><Advice Code>.DTL (Acceptable file extensions include .dtl, .dat and .txt)
        const fieNameWithExt = `${fileName}.txt`;

        //Employer Header Record
        const fileCreationDate = moment().format("YYYYMMDD") //'20190129'; //CCYYMMDD
        const fileCreationTime = moment().format("HHmmss")//'183315'; //HHMMSS
        const fileId = 'FTP.DTL';


        const employeerHeaderRecord = `${submissionMode}${recordType}${UEN_NRIC_FIN}${paymentType}${sNo}${filler}${adviceCode}${fileCreationDate}${fileCreationTime}${fileId}${fillers103}`;
        // let employeerContributionSummaryRecords = [];
        let employeerContributionDetailRecords = [];

        /*
        *Payment Code
        *    01 - CPF Contribution
        *    02 - MBMF
        *    03 - SINDA
        *    04 - CDAC
        *    05 - Eurasian Community Fund (ECF)
        *    06 - Reserved for future use
        *    07 - CPF Penalty Interest
        *    08 - Foreign Worker's Levy (FWL)
        *    09 - FWL Penalty Interest
        *    10 - Community Chest
        *    11 - - Skill Development Fund (SDF)
        */
        let payment_code_01 = 0;
        let payment_code_02 = 0; //type = 4, shg_detection
        let payment_code_03 = 0;
        let payment_code_04 = 0;
        let payment_code_05 = 0;
        let payment_code_06 = 0;
        let payment_code_07 = 0;
        let payment_code_08 = 0;
        let payment_code_09 = 0;
        let payment_code_10 = 0;
        let payment_code_11 = 0;

        let count_02 = 0;
        let count_03 = 0;
        let count_04 = 0;
        let count_05 = 0;
        let count_10 = 0;

        const column_1_26_summary = `${submissionMode}0${UEN_NRIC_FIN}${paymentType}${sNo}${filler}${adviceCode}${relevantMonth}`;
        const column_1_26_detail = `${submissionMode}1${UEN_NRIC_FIN}${paymentType}${sNo}${filler}${adviceCode}${relevantMonth}`;

        const {total} = await payrollModels.generateLevyStatement(company_id, "2019-09-01", "2019-09-30"); // get Levy total
        payrollModels.employeeSalaryDetails(cpfmonthContribute).then(results => {
            const { employeeLists } = results;
            employeeLists.map((o, i) => {

                payment_code_01 = parseInt(payment_code_01) + parseInt(o.employee_contribution) + parseInt(o.employer_contribution);
                payment_code_07 = parseInt(payment_code_07) + parseInt(o.cpf_penalty);
                payment_code_09 = parseInt(payment_code_09) + parseInt(o.fwl_penalty);
                payment_code_11 = parseInt(payment_code_11) + parseInt(o.sdl_payable);

                let tempAccNo = `${AccountPrefix(o.pr_date)}${o.cpf_number}`

                let detail_str_01 = `${column_1_26_detail}01${tempAccNo}A${recordCountFn((parseInt(o.employee_contribution) + parseInt(o.employer_contribution)), 10)}00${recordCountFn(o.basic_salary, 8)}00${recordCountFn(o.bonus, 8)}00${employeeStatus(o.joined_date, o.status)}${(o.firstname).toUpperCase().substr(0, 22)}`;
                employeerContributionDetailRecords.push(detail_str_01);

                if (o.shg_type == 4) { // MBMF
                    payment_code_02 = parseInt(payment_code_02) + parseInt(o.shg_deduction);
                    count_02++;
                    let detail_str_02 = `${column_1_26_detail}01${tempAccNo}B${recordCountFn(parseInt(o.shg_deduction), 10)}00${recordCountFn('', 8)}00${recordCountFn('', 8)}00 ${(o.firstname).toUpperCase().substr(0, 22)}`;
                    employeerContributionDetailRecords.push(detail_str_02);

                } else if (o.shg_type == 3) { // SINDA
                    payment_code_03 = parseInt(payment_code_03) + parseInt(o.shg_deduction);
                    count_03++;
                    let detail_str_03 = `${column_1_26_detail}01${tempAccNo}B${recordCountFn(parseInt(o.shg_deduction), 10)}00${recordCountFn('', 8)}00${recordCountFn('', 8)}00 ${(o.firstname).toUpperCase().substr(0, 22)}`;
                    employeerContributionDetailRecords.push(detail_str_03);
                } else if (o.shg_type == 2) { // ECF
                    payment_code_05 = parseInt(payment_code_05) + parseInt(o.shg_deduction);
                    count_05++;
                    let detail_str_04 = `${column_1_26_detail}01${tempAccNo}B${recordCountFn(parseInt(o.shg_deduction), 10)}00${recordCountFn('', 8)}00${recordCountFn('', 8)}00 ${(o.firstname).toUpperCase().substr(0, 22)}`;
                    employeerContributionDetailRecords.push(detail_str_04);
                } else if (o.shg_type == 1) { // CDAC
                    payment_code_04 = parseInt(payment_code_04) + parseInt(o.shg_deduction);
                    count_04++;
                    let detail_str_05 = `${column_1_26_detail}01${tempAccNo}B${recordCountFn(parseInt(o.shg_deduction), 10)}00${recordCountFn('', 8)}00${recordCountFn('', 8)}00 ${(o.firstname).toUpperCase().substr(0, 22)}`;
                    employeerContributionDetailRecords.push(detail_str_05);
                }
            });
            const payment_code = [
                {
                    code: '01',
                    amt: `${"0".repeat(10 - payment_code_01.toString().length)}${payment_code_01}00`,
                    count: '0000000'
                },
                {
                    code: '02',
                    amt: `${"0".repeat(10 - payment_code_02.toString().length)}${payment_code_02}00`,
                    count: `${"0".repeat(7 - count_02.toString().length)}${count_02}`
                },
                {
                    code: '03',
                    amt: `${"0".repeat(10 - payment_code_03.toString().length)}${payment_code_03}00`,
                    count: `${"0".repeat(7 - count_03.toString().length)}${count_03}`
                },
                {
                    code: '04',
                    amt: `${"0".repeat(10 - payment_code_04.toString().length)}${payment_code_04}00`,
                    count: `${"0".repeat(7 - count_04.toString().length)}${count_04}`
                },
                {
                    code: '05',
                    amt: `${"0".repeat(10 - payment_code_05.toString().length)}${payment_code_05}00`,
                    count: `${"0".repeat(7 - count_05.toString().length)}${count_05}`
                },
                {
                    code: '07',
                    amt: `${"0".repeat(10 - payment_code_07.toString().length)}${payment_code_07}00`,
                    count: '0000000'
                },
                {
                    code: '08',
                    amt: `${"0".repeat(10 - total[0]['totallevybill'].toString().length)}${total[0]['totallevybill']}00`,
                    count: '0000000'
                },
                {
                    code: '09',
                    amt: `${"0".repeat(10 - payment_code_09.toString().length)}${payment_code_09}00`,
                    count: '0000000'
                },
                {
                    code: '10',
                    amt: `${"0".repeat(10 - payment_code_10.toString().length)}${payment_code_10}00`,
                    count: `${"0".repeat(7 - count_10.toString().length)}${count_10}`
                },
                {
                    code: '11',
                    amt: `${"0".repeat(10 - payment_code_11.toString().length)}${payment_code_11}00`,
                    count: '0000000'
                }
            ];

            const employeerContributionSummaryRecords = payment_code.map((o, i) => {
                let tempStr = `${column_1_26_summary}${o.code}${o.amt}${o.count}`;
                return tempStr;
            });


            //Employer Contribution Detail Record Calculation


            //Employer Trailer Record Calculation
            const fileText = [employeerHeaderRecord,
                ...employeerContributionSummaryRecords,
                ...employeerContributionDetailRecords
            ];
            const record_count = fileText.length + 1;
            const sum_summary = payment_code_01 + payment_code_02 + payment_code_03 + payment_code_04 + payment_code_05
                + payment_code_06 + payment_code_07 + payment_code_08 + payment_code_09 + payment_code_10 + payment_code_11
            const trailerObj = {
                column_1_20: `${submissionMode}9${UEN_NRIC_FIN}${paymentType}${sNo}${filler}${adviceCode}`,
                recordCount: `${"0".repeat(7 - record_count.toString().length)}${record_count}`,
                sumAmt: `${"0".repeat(13 - sum_summary.toString().length)}${sum_summary}00`,
            };
            const employerTrailerRecord = `${trailerObj.column_1_20}${trailerObj.recordCount}${trailerObj.sumAmt}`;
            fileText.push(employerTrailerRecord);

            //Create txt file by using the calculation details
            // res.json({total, employeeLists});
            // var hostname = ( req.headers.host.match(/:/g) ) ? req.headers.host.slice( 0, req.headers.host.indexOf(":") ) : req.headers.host
            // let path = `./public/uploads/${fieNameWithExt}`;
            // let downloadPath= "http://localhost:9001/uploads/"+fieNameWithExt;
            
            res.json({ status:1,message: "File created successfully", dataSet: fileText.join('\n'), fileName: fieNameWithExt });

            // let downloadPath= commonConfig.SERVER_URL_STATIC +":9001"+`/uploads/${fieNameWithExt}`;
            // fs.writeFile(`./public/uploads/${fieNameWithExt}`, fileText.join('\n'), (err) => {
            //     if (err)  res.json({ status:0,message:err.message });
            //     else{
            //         res.json({ status:1,message: "File created successfully", dataSet: fileText.join('\n'), fileName: fieNameWithExt });
            //     }
            // })
        });
    },
    downloadFtpCpf: (req, res) => {
        console.log('req', req.params)
        const {fileName} = req.params;
        const file = path.join(process.cwd(), '/public/uploads/', `${fileName}.txt`) 
        console.log('file', file)
        res.download(file);
        // res.json({sucess: 'sdsd'})
    }

}
function recordCountFn(value, digit) {
    return `${"0".repeat(digit - value.toString().length)}${value}`
};

function AccountPrefix(pr_date){
    let YYYY = pr_date.split('-')[0]
    console.log('YYYY', YYYY);
    return YYYY < 2000 ? 'S' : 'T'
}

function employeeStatus(bDate, status){
   
    let MM = bDate.toString().split('-')[1];
    console.log(MM)
    let currentMonth = moment().format('MM');
    
    return status == '1' ? MM == currentMonth ? 'N':'E' : 'L'
}


