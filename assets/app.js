// pls donut look at my spaghetti code
// is in the middle of refactoring :) - Matt

var charts = false,
    pieColors = ['#fb8072','#80b1d3','#8dd3c7','#ffd800','#bebada','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd'],
    pieLabels = [],
    pieHours = [],
    pieExpenses = [],
    rawData,
    newData = [], // contains arrays of name, hours, rate, expenses
    projectName,
		totalHours = 0,
		totalCost = 0,
		totalIncome = 0,
		percentProfit = 0,
		invoiceCount = 0;

$(document).ready(function() {
  $("#csv-file").change(handleFileSelect);
	$(".sort").click(function() {
		var dir = $(this).attr('id');
		sortButtons(dir);
		$(".asc").removeClass("asc");
		$(".dsc").removeClass("dsc");
		$(this).addClass(dir.substr(dir.lastIndexOf("-")+1));
		$(".Cx").remove();
		displayEmployeeTable();
		displayTotals();
	});
  $(".calculate").click(function() {
		$(".asc").removeClass("asc");
		$(".dsc").removeClass("dsc");
    prepResults();
		calculateTotals();
		displayTotals();
  });
	$("#addInvoice").click(function() {
		addInvoice();
	});
	$("#removeInvoice").click(function() {
		removeInvoice();
	});
});

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
			projectName = $(".projectName").val();
			$("#projectName").html(projectName);
      processHours();
			displayEmployeeTable();
      prepResults();
    }
  });
}

function processHours() {
  for(var i = 0; i < rawData.data.length; i++) {
    var found = false,
        tempName = rawData.data[i]["First Name"] + " " + rawData.data[i]["Last Name"],
        tempHours = rawData.data[i]["Hours"];
    if (i == 0) {
      newData.push([tempName, 0, 0, 0]);
    }
    for (var x = 0; x < newData.length; x++) {
      if (newData[x][0] === tempName) {
        newData[x][1] += tempHours;
        found = true;
      }
    }
    if (!found) {
      newData.push([tempName, tempHours, 0, 0]);
    }
  }
}

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

function calculateTotals() {
	totalHours = 0;
	totalCost = 0;
	totalIncome = 0;
	for (var i = 0; i < newData.length; i++) {
		totalHours += newData[i][1];
		totalCost += newData[i][3];
	}
	for (var x = 1; x <= invoiceCount; x++) {
		totalIncome += Number($("#income" + x).val());
	}
	percentProfit = (((totalIncome - totalCost) / totalIncome) * 100).toFixed(2);
}

function displayEmployeeTable() {
  var tbody = $(".expensesTable tbody");
  for (var i = 0; i < newData.length; i++) {
    var tr = $('<tr class="Cx">');
    for (var j = 0; j < 4; j++) {
      if (j === 2) {
        $('<td>').html('$ <input class="input-sm" type="text" id="rate' + i + '" placeholder="'
         + newData[i][j] + '"></input> / hr').appendTo(tr);
      }
      else if (j === 3) {
        var out = newData[i][j].toFixed(2);
        if (out == 0) {
          out = "";
        }
        $('<td>').html('$ ' + out).appendTo(tr);
      }
      else {
        $('<td>').html(newData[i][j]).appendTo(tr);
      }
    }
    tbody.append(tr);
  }
}

function displayTotals() {
	$("#percentProfit").html(percentProfit + ' %');
	$("#totalIncome").html('$ ' + totalIncome.toFixed(2));
	$("#totalCost").html('$ ' + totalCost.toFixed(2));
	$("#totalHours").html(totalHours);
}

function addInvoice() {
	invoiceCount++;
	$('<tr><td><input class="input-med" type="text"></input></td><td>$ <input class="input-med" type="text" id="income' + invoiceCount + '"></input></td></tr>').insertBefore('#invoices tr:last');
}

function removeInvoice() {
	if (invoiceCount > 0) {
		invoiceCount--;
	}
	$('#invoices tr:last').prev().remove();
}

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

function prepResults() {
  calculateExpenses();
	newData = sortByColumn(newData, 0);
	$("#emp-asc").addClass("asc");
  $(".Cx").remove();
  // $(".charts").remove();
  // charts = false;
  displayEmployeeTable();
  // convertToChartData();
  // if (!charts) {
  //   $('<div class="centered charts">').html('<div class="fixedSizeChart"><div class="centered bold">Hours</div><canvas id="hoursChart" width="300" height="300"></canvas></div><div class="fixedSizeChart"><div class="centered bold">Total Expense</div><canvas id="expensesChart" width="300" height="300"></canvas>').insertAfter($(".expensesTable"));
  //   charts = true;
  // }
	// displayHoursChart();
	// displayExpensesChart();
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
