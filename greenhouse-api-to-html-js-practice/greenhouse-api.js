//Retrieve 2 API and Merge

var getJSON = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

let mergeJobBoard = [];
getJSON(
  "https://boards-api.greenhouse.io/v1/boards/frequenceinc/departments/",
  function (error, data) {
    data.departments.forEach((department) => {
      mergeJobBoard.push(department);
    });
  }
);
const ojbTimeout = setTimeout(oldJobBoard, 500);
function ojbClearTimeout() {
  clearTimeout(ojbTimeout);
}
function oldJobBoard() {
  getJSON(
    "https://boards-api.greenhouse.io/v1/boards/frequence/departments/",
    function (error, data) {
      data.departments.forEach((department) => {
        mergeJobBoard.push(department);
      });
      var allJobBoards = [];
      mergeJobBoard.forEach((department) => {
        if (department.jobs.length > 0) {
          var existing = allJobBoards.filter(function (v, i) {
            return v.id == department.id;
          });
          if (existing.length) {
            var existingIndex = allJobBoards.indexOf(existing[0]);
            allJobBoards[existingIndex].jobs = allJobBoards[
              existingIndex
            ].jobs.concat(department.jobs);
          } else {
            if (typeof department.jobs == "string")
              department.jobs = [department.jobs];
            allJobBoards.push(department);
          }
        }
      });
      let output = "";
      let output_departments = '<option value="">All Departments</option>';
      let locations = '<option value="">All Locations</option>';
      let dept_set = new Set();
      allJobBoards.forEach((department) => {
        if (department.jobs.length > 0) {
          output_departments += `<option value="${department.id}">${department.name}</option>`;
          output += '<div class="accordion-contianer">';
          output += `<button class='accordion'>${department.name}<svg height='30' width='30' style='position: absolute;top: -15px;right: -24px;font-size: 20px;'>  <circle cx='12' cy='15' r='6' stroke='#f54036' stroke-width='1' fill='transparent'></circle>  Sorry, your browser does not support inline SVG.  </svg></button>`;
          output += '<div class="panel" style="display: none;">';
          department.jobs.forEach((job) => {
            let locations = job.location.name.split("|");
            locations.forEach((loc) => {
              dept_set.add(loc.trim());
            });
            output += `<div class="job-title"><a target="_blank" href="${job.absolute_url}">${job.title}</a></div>`;
            output += `<div class="job-location">${job.location.name}</div>`;
          });
          output += "</div>";
          output += "</div>";
        }
      });

      let dept_arr = [...dept_set];
      dept_arr.forEach((loc) => {
        locations += `<option value="${loc}">${loc}</option>`;
      });
      document.querySelector("#root").innerHTML = output;
      document.querySelector("select.filter-department").innerHTML =
        output_departments;
      document.querySelector("select.filter-location").innerHTML = locations;

      var colAccordion = document.getElementsByClassName("accordion");
      var i;

      for (i = 0; i < colAccordion.length; i++) {
        colAccordion[i].addEventListener("click", function () {
          this.classList.toggle("active");
          var content = this.nextElementSibling;
          if (content.style.display === "block") {
            content.style.display = "none";
          } else {
            content.style.display = "block";
          }
        });
      }

      const select_query = document.querySelectorAll(
        "select[name='department'], select[name='location'], input[name='search-job']"
      );

      select_query.forEach((value) => {
        value.addEventListener("change", (event) => {
          const getDepartments = document.querySelector(
            "select[name='department']"
          ).value;
          const getLocations = document.querySelector(
            "select[name='location']"
          ).value;
          const search_job = document
            .querySelector("input[name='search-job']")
            .value.toString()
            .toUpperCase();
          let query_output = "";

          const matches = allJobBoards.filter((department) => {
            const dept_name =
              department.id.toString().toUpperCase().indexOf(getDepartments) >=
              0;
            const job_location = department.jobs.some(
              (job) => job.location.name.indexOf(getLocations) >= 0
            );
            const search_job_data =
              department.jobs.some(
                (job) => job.title.toUpperCase().indexOf(search_job) >= 0
              ) ||
              department.jobs.some(
                (job) => job.location.name.indexOf(search_job) >= 0
              ) ||
              department.name.toString().toUpperCase().indexOf(search_job) >= 0;
            return dept_name && job_location && search_job_data;
          });

          if (matches.length > 0) {
            matches.forEach((department) => {
              if (department.jobs.length > 0) {
                query_output += '<div class="accordion-contianer">';
                query_output += `<button class='accordion'>${department.name}<svg height='30' width='30' style='position: absolute;top: -15px;right: -24px;font-size: 20px;'>  <circle cx='12' cy='15' r='6' stroke='#f54036' stroke-width='1' fill='transparent'></circle>  Sorry, your browser does not support inline SVG.  </svg></button>`;
                query_output += '<div class="panel" style="display: block;">';
                let regex = new RegExp(search_job, "i");
                department.jobs.forEach((job) => {
                  let jobTitle = [job.title].filter((item) => regex.test(item));
                  if (
                    job.location.name.includes(getLocations) &&
                    jobTitle &&
                    jobTitle[0] == job.title
                  ) {
                    query_output += `<div class="job-title"><a target="_blank" href="${job.absolute_url}">${job.title}</a></div>`;
                    query_output += `<div class="job-location">${job.location.name}</div>`;
                  }
                });
                query_output += "</div>";
                query_output += "</div>";
              }
            });
          } else {
            query_output += '<div class="accordion-contianer">';
            query_output +=
              '<h4 style="margin-bottom: 2rem;">Sorry, no jobs were found for that criteria.</h4>';
            query_output += "</div>";
          }
          const accordion_list = document.querySelectorAll(
            ".accordion-contianer"
          );
          accordion_list.forEach((accordion) => {
            accordion.remove();
          });

          document.querySelector("#root").innerHTML = query_output;
          var colAccordion = document.getElementsByClassName("accordion");
          var i;

          for (i = 0; i < colAccordion.length; i++) {
            colAccordion[i].addEventListener("click", function () {
              this.classList.toggle("active");
              var content = this.nextElementSibling;
              if (content.style.display === "block") {
                content.style.display = "none";
              } else {
                content.style.display = "block";
              }
            });
          }
        });
      });
    }
  );
  ojbClearTimeout();
}
