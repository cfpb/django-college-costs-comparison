/*	A script to control the Comparison Tool, including adding and removing schools, loading school data,
	performing data calculations on schools and loans, and handling UI elements and events. -wernerc */


//** CFPBComparisonTool represents a namespace for comparison tool classes and functions **//

var CFPBComparisonTool = (function() {
	// A bunch of global defaults and such - see GLOBALS.txt for descriptions of the parameters
	var global = {
		"institutionalloanratedefault": 0.079, "privateloanratedefault": 0.079,
		"group1GradRankHigh": 620, "group1GradRankMed": 1247, "group1GradRankMax": 1873,
		"group2GradRankHigh": 304, "group2GradRankMed": 881, "group2GradRankMax": 1318,
		"group3GradRankHigh": 247, "group3GradRankMed": 420, "group3GradRankMax": 539,
		"group4GradRankHigh": 0, "group4GradRankMed": 0, "group4GradRankMax": 0,
		"group5GradRankHigh": 0,"group5GradRankMed": 0, "group5GradRankMax": 0,
		"group1GradMed": 39.6, "group1gradhigh": 57.9, "group2GradMed": 19.4, "group2GradHigh": 41.9,
		"group3GradMed": 21.4, "group3GradHigh": 41.2, "group4GradMed": 0, "group4GradHigh": 0, 
		"group5GradMed": 0, "group5GradHigh": 0, "cdrhigh": 100, "cdravg": 13.4, "cdrlow": 0.0, 
		"group1loanmed": 15025, "group1loanhigh": 20016, "group2loanmed": 6891, "group2loanhigh": 12584, 
		"group3loanmed": 6836, "group3loanhigh": 9501, "group4loanmed": 0, "group4loanhigh": 0, 
		"group5loanmed": 0, "group5loanhigh": 0,
		"group1loanrankmed": 724, "group1loanrankhigh": 1394, "group1loanrankmax": 2067,
		"group2loanrankmed": 541, "group2loanrankhigh": 1009, "group2loanrankmax": 1464,
		"group3loanrankmed": 277, "group3loanrankhigh": 459, "group3loanrankmax": 836,
		"group4loanrankmed": 0, "group4loanrankhigh": 0, "group4loanrankmax": 0,
		"group5loanrankmed": 0, "group5loanrankhigh": 0, "group5loanrankmax": 0,

		//-- Values below this line have not been verified as necessary. --//
		
		"aaprgmlength": 2, "yrincollege": 1, "vet": false, "serving": "no", "program": "ba",
		"tier": 100, "gradprgmlength": 2, "familyincome": 48, "most_expensive_cost": 50000,
		"transportationdefault": 0, "roombrdwfamily": 0, "gibillch1606": 356,
		"perkinscapunder": 5500, "perkinscapgrad": 8000, "pellcap": 5550,
		"subsidizedcapyr1": 3500, "subsidizedcapyr2": 4500, "subsidizedcapyr3": 5500, 
		"unsubsidizedcapyr1": 5500, "unsubsidizedcapyr2": 6500, "unsubsidizedcapyr3": 7500,
		"unsubsidizedcapindepyr1": 9500, "unsubsidizedcapindepyr2": 10500, "unsubsidizedcapindepyr3": 12500, 
		"unsubsidizedcapgrad": 20500, "state529plan": 0, "perkinsrate": 0.05, "subsidizedrate": 0.0386, 
		"unsubsidizedrateundergrad": 0.0386, "unsubsidizedrategrad": 0.0541, "dloriginationfee": 1.01051, "gradplusrate": 0.0641, 
		"parentplusrate": 0.079, "plusoriginationfee": 1.04204, "homeequityloanrate": 0.079, "deferperiod": 6, "salary": 30922, 
		"salaryaa": 785, "salaryba": 1066, "salarygrad": 1300, "lowdefaultrisk": 0.08, "meddefaultrisk": 0.14, 
		"tfcap": 19198.31, "avgbah": 1429, "bscap": 1000, 
		"tuitionassistcap": 4500, "kicker": 0, "yrben": 0, "rop": 1, "depend": "independent",
		"schools_added": -1, "reached_zero": 0, "worksheet_id": "none"
	};

	//*** Non-Class Functions ***//
	//-- money_to_num(): Convert from money string to number --//
	function money_to_num(money) { 	
		if (typeof(money) !== "string") {
			return 0;
		} 
		else {
			return Number(money.replace(/[^0-9\.]+/g,""));	
		}
	} // end money_to_num()

	//-- num_to_money(): Convert from number to money string --//
	function num_to_money(n) { 
		var t = ",";
		if (n < 0) {
			var s = "-";
		}
		else {
			var s = "";
		}
		var i = parseInt(n = Math.abs(+n || 0).toFixed(0)) + "";
		var j = 0;
		if (i.length > 3) {
			j = ((i.length) % 3);
		}
		money = "$" + s;
		if (j > 0) {
			money += i.substr(0,j) + t;
		}
		money += i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t);
		return money;
	} // end num_to_money()


	//-- findEmptyColumn() - finds the first empty column, returns column number [1-3] --//
	function findEmptyColumn() {
		var column;
		for (var x = 1; x <= 3; x++) {
			var school_id = $("#institution-row [data-column='" + x + "']").attr("data-schoolid")
			if ( school_id === "" ) {
				column = x;
				break;
			}
		}
		return column;
	}

	//-- Delay calculations after keyup --//
	var delay = (function(){ 
			var t = 0;
			return function(callback, delay) {
				clearTimeout(t);
				t = setTimeout(callback, delay);
			};
	})(); // end delay()

	function calculateAndDraw(columnNumber) {
		var schoolID = columns[columnNumber].fetchSchoolID();
		var newData = columns[columnNumber].fetchFormValues();
		schools[schoolID].recalculate(newData);
		var schoolData = schools[schoolID].schoolData;
		columns[columnNumber].updateFormValues(schoolData);
		columns[columnNumber].drawCostBars(schoolData);
		columns[columnNumber].drawPieChart(schoolData);
		columns[columnNumber].drawDebtBurden(schoolData);
	}

	//*** Classes ***//

	/**	the School class represents the data structure of a school's data. This does NOT represent
		any UI or DOM elements - see Column() **/
	function School(schoolID) {
		this.schoolID = schoolID;
		this.schoolData = {};

		//-- Get schoolData values from API --//
		this.getSchoolData = function() { 
			// AJAX the schoolData
			var schoolData = this.schoolData;
			var queryURL = 'api/school/' + this.schoolID + '.json';
			var request = $.ajax({
				async: false,
				dataType: 'json',
				url: queryURL
			});
			request.done(function(response) {
				$.each(response, function(key, val) {
					key = key.toLowerCase();
					if (schoolData[key] == undefined) {
						schoolData[key] = val;
					}
				});
			});
			request.fail(function() {
				// Your fail message here.
			});
			this.schoolData = schoolData;
		}

		//-- Retrieve entered values from Add a School inputs --//
		this.importAddForm = function() { 
			this.schoolData['program'] = $('#step-one input:radio[name="program"]').val();
			this.schoolData['prgmlength'] = $('#step-one select[name="prgmlength"]').val();

			// Set undergrad
			if ( this.schoolData.program == "grad" ) {
				this.schoolData.undergrad = false;
			}
			else {
				this.schoolData.undergrad = true;
			}

			// Set unsubsidized rate (there is a difference between grad and undergrad direct loan rates)
			if (this.schoolData.undergrad == true) {
				this.schoolData.unsubsidizedrate = global.unsubsidizedrateundergrad;
			}
			else {
				this.schoolData.unsubsidizedrate = global.unsubsidizedrategrad;
			}

			if ( this.schoolData.program == undefined ) {
				this.schoolData.program = "ba";
			}
			if ( this.schoolData.prgmlength == 0 ) {
				if (this.schoolData.program == "ba") {
					this.schoolData.prgmlength = 4;
				}
				else if (this.schoolData.program == "aa") {
					this.schoolData.prgmlength = 2;
				}
				else {
					this.schoolData.prgmlength = 2;
				}
			}

			// Unused (but required) variables
			this.schoolData.homeequity = 0;
			this.schoolData.parentplus = 0;

		}

		// recalculate() - Recalculate the schoolData
		this.recalculate = function(newData) {
			// join newData with existing schoolData object to form data object
			var data = this.schoolData
			$.each(newData, function(key, val) {
				data[key] = val;
			});

			// schoolData.yrincollege is set to global.yrincollege, possibly just for now
			data.yrincollege = global.yrincollege;

			// For calculations, add transportation and otherexpenses into personalcosts
			data.personal = data.transportation + data.otherexpenses;

			// tf in-state rate prepopulate (schoolData.tfinsprep)
			if ( ( data.control =="public" ) && ( data.program="grad" ) ) {
				data.tfinstate = data.tuitiongradins;
			}
			else {
				data.tfinstate = data.tuitionunderins;
			}

			// netprice
			if (data.netpricegeneral < 0) {
				data.netprice = -1;
			}
			else {
				data.netprice = data.netpricegeneral;
			}

			// Start calculations
			// Cost of First Year (schoolData.firstyrcostattend)
			data.firstyrcostattend = data.tuitionfees + data.roombrd + data.books + data.otherexpenses + data.transportation;

			/*------- SCHOLARSHIPS & GRANTS --------*/
			// Pell Grants
			data.pell_max = 0;
			if ( data.undergrad == true ) {
				data.pell_max = global.pellcap;
			}
			if ( data.pell_max > data.firstyrcostattend ) {
				data.pell_max = data.firstyrcostattend;
			}
			if ( data.pell_max < 0 ) {
				data.pell_max = 0;
			}
			if (data.pell > data.pell_max){
				data.pell = data.pell_max;
			}

			// Military Tuition Assistance
			if ( global.tuitionassistcap < data.tuitionfees ) {
				data.tuitionassist_max = global.tuitionassistcap;
			}
			else {
				data.tuitionassist_max = data.tuitionfees;
			}
			if (data.tuitionassist > data.tuitionassist_max) {
				data.tuitionassist = data.tuitionassist_max;
			}

			// GI Bill
			// Set schoolData.tfinstate
			if ( data.instate == false ) {
				data.tfinstate = data.militaryinstatetuition;	
			}
			else {
				data.tfinstate = data.tuitionfees;
			}

			// Tuition & Fees benefits:
			if (global.vet == false) {
				data.gibilltf = 0; 
			}
			else {
				 
				// Calculate veteran benefits:		
				if ( ( data.control == "Public" ) && ( data.instate == true ) ) {
					data.gibilltf = ( data.tuitionfees - data.scholar - data.tuitionassist ) * global.tier;
					if ( data.gibilltf < 0 ) {
						data.gibilltf = 0;
					}
				}
				else if ( ( data.control == "Public" ) && ( data.instate == false ) ) {
					data.gibilltf = ( data.tfinstate + (global.yrben * 2) - data.scholar - data.tuitionassist ) * global.tier;
					if ( data.gibilltf < 0 ) {
						data.gibilltf = 0;
					}
					if ( data.gibilltf > ( ( data.tuitionfees - data.scholar - data.tuitionassist) * global.tier ) ) {
						data.gibilltf = data.tuitionfees * global.tier;
					}
				}
				else { // School is not public
					data.gibilltf = ( global.tfcap + (global.yrben * 2) - data.scholar - data.tuitionassist ) * global.tier;
					if ( data.gibilltf < 0 ) {
						data.gibilltf = 0;
					}
					if ( data.gibilltf > ( ( data.tuitionfees - data.scholar - data.tuitionassist) * global.tier ) ) {
						data.gibilltf = data.tuitionfees * global.tier;
					}
				}
			}

			// GI living allowance benefits:
			if (global.vet === false) {
				data.gibillla = 0;
			}
			else { 
				if (global.serving == "ad") { 
					data.gibillla = 0;
				}
				else if ( ( global.tier == 0 ) && ( global.serving == "ng" ) ) {
					data.gibillla = global.gibillch1606 * 9;
				}
				else {
					if (data.online == "Yes" ) {
						data.gibillla = ( ( ( global.avgbah / 2 * global.tier ) + global.kicker ) * global.rop) * 9;
					}
					else {
						data.gibillla = data.bah * global.tier * 9 * global.rop;
					}
				}
			}


			// GI Bill Book Stipend
			if (global.vet === false) {
				data.gibillbs = 0;
			}
			else {
				data.gibillbs = global.bscap * global.tier * global.rop;
			}

			// Total GI Bill
			data.gibill = data.gibilltf + data.gibillla + data.gibillbs;

			// Total Grants
			data.grantstotal = data.pell + data.scholar + data.gibill + data.tuitionassist;

			// First Year Net Cost
			data.firstyrnetcost = data.firstyrcostattend - data.grantstotal;

			// Total Contributions
			data.savingstotal = data.savings + data.family + data.state529plan + data.workstudy;
			
			/*------- grants and savings --------*/
			var totalgrantsandsavings = data.savingstotal + data.grantstotal;

			/*------- FEDERAL LOANS --------*/
			// Perkins Loan

			data.perkins_max = data.firstyrcostattend - data.pell;
			if ( data.perkins_max < 0 ) {
				data.perkins_max = 0;
			}
			if ( data.undergrad == true ) {
				if ( data.perkins_max > global.perkinscapunder ) {
					data.perkins_max = global.perkinscapunder;
				}
			}
			else {
				if ( data.perkins_max > global.perkinscapgrad ) {
					data.perkins_max = global.perkinscapgrad;
				}		
			}
			if (data.perkins > data.perkins_max) {
				data.perkins = data.perkins_max;
			}
				
			// Subsidized Stafford Loan
			if (data.undergrad == false) {
				data.staffsubsidized_max = 0;
			}
			else {
				if ((data.program == "aa") || (data.yrincollege == 1)) {
					data.staffsubsidized_max = data.firstyrcostattend - data.pell - data.perkins;
					if ( data.staffsubsidized_max > global.subsidizedcapyr1 ) {
						data.staffsubsidized_max = global.subsidizedcapyr1;
					}
					if ( data.staffsubsidized_max < 0 ) {
						data.staffsubsidized_max = 0;
					}
				}
				else if (data.yrincollege == 2) {
					data.staffsubsidized_max = data.firstyrcostattend - data.perkins - data.pell;
					if ( data.staffsubsidized_max > ( global.subsidizedcapyr2 - data.staffsubsidized ) ) {
						data.staffsubsidized_max = global.subsidizedcapyr2 - data.staffsubsidized ;
					}
					if ( data.staffsubsidized_max < 0 ) {
						data.staffsubsidized_max = 0;
					}
				}
				else if (data.yrincollege == 3) {
					data.staffsubsidized_max = data.firstyrcostattend - data.perkins - data.pell;
					if ( data.staffsubsidized_max > ( global.subsidizedcapyr3 - data.staffsubsidized ) ) {
						data.staffsubsidized_max = global.subsidizedcapyr3 - data.staffsubsidized ;
					}
					if ( data.staffsubsidized_max < 0 ) {
						data.staffsubsidized_max = 0;
					}
				}
			}
			if (data.staffsubsidized_max < 0){
				data.staffsubsidized = 0;
			}
			if (data.staffsubsidized > data.staffsubsidized_max){
				data.staffsubsidized = data.staffsubsidized_max;
			}

			//unsubsidized loan max for independent students
			if ( data.undergrad == false) { 
				data.staffunsubsidizedindep_max = data.firstyrcostattend - data.pell - data.perkins - data.staffsubsidized;
				if ( data.staffunsubsidizedindep_max > global.unsubsidizedcapgrad ) {
					data.staffunsubsidizedindep_max = global.unsubsidizedcapgrad;
				}
				if (data.staffunsubsidizedindep_max > global.unsubsidizedcapgrad - data.staffsubsidized) {
					data.staffunsubsidizedindep_max = global.unsubsidizedcapgrad - data.staffsubsidized;
				}
				if ( data.staffunsubsidizedindep_max < 0 ) {
					data.staffunsubsidizedindep_max = 0;
				}
			} 
			else {
				if ( ( data.program == "aa" ) || ( data.yrincollege == 1 ) ) { 
					data.staffunsubsidizedindep_max = data.firstyrcostattend - data.pell - data.perkins - data.staffsubsidized;
					if ( data.staffunsubsidizedindep_max > ( global.unsubsidizedcapindepyr1 - data.staffsubsidized ) ) {
						data.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr1;
					}
					if (data.staffunsubsidizedindep_max > global.unsubsidizedcapindepyr1 - data.staffsubsidized) {
						data.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr1 - data.staffsubsidized;
					}
					if ( data.staffunsubsidizedindep_max < 0 ) {
						data.staffunsubsidizedindep_max = 0;
					}
				}
				else if ( data.yrincollege == 2) { 
					data.staffunsubsidizedindep_max = data.firstyrcostattend - data.pell - data.perkins - data.staffsubsidized;
					if ( data.staffunsubsidizedindep_max > ( global.unsubsidizedcapindepyr2 - data.staffsubsidized ) ) {
						data.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr2;
					}
					if ( data.staffunsubsidizedindep_max > global.unsubsidizedcapindepyr2 - data.staffsubsidized ) {
						data.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr2 - data.staffsubsidized;
					}
					if ( data.staffunsubsidizedindep_max < 0 ) {
						data.staffunsubsidizedindep_max = 0;
					}
				}
				else if ( data.yrincollege == 3) { 
					data.staffunsubsidizedindep_max = data.firstyrcostattend - data.pell - data.perkins- data.staffsubsidized;
					if ( data.staffunsubsidizedindep_max > ( global.unsubsidizedcapindepyr3 - data.staffsubsidized ) ) {
						data.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr3;
					}
					if ( data.staffunsubsidizedindep_max > global.unsubsidizedcapindepyr3 - data.staffsubsidized ) {
						data.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr3 - data.staffsubsidized;
					}
					if ( data.staffunsubsidizedindep_max < 0 ) {
						data.staffunsubsidizedindep_max = 0;
					}
				}
			}
			// unsubsidized loan max for dependent students
			if ( data.undergrad == false ) {
				data.staffunsubsidizeddep_max = data.firstyrcostattend - data.pell - data.perkins - data.staffsubsidized;
				if ( data.staffunsubsidizeddep_max > global.unsubsidizedcapgrad - data.staffsubsidized) {
					data.staffunsubsidizeddep_max = global.unsubsidizedcapgrad - data.staffsubsidized;
				}
				if ( data.staffunsubsidizeddep_max < 0 ) {
					data.staffunsubsidizeddep_max = 0;
				}
			} 
			else if ( data.program == "aa" || data.yrincollege == 1 ) {
				data.staffunsubsidizeddep_max = data.firstyrcostattend - data.pell - data.perkins - data.staffsubsidized;
				if ( data.staffunsubsidizeddep_max > global.unsubsidizedcapyr1 - data.staffsubsidized) {
					data.staffunsubsidizeddep_max = global.unsubsidizedcapyr1 - data.staffsubsidized;
				}
				if ( data.staffunsubsidizeddep_max < 0 ) {
					data.staffunsubsidizeddep_max = 0;
				}
			}
			else if ( data.yrincollege == 2) { 
				data.staffunsubsidizeddep_max = data.firstyrcostattend - data.pell - data.perkins - data.staffsubsidized;
				if ( data.staffunsubsidizeddep_max > global.unsubsidizedcapyr2 - data.staffsubsidized) {
					data.staffunsubsidizeddep_max = global.unsubsidizedcapyr2 - data.staffsubsidized;
				}
				if ( data.staffunsubsidizeddep_max < 0 ) {
					data.staffunsubsidizeddep_max = 0;
				}
			} 
			else if ( data.yrincollege == 3 ) { 
				data.staffunsubsidizeddep_max = data.firstyrcostattend - data.pell - data.perkins - data.staffsubsidized;
				if ( data.staffunsubsidizeddep_max > (global.unsubsidizedcapyr3 - data.staffsubsidized) ) {
					data.staffunsubsidizeddep_max = global.unsubsidizedcapyr3 - data.staffsubsidized;
				}
				if ( data.staffunsubsidizeddep_max < 0 ) {
					data.staffunsubsidizeddep_max = 0;
				}
			}

			// Unsubsidized Stafford Loans
			if ( global.depend == "dependent" ) {
				data.staffunsubsidized_max = data.staffunsubsidizeddep_max;
			}
			else {
				data.staffunsubsidized_max = data.staffunsubsidizedindep_max;
			}
			if (data.staffunsubsidized_max < 0) {
				data.staffunsubsidized_max = 0;
			}
			if (data.staffunsubsidized > data.staffunsubsidized_max) {
				data.staffunsubsidized = data.staffunsubsidized_max;
			}

			// Gradplus
			if (data.undergrad == true) {
				data.gradplus_max = 0;
			}
			else {
				data.gradplus_max = data.firstyrnetcost - data.perkins - data.staffsubsidized - data.staffunsubsidized;
			}
			if ( data.gradplus_max < 0 ) {
				data.gradplus_max = 0;
			}
			if (data.gradplus > data.gradplus_max) {
				data.gradplus = data.gradplus_max;
			}

			// Federal Total Loan
			data.federaltotal = data.perkins + data.staffsubsidized + data.staffunsubsidized + data.gradplus;

			/*------- PRIVATE LOANS --------*/
			// Institution Loans
			data.institutionalloan_max = data.firstyrnetcost - data.perkins - data.staffsubsidized - data.staffunsubsidized - data.parentplus - data.gradplus - data.homeequity;
			if ( data.institutionalloan_max < 0 ) {
				data.institutionalloan_max = 0;
			}
			if (data.institutionalloan > data.institutionalloan_max) {
				data.institutionalloan = data.institutionalloan_max;
			}

			// Institutional Loan Rate
			if ( data.institutionalloanrate === undefined || data.institutionalloanrate === 0) {
				data.institutionalloanrate = global.institutionalloanratedefault;
			}
			if ( data.institutionalloanrate > .2 ) {
				data.institutionalloanrate = .2;
			}
			if ( data.institutionalloanrate < .01 ) {
				data.institutionalloanrate = .01;
			}

			data.privateloan_max = data.firstyrnetcost - data.perkins - data.staffsubsidized - data.staffunsubsidized - data.institutionalloan - data.gradplus;
			if ( data.privateloan_max < 0 ) {
				data.privateloan_max = 0;
			}
			if (data.privateloan > data.privateloan_max) {
				data.privateloan = data.privateloan_max;
			}

			// Private Loan Rate
			if ( data.privateloanrate === undefined || data.privateloanrate === 0 ) {
				data.privateloanrate = global.privateloanratedefault;
			}
			if ( data.privateloanrate > .2 ) {
				data.privateloanrate = .2;
			}
			if ( data.privateloanrate < .01 ) {
				data.privateloanrate = .01;
			}

			// Private Loan Total
			data.privatetotal = data.privateloan + data.institutionalloan;

			// gap
			data.gap = data.firstyrnetcost - data.perkins - data.staffsubsidized - data.staffunsubsidized - data.workstudy - data.savings - data.family - data.state529plan - data.privateloan - data.institutionalloan - data.parentplus - data.homeequity;

			/* --- Loan Calculation -- */
			// Borrowing Total
			data.borrowingtotal = data.privatetotal + data.federaltotal;

			// Out of Pocket Total
			data.totaloutofpocket = data.grantstotal + data.savingstotal;

			// Money for College Total
			data.moneyforcollege = data.totaloutofpocket + data.borrowingtotal;
			
			// remainingcost -- "Left to Pay"
			data.remainingcost = data.firstyrnetcost - data.totaloutofpocket;
			if ( data.remainingcost < 0 ) {
				data.remainingcost = 0;
			}
			
			// loandebt1yr -- "Estimated Total Borrowing"
				data.loandebt1yr = data.perkins + data.staffsubsidized + data.staffunsubsidized + data.gradplus + data.privateloan + data.institutionalloan + data.parentplus + data.homeequity;

			// Borrowing over cost of attendance
			data.overborrowing = 0;
			if ( data.firstyrcostattend < ( data.outofpockettotal + data.borrowingtotal ) ) {
				data.overborrowing = data.borrowingtotal + data.outofpockettotal - data.firstyrcostattend;
			}

			// Estimated Debt Calculation
			// Perkins debt at graduation
			data.perkinsgrad = data.perkins * data.prgmlength;

			// Direct Subsidized Loan with 1% Origination Fee
			data.staffsubsidizedwithfee = data.staffsubsidized * global.dloriginationfee;

			// Subsidized debt at graduation
			data.staffsubsidizedgrad = data.staffsubsidizedwithfee * data.prgmlength;

			// Direct Unsubsidized Loan with 1% Origination Fee
			data.staffunsubsidizedwithfee = data.staffunsubsidized * global.dloriginationfee;

		    // Unsubsidized debt at graduation
		    data.staffunsubsidizedgrad = (data.staffunsubsidizedwithfee  * data.unsubsidizedrate / 12 * ((data.prgmlength * (data.prgmlength + 1) / 2 * 12 + data.prgmlength * global.deferperiod)) + (data.staffunsubsidizedwithfee  * data.prgmlength));

			// Grad Plus with origination
			data.gradpluswithfee = data.gradplus * global.plusoriginationfee;

			// Grad Plus debt at graduation
			data.gradplusgrad = (data.gradpluswithfee * global.gradplusrate  / 12 * ((data.prgmlength * (data.prgmlength + 1) / 2 * 12 + data.prgmlength * global.deferperiod)) + (data.gradpluswithfee * data.prgmlength));
			
			// Parent Plus Loans with origination fees
			data.parentpluswithfee = data.parentplus * global.plusoriginationfee;

			// Parent Plus Loans at graduation
			data.parentplusgrad = data.parentpluswithfee * data.prgmlength;

		    // Private Loan debt at graduation
		    data.privateloangrad = (data.privateloan * data.privateloanrate / 12  * ((data.prgmlength * (data.prgmlength + 1) / 2 * 12 + data.prgmlength * global.deferperiod)) + (data.privateloan * data.prgmlength));

		    // Institutional Loan debt at graduation
		    data.institutionalloangrad =  (data.institutionalloan * data.institutionalloanrate  / 12 * ((data.prgmlength * (data.prgmlength + 1) / 2 * 12 + data.prgmlength * global.deferperiod)) + (data.institutionalloan * data.prgmlength));
			
			// Home Equity Loans at graduation
			data.homeequitygrad = (data.homeequity * .079 / 12 * ((data.prgmlength * (data.prgmlength + 1) / 2 * 12)));

			// Debt after 1 yr
			data.loandebt1yr = data.perkins + data.staffsubsidized + data.staffunsubsidized + data.gradplus + data.privateloan + data.institutionalloan + data.parentplus + data.homeequity;

			// Total debt at graduation
			data.totaldebtgrad = data.perkinsgrad + data.staffsubsidizedgrad + data.staffunsubsidizedgrad + data.gradplusgrad + data.parentplusgrad + data.privateloangrad + data.institutionalloangrad + data.homeequitygrad;

			// repayment term
			if ( data.repaymentterminput == "10 years") { 
				data.repaymentterm = 10;
			} 
			else if ( data.repaymentterminput == "20 years") {
				data.repaymentterm =  20; 
			}
			else {
				data.repaymentterm = 10;
			}
			
			// loanmonthly - "Monthly Payments"
			data.loanmonthly =
			( data.perkinsgrad * ( global.perkinsrate / 12 ) / ( 1 - Math.pow((1 + global.perkinsrate / 12), ( -data.repaymentterm * 12 ) ) ) )
				+ (data.staffsubsidizedgrad 
					* (global.subsidizedrate / 12) / (1 - Math.pow((1 + global.subsidizedrate / 12), (-data.repaymentterm * 12))))
				+ (data.staffunsubsidizedgrad 
					* (data.unsubsidizedrate / 12) / (1 - Math.pow((1 + data.unsubsidizedrate / 12), (-data.repaymentterm  * 12))))
				+ (data.gradplusgrad * (global.gradplusrate / 12) / (1 - Math.pow((1 + global.gradplusrate /12), (-data.repaymentterm * 12))))
				+ (data.privateloangrad * (data.privateloanrate / 12) / (1 - Math.pow((1 + data.privateloanrate /12), (-data.repaymentterm * 12))))
				+ (data.institutionalloangrad 
					* (data.institutionalloanrate / 12) / (1 - Math.pow((1 + data.institutionalloanrate /12), (-data.repaymentterm * 12))));
			
			// loanmonthlyparent
			data.loanmonthlyparent = (data.parentplus * (global.parentplusrate / 12) / (Math.pow(1 - (1 + global.parentplusrate / 12), (-data.repaymentterm * 12)))) + (data.homeequity * (global.homeequityloanrate / 12) / (Math.pow(1 - (1 + global.homeequityloanrate / 12), (-data.repaymentterm * 12))));
			
			// loanlifetime
			data.loanlifetime = data.loanmonthly * data.repaymentterm  * 12;

			// salaryneeded
			data.salaryneeded = data.loanmonthly * 12 / 0.14;

			// Expected salary and Annual salary (educ lvl)
			if ( data.program == "aa" ) {
				data.salaryexpected25yrs = global.salaryaa * 52.1775;
			}
			else if ( data.program == "ba" ) {
				data.salaryexpected25yrs =  global.salaryba * 52.1775
			}
			else {
				data.salaryexpected25yrs = global.salarygrad * 52.1775;
			}
			data.salarymonthly = global.salary / 12;

			// Now update the School object's schoolData property to the finished data object.
			this.schoolData = data;

		} // end .recalculate()

	} // end School() class

	/**	the Column class represents the DOM elements of a "school," including the inputs. Methods of this
		class manipulate the DOM, but also take data from inputs and place them into the schools[] object
		Column also contains code for visualizations **/
	function Column(number) {
		this.number = number; // defines which column, [1-3]
		var columnObj = $('[data-column="' + number + '"]');

		//-- Adds basic schoolData to the column --//
		this.addSchoolData = function(schoolData) { 
			this.toggleActive('active'); // Make the column active
			columnObj.find('[data-nickname="institution_name"]').html(schoolData.school);
			columnObj.find('[data-nickname="institution_name"]').attr("id", schoolData.school_id);
			columnObj.find('input.school-data').not(".interest-rate").val("$0");
			columnObj.find('input[data-nickname="institutional_loan_rate"]').val(global.institutionalloanratedefault * 100 + '%');
			columnObj.find('input[data-nickname="private_loan_rate"]').val(global.privateloanratedefault * 100 + '%');
			columnObj.find("a.navigator-link").attr("href", "http://nces.ed.gov/collegenavigator/?id=" + schoolData.school_id);
			this.drawSchoolIndicators(schoolData);
		} // end .addSchoolData()

		this.drawCostBars = function(schoolData) {
			var chartWidth = columnObj.find(".chart_mask_internal .full").width();
			var barBorderThickness = 1;
			var cost = money_to_num(columnObj.find("[data-nickname='firstyrcostattend']").html());
			var pixelPrice = chartWidth / cost;
			var left = 0;

			// Set section_width
			var totalSectionWidth = 0;
			var totalBorrowedSectionWidth = 0;
			var totalPocketSectionWidth = 0; // Out of Pocket Section

			columnObj.find(".bars-container").width(chartWidth);

			if ( cost <= 0 ) {
				columnObj.find(".meter").hide();
			}
			else {
				columnObj.find(".meter").show();
				// find each .bar element and determine its width, then animate
				columnObj.find(".bars-container").each(function() {
					var remainingWidth = chartWidth;
					$(this).find(".chart_mask_internal .bar").each(function() {
						var bar = $(this);
						var name = bar.attr("data-nickname");
						var value = schoolData[name];
						var sectionWidth = Math.floor(value * pixelPrice);
						if ( sectionWidth > remainingWidth ) {
							sectionWidth = remainingWidth;
						}
						if (sectionWidth < minimumChartSectionWidth) {
							sectionWidth = 0;
							bar.stop(true, false).animate({width: 0}, transitionTime, function() {
								bar.hide();
							});
						}
						else {
							sectionWidth = sectionWidth;
							bar.stop(true, false).animate({width: (sectionWidth - barBorderThickness)}, transitionTime);
						}

						if ( sectionWidth != 0) {
							bar.show();
							totalSectionWidth += sectionWidth;
							if ( $(this).hasClass("fedloans") || $(this).hasClass("privloans") ){					
								totalBorrowedSectionWidth += sectionWidth;
							}
							else {
								totalBorrowedSectionWidth += sectionWidth;
							}
						}
						else {
							bar.hide();
						}
						remainingWidth -= sectionWidth;
						if ( remainingWidth < 0 ) {
							remainingWidth = 0;
						}
					});
					if ((totalBorrowedSectionWidth + totalBorrowedSectionWidth) > chartWidth) {
						// columnObj.find(".error_msg").fadeIn(400);
						// This code will resize the bar past the width of the total cost
						// columnObj.find(".bars-container").width(totalBorrowedSectionWidth + totalBorrowedSectionWidth);
						// marginright = (totalBorrowedSectionWidth + totalBorrowedSectionWidth) - chartWidth;
						// columnObj.find(".tick.full").css("left", chartWidth - 2 );
					}
					else {
						// columnObj.find(".bars-container").width(chartWidth);
						columnObj.find(".error_msg").fadeOut(400);
					}
				});

			    left = 0 + totalBorrowedSectionWidth;
			    if ( left < 1 ) {
			    	// uncomment this line and the "total borrowed" will not float beyond the cost bar
			    	left = 0;
			    }
			    columnObj.find(".bar.borrowing").css("left", left);
			    columnObj.find(".bar.borrowing").css("width", totalBorrowedSectionWidth);
			    columnObj.find(".tick-borrowing").css("left", totalBorrowedSectionWidth + left - 2);
			    columnObj.find(".totalborrowing").css("padding-left", left);

			    if ( totalBorrowedSectionWidth < 1 ) {
			        // columnObj.find('.borrowing-container').hide(transitionTime);
			        // Hiding borrowing section for now
			        columnObj.find('.borrowing-container').hide();
			    }
			    else {
			        // columnObj.find('.borrowing-container').show(transitionTime);
			        // Hiding borrowing section for now
			        columnObj.find('.borrowing-container').hide();
			    }
			    var breakdownheight = $(".meter").height();
			    columnObj.find(".meter").closest("td").height(breakdownheight);
			}
		}

	    //-- Draw the pie chart --//
		this.drawPieChart = function(schoolData) {
			$("#pie" + this.number).closest("td").children().show();
			var percentLoan = Math.round( ( schoolData.loanmonthly / schoolData.salarymonthly ) * 100 );
		    if ( percentLoan > 100 ) {
		    	percentLoan = 100;
		    }
		    columnObj.find(".payment-percent").html(percentLoan + "%");
		    var angle = percentLoan / 100 * 2 * Math.PI;
			var x = Math.sin(angle);
			x = 62 + ( x * 50 );
			var y = Math.cos(angle);
			y = 62 - ( y * 50 );
			var string = "M 62 62 L 62 12 ";
			if ( angle > Math.PI/2 ) {
				string += "A 50 50 0 0 1 112 62 ";
			}
			if ( angle > Math.PI ) {
				string += "A 50 50 0 0 1 62 112 ";
			}
			if ( angle > Math.PI * 1.5 ) {
				string += "A 50 50 0 0 1 12 62 ";
			}
			if ( angle > Math.PI * 2 ) {
				string += "A 50 50 0 0 1 62 12 ";
			}
			string += "A 50 50 0 0 1 " + x + " " + y + " z";
			loans[this.number].attr("path", string);			
		}

		//-- Draws the debt burden gauge --//
		this.drawDebtBurden = function(schoolData) {
            if ( schoolData.salarymonthly !== undefined ) {
                if ( schoolData.loanmonthly == 0) {
                    schoolData.riskofdefault = "None";
                    columnObj.find("[data-nickname='debtburden']").closest("td").css("background-position", "25px 0px");
                }
                else if ( schoolData.loanmonthly <= ( schoolData.salarymonthly * global.lowdefaultrisk ) ) {
                    schoolData.riskofdefault =  "Low";
                    columnObj.find("[data-nickname='debtburden']").closest("td").css("background-position", "25px -60px");
                }
                else if ( schoolData.loanmonthly <= ( schoolData.salarymonthly * global.meddefaultrisk ) ) {
                    schoolData.riskofdefault = "Medium";
                    columnObj.find("[data-nickname='debtburden']").closest("td").css("background-position", "25px -120px");
                }
                else {
                    schoolData.riskofdefault = "High";
                    columnObj.find("[data-nickname='debtburden']").closest("td").css("background-position", "25px -180px");
                }
                columnObj.find("[data-nickname='debtburden']").html(schoolData.riskofdefault);
            }
            else {
                columnObj.find("[data-nickname='debtburden']").html("");
                columnObj.find("[data-nickname='debtburden']").closest("td").css("background-position", "30% 60px");
            }			
		}

		//-- Draws the various indicators for a school --//
		this.drawSchoolIndicators = function(schoolData) { 
		    //Grad programs don't have indicators, nor groups 4 or 5
		    if ( (schoolData.undergrad != true) || (schoolData.indicatorgroup === "4") || (schoolData.indicatorgroup === "5") ) {
				columnObj.find(".graduation-rate-chart").hide();
				columnObj.find(".default-rate-chart").hide();
				columnObj.find(".median-borrowing-chart").hide();
				columnObj.find(".indicator-textbox").html("not available");
			}
		    else { // Groups 1, 2, and 3 have indicators
			    // Draw the graduation rate chart
			    columnObj.find(".gradrisk-percent").html(schoolData.gradrate + "%");
			    // Note: ranks go from 1 to X, and X is "max"
			    var grouphigh = global["group" + schoolData.indicatorgroup + "GradHigh"];
			    var groupmed = global["group" + schoolData.indicatorgroup + "GradMed"];
			    var grhigh = global["group" + schoolData.indicatorgroup + "GradRankHigh"];
			    var grmax = global["group" + schoolData.indicatorgroup + "GradRankMax"];
			    var grmed = global["group" + schoolData.indicatorgroup + "GradRankMed"];
			    var grhigh = global["group" + schoolData.indicatorgroup + "GradRankHigh"];
			    var rankcount = 1;
			    var place = 1;
			    var gradoffset = 0;	
			    var divwidth = 68;
			    if ( ( schoolData.gradraterank != undefined ) && ( schoolData.gradrate != "NR" ) ) {
			    	columnObj.find(".gradrisk-container").closest("td").children().show();
			        if ( schoolData.gradrate < groupmed ) {
			        	rankcount = grmax - grmed;
			        	place = schoolData.gradraterank - grmed;
			        	gradoffset = 0 + Math.floor( ( rankcount - place ) * ( 65 / rankcount)) 	
			        }
			        else if ( schoolData.gradrate < grouphigh ) {
			        	rankcount = grmed - grhigh;
			        	place = schoolData.gradraterank - grhigh;
			        	gradoffset = 77 + Math.floor( ( rankcount - place ) * ( 60 / rankcount)) 	
			        }
			        else {
			         	rankcount = grhigh;
			        	place =  schoolData.gradraterank;
			        	gradoffset = 148 + Math.floor( ( rankcount - place  ) * ( 64 / rankcount ) );
			        }
			        columnObj.find(".gradrisk-container").css("left", gradoffset + "px");
			    }
			    else {
			    	columnObj.find(".graduation-rate-chart").hide();
			    }


			    // Draw the default rate indicator
			    if ( ( schoolData.defaultrate != undefined ) && ( schoolData.avgstuloandebt != "NR" ) ) {
			    	columnObj.find(".default-rate-chart").closest("td").children().show();
			    	var height = ( schoolData.defaultrate / ( global.cdravg * 2 ) ) * 100;
			    	var y = 100 - height;
			    	defaultbars[this.number].attr({"y": y, "height": height});
			       	if ( height > 100 ) {
			       		var avgheight = ( global.cdravg / schoolData.defaultrate ) * 100;
			       		var avgy = 100 - avgheight;
			    		averagebars[this.number].attr({"y": avgy, "height": avgheight})
			    	}
			    	var percent = schoolData.defaultrate + "%";
			    	columnObj.find(".default-rate-this .percent").html(percent);
			    	var average = ( global.cdravg) + "%";
			    	columnObj.find(".default-rate-avg .percent").html(average);
			    }
			    else {
			 		columnObj.find(".default-rate-chart").hide();   	
			    }

			    // Draw the avg borrowing meter
			    var grouphigh = global["group" + schoolData.indicatorgroup + "loanhigh"];
			    var groupmed = global["group" + schoolData.indicatorgroup + "loanmed"];
			    var grhigh = global["group" + schoolData.indicatorgroup + "loanrankhigh"];
			    var grmax = global["group" + schoolData.indicatorgroup + "loanrankmax"];
			    var grmed = global["group" + schoolData.indicatorgroup + "loanrankmed"];
			    var grhigh = global["group" + schoolData.indicatorgroup + "loanrankhigh"];
			    var borrowangle = 0;
			    var rankcount = 1;
			    var place = 1;
			    if ( ( schoolData.avgstuloandebtrank != undefined ) && ( schoolData.avgstuloandebt != "NR" ) ) {
			    	columnObj.find(".median-borrowing-chart").closest("td").children().show();
			        if ( schoolData.avgstuloandebt < groupmed ) {
			        	rankcount = grmed;
			        	place = schoolData.avgstuloandebtrank;
			        	borrowangle = 3 + Math.floor( ( place ) * ( 45 / rankcount)) 	
			        }
			        else if ( schoolData.avgstuloandebt < grouphigh ) {
			        	rankcount = grhigh - grmed;
			        	place = schoolData.avgstuloandebtrank - grmed;
			        	borrowangle = 55 + Math.floor( ( place ) * ( 60 / rankcount));
			        }
			        else {
			         	rankcount = grmax - grhigh;
			        	place =  schoolData.avgstuloandebtrank - grhigh;
			        	borrowangle = 130 + Math.floor( ( place ) * ( 47 / rankcount ) );
			        }  
			        // Convert to radians
			        borrowangle = ( Math.PI * 2 * borrowangle ) / 360;
			        // Coordinates of indicating point
					x = 100 - ( Math.cos(borrowangle) * 40 );
					y = 100 - ( Math.sin(borrowangle) * 40 );
					// coordinates of left base point
					var trailingangle = borrowangle - ( Math.PI / 2 );
					var x2 = 100 - ( Math.cos(trailingangle) * 4 );
					var y2 = 100 - ( Math.sin(trailingangle) * 4 );
					// coordinates of right base point
					var leadingangle = borrowangle + ( Math.PI / 2 );
					var x3 = 100 - ( Math.cos(leadingangle) * 4 );
					var y3 = 100 - ( Math.sin(leadingangle) * 4 );
					var path = "M " + x + " " + y + " L " + x2 + " " + y2 + " L " + x3 + " " + y3 + " z";
					meterarrows[this.number].attr({"path": path, "fill": "#f5f5f5"});
					meterarrows[this.number].toBack();
					// Display borrowing amount in textbox
					var content = "<em>" + num_to_money(schoolData.avgstuloandebt) + "</em>";
					columnObj.find(".median-borrowing-text").html(content);
					columnObj.find(".median-borrowing-text").css("font-weight", "600")
			    }
			    else {
			    	columnObj.find(".median-borrowing-chart").hide();
			    	columnObj.find(".indicator-textbox").html("not available");
			    }
		  	} 
		} // end .drawSchoolIndicators()

		//-- "fetch" (read) the values from the form elements into a data object --//
		this.fetchFormValues = function() {
			var data = {};
			columnObj.find("input.school-data").each(function() {
				data[$(this).attr("data-nickname")] = money_to_num($(this).val());
				if ( $(this).hasClass("interest-rate") ) {
					data[$(this).attr("data-nickname")] = ( money_to_num( $(this).val() ) / 100 );
				}
			});
			return data;
		} // end .fetchFormValues()

		//-- "fetch" the schoolID from the Column --//
		this.fetchSchoolID = function() {
			var schoolID = columnObj.find('h2[data-nickname="institution_name"]').attr('id');
			return schoolID;
		} // end .fetchSchoolID()

		//-- set an element value to the matching schoolData object property (converted to money string) --//
		this.setByNickname = function(nickname, value, overwrite) {
			var element = columnObj.find("[data-nickname='" + nickname + "']");
			element.val(num_to_money(value));
			return false;
		}; // .setByNickname()

		//-- toggles "active" or "inactive" state of the column --//
		this.toggleActive = function(state) { 
			// list of elements to toggle
			var selector = 'input, .visualization, .data-total';

			// If state isn't something clear, then it's as good as undefined
			if (state !== 'active' && state !== 'inactive') {
				state = undefined;
			}
			// Detect state if state is undefined
			if (state === undefined) {
				// Code to detect state goes here.
			}

			// Now we can alter the state to 'state'
			if (state === 'active') {
				columnObj.find(selector).show();
			}

			if (state === 'inactive') {
				columnObj.find(selector).hide();
			}

		} // end .toggleActive()

		//-- Updates Column with new values for inputs and totals --//
		this.updateFormValues = function(data) { 
			columnObj.find('.data-total, .school-data').each(function() {
				var nickname = $(this).attr('data-nickname');
				var value = data[nickname];
				if ( $(this).prop('tagName') === 'INPUT') {
					if ( $(this).hasClass('interest-rate') ) {
						value = (value * 100).toString() + "%";
					}
					else {
						value = num_to_money(value);
					}
					$(this).val(value);
				}
				else {
					$(this).html( num_to_money(value) );
				}
			});
		} // end .updateFormValues()

	} // end Column() class

	//********** END NEW STUFF *************//

	//*** Initialize values, objects, etc ***//
	var pixelPrice = 0, // The ratio of pixels to dollars for the bar graph
		transitionTime = 200, // The transition time of bar graph animations
		minimumChartSectionWidth = 5, // The minimum width of a bar graph section
		input_bg_default = "#E6E6E6", // default bg color for inputs
		input_bg_error = "#F6D5D5", // bg color for inputs that are above max
		schoolcounter = 0, // an internal counter to keep school ids unique
		highest_cost = global.most_expensive_cost; // The most expensive cost of any school
	var columns = new Object();
	var schools = new Object();
	var schools_zeroed = new Object();
	var pies = [];
	var circles = [];
	var loans = [];
	var bars = [];
	var averagebars = [];
	var defaultbars = [];
	var meters = [];
	var meterarrows = [];


	// setbyname - set an element to the matching schoolData object property (converted to money string)
	jQuery.fn.setbyname = function(name, value, overwrite) {
		var school_id = $(this).find("[data-nickname='institution_name']").attr("data-schoolid");
		var schoolData = schools[school_id];
		var element = $(this).find("[data-nickname='" + name + "']");

		element.val(num_to_money(value));
		
		// Check if this input field is focus
		if (element.is(":focus")) {
			// element.focus().val(element.val());
		}

		// Set the variable IF the value hasn't been user changed
		/* if (overwrite == true || schoolData[name + "_edited"] != true) {
			element.val(num_to_money(value, ""));
		} */
		return false;
	};

	// textbyname - set the text of an element to a money string
	jQuery.fn.textbyname = function(name, value) {
		var school_id = $(this).find("[data-nickname='institution_name']").attr("data-schoolid");
		var schoolData = schools[school_id];
		var element = $(this).find("[data-nickname='" + name + "']");
		element.text(num_to_money(value));
		return false;
	};

	// exists - a simple way to determine if any instance of an element matching the selector exists
	jQuery.fn.exists = function() {
		return this.length > 0;
	}

	// get_worksheep_id() - gets a new worksheet id, and sets global.worksheet_id
	function get_worksheet_id() {
		var request = $.ajax({
			type: "POST",
			async: false,
			url: "api/worksheet/"
		});
		request.done( function( data, textStatus, jqXHR) {
			var data = jQuery.parseJSON(jqXHR.responseText);
			global.worksheet_id = data.id;
		});
	}

	function process_school_list(schools) {
		var op = "";
		$.each(schools, function(i, val) {
			op = op + i + "(" + val + ") ";
		});
		return op;
	} // end process_school_list()

	function school_search_results(query) {
		var dump = "";
		var qurl = "api/search-schools.json?q=" + query;
		var cell = $("#step-one");
		var request = $.ajax({
			async: true,
			dataType: "json",
			url: qurl
		});
		request.done(function(response) {
			$.each(response, function(i, val) {
				dump += '<li class="school-result">';
				dump += '<a href="' + val.id + '">' + val.schoolname + '</a>';
				dump += '<p class="location">' + val.city + ', ' + val.state + '</p></li>';
			});
			if (dump == "") {
				cell.find(".search-results").html("<li><p>No results found</p></li>");
			}
			else {
				cell.find(".search-results").show();
				cell.find(".search-results").html(dump);
			}
		});
		request.fail(function() {
			// alert("ERROR");
		});
		return dump;
	} // end school_search_results()

	/*----------------
	    "Add a School" and related functions
	  ----------------*/

	// set_add_stage(stage) - sets the "get started/add a school" section to the specified stage
	//     and 'stage' is the desired stage of the "Add a School" process

	function set_add_stage(stage) {
		if (stage === 0) {
			$("#introduction .get-started").not("#step-zero").hide();
			$("#introduction #step-zero").show();
		}
		if (stage === 1) {
			$("#introduction .get-started").not("#step-one").hide();
			$("#introduction #step-one").show();
		}
		if (stage === 2) {
			$("#introduction .get-started").not("#step-two").hide();
			$("#introduction #step-two").show();
		}
		if (stage === 3) {
			$("#introduction .get-started").not("#step-three").hide();
			$("#introduction #step-three").show();
		}
	}

	/*----------------
		DOCUMENT.READY
	--------------------*/

	$(document).ready(function() {
		// Initialize columns[] with an instance of Column() for each column
		for (var x=1;x<=3;x++) {
			columns[x] = new Column(x);
		}

		// Make all columns inactive
		for (var x=1; x<=3; x++) {
			columns[x].toggleActive("inactive");
		}

		// For testing purposes only
	/*
		schools["211440"] = new School("211440");
		schools["211440"].getSchoolData();
		columns[1].addSchoolData(schools["211440"].schoolData);
		columns[1].drawSchoolIndicators(schools["211440"].schoolData);
	*/

		//** END NEW STUFF **//

		if ( $("#comparison-tables").length != 0 ) { // Added for ease of testing
			/* Notification for mobile screens */
			$("#pfc-notification-wrapper").hide();
		    $("#pfc-notification-wrapper").delay(1500).slideDown(1000);

		    $("#pfc-close-bar, #pfc-close-text").click(function() {
		        $("#pfc-notification-wrapper").slideUp(1000);
		    });
		    
			/* --- Initialize Visualizations --- */
			// Pie Charts
			var x;
			for (x = 1; x <= 3; x++ ) {
				pies[x] = Raphael($("[data-column='" + x + "'] .debt-pie")[0], 125, 125);
				pies[x].circle(62, 62, 50);
				circles[x] = pies[x].circle(62, 62, 50);
				circles[x].attr({fill: "Gray", stroke: "White", "stroke-width": 2});
				loans[x] = pies[x].path("M 62 62");
				loans[x].attr({fill: "Red", stroke: "White", "stroke-width": 2});	
			}

			// Default Rate Bars
			for (x = 1; x <= 3; x++ ) {
				bars[x] = Raphael($("[data-column='" + x + "'] .default-rate-chart")[0], 200, 100);
				var bottomline = bars[x].path("M 0 100 L 200 100");
				bottomline.attr({"stroke": "#585858", "stroke-width": 3})
				averagebars[x] = bars[x].rect(120, 50, 60, 50);
				averagebars[x].attr({"fill":"#585858", "stroke": "#585858"});
				defaultbars[x] = bars[x].rect(20, 100, 60, 0);
				defaultbars[x].attr({"fill":"#585858", "stroke": "#585858"});
			}

			// Borrowing meter
			for (x = 1; x <= 3; x++ ) {
				meters[x] = Raphael($("[data-column='" + x + "'] .median-borrowing-chart")[0], 200, 100);
				var circle = meters[x].circle(101, 100, 8);
				circle.attr({"stroke": "#585858", "stroke-width": 1, "fill": "#585858"});
				meterarrows[x] = meters[x].path("M 100 100 L 50 100");
				meterarrows[x].attr({"stroke": "#f5f5f5", "stroke-width": 2});
			}

		/*------------------
			JQUERY EVENT HANDLERS
		-------------------------*/

			/* -------------
				Accordions (not the instrument, sadly)
			-----------------*/

			$('tr.show').click(function() {
				$(this).closest('tbody').children(':not(.show)').toggleClass('hide');
				$(this).closest('.arrw-collapse').toggleClass('arrw');
			});
			$('.grants').click(function() {
				$('.grants-row').toggleClass('tr-hide');
				$(this).closest('.arrw-collapse').toggleClass('arrw');
			});
			$('.federal').click(function() {
				$('.federal-row').toggleClass('tr-hide');
				$(this).closest('.arrw-collapse').toggleClass('arrw');
			});
			$('.private').click(function() {
				$('.private-row').toggleClass('tr-hide');
				$(this).closest('.arrw-collapse').toggleClass('arrw');
			});
			$('.contributions').click(function() {
				$('.contrib-row').toggleClass('tr-hide');
				$(this).closest('.arrw-collapse').toggleClass('arrw');
			});


			/* -----------
				"Add a school" user interface
			----------- */

			// User clicks "Get Started"
			$("#get-started-button").click( function(event) {
				event.preventDefault();
				set_add_stage(1);
			});

			// [step-one] User has typed into the school-search input - perform search and display results
			$("#step-one .school-search").on("keyup", "#school-name-search", function (ev) {
				var query = $(this).val();
				$("#step-one .search-results").show();
				$("#step-one .search-results").html("<li><em>Searching...</em></li>");
				delay(function() {
					if ( query.length > 2 ) {
						school_search_results(query);
					}
					else {
						var msg = "<li><p>Please enter at least three letters to search.</p></li>"
						$("#step-one .search-results").html(msg);
					}
				}, 500);
			});

			// [step-one] User clicks on a school from the search-results list
			$("#step-one .search-results").on("click", ".school-result a", function(event) {
				event.preventDefault();
				var school_id = $(this).attr("href");

				// AJAX the schoolData
				var schoolData = new Object();
				var surl = "api/school/" + school_id + ".json";
				var request = $.ajax({
					async: false,
					dataType: "json",
					url: surl
				});
				request.done(function(response) {
					$.each(response, function(i, val) {
						i = i.toLowerCase();
						if (schoolData[i] == undefined) {
							schoolData[i] = val;
						}
					});
				});
				request.fail(function() {
					// Your fail message here.
				});	
				schools[school_id] = schoolData;
				$("#school-name-search").attr("data-schoolid", school_id);
				$("#school-name-search").val($(this).html());
				$("#step-one .search-results").html("").hide();
			});


			// [step-one] User clicks Continue at step-one
			$("#step-one .continue").click( function() {
				set_add_stage(2);
			});

			// [step-two] User clicks Continue at step-two
			$("#step-two .continue").click( function() {
				set_add_stage(3);
				var column = findEmptyColumn();
				var school_id = $("#school-name-search").attr("data-schoolid");
				$("#institution-row [data-column='" + column + "']").attr("data-schoolid", school_id);
				schools[school_id] = new School(school_id);
				schools[school_id].getSchoolData();
				schools[school_id].importAddForm();
				columns[column].addSchoolData(schools[school_id].schoolData);
				calculateAndDraw(column);
			});

			// [step-three] User clicks Continue at step-three
			$("#step-three .continue").click( function() {
				set_add_stage(1);
			});


			// User clicks Continue at the Program Length ("prgmlength") stage
			$(".add-school-info .prgmlength-selection .continue").click( function() {
				var headercell = $(this).closest("[data-column]");
				var column = headercell.attr("data-column");
				var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
				var schoolData = schools[school_id];
				if ( schoolData.kbyoss == "TRUE") {
					set_column_stage(column, "xml");
				}
				else {
					set_column_stage(column, "noxml");
				}
			});

			// User clicks Continue at the XML ("xml") or No XML ("noxml") stage
			$(".add-school-info .xml-info .continue").click( function() {
				var headercell = $(this).closest("[data-column]");
				var column = headercell.attr("data-column");
				var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
				var schoolData = schools[school_id];
				build_school_element(column);
				set_column_stage(column, "occupied");
				if ( $(this).closest(".xml-info").hasClass("add-xml") ) {
					_gaq.push(["_trackEvent", "School Interactions", "XML Continue Button Clicked", school_id]);
				}
				calculate_school(column);	
			});

			// User clicks Apply XML at the XML ("xml") stage
			$(".add-school-info .add-xml .xml-process").click( function() {
				var headercell = $(this).closest("[data-column]");
				var column = headercell.attr("data-column");
				var school = $("[data-column='" + column + "']");
				var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
				var schoolData = schools[school_id];

				var xml = headercell.find(".xml-text").val();
				if ( xml == "" ) {
					_gaq.push(["_trackEvent", "School Interactions", "Apply XML button clicked - no text detected", school_id]);
				}
				else {
					_gaq.push(["_trackEvent", "School Interactions", "Apply XML button clicked - with text", school_id]);			
				}
				var json = $.xml2json(xml);

				build_school_element(column);

				// assign values based on json
				if ( json.costs != undefined) {
					schoolData.books = money_to_num(json.costs.books_and_supplies);
					schoolData.roombrd = money_to_num(json.costs.housing_and_meals);
					schoolData.otherexpenses = money_to_num(json.costs.other_education_costs);
					schoolData.transportation = money_to_num(json.costs.transportation);
					schoolData.tuitionfees = money_to_num(json.costs.tuition_and_fees);			
				}
				if ( json.grants_and_scholarships != undefined ) {
					schoolData.pell = money_to_num(json.grants_and_scholarships.federal_pell_grant);
					// other scholarships & grants comprises several json data
					schoolData.scholar = money_to_num(json.grants_and_scholarships.grants);
					schoolData.scholar += money_to_num(json.grants_and_scholarships.grants_from_state);
					schoolData.scholar += money_to_num(json.grants_and_scholarships.other_scholarships);
				}
				if ( json.loan_options != undefined ) {
					schoolData.staffsubsidized = money_to_num(json.loan_options.federal_direct_subsidized_loan);
					schoolData.staffunsubsidized = money_to_num(json.loan_options.federal_direct_unsubsidized_loan);
					schoolData.perkins = money_to_num(json.loan_options.federal_perkins_loans);
				}
				if ( json.other_options != undefined ) {
					schoolData.family = money_to_num(json.other_options.family_contribution);
				}
				if ( json.work_options != undefined ) {
					schoolData.workstudy = money_to_num(json.work_options.work_study);
				}

				for (key in schoolData) {
					if ( schoolData[key] == undefined ) {
						schoolData[key] = 0;
					}
				}

				school.find("input.school-data").each(function() {
					if ( $(this).hasClass("interest-rate") ) {
						var interest = schoolData[$(this).attr("data-nickname")] * 100;
						interest = Math.round( interest * 10) / 10;
						$(this).val( interest + "%") ;
					}
					else {
						$(this).val( num_to_money( schoolData[$(this).attr("data-nickname")] ) ) ;
					}
				});

				schools[school_id] = schoolData;

				set_column_stage(column, "occupied");
				calculate_school(column);
			});

			// Cancel Add a School
			$(".add-school-info .add-cancel").click( function(event) {
				event.preventDefault();
				var column = $(this).closest("[data-column]").attr("data-column");
				set_column_stage(column, "default");
			});

			/* -------
				"Remove this school" user interface 
			--------------- */

			// Remove a school (display confirmation)
			$(".remove-this-school").click( function(event) {
				event.preventDefault();
				$(this).closest("[data-column]").children(".remove-confirm").show();
			});

			// Remove school (confirmed, so actually get rid of it)
			$(".remove-confirm a.remove-yes").click( function(event) {
				event.preventDefault();
				$(this).closest("[data-column]").children(".remove-confirm").hide();
				var column = $(this).closest("[data-column]").attr("data-column");
				// Set the "default" to false - the user is now engaged
				var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
				$("#institution-row [data-column='" + column + "']").attr("data-schoolid", "");
				toggle_column(column, "inactive");
				_gaq.push([ "_trackEvent", "School Interactions", "School Removed", school_id ] );
				delete schools[school_id];
			})

			// Wait, no, I don't want to remove it!
			$(".remove-confirm a.remove-no").click( function(event) {
				event.preventDefault();
				$(this).closest("[data-column]").children(".remove-confirm").hide();
			})

			/* -----------
				"GI Bill" user interface
			----------- */
			// Show the GI Bill panel on click
			$(".gibill-calculator, input[data-nickname='gibill']").click( function(event) {
				event.preventDefault();
				var column = $(this).closest("[data-column]").attr("data-column");
				school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
			});

			// Using the service selectors changes all selectors and activates service tier.
			$(".military-status-select").change( function() {
				var value = $(this).val();
				$(".military-status-select").each( function() {
					$(this).val(value);
				});
				if ( $(this).val() != "none" ) {
					$(".military-tier-select").each( function() {
						$(this).removeAttr("disabled");
					});
				}
				else {
					$(".military-tier-select").each( function() {
						$(this).attr("disabled", "disabled");
					});
				}
				for ( c = 1; c <= 3; c++ ) {
					calculate_school(c);
				}
			});

			// Selecting an option from tier sets all tier to that value
			$(".military-tier-select").change( function() {
				var value = $(this).val();
				$(".military-tier-select").each( function() {
					$(this).val(value);
				});
				for ( c = 1; c <= 3; c++ ) {
					calculate_school(c);
				}
			});

			// Selecting an option from residency modifies instate box visibility
			$(".military-residency-panel .radio-input").change( function() {
				var value = $(this).val();
				if ( value == "outofstate") {
					$(this).closest(".military-residency-panel").find(".military-instate").slideDown();
					$(this).closest(".military-residency-panel").find("label.military-instate").css("display", "block");
				}
				else {
					$(this).closest(".military-residency-panel").find(".military-instate").slideUp();
				}
			});

			// Clicking "Calculate" button hides GI Bill panel and performs a calculation
			$(".gibill-panel .military-calculate").click( function() {
				var column = $(this).closest("[data-column]").attr("data-column");
				$("[data-column='" + column + "'] .gibill-panel").hide();
				var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
				_gaq.push(["_trackEvent", "School Interactions", "GI Bill Calculator Submit", school_id]);
				calculate_school(column);
			})

			/* ----------------
				Interest Rate change buttons
			--------------------- */

			$(".rate-change").on("click", function(event) {
				event.preventDefault();
				var column = $(this).closest("[data-column]").attr("data-column");
				var rateinput = $(this).closest("td").find("input.interest-rate");
				var loanrate = money_to_num( $(this).closest("td").find("input.interest-rate").val() );
				if ( $(this).hasClass("up") ) {
					loanrate += .1;
				}
				if ( $(this).hasClass("down") ) {
					loanrate -= .1;
				}
				loanrate = Math.round( loanrate * 10 ) / 10; // Round to tens place
				loanrate = Math.round( loanrate * 100 ) / 100 + "%"
				rateinput.val( loanrate );
				var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
				updateTables();

			});

			/* ----------------
				"Real-time" calculations
			--------------------- */

			// Perform a calculation when the user blurs inputs
			$("#comparison-tables").on("blur", "input.school-data", function (ev) {
				var column = $(this).closest("[data-column]").attr("data-column");
				calculateAndDraw(column);
			});

			// Disable keydown and keypress for enter key - IE8 fix
			$("#comparison-tables").on("keypress keydown", " input.school-data", function(event) {
				if (event.keyCode == 13) {
					event.preventDefault();
					return false;
				}
			});

			// Perform a calculation when a keyup occurs in the school fields...
			$("#comparison-tables").on("keyup", "input.school-data", function (ev) {
				var column = $(this).closest("[data-column]").attr("data-column");
				var school_id = columns[column].fetchSchoolID();
				if ( $(this).hasClass("interest-rate") ) {
					value = value / 100;
				}
				var name = $(this).attr("data-nickname");
				// ...immediately when the user hits enter
				if (ev.keyCode == 13) {
					ev.preventDefault();
					return false;
				}
				// .. after a delay if any other key is pressed
				delay(function() {
					calculateAndDraw(column);
					}, 500);
			});


			$(".bar-info").on('mouseover', function() {
				// position bar-info-container based on the element clicked
				var thisoff = $(this).offset();
				var ttc = $("#bar-info-container");
				ttc.show();
				ttc.css(
					{"left": (thisoff.left + 10) + "px",
					 "top": (thisoff.top + $(this).height() + 5) + "px"});
				var ttcoff = ttc.offset();
				var right = ttcoff.left + ttc.outerWidth(true);
				if (right > $(window).width()) {
					var left = $(window).width() - ttc.outerWidth(true) - 20;
					ttc.offset({"left": left});
				}
				// check offset again, properly set tips to point to the element clicked
				ttcoff = ttc.offset();
				var tipset = Math.max(thisoff.left - ttcoff.left, 0);
				ttc.find(".innertip").css("left", (tipset + 8));
				ttc.find(".outertip").css("left", (tipset + 5));
				var bgcolor = $(this).css("background-color");
				ttc.css("border-color", bgcolor);
				ttc.find(".outertip").css("border-bottom-color", bgcolor);
				ttc.find("p").html($(this).attr("data-tooltip"));
			});
			$(".chart_mask_internal").on("mouseleave", function() {
				var ttc = $("#bar-info-container");
				ttc.hide();
			});

			$(".tooltip-info").click( function(event) {
				event.stopPropagation();
				// position tooltip-container based on the element clicked
				var thisoff = $(this).offset();
				var ttc = $("#tooltip-container");
				ttc.show();
				ttc.css(
					{"left": (thisoff.left + 10) + "px",
					 "top": (thisoff.top + $(this).height() + 5) + "px"});
				var ttcoff = ttc.offset();
				var right = ttcoff.left + ttc.outerWidth(true);
				if (right > $(window).width()) {
					var left = $(window).width() - ttc.outerWidth(true) - 20;
					ttc.offset({"left": left});
				}
				// check offset again, properly set tips to point to the element clicked
				ttcoff = ttc.offset();
				var tipset = Math.max(thisoff.left - ttcoff.left, 0);
				ttc.find(".innertip").css("left", (tipset + 8));
				ttc.find(".outertip").css("left", (tipset + 5));
				$("#tooltip-container > p").html($(this).attr("data-tooltip"));
				
				$("html").on('click', "body", function() {
					$("#tooltip-container").hide();
					$("html").off('click');
				});
				tooltip = $(this).attr("data-tipname");
				if ( tooltip == undefined ){
					tooltip = "Name not found";
				}
				_gaq.push(["_trackEvent", "Page Interactions", "Tooltip Clicked", tooltip]);
			});

			// Send email
			$("#send-email").click( function(){
				_gaq.push([ "_trackEvent", "School Interactions", "Save and Share", "Send email"] );
				var email = $('#email').val();
				var request = $.ajax({
					type: "POST",
					url: "api/email/",
					dataType: "json",
					data:{"id": global.worksheet_id, "email": email}
				});
				request.done( function( result ) {
					alert("Email sent!");
				});
				request.fail( function( jqXHR, msg ) {
					alert( "Email failed." );
				});
			});

			// toggle save drawer
			$("#save-and-share").click( function( event, native ) {
				if ( native == undefined) {
					_gaq.push([ "_trackEvent", "School Interactions", "Save and Share", "toggle button"] );
				}
				if ( global.worksheet_id == "none") {
					get_worksheet_id();
				}
				var posturl = "api/worksheet/" + global.worksheet_id + ".json";
				var json_schools = JSON.stringify( schools );
				var request = $.ajax({
					type: "POST",
					url: posturl,
					dataType: "JSON",
					data: json_schools
				});
				request.done( function ( result ) {

				});
				request.fail( function ( result ) {
					alert( "Save failed!");
				});
				var geturl = "http://" + document.location.host
							+ "/paying-for-college/compare-financial-aid-and-college-cost/"
		                    + "#"
		                    + global.worksheet_id;
		        $("#unique").val(geturl);
				$("#save-drawer").slideDown(300);
				var t  = new Date();
				var minutes = t.getMinutes();
				if ( minutes < 10 ) {
					minutes = "0" + minutes;
				}
				var seconds = t.getSeconds();
				if ( seconds < 10 ) {
					seconds = "0" + seconds;
				}
				var timestamp = ( t.getMonth() + 1 ) + "/" + t.getDate() + "/" + t.getFullYear();
				timestamp = timestamp + " at " + t.getHours() + ":" + minutes + ":" + seconds;
				$("#timestamp").html("Saved on " + timestamp);
		    }); 
			$("#save-current").click( function() {
				_gaq.push([ "_trackEvent", "School Interactions", "Save and Share", "Save current worksheet"] );
				$("#save-and-share").trigger("click", ['save-current']);
			});

			// Analytics handlers
			$(".navigator-link").click( function() {
				var school_id = $(this).closest("[data-column]").attr("data-schoolid");
				_gaq.push([ "_trackEvent", "School Interactions", "School Information link clicked", school_id ] );		
			});

			$("#unique").click( function() {
				_gaq.push([ "_trackEvent", "School Interactions", "Save and Share", "Copy URL"] );	
			});

			$("#save-drawer .save-share-facebook").click( function() {
				_gaq.push([ "_trackEvent", "School Interactions", "Save and Share", "Facebook_saveshare"] );	
			});

			$("#save-drawer .save-share-twitter").click( function() {
				_gaq.push([ "_trackEvent", "School Interactions", "Save and Share", "Twitter_saveshare"] );	
			});

			/* --- Start the page up! --- */


			// Set vertical tabbing
			for (c = 1; c <= 3; c++) {
				var school = $("[data-column='" + c + "']");
				var tabindex = 1;
				school.find("input, select").each(function() {
					var i = (c * 100) + tabindex;
					$(this).attr("tabindex", i);
					tabindex++;
				});
			}

			// Check to see if there is restoredata
		    if(window.location.hash){
		        var wid = window.location.href.substr(window.location.href.lastIndexOf("#")+1);
		        var posturl = "api/worksheet/" + wid + ".json";
		        var request = $.ajax({
		            type: "POST",
		            url: posturl,
		            data: null
		        });
		        request.done(function( data, textStatus, jqXHR ) {
		            var data = jQuery.parseJSON(jqXHR.responseText);
		            schools = data;
		            var column = 1;
		            $.each(schools, function(i, val) {
		                schools[i]["origin"] = "saved";
		                $("#institution-row").find("[data-column='" + column + "']").attr("data-schoolid", i);
		                build_school_element(column);
		                column++;
		            });
		        });
		        request.fail(function( jqXHR, msg ) {
		            test = jqXHR.responseText;
		        });
		    };

		}
	});
})(jQuery); // end cfpb_pfc_ct namespace anonymous function capsule