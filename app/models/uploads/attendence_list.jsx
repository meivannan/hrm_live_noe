import React, { Component } from "react";

// import Tbl from '../../attendanceData.js';

import FetchCall from "../../API/FetchCall";
import $ from "jquery";
import Header from "../../common/Header";
import TopHeader from "../../common/TopHeader";
import Footer from "../../common/FooterScript";
import downloadsample from "../../assets/Work_list_sample.xlsx";

class attendancelist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSet: [],
      emplist: [],
      employee: "",
      sempid: "",
      
      sdate: "",
      emp_id: localStorage.getItem("userId")
        ? localStorage.getItem("userId")
        : "",
      inoorout: "",
      alreaylogged: localStorage.getItem("alreadylogged"),
      role: localStorage.getItem("roleKey"),
      selectedFile: null
    };
    this.handleLoad = this.handleLoad.bind(this);
  }

  componentDidMount() {
    window.addEventListener("load", this.handleLoad);
  }

  componentWillMount() {
    if (localStorage.getItem("key") == "") {
      this.props.history.push("/login");
    }

    setTimeout(function() {
      $("#divLoading").addClass("show");
      $("#loadinggif").addClass("show");
    }, 10);

    var THIS = this;
    $(document).on("change", "#employee", function(e) {
      THIS.setState({
        employee: e.target.value
      });
    });

    $(document).on("change", "#sempid", function(e) {
      THIS.setState({
        sempid: e.target.value
      });
    });

    var Filterdata = {
      company_id: localStorage.getItem("companyId")
    };

    FetchCall.getallemptype(Filterdata, response => {
      this.setEmployeeData(response);
    });

    var d = new Date();

    var month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear(),
      Hours = d.getHours(),
      Minutes = d.getMinutes(),
      Seconds = d.getSeconds();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    var checkindate = [year, month, day].join("-");
    var checkintime = [Hours, Minutes, Seconds].join(":");

    // var checkout = checkindate+" "+checkintime;

    var Filterdata = {
      sdate: "",
      sempid: ""
    };

    FetchCall.GetAttendanceList(Filterdata, response => {
      // console.log(response.attendence_details);
      this.AttendanceListData(response.attendence_details);
      setTimeout(function() {
        $("#divLoading").removeClass("show");
        $("#loadinggif").removeClass("show");
      }, 1000);
    });
  }

  shuffle(response) {
    var ctr = response.length,
      temp,
      index;

    // While there are elements in the array
    while (ctr > 0) {
      // Pick a random index
      index = Math.floor(Math.random() * ctr);
      // Decrease ctr by 1
      ctr--;
      // And swap the last element with it
      temp = response[ctr];
      response[ctr] = response[index];
      response[index] = temp;
    }
    return response;
  }

  AttendanceListData(presentlist) {
    var Filterdata = {
      sdate:
        this.state.sdate != "" ? this.formatDatetoymd(this.state.sdate) : "",
      sempid: this.state.sempid != "" ? this.state.sempid : ""
    };

    FetchCall.GetAttendanceListAbsent(Filterdata, response => {
      this.Absentlist(presentlist, response.attendence_details);
    });
  }

  findemployeepresent(arr, date, emp_id, presentlist) {
    const { length } = arr;
    // const id = length + 1;
    // const found = arr.some(el => el.attendence_date === date);
    var index = arr.findIndex(
      x => x.attendence_date === date && x.emp_id === emp_id
    );
    return index;
    // if (found) arr.push({ id, username: name });
    // return arr;
  }

  Absentlist(presentlist, absentlist) {
    if (presentlist) {
      presentlist.map((present, index) => {
        var absentindex = this.findemployeepresent(
          absentlist,
          present.attendence_date,
          present.emp_id,
          presentlist
        );
        if (absentindex >= 0) {
          absentlist[absentindex].active = present.active;
          absentlist[absentindex].attendence_date = present.attendence_date;
          absentlist[absentindex].working_hours = present.working_hours;
          absentlist[absentindex].late_time = present.late_time;
          absentlist[absentindex].over_time = present.over_time;
          absentlist[absentindex].time_in = present.time_in;
          absentlist[absentindex].time_out = present.time_out;
        }
      });
    }

    this.setState({
      dataSet: absentlist
    });

    this.el = $(this.el);

    this.el.DataTable({
      destroy: true,
      data: this.state.dataSet,
      order: [[2, "desc"]],
      columns: [
        { data: "empid" },
        { data: "empname" },
        { data: "attendence_date" },
        { data: "working_hours" },
        { data: "over_time" },
        { data: "late_time" },
        { data: "active" }
      ]
    });
  }

  setEmployeeData(response) {
    this.setState({
      emplist: response
    });
    // console.log('Emp List', this.state.emplist.workers_list)
  }

  handleLoad() {
    $(".select2").select2();

    var date = new Date();
    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    //   alert(today)
    // var end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var THIS = this;
    $(".duration")
      .datepicker({
        autoclose: true,
        setDate: today,
        // startDate: today,
        // endDate: end,
        todayHighlight: true
      })
      .on("changeDate", function(e) {
        // console.log(e.target.id + e.format());
        THIS.setState({
          sdate: e.format()
        });
      });
  }
  onChangeHandler = (e) =>{  

    this.setState({
      selectedFile: e.target.files[0] 
    })
    console.log(e.target.files[0])

}
  handleImportSubmit = e => {
    e.preventDefault();

    var attendanceData = {
      attendence_list: this.state.selectedFile,
      company_id: localStorage.getItem("companyId"),
      images: this.state.selectedFile
    };

    FetchCall.ImportAttendance(attendanceData, response => {
      if (response.status) {
        // this.props.history.push('/companyprofile');
        window.location.reload();
      } else if (response.status == 0) {
        $("#loginerr").html(response.message);
      }
    });
  };

  change(page) {
    this.props.history.push(page);
  }

  hris(Routepath) {
    this.props.history.push("/" + Routepath);
    // this.props.handleChange('/'+Routepath);
  }

  logout(v) {
    localStorage.setItem("key", "");
    localStorage.setItem("EmpId", "");
    localStorage.setItem("userId", "");
    localStorage.setItem("companyId", "");
    localStorage.setItem("logged", "");
    localStorage.setItem("roleid", "");
    localStorage.setItem("roleKey", "");
    this.props.history.push(v);
  }

  getEmployeeList() {
    var empList = this.state.emplist.workers_list;
    if (empList) {
      var options = empList.map((employee, index) => {
        return (
          <option value={employee.id} key={index}>
            {employee.name}
          </option>
        );
      });
      return options;
    }
  }

  handleofSelect = e => {
    this.setState({
      employee: e.target.value
    });
  };
  handleofSearchSelect = e => {
    this.setState({
      sempid: e.target.value
    });
  };
  handlesdateChange = e => {
    this.setState({
      sdate: e.target.value
    });
  };

  searchbyfilter = e => {
    e.preventDefault();

    setTimeout(function() {
      $("#divLoading").addClass("show");
      $("#loadinggif").addClass("show");
    }, 10);

    var userData = {
      sdate:
        this.state.sdate != "" ? this.formatDatetoymd(this.state.sdate) : "",
      sempid: this.state.sempid != "" ? this.state.sempid : ""
    };

    FetchCall.GetAttendanceList(userData, response => {
      this.AttendanceListData(response.attendence_details);
      setTimeout(function() {
        $("#divLoading").removeClass("show");
        $("#loadinggif").removeClass("show");
      }, 1000);
      // window.location.reload();
    });
  };

  formatDatetoymd(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear(),
      Hours = d.getHours(),
      Minutes = d.getMinutes(),
      Seconds = d.getSeconds();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    var checkindate = [year, month, day].join("-");
    var checkintime = [Hours, Minutes, Seconds].join(":");

    return checkindate;
  }

  render() {
    const userRole = this.state.role;
    const loggedornot = localStorage.getItem("alreadylogged");
    // console.log('Log status', localStorage.getItem("alreadylogged"))
    var classNameforatt =
      loggedornot == 0
        ? "btn btn-danger attendanceforme"
        : "btn btn-danger attendancelogout";

    return (
      <React.Fragment>
        <div className="hold-transition skin-blue sidebar-mini">
          <div className="wrapper">
            <TopHeader logoutClick={v => this.logout(v)} />

            <Header handleChange={v => this.change(v)} />

            <div className="content-wrapper">
              <section className="content-header">
                <h1>Attendance History</h1>
                <ol className="breadcrumb">
                  <li>
                    <a href="/admindashboard">
                      <i className="fa fa-dashboard"></i> Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="#!">Attendance</a>
                  </li>
                  <li className="active">Attendance History</li>
                </ol>
              </section>

              <section className="content">
                <div className="row">
                  <div className="col-xs-12">
                    <div className="box">
                      <div className="box-header">
                        <button
                          type="button"
                          className="btn btn-warning "
                          data-toggle="modal"
                          data-target="#exampleModal"
                        >
                          <i className="fa fa-cloud-upload"></i> Import
                        </button>{" "}
                        &nbsp; &nbsp;
                        <button
                          type="button"
                          className="btn btn-info "
                          data-toggle="modal"
                          data-target="#exportModal"
                          onClick={this.Downloademployees}
                        >
                          <i className="fa fa-cloud-download"></i> Export
                        </button>
                        <div
                          className="modal fade"
                          id="exampleModal"
                          tabIndex="-1"
                          role="dialog"
                          aria-labelledby="exampleModalLabel"
                          aria-hidden="true"
                        >
                          <div className="modal-dialog" role="document">
                            <div className="modal-content">
                              <div className="modal-header">
                                <h4
                                  className="modal-title"
                                  id="exampleModalLabel"
                                >
                                  {" "}
                                  Create Attendance
                                  <button
                                    type="button"
                                    className="close"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={this.handleClose}
                                  >
                                    <span aria-hidden="true">&times;</span>
                                  </button>
                                </h4>
                              </div>
                              <form
                                onSubmit={this.handleImportSubmit}
                                autoclose="off"
                              >
                                <div className="modal-body">
                                  <span
                                    id="loginerr"
                                    className="text-red"
                                  ></span>
                                  <div className="form-group col-md-6">
                                    <label htmlFor="empid">Import file:</label>
                                    <input
                                      type="file"
                                      id="employeelist"
                                      name="employeelist"
                                      onChange={this.onChangeHandler}
                                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    />
                                    <p className="help-block">
                                      File type should be .xlsx{" "}
                                    </p>
                                    {/* <input type="file"   id="employeelist" placeholder="" name="employeelist" className="form-control" />  */}
                                  </div>
                                  <div className="form-group col-md-6">
                                    <label htmlFor="empid">
                                      Download sample file:
                                    </label>
                                    <a
                                      href={downloadsample}
                                      className="btn btn-warning"
                                      download
                                    >
                                      <i
                                        className="fa fa-download"
                                        aria-hidden="true"
                                      ></i>{" "}
                                      Download Sample File{" "}
                                    </a>
                                  </div>

                                  <div className="clearfix"></div>

                                  <div className="form-group col-md-12 text-center"></div>
                                </div>
                                <div className="modal-footer">
                                  <button
                                    type="reset"
                                    className="btn btn-default waves-effect mr-1"
                                    onClick={this.handleClose}
                                  >
                                    <i
                                      className="fa fa-ban"
                                      aria-hidden="true"
                                    ></i>{" "}
                                    Cancel
                                  </button>
                                  &nbsp; &nbsp;&nbsp;
                                  <button
                                    type="submit"
                                    className="btn btn-danger"
                                  >
                                    <i
                                      className="fa fa-cloud-upload"
                                      aria-hidden="true"
                                    ></i>{" "}
                                    Upload{" "}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-8">
                          <form autoclose="off">
                            <div className="form-group col-md-4">
                              <select
                                className="form-control select2"
                                value={this.state.sempid}
                                onChange={this.handleofSearchSelect}
                                name="sempid"
                                id="sempid"
                                data-placeholder="Select Employee"
                                style={{ width: "100%" }}
                              >
                                <option value="">Select Employee</option>
                                {this.getEmployeeList()}
                              </select>
                            </div>

                            <div className="form-group col-md-4">
                              <input
                                type="text"
                                className="form-control duration"
                                value={this.state.sdate}
                                onChange={this.handlesdateChange}
                                id="sdate"
                                placeholder="mm/dd/yyyy"
                                name="sdate"
                              />
                            </div>

                            <button
                              type="button"
                              className="btn btn-info searchnow"
                              onClick={this.searchbyfilter}
                            >
                              <i
                                className="fa fa-search"
                                aria-hidden="true"
                              ></i>{" "}
                              Search{" "}
                            </button>
                          </form>
                        </div>
                      </div>
                      <div className="box-body">
                        <table
                          className="table table-bordered table-striped styleTable"
                          width="100%"
                          ref={el => (this.el = el)}
                        >
                          <thead>
                            <tr>
                              <th>Employee Id</th>
                              <th>Name</th>
                              <th>Attendance Date</th>
                              <th>Working Hours (total)</th>
                              <th>Over Time</th>
                              <th>Late for work</th>
                              <th>Status</th>
                              {this.state.role == "HR" ? (
                                <th className="text-center">LogOut</th>
                              ) : (
                                ""
                              )}
                            </tr>
                          </thead>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <Footer />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default attendancelist;
