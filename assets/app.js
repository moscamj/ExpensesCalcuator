var charts = false,
    pieColors = ['#8dd3c7','#ffd800','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd'],
    pieLabels = [],
    pieHours = [],
    pieExpenses = [],
    rawData,
    newData = [], // contains arrays of name, hours, rate, expenses
    projectName;

// START file handling function
// grabs csv file from html input field then parses it through papaparse
// returns data in var rawData as array
function handleFileSelect(evt) {
  var file = evt.target.files[0];
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: function(results) {
      rawData = results;
      $("#csv-file").fadeOut(500, function() {
        $(this).remove();
        $(".hidden").removeClass("hidden");
      });
      processHours();
			displayTable();
      prepResults();
    }
  });
}
$(document).ready(function() {
  $("#csv-file").change(handleFileSelect);
	$(".sort").click(function() {
		var dir = $(this).attr('id');
		sortButtons(dir);
		$(".asc").removeClass("asc");
		$(".dsc").removeClass("dsc");
		$(this).addClass(dir.substr(dir.lastIndexOf("-")+1));
		$(".Cx").remove();
		displayTable();
	});
  $(".calculate").click(function() {
		$(".asc").removeClass("asc");
		$(".dsc").removeClass("dsc");
    prepResults();
  });
});

// HOURS PROCESSING FUNCTION
// processes names and hours from csv results in var rawData
// results end up as names and hours in var newData
function processHours() {
  // initialize the data store with all the necessary names and set their hours, hourly rate, and expenses
  for(var i = 0; i < rawData.data.length; i++) {
    var found = false,
        tempName = rawData.data[i]["First Name"] + " " + rawData.data[i]["Last Name"],
        tempHours = rawData.data[i]["Hours"];
    if (i == 0) {
      newData.push([tempName, 0, 10, 0]);
    }
    for (var x = 0; x < newData.length; x++) {
      if (newData[x][0] === tempName) {
        newData[x][1] += tempHours;
        found = true;
      }
    }
    if (!found) {
      newData.push([tempName, tempHours, 10, 0]);
    }
  }
}

// sortByColumn function
// sorts array a by a column index b
function sortByColumn(a, colIndex){
  a.sort(sortFunction);
  function sortFunction(a, b) {
    if (a[colIndex] === b[colIndex]) {
      return 0;
    }
    else {
      return (a[colIndex] < b[colIndex]) ? -1 : 1;
    }
  }
  return a;
}

function sortButtons(a) {
	var sortType = a.substr(0, a.indexOf("-"));
	var sortDir = a.substr(a.lastIndexOf("-")+1);
	if (sortType == "emp") {
		newData = sortByColumn(newData, 0);
	}
	else if (sortType == "hours") {
		newData = sortByColumn(newData, 1);
	}
	else if (sortType == "rate") {
		newData = sortByColumn(newData, 2);
	}
	else if (sortType == "exp") {
		newData = sortByColumn(newData, 3);
	}
	if (sortDir == "dsc") {
		newData.reverse();
	}
}

// EXPENSES CALCULATING FUNCTION
// multiplies the number of hours by the hourly rate entered
// sticks results in newData
function calculateExpenses() {
  for(var i = 0; i < newData.length; i++) {
		var a = Number($("#rate" + i).val());
		if (a == 0) {
      newData[i][2] = newData[i][2];
    }
		else {
    	newData[i][2] = a;
		}
    newData[i][3] = newData[i][1] * newData[i][2];
  }
}

// DISPLAY TABLE function
// puts a bunch of table contents into an empty table
function displayTable() {
  var tbody = $(".expensesTable tbody");
  for (var i = 0; i < newData.length; i++) {
    var tr = $('<tr class="Cx">');
    for (var j = 0; j < 4; j++) {
      if (j === 2) {
        $('<td>').html('$ <input class="input-sm" type="text" id="rate' + i + '" placeholder="'
         + newData[i][j] + '"> / hr').appendTo(tr);
      }
      else if (j === 3) {
        var out = newData[i][j].toFixed(2);
        if (out == 0) {
          out = "";
        }
        $('<td>').html("$ " + out).appendTo(tr);
      }
      else {
        $('<td>').html(newData[i][j]).appendTo(tr);
      }
    }
    tbody.append(tr);
  }
}

// convertToChartData function
// takes existing, processed data in newData, adds it to arrays of
//   labels, hours, and expenses which are to be used in the chart display function
function convertToChartData() {
  pieLabels.length = 0;
  pieHours.length = 0;
  pieExpenses.length = 0;
  for (var x = 0; x < newData.length; x++) {
    pieLabels.push(newData[x][0]);
    pieHours.push(newData[x][1]);
    pieExpenses.push(newData[x][3]);
  }
}

// prepResults function
// calculates expenses, removes existing table rows and charts,
//   then inserts new table rows and charts
function prepResults() {
  calculateExpenses();
	newData = sortByColumn(newData, 0);
	$("#emp-asc").addClass("asc");
  $(".Cx").remove();
  $(".charts").remove();
  charts = false;
  displayTable();
  convertToChartData();
  if (!charts) {
    $('<div class="centered charts">').html('<div class="fixedSizeChart"><div class="centered bold">Hours</div><canvas id="hoursChart" width="300" height="300"></canvas></div><div class="fixedSizeChart"><div class="centered bold">Total Expense</div><canvas id="expensesChart" width="300" height="300"></canvas>').insertAfter($(".expensesTable"));
    charts = true;
  }
	displayHoursChart();
	displayExpensesChart();
}

// displayHoursChart function
function displayHoursChart() {
  var hoursChart = new Chart($("#hoursChart"), {
    responsive: true,
    maintainAspectRatio: false,
    type: 'pie',
    data: {
      labels: pieLabels,
      datasets: [
        {
          data: pieHours,
          backgroundColor: pieColors,
          hoverBackgroundColor: pieColors
        }
      ]
    },
    options: {
      tooltips: {
          callbacks: {
              label: function(tooltipItem, data) {
                  var allData = data.datasets[tooltipItem.datasetIndex].data;
                  var tooltipLabel = data.labels[tooltipItem.index];
                  var tooltipData = allData[tooltipItem.index];
                  var total = 0;
                  for (var i in allData) {
                      total += allData[i];
                  }
                  var tooltipPercentage = Math.round((tooltipData / total) * 100);
                  return tooltipLabel + ': ' + tooltipData + ' (' + tooltipPercentage + '%)';
              }
          }
      }
    }
  });
}

// displayExpensesChart function
function displayExpensesChart() {
  var expensesChart = new Chart($("#expensesChart"), {
    responsive: true,
    maintainAspectRatio: false,
    type: 'pie',
    data: {
      labels: pieLabels,
      datasets: [
        {
          data: pieExpenses,
          backgroundColor: pieColors,
          hoverBackgroundColor: pieColors
        }
      ]
    },
    options: {
      tooltips: {
          callbacks: {
              label: function(tooltipItem, data) {
                  var allData = data.datasets[tooltipItem.datasetIndex].data;
                  var tooltipLabel = data.labels[tooltipItem.index];
                  var tooltipData = allData[tooltipItem.index];
                  var total = 0;
                  for (var i in allData) {
                      total += allData[i];
                  }
                  var tooltipPercentage = Math.round((tooltipData / total) * 100);
                  return tooltipLabel + ': ' + tooltipData + ' (' + tooltipPercentage + '%)';
              }
          }
      }
    }
  });
}
