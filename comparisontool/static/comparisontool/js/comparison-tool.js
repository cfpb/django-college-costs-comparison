/*	Rewrite by wernerc */

/* A few default settings: */


 // see GLOBALS.txt for descriptions of the parameters
var global = {
		"aaprgmlength": 2, "yrincollege": 1, "vet": false, "serving": "no", "program": "ba",
		"tier": 100, "gradprgmlength": 2, "familyincome": 48, "most_expensive_cost": 50000,
		"transportationdefault": 0, "roombrdwfamily": 0, "gibillch1606": 356,
		"perkinscapunder": 5500, "perkinscapgrad": 8000, "pellcap": 5550,
		"subsidizedcapyr1": 3500, "subsidizedcapyr2": 4500, "subsidizedcapyr3": 5500, 
		"unsubsidizedcapyr1": 5500, "unsubsidizedcapyr2": 6500, "unsubsidizedcapyr3": 7500,
		"unsubsidizedcapindepyr1": 9500, "unsubsidizedcapindepyr2": 10500, "unsubsidizedcapindepyr3": 12500, 
		"unsubsidizedcapgrad": 20500, "state529plan": 0, "perkinsrate": 0.05, "subsidizedrate": 0.0386, 
		"unsubsidizedrateundergrad": 0.0386, "unsubsidizedrategrad": 0.0541, "dloriginationfee": 1.01051, "gradplusrate": 0.0641, 
		"parentplusrate": 0.079, "plusoriginationfee": 1.04204, "privateloanratedefault": 0.079, 
		"institutionalloantratedefault":0.079, "homeequityloanrate": 0.079, "deferperiod": 6, "salary": 30922, 
		"salaryaa": 785, "salaryba": 1066, "salarygrad": 1300, "lowdefaultrisk": 0.08, "meddefaultrisk": 0.14, 
		"group1gradrankhigh": 620, "group1gradrankmed": 1247, "group1gradrankmax": 1873,
		"group2gradrankhigh": 304, "group2gradrankmed": 881, "group2gradrankmax": 1318,
		"group3gradrankhigh": 247, "group3gradrankmed": 420, "group3gradrankmax": 539,
		"group4gradrankhigh": 0, "group4gradrankmed": 0, "group4gradrankmax": 0,
		"group5gradrankhigh": 0,"group5gradrankmed": 0, "group5gradrankmax": 0,
		"group1gradmed": 39.6, "group1gradhigh": 57.9, "group2gradmed": 19.4, "group2gradhigh": 41.9,
		"group3gradmed": 21.4, "group3gradhigh": 41.2, "group4gradmed": 0, "group4gradhigh": 0, 
		"group5gradmed": 0, "group5gradhigh": 0, "cdrhigh": 100, "cdravg": 13.4, "cdrlow": 0.0, 
		"group1loanmed": 15025, "group1loanhigh": 20016, "group2loanmed": 6891, "group2loanhigh": 12584, 
		"group3loanmed": 6836, "group3loanhigh": 9501, "group4loanmed": 0, "group4loanhigh": 0, 
		"group5loanmed": 0, "group5loanhigh": 0,
		"group1loanrankmed": 724, "group1loanrankhigh": 1394, "group1loanrankmax": 2067,
		"group2loanrankmed": 541, "group2loanrankhigh": 1009, "group2loanrankmax": 1464,
		"group3loanrankmed": 277, "group3loanrankhigh": 459, "group3loanrankmax": 836,
		"group4loanrankmed": 0, "group4loanrankhigh": 0, "group4loanrankmax": 0,
		"group5loanrankmed": 0, "group5loanrankhigh": 0, "group5loanrankmax": 0,
		"tfcap": 19198.31, "avgbah": 1429, "bscap": 1000, 
		"tuitionassistcap": 4500, "kicker": 0, "yrben": 0, "rop": 1, "depend": "independent",
		"schools_added": -1, "reached_zero": 0, "worksheet_id": "none"
	};

var presets = {
		"average-public" :
			{"school":"Average Public 4-Year University", "tuitionfees": 8655, "roombrd": 9205,
			 "books": 1200, "transportation": 1110, "otherexpenses": 2091, "program": "ba",
			 "school_id": "average-public", "prgmlength": 4, "control": "public", "origin":"presets"},
		"average-private" :
			{"school":"Average Private 4-Year University", "tuitionfees": 29056, "roombrd": 10462,
			 "books": 1244, "transportation": 957, "otherexpenses": 1570, "program": "ba",
			 "school_id": "average-private", "prgmlength": 4, "control": "private", "origin":"presets"}
	};

var schools = new Object();
var schools_zeroed = new Object();

/* -------- 
	Initialize
---------------- */
var pixel_price = 0, // The ratio of pixels to dollars for the bar graph
	transition_time = 200, // The transition time of bar graph animations
	minimum_chart_section_width = 1, // The minimum width of a bar graph section
	input_bg_default = "#E6E6E6", // default bg color for inputs
	input_bg_error = "#F6D5D5", // bg color for inputs that are above max
	schoolcounter = 0, // an internal counter to keep school ids unique
	highest_cost = global.most_expensive_cost; // The most expensive cost of any school

var pies = [];
var circles = [];
var loans = [];
var bars = [];
var averagebars = [];
var defaultbars = [];
var meters = [];
var meterarrows = [];

/* -------- 
	FUNCTIONS 
---------------*/
// money_to_num() - Convert from money string to number
function money_to_num(money) {
	if (typeof(money) !== "string") {
		return 0;
	} 
	else {
		return Number(money.replace(/[^0-9\.]+/g,""));	
	}
}
// num_to_money() - Convert from number to money string
function num_to_money(n, sign, c, d, t) {
	if (isNaN(c = Math.abs(c))) {
		c = 0;
	}
	if (d === undefined) {
		d = ".";
	}
	if (t === undefined) {
		t = ",";
	}
	if (sign === undefined) {
		sign = "$";
	}
	if (n < 0) {
		var s = "-";
	}
	else {
		var s = "";
	}
	var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "";
	var j = 0;
	if (i.length > 3) {
		j = ((i.length) % 3);
	}
	money = sign + s;
	if (j > 0) {
		money += i.substr(0,j) + t;
	}
	money += i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t);
	if (c) {
		money += d + Math.abs(n - i).toFixed(c).slice(2);
	}
	return money;
}

// delay - used to delay calculations after keyup
var delay = (function(){
		var t = 0;
		return function(callback, delay) {
			clearTimeout(t);
			t = setTimeout(callback, delay);
		};
})();

// setbyname - set an element to the matching schooldata object property (converted to money string)
jQuery.fn.setbyname = function(name, value, overwrite) {
	var school_id = $(this).find("[data-nickname='institutionname']").attr("data-schoolid");
	var schooldata = schools[school_id];
	var element = $(this).find("[data-nickname='" + name + "']");

	element.val(num_to_money(value));
	
	// Check if this input field is focus
	if (element.is(":focus")) {
		// element.focus().val(element.val());
	}

	// Set the variable IF the value hasn't been user changed
	/* if (overwrite == true || schooldata[name + "_edited"] != true) {
		element.val(num_to_money(value, ""));
	} */
	return false;
};

// textbyname - set the text of an element to a money string
jQuery.fn.textbyname = function(name, value) {
	var school_id = $(this).find("[data-nickname='institutionname']").attr("data-schoolid");
	var schooldata = schools[school_id];
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

// hide_column() - "Hide" a column, hiding all elements except .add-a-school and .width-holder
function hide_column(col_num) {
	var column = $("[data-column='" + col_num + "']");
	column.each( function() {
		$(this).children().not(".add-a-school, .width-holder").hide();
		$(this).children(".add-a-school").show();
		if ( $(this).hasClass("debt-burden-cell") ) {
			$(this).css("background-position", "25px 100px");
		}
	});
}

// show_column() - Undoes the effects of hide_column()
function show_column(col_num) {
	var column = $("[data-column='" + col_num + "']");
	column.each( function() {
		$(this).children().not(".hidden-box").show();
	});	
}

// build_school_element() - Fill in a column with the school's data (school's data must be in the 'schools' object)
function build_school_element(column) {
	var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
	var school = $("[data-column='" + column + "']");
	set_column_stage(column, "occupied");

	school.find(".indicator-textbox").html("");
	school.find(".indicator-textbox").hide();

	if (schools[school_id] != undefined) {
		var schooldata = schools[school_id];
	}
	else {
		return false;
	}

	// Get program type and length
	schooldata.program = school.find(".program-selection :radio:checked").val();
	if ( schooldata.program == undefined ) {
		schooldata.program = "ba";
	}
	schooldata.prgmlength = money_to_num(school.find(".prgmlength-selection select").val());
	if ( schooldata.prgmlength == 0 ) {
		if (schooldata.program == "ba") {
			schooldata.prgmlength = 4;
		}
		else if (schooldata.program == "aa") {
			schooldata.prgmlength = 2;
		}
		else {
			schooldata.prgmlength = 2;
		}
	}

	// If private school, hide residency.
	if (schooldata.control != "Public") {
		school.find(".military-residency-panel").hide();
	}
	else {
		school.find(".military-residency-panel").show();
	}

	// Set undergrad
	if ( schooldata.program == "grad" ) {
		schooldata.undergrad = false;
	}
	else {
		schooldata.undergrad = true;
	}

	// Set the data within the element
	school.find("[data-nickname='institutionname']").html(schooldata.school);
	school.find("input.school-data").not(".interest-rate").val("$0");
	school.find("input[data-nickname='institutionalloanrate']").val(global.institutionalloantratedefault * 100 + "%");
	school.find("input[data-nickname='privateloanrate']").val(global.privateloanratedefault * 100 + "%");
	// Currently, we're not using schooldata from the database
	// As such, the following is only used for average schools
	if ( ( schooldata.origin == "presets" ) || ( schooldata.origin == "saved" ) ) {
		for (key in schooldata) {
		    school.find("input[data-nickname='" + key + "']").val(schooldata[key]);
		}
		// Average public and private do not have GI Bill information
	}
	if ( schooldata.origin == "presets" ) {
		school.find(".gibill-calculator").hide();
	}
	else {
		// If it was previously hidden, show it.
		school.find(".gibill-calculator").show();
	}

	if ( ( schooldata.school_id == "average-public" ) || ( schooldata.school_id == "average-private" ) ) {
		school.find("a.navigator-link").attr("href", "#");
		school.find("a.navigator-link").hide();
		}
	else {
		var navigatorlink = "http://nces.ed.gov/collegenavigator/?id=" + school_id;
		school.find("a.navigator-link").show();
		school.find("a.navigator-link").attr("href", navigatorlink);
	}

	/* ----- DRAW SCHOOL INDICATORS ----- */

    //Grad programs don't have indicators, nor groups 4 or 5 
    if ( schooldata.undergrad == true && schooldata.indicatorgroup != "4" && schooldata.indicatorgroup != "5" ) {

	   // Draw the graduation rate chart
	    school.find(".gradrisk-percent").html(schooldata.gradrate + "%");
	    // Note: ranks go from 1 to X, and X is "max"
	    var grouphigh = global["group" + schooldata.indicatorgroup + "gradhigh"];
	    var groupmed = global["group" + schooldata.indicatorgroup + "gradmed"];
	    var grhigh = global["group" + schooldata.indicatorgroup + "gradrankhigh"];
	    var grmax = global["group" + schooldata.indicatorgroup + "gradrankmax"];
	    var grmed = global["group" + schooldata.indicatorgroup + "gradrankmed"];
	    var grhigh = global["group" + schooldata.indicatorgroup + "gradrankhigh"];
	    var rankcount = 1;
	    var place = 1;
	    var gradoffset = 0;	
	    var divwidth = 68;
	    if ( ( schooldata.gradraterank != undefined ) && ( schooldata.gradrate != "NR" ) ) {
	    	school.find(".gradrisk-container").closest("td").children().show();
	        if ( schooldata.gradrate < groupmed ) {
	        	rankcount = grmax - grmed;
	        	place = schooldata.gradraterank - grmed;
	        	gradoffset = 0 + Math.floor( ( rankcount - place ) * ( 65 / rankcount)) 	
	        }
	        else if ( schooldata.gradrate < grouphigh ) {
	        	rankcount = grmed - grhigh;
	        	place = schooldata.gradraterank - grhigh;
	        	gradoffset = 77 + Math.floor( ( rankcount - place ) * ( 60 / rankcount)) 	
	        }
	        else {
	         	rankcount = grhigh;
	        	place =  schooldata.gradraterank;
	        	gradoffset = 148 + Math.floor( ( rankcount - place  ) * ( 64 / rankcount ) );
	        }
	        school.find(".gradrisk-container").css("left", gradoffset + "px");
	    }
	    else {
	    	school.find(".graduation-rate-chart").hide();
	    }


	    // Draw the default rate indicator
	    if ( ( schooldata.defaultrate != undefined ) && ( schooldata.avgstuloandebt != "NR" ) ) {
	    	school.find(".default-rate-chart").closest("td").children().show();
	    	var height = ( schooldata.defaultrate / ( global.cdravg * 2 ) ) * 100;
	    	var y = 100 - height;
	    	defaultbars[column].attr({"y": y, "height": height});
	       	if ( height > 100 ) {
	       		var avgheight = ( global.cdravg / schooldata.defaultrate ) * 100;
	       		var avgy = 100 - avgheight;
	    		averagebars[column].attr({"y": avgy, "height": avgheight})
	    	}
	    	var percent = schooldata.defaultrate + "%";
	    	school.find(".default-rate-this .percent").html(percent);
	    	var average = ( global.cdravg) + "%";
	    	school.find(".default-rate-avg .percent").html(average);
	    }
	    else {
	 		school.find(".default-rate-chart").hide();   	
	    }

	    // Draw the avg borrowing meter
	    var grouphigh = global["group" + schooldata.indicatorgroup + "loanhigh"];
	    var groupmed = global["group" + schooldata.indicatorgroup + "loanmed"];
	    var grhigh = global["group" + schooldata.indicatorgroup + "loanrankhigh"];
	    var grmax = global["group" + schooldata.indicatorgroup + "loanrankmax"];
	    var grmed = global["group" + schooldata.indicatorgroup + "loanrankmed"];
	    var grhigh = global["group" + schooldata.indicatorgroup + "loanrankhigh"];
	    var borrowangle = 0;
	    var rankcount = 1;
	    var place = 1;
	    if ( ( schooldata.avgstuloandebtrank != undefined ) && ( schooldata.avgstuloandebt != "NR" ) ) {
	    	school.find(".median-borrowing-chart").closest("td").children().show();
	        if ( schooldata.avgstuloandebt < groupmed ) {
	        	rankcount = grmed;
	        	place = schooldata.avgstuloandebtrank;
	        	borrowangle = 3 + Math.floor( ( place ) * ( 45 / rankcount)) 	
	        }
	        else if ( schooldata.avgstuloandebt < grouphigh ) {
	        	rankcount = grhigh - grmed;
	        	place = schooldata.avgstuloandebtrank - grmed;
	        	borrowangle = 55 + Math.floor( ( place ) * ( 60 / rankcount));
	        }
	        else {
	         	rankcount = grmax - grhigh;
	        	place =  schooldata.avgstuloandebtrank - grhigh;
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
			meterarrows[column].attr({"path": path, "fill": "#f5f5f5"});
			meterarrows[column].toBack();
			// Display borrowing amount in textbox
			var content = "<em>" + num_to_money(schooldata.avgstuloandebt) + "</em>";
			school.find(".median-borrowing-text").html(content);
			school.find(".median-borrowing-text").css("font-weight", "600")
	    }
	    else {
	    	school.find(".median-borrowing-chart").hide();
	    	school.find(".indicator-textbox").html("not available");
	    }
	}
	else {
		school.find(".graduation-rate-chart").hide();
		school.find(".default-rate-chart").hide();
		school.find(".median-borrowing-chart").hide();
		school.find(".indicator-textbox").html("not available");
	}	

	global.schools_added++;
	if ( global.schools_added > 0 ) {
		var value = (global.schools_added).toString();
		_gaq.push([ "_trackEvent", "School Interactions", "Total Schools Added", value ] );
		_gaq.push([ "_trackEvent", "School Interactions", "School Added", school_id ] );
	}

	calculate_school(column);

} // end build_school_element()


/*----------
	CALCULATION FUNCTIONS
-----------*/

// calculate_school(column) - Calculate the numbers for a particular school
function calculate_school(column) {
	var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
	var school = $("[data-column='" + column + "']");
	var schooldata = schools[school_id];


	// Set unsubsidized rate (there is a difference between grad and undergrad direct loan rates)
	if (schooldata.undergrad == true) {
		schooldata.unsubsidizedrate = global.unsubsidizedrateundergrad;
	}
	else {
		schooldata.unsubsidizedrate = global.unsubsidizedrategrad;
	}

	// Supplement/replace data with customized fields
	school.find("input.school-data").each(function() {
		schooldata[$(this).attr("data-nickname")] = money_to_num($(this).val());
		if ( $(this).hasClass("interest-rate") ) {
			schooldata[$(this).attr("data-nickname")] = ( money_to_num( $(this).val() ) / 100 );
		}
	});

	// Get program type and length
	schooldata.program = school.find(".program-selection :radio:checked").val();
	if ( schooldata.program == undefined ) {
		schooldata.program = "ba";
	}
	schooldata.prgmlength = money_to_num(school.find(".prgmlength-selection select").val());
	if ( schooldata.prgmlength == 0 ) {
		if (schooldata.program == "ba") {
			schooldata.prgmlength = 4;
		}
		else if (schooldata.program == "aa") {
			schooldata.prgmlength = 2;
		}
		else {
			schooldata.prgmlength = 2;
		}
	}

	// Set undergrad
	if ( schooldata.program == "grad" ) {
		schooldata.undergrad = false;
	}
	else {
		schooldata.undergrad = true;
	}


	// schooldata.yrincollege is set to global.yrincollege, possibly just for now
	schooldata.yrincollege = global.yrincollege;

	// For calculations, add transportation and otherexpenses into personalcosts

	schooldata.personal = schooldata.transportation + schooldata.otherexpenses;

	// tf in-state rate prepopulate (schooldata.tfinsprep)
	if ( ( schooldata.control =="public" ) && ( schooldata.program="grad" ) ) {
		schooldata.tfinstate = schooldata.tuitiongradins;
	}
	else {
		schooldata.tfinstate = schooldata.tuitionunderins;
	}

	// Unused (but required) variables
	schooldata.homeequity = 0;
	schooldata.parentplus = 0;

	// netprice
	if (schooldata.netpricegeneral < 0) {
		schooldata.netprice = -1;
	}
	else {
		schooldata.netprice = schooldata.netpricegeneral;
	}

	// Set fields by name, removing non-numeric characters in the process
	// First, set the costs:
	school.setbyname("tuitionfees", schooldata.tuitionfees, true);
	school.setbyname("roombrd", schooldata.roombrd, true);
	school.setbyname("books", schooldata.books, true);
	school.setbyname("transportation", schooldata.transportation, true);
	school.setbyname("otherexpenses", schooldata.otherexpenses, true);

	// Start calculations
	// Cost of First Year (schooldata.firstyrcostattend)
	schooldata.firstyrcostattend = schooldata.tuitionfees + schooldata.roombrd + schooldata.books + schooldata.otherexpenses + schooldata.transportation;
	school.find("[data-nickname='firstyrcostattend']").text( num_to_money( schooldata.firstyrcostattend ) );

	/*------- SCHOLARSHIPS & GRANTS --------*/
	// Pell Grants
	schooldata.pell_max = 0;
	if ( schooldata.undergrad == true ) {
		schooldata.pell_max = global.pellcap;
	}
	if ( schooldata.pell_max > schooldata.firstyrcostattend ) {
		schooldata.pell_max = schooldata.firstyrcostattend;
	}
	if ( schooldata.pell_max < 0 ) {
		schooldata.pell_max = 0;
	}
	if (schooldata.pell > schooldata.pell_max){
		schooldata.pell = schooldata.pell_max;
	}
	school.setbyname("pell", schooldata.pell, true);

	// Other grants & scholarships
	school.setbyname("scholar", schooldata.scholar, true);

	// Military Tuition Assistance
	if ( global.tuitionassistcap < schooldata.tuitionfees ) {
		schooldata.tuitionassist_max = global.tuitionassistcap;
	}
	else {
		schooldata.tuitionassist_max = schooldata.tuitionfees;
	}
	if (schooldata.tuitionassist > schooldata.tuitionassist_max) {
		schooldata.tuitionassist = schooldata.tuitionassist_max;
	}
	school.setbyname("tuitionassist", schooldata.tuitionassist, true);

	// GI Bill

	// Determine in-state and out-of-state
	var instate = school.find(".military-residency-panel :radio:checked").val();
	if ( ( instate === "instate" ) || ( instate == "indistrict" ) ) {
		schooldata.instate = true;
	}
	else {
		schooldata.instate = false;
	}
	// Set schooldata.tfinstate
	if ( schooldata.instate == false ) {
		schooldata.tfinstate = schooldata.militaryinstatetuition;	
	}
	else {
		schooldata.tfinstate = schooldata.tuitionfees;
	}

	// Determine if global.vet is true or false:
	var vetselect = school.find(".military-status-select").val();
	if (vetselect != "none") {
		global.vet = true;
	}
	else {
		global.vet = false;
	}

	// Tuition & Fees benefits:
	if (global.vet == false) {
		schooldata.gibilltf = 0; 
	}
	else {
		 global.tier = $("[data-column='1'] .military-tier-select").find(":selected").val();
		// Calculate veteran benefits:		
		if ( ( schooldata.control == "Public" ) && ( schooldata.instate == true ) ) {
			schooldata.gibilltf = ( schooldata.tuitionfees - schooldata.scholar - schooldata.tuitionassist ) * global.tier;
			if ( schooldata.gibilltf < 0 ) {
				schooldata.gibilltf = 0;
			}
		}
		else if ( ( schooldata.control == "Public" ) && ( schooldata.instate == false ) ) {
			schooldata.gibilltf = ( schooldata.tfinstate + (global.yrben * 2) - schooldata.scholar - schooldata.tuitionassist ) * global.tier;
			if ( schooldata.gibilltf < 0 ) {
				schooldata.gibilltf = 0;
			}
			if ( schooldata.gibilltf > ( ( schooldata.tuitionfees - schooldata.scholar - schooldata.tuitionassist) * global.tier ) ) {
				schooldata.gibilltf = schooldata.tuitionfees * global.tier;
			}
		}
		else { // School is not public
			schooldata.gibilltf = ( global.tfcap + (global.yrben * 2) - schooldata.scholar - schooldata.tuitionassist ) * global.tier;
			if ( schooldata.gibilltf < 0 ) {
				schooldata.gibilltf = 0;
			}
			if ( schooldata.gibilltf > ( ( schooldata.tuitionfees - schooldata.scholar - schooldata.tuitionassist) * global.tier ) ) {
				schooldata.gibilltf = schooldata.tuitionfees * global.tier;
			}
		}
	}

	// GI living allowance benefits:
	global.serving = $("[data-column='1'] .military-status-select").val();
	if (global.vet === false) {
		schooldata.gibillla = 0;
	}
	else { 
		if (global.serving == "ad") { 
			schooldata.gibillla = 0;
		}
		else if ( ( global.tier == 0 ) && ( global.serving == "ng" ) ) {
			schooldata.gibillla = global.gibillch1606 * 9;
		}
		else {
			if (schooldata.online == "Yes" ) {
				schooldata.gibillla = ( ( ( global.avgbah / 2 * global.tier ) + global.kicker ) * global.rop) * 9;
			}
			else {
				schooldata.gibillla = schooldata.bah * global.tier * 9 * global.rop;
			}
		}
	}


	// GI Bill Book Stipend
	if (global.vet === false) {
		schooldata.gibillbs = 0;
	}
	else {
		schooldata.gibillbs = global.bscap * global.tier * global.rop;
	}

	// Total GI Bill
	schooldata.gibill = schooldata.gibilltf + schooldata.gibillla + schooldata.gibillbs;
	if ( schooldata.school_id.substring(0,7) == "average") {
		// average schools should have their gibill zeroed out
		schooldata.gibill = 0;
	}
	school.setbyname("gibill", schooldata.gibill, true);
	// Also, pretty-up the instate tuition while we're at it:
	school.setbyname("militaryinstatetuition", schooldata.militaryinstatetuition, true);

	// Total Grants
	schooldata.grantstotal = schooldata.pell + schooldata.scholar + schooldata.gibill + schooldata.tuitionassist;
	school.textbyname("grantstotal", schooldata.grantstotal);

	// First Year Net Cost
	schooldata.firstyrnetcost = schooldata.firstyrcostattend - schooldata.grantstotal;

	/*------- CONTRIBUTIONS aka savings --------*/
	school.setbyname("savings", schooldata.savings, true);
	school.setbyname("family", schooldata.family, true);
	school.setbyname("state529plan", schooldata.state529plan, true);
	school.setbyname("workstudy", schooldata.workstudy, true);

	// Total Contributions
	schooldata.savingstotal = schooldata.savings + schooldata.family + schooldata.state529plan + schooldata.workstudy;
	school.textbyname("savingstotal", schooldata.savingstotal);

	/*------- grants and savings --------*/
	var totalgrantsandsavings = schooldata.savingstotal + schooldata.grantstotal;
	school.textbyname("totalgrantsandsavings", totalgrantsandsavings);

	/*------- FEDERAL LOANS --------*/
	// Perkins Loan

	schooldata.perkins_max = schooldata.firstyrcostattend - schooldata.pell;
	if ( schooldata.perkins_max < 0 ) {
		schooldata.perkins_max = 0;
	}
	if ( schooldata.undergrad == true ) {
		if ( schooldata.perkins_max > global.perkinscapunder ) {
			schooldata.perkins_max = global.perkinscapunder;
		}
	}
	else {
		if ( schooldata.perkins_max > global.perkinscapgrad ) {
			schooldata.perkins_max = global.perkinscapgrad;
		}		
	}
	if (schooldata.perkins > schooldata.perkins_max) {
		schooldata.perkins = schooldata.perkins_max;
	}
	school.setbyname("perkins", schooldata.perkins, true);
		
	// Subsidized Stafford Loan
	if (schooldata.undergrad == false) {
		schooldata.staffsubsidized_max = 0;
	}
	else {
		if ((schooldata.program == "aa") || (schooldata.yrincollege == 1)) {
			schooldata.staffsubsidized_max = schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins;
			if ( schooldata.staffsubsidized_max > global.subsidizedcapyr1 ) {
				schooldata.staffsubsidized_max = global.subsidizedcapyr1;
			}
			if ( schooldata.staffsubsidized_max < 0 ) {
				schooldata.staffsubsidized_max = 0;
			}
		}
		else if (schooldata.yrincollege == 2) {
			schooldata.staffsubsidized_max = schooldata.firstyrcostattend - schooldata.perkins - schooldata.pell;
			if ( schooldata.staffsubsidized_max > ( global.subsidizedcapyr2 - schooldata.staffsubsidized ) ) {
				schooldata.staffsubsidized_max = global.subsidizedcapyr2 - schooldata.staffsubsidized ;
			}
			if ( schooldata.staffsubsidized_max < 0 ) {
				schooldata.staffsubsidized_max = 0;
			}
		}
		else if (schooldata.yrincollege == 3) {
			schooldata.staffsubsidized_max = schooldata.firstyrcostattend - schooldata.perkins - schooldata.pell;
			if ( schooldata.staffsubsidized_max > ( global.subsidizedcapyr3 - schooldata.staffsubsidized ) ) {
				schooldata.staffsubsidized_max = global.subsidizedcapyr3 - schooldata.staffsubsidized ;
			}
			if ( schooldata.staffsubsidized_max < 0 ) {
				schooldata.staffsubsidized_max = 0;
			}
		}
	}
	if (schooldata.staffsubsidized_max < 0){
		schooldata.staffsubsidized = 0;
	}
	if (schooldata.staffsubsidized > schooldata.staffsubsidized_max){
		schooldata.staffsubsidized = schooldata.staffsubsidized_max;
	}
	schools[school_id].staffsubsidized_max = schooldata.staffsubsidized_max;
	school.setbyname("staffsubsidized", schooldata.staffsubsidized, true);

	//unsubsidized loan max for independent students
	if ( schooldata.undergrad == false) { 
		schooldata.staffunsubsidizedindep_max = schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins - schooldata.staffsubsidized;
		if ( schooldata.staffunsubsidizedindep_max > global.unsubsidizedcapgrad ) {
			schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapgrad;
		}
		if (schooldata.staffunsubsidizedindep_max > global.unsubsidizedcapgrad - schooldata.staffsubsidized) {
			schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapgrad - schooldata.staffsubsidized;
		}
		if ( schooldata.staffunsubsidizedindep_max < 0 ) {
			schooldata.staffunsubsidizedindep_max = 0;
		}
	} 
	else {
		if ( ( schooldata.program == "aa" ) || ( schooldata.yrincollege == 1 ) ) { 
			schooldata.staffunsubsidizedindep_max = schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins - schooldata.staffsubsidized;
			if ( schooldata.staffunsubsidizedindep_max > ( global.unsubsidizedcapindepyr1 - schooldata.staffsubsidized ) ) {
				schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr1;
			}
			if (schooldata.staffunsubsidizedindep_max > global.unsubsidizedcapindepyr1 - schooldata.staffsubsidized) {
				schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr1 - schooldata.staffsubsidized;
			}
			if ( schooldata.staffunsubsidizedindep_max < 0 ) {
				schooldata.staffunsubsidizedindep_max = 0;
			}
		}
		else if ( schooldata.yrincollege == 2) { 
			schooldata.staffunsubsidizedindep_max = schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins - schooldata.staffsubsidized;
			if ( schooldata.staffunsubsidizedindep_max > ( global.unsubsidizedcapindepyr2 - schooldata.staffsubsidized ) ) {
				schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr2;
			}
			if ( schooldata.staffunsubsidizedindep_max > global.unsubsidizedcapindepyr2 - schooldata.staffsubsidized ) {
				schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr2 - schooldata.staffsubsidized;
			}
			if ( schooldata.staffunsubsidizedindep_max < 0 ) {
				schooldata.staffunsubsidizedindep_max = 0;
			}
		}
		else if ( schooldata.yrincollege == 3) { 
			schooldata.staffunsubsidizedindep_max = schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins- schooldata.staffsubsidized;
			if ( schooldata.staffunsubsidizedindep_max > ( global.unsubsidizedcapindepyr3 - schooldata.staffsubsidized ) ) {
				schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr3;
			}
			if ( schooldata.staffunsubsidizedindep_max > global.unsubsidizedcapindepyr3 - schooldata.staffsubsidized ) {
				schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr3 - schooldata.staffsubsidized;
			}
			if ( schooldata.staffunsubsidizedindep_max < 0 ) {
				schooldata.staffunsubsidizedindep_max = 0;
			}
		}
	}
	// unsubsidized loan max for dependent students
	if ( schooldata.undergrad == false ) {
		schooldata.staffunsubsidizeddep_max = schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins - schooldata.staffsubsidized;
		if ( schooldata.staffunsubsidizeddep_max > global.unsubsidizedcapgrad - schooldata.staffsubsidized) {
			schooldata.staffunsubsidizeddep_max = global.unsubsidizedcapgrad - schooldata.staffsubsidized;
		}
		if ( schooldata.staffunsubsidizeddep_max < 0 ) {
			schooldata.staffunsubsidizeddep_max = 0;
		}
		// schooldata.staffunsubsidizeddep_max = math.min (( global.unsubsidizedcapgrad - schooldata.staffsubsidized) , math.max ( 0, (schooldata.firstyrcostattend - schooldata.perkins - schooldata.staffsubsidized)));
	} 
	else if ( schooldata.program == "aa" || schooldata.yrincollege == 1 ) {
		schooldata.staffunsubsidizeddep_max = schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins - schooldata.staffsubsidized;
		if ( schooldata.staffunsubsidizeddep_max > global.unsubsidizedcapyr1 - schooldata.staffsubsidized) {
			schooldata.staffunsubsidizeddep_max = global.unsubsidizedcapyr1 - schooldata.staffsubsidized;
		}
		if ( schooldata.staffunsubsidizeddep_max < 0 ) {
			schooldata.staffunsubsidizeddep_max = 0;
		}
		// schooldata.staffunsubsidizeddep_max = math.min((global.unsubsidizedcapyr1- schooldata.staffsubsidized), math.max(0, (schooldata.firstyrcostattend - schooldata.perkins- schooldata.staffsubsidized))); 
	}
	else if ( schooldata.yrincollege == 2) { 
		schooldata.staffunsubsidizeddep_max = schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins - schooldata.staffsubsidized;
		if ( schooldata.staffunsubsidizeddep_max > global.unsubsidizedcapyr2 - schooldata.staffsubsidized) {
			schooldata.staffunsubsidizeddep_max = global.unsubsidizedcapyr2 - schooldata.staffsubsidized;
		}
		if ( schooldata.staffunsubsidizeddep_max < 0 ) {
			schooldata.staffunsubsidizeddep_max = 0;
		}
		// schooldata.staffunsubsidizeddep_max = math.min((global.unsubsidizedcapyr2 - schooldata.staffsubsidized), math.max(0, (schooldata.firstyrcostattend - schooldata.perkins- schooldata.staffsubsidized))):
	} 
	else if ( schooldata.yrincollege == 3 ) { 
		schooldata.staffunsubsidizeddep_max = schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins - schooldata.staffsubsidized;
		if ( schooldata.staffunsubsidizeddep_max > (global.unsubsidizedcapyr3 - schooldata.staffsubsidized) ) {
			schooldata.staffunsubsidizeddep_max = global.unsubsidizedcapyr3 - schooldata.staffsubsidized;
		}
		if ( schooldata.staffunsubsidizeddep_max < 0 ) {
			schooldata.staffunsubsidizeddep_max = 0;
		}
	// schooldata.staffunsubsidizeddep_max = math.min((global.unsubsidizedcapyr3 - schooldata.staffsubsidized), math.max(0, (schooldata.firstyrcostattend - schooldata.perkins- schooldata.staffsubsidized)));
	}

	// Unsubsidized Stafford Loans
	if ( global.depend == "dependent" ) {
		schooldata.staffunsubsidized_max = schooldata.staffunsubsidizeddep_max;
	}
	else {
		schooldata.staffunsubsidized_max = schooldata.staffunsubsidizedindep_max;
	}
	if (schooldata.staffunsubsidized_max < 0) {
		schooldata.staffunsubsidized_max = 0;
	}
	if (schooldata.staffunsubsidized > schooldata.staffunsubsidized_max) {
		schooldata.staffunsubsidized = schooldata.staffunsubsidized_max;
	}
	school.setbyname("staffunsubsidized", schooldata.staffunsubsidized, true);

	// Gradplus
	if (schooldata.undergrad == true) {
		schooldata.gradplus_max = 0;
	}
	else {
		schooldata.gradplus_max = schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized;
	}
	if ( schooldata.gradplus_max < 0 ) {
		schooldata.gradplus_max = 0;
	}
	if (schooldata.gradplus > schooldata.gradplus_max) {
		schooldata.gradplus = schooldata.gradplus_max;
	}
    // If it's an undergrad program, gradplus is readonly
    if ( schooldata.undergrad == true ) {
    	school.find("[data-nickname='gradplus']").attr("readonly", "readonly");
    	school.find("[data-nickname='gradplus']").val("not available");
    } 
    else {
    	school.find("[data-nickname='gradplus']").removeAttr("readonly");
    	school.setbyname("gradplus", schooldata.gradplus, true);
    }

	// Federal Total Loan
	schooldata.federaltotal = schooldata.perkins + schooldata.staffsubsidized + schooldata.staffunsubsidized + schooldata.gradplus;
	school.textbyname("federaltotal", schooldata.federaltotal);


	/*------- PRIVATE LOANS --------*/
	// Institution Loans
	schooldata.institutionalloan_max = schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized - schooldata.parentplus - schooldata.gradplus - schooldata.homeequity;
	if ( schooldata.institutionalloan_max < 0 ) {
		schooldata.institutionalloan_max = 0;
	}
	if (schooldata.institutionalloan > schooldata.institutionalloan_max) {
		schooldata.institutionalloan = schooldata.institutionalloan_max;
	}
	school.setbyname("institutionalloan", schooldata.institutionalloan, true);

	// Institutional Loan Rate
	if ( schooldata.institutionalloanrate == 0) {
		schooldata.institutionalloanrate = global.institutionalloantratedefault;
	}
	if ( schooldata.institutionalloanrate > .2 ) {
		schooldata.institutionalloanrate = .2;
	}
	if ( schooldata.institutionalloanrate < .01 ) {
		schooldata.institutionalloanrate = .01;
	}
	loantext = ( Math.round(schooldata.institutionalloanrate * 1000) / 10 ) + "%";
	school.find("[data-nickname='institutionalloanrate']").val(loantext);


	schooldata.privateloan_max = schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized - schooldata.institutionalloan - schooldata.gradplus;
	if ( schooldata.privateloan_max < 0 ) {
		schooldata.privateloan_max = 0;
	}
	if (schooldata.privateloan > schooldata.privateloan_max) {
		schooldata.privateloan = schooldata.privateloan_max;
	}
	school.setbyname("privateloan", schooldata.privateloan, true);

	// Private Loan Rate
	if ( schooldata.privateloanrate == 0) {
		schooldata.privateloanrate = global.privateloanratedefault;
	}
	if ( schooldata.privateloanrate > .2 ) {
		schooldata.privateloanrate = .2;
	}
	if ( schooldata.privateloanrate < .01 ) {
		schooldata.privateloanrate = .01;
	}
	loantext = ( Math.round(schooldata.privateloanrate * 1000) / 10 ) + "%";
	school.find("[data-nickname='privateloanrate']").val(loantext);

	// Private Loan Total
	schooldata.privatetotal = schooldata.privateloan + schooldata.institutionalloan;
	school.textbyname("privatetotal", schooldata.privatetotal, true);

	// gap
	schooldata.gap = schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized - schooldata.workstudy - schooldata.savings - schooldata.family - schooldata.state529plan - schooldata.privateloan - schooldata.institutionalloan - schooldata.parentplus - schooldata.homeequity;
	if ( schooldata.gap < 0 ) {
		schooldata.gap = 0;
	} 

	/* --- Loan Calculation -- */
	// Borrowing Total
	schooldata.borrowingtotal = schooldata.privatetotal + schooldata.federaltotal;
	school.textbyname("borrowingtotal", schooldata.borrowingtotal);

	// Out of Pocket Total
	schooldata.totaloutofpocket = schooldata.grantstotal + schooldata.savingstotal;

	// Money for College Total
	schooldata.moneyforcollege = schooldata.totaloutofpocket + schooldata.borrowingtotal;
	school.textbyname("moneyforcollege", schooldata.moneyforcollege);
	
	// remainingcost -- "Left to Pay"
	schooldata.remainingcost = schooldata.firstyrnetcost - schooldata.totaloutofpocket;
	if ( schooldata.remainingcost < 0 ) {
		schooldata.remainingcost = 0;
	}
	school.textbyname("remainingcost", schooldata.remainingcost);
	
	// loandebt1yr -- "Estimated Total Borrowing"
		schooldata.loandebt1yr = schooldata.perkins + schooldata.staffsubsidized + schooldata.staffunsubsidized + schooldata.gradplus + schooldata.privateloan + schooldata.institutionalloan + schooldata.parentplus + schooldata.homeequity;
		//school.textbyname("loandebt1yr", schooldata.loandebt1yr);

	// Borrowing over cost of attendance
	schooldata.overborrowing = 0;
	if ( schooldata.firstyrcostattend < ( schooldata.outofpockettotal + schooldata.borrowingtotal ) ) {
		schooldata.overborrowing = schooldata.borrowingtotal + schooldata.outofpockettotal - schooldata.firstyrcostattend;
	}

	// Estimated Debt Calculation
	// Perkins debt at graduation
	schooldata.perkinsgrad = schooldata.perkins * schooldata.prgmlength;

	// Direct Subsidized Loan with 1% Origination Fee
	schooldata.staffsubsidizedwithfee = schooldata.staffsubsidized * global.dloriginationfee;

	// Subsidized debt at graduation
	schooldata.staffsubsidizedgrad = schooldata.staffsubsidizedwithfee * schooldata.prgmlength;

	// Direct Unsubsidized Loan with 1% Origination Fee
	schooldata.staffunsubsidizedwithfee = schooldata.staffunsubsidized * global.dloriginationfee;

    // Unsubsidized debt at graduation
    schooldata.staffunsubsidizedgrad = (schooldata.staffunsubsidizedwithfee  * schooldata.unsubsidizedrate / 12 * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * global.deferperiod)) + (schooldata.staffunsubsidizedwithfee  * schooldata.prgmlength));

	// Grad Plus with origination
	schooldata.gradpluswithfee = schooldata.gradplus * global.plusoriginationfee;

	// Grad Plus debt at graduation
	schooldata.gradplusgrad = (schooldata.gradpluswithfee * global.gradplusrate  / 12 * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * global.deferperiod)) + (schooldata.gradpluswithfee * schooldata.prgmlength));
	
	// Parent Plus Loans with origination fees
	schooldata.parentpluswithfee = schooldata.parentplus * global.plusoriginationfee;

	// Parent Plus Loans at graduation
	schooldata.parentplusgrad = schooldata.parentpluswithfee * schooldata.prgmlength;

    // Private Loan debt at graduation
    schooldata.privateloangrad = (schooldata.privateloan * schooldata.privateloanrate / 12  * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * global.deferperiod)) + (schooldata.privateloan * schooldata.prgmlength));

    // Institutional Loan debt at graduation
    schooldata.institutionalloangrad =  (schooldata.institutionalloan * schooldata.institutionalloanrate  / 12 * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * global.deferperiod)) + (schooldata.institutionalloan * schooldata.prgmlength));
	
	// Home Equity Loans at graduation
	schooldata.homeequitygrad =
		(schooldata.homeequity * .079 / 12 * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12)));

	// Debt after 1 yr
	schooldata.loandebt1yr = schooldata.perkins + schooldata.staffsubsidized + schooldata.staffunsubsidized + schooldata.gradplus + schooldata.privateloan + schooldata.institutionalloan + schooldata.parentplus + schooldata.homeequity;
	//school.textbyname("loandebt1yr", schooldata.loandebt1yr);

	// Total debt at graduation
	schooldata.totaldebtgrad = schooldata.perkinsgrad + schooldata.staffsubsidizedgrad + schooldata.staffunsubsidizedgrad + schooldata.gradplusgrad + schooldata.parentplusgrad + schooldata.privateloangrad + schooldata.institutionalloangrad + schooldata.homeequitygrad;
	school.textbyname("totaldebtgrad", schooldata.totaldebtgrad, true );

	// repayment term
	if ( schooldata.repaymentterminput == "10 years") { 
		schooldata.repaymentterm = 10;
	} 
	else if ( schooldata.repaymentterminput == "20 years") {
		schooldata.repaymentterm =  20; 
	}
	else {
		schooldata.repaymentterm = 10;
	}
	
	// loanmonthly - "Monthly Payments"
	schooldata.loanmonthly =
	( schooldata.perkinsgrad * ( global.perkinsrate / 12 ) / ( 1 - Math.pow((1 + global.perkinsrate / 12), ( -schooldata.repaymentterm * 12 ) ) ) )
		+ (schooldata.staffsubsidizedgrad 
			* (global.subsidizedrate / 12) / (1 - Math.pow((1 + global.subsidizedrate / 12), (-schooldata.repaymentterm * 12))))
		+ (schooldata.staffunsubsidizedgrad 
			* (schooldata.unsubsidizedrate / 12) / (1 - Math.pow((1 + schooldata.unsubsidizedrate / 12), (-schooldata.repaymentterm  * 12))))
		+ (schooldata.gradplusgrad * (global.gradplusrate / 12) / (1 - Math.pow((1 + global.gradplusrate /12), (-schooldata.repaymentterm * 12))))
		+ (schooldata.privateloangrad * (schooldata.privateloanrate / 12) / (1 - Math.pow((1 + schooldata.privateloanrate /12), (-schooldata.repaymentterm * 12))))
		+ (schooldata.institutionalloangrad 
			* (schooldata.institutionalloanrate / 12) / (1 - Math.pow((1 + schooldata.institutionalloanrate /12), (-schooldata.repaymentterm * 12))));
	school.textbyname("loanmonthly", schooldata.loanmonthly);
	
	// loanmonthlyparent
	schooldata.loanmonthlyparent = (schooldata.parentplus * (global.parentplusrate / 12) / (Math.pow(1 - (1 + global.parentplusrate / 12), (-schooldata.repaymentterm * 12)))) + (schooldata.homeequity * (global.homeequityloanrate / 12) / (Math.pow(1 - (1 + global.homeequityloanrate / 12), (-schooldata.repaymentterm * 12))));
	
	// loanlifetime
	schooldata.loanlifetime = schooldata.loanmonthly * schooldata.repaymentterm  * 12;
	school.textbyname("loanlifetime", schooldata.loanlifetime, true);

	// salaryneeded
	schooldata.salaryneeded = schooldata.loanmonthly * 12 / 0.14;

	// Expected salary and Annual salary (educ lvl)
	if ( schooldata.program == "aa" ) {
		schooldata.salaryexpected25yrs = global.salaryaa * 52.1775;
	}
	else if ( schooldata.program == "ba" ) {
		schooldata.salaryexpected25yrs =  global.salaryba * 52.1775
	}
	else {
		schooldata.salaryexpected25yrs = global.salarygrad * 52.1775;
	}
	schooldata.salarymonthly = global.salary / 12;

	// Risk of Default
	if ( schooldata.salarymonthly != undefined ) {
		var default_rate_readable = " (" + Math.round(schooldata.defaultrate * 100) + "%)";
		if ( schooldata.loanmonthly == 0) {
			schooldata.riskofdefault = "None";
			school.find("[data-nickname='debtburden']").closest("td").css("background-position", "25px 0px");
		}
		else if ( schooldata.loanmonthly <= ( schooldata.salarymonthly * global.lowdefaultrisk ) ) {
			schooldata.riskofdefault =  "Low";
			school.find("[data-nickname='debtburden']").closest("td").css("background-position", "25px -60px");
		}
		else if ( schooldata.loanmonthly <= ( schooldata.salarymonthly * global.meddefaultrisk ) ) {
			schooldata.riskofdefault = "Medium";
			school.find("[data-nickname='debtburden']").closest("td").css("background-position", "25px -120px");
		}
		else {
			schooldata.riskofdefault = "High";
			school.find("[data-nickname='debtburden']").closest("td").css("background-position", "25px -180px");
		}
		school.find("[data-nickname='debtburden']").html(schooldata.riskofdefault);
	}
	else {
		school.find("[data-nickname='debtburden']").html("");
		school.find("[data-nickname='debtburden']").closest("td").css("background-position", "30% 60px");
	}
	// ---- School Indicators ---- //
	// Comparative Graduation Rate
	if (schooldata.gradrate == "NR") {
		schooldata.gradrisk = "Not Reported";
	}
	else if ( schooldata.indicatorgroup != undefined ) {
		var i = schooldata.indicatorgroup;
		if ( schooldata.gradrate >= global["group" + i + "gradhigh"] ) {
			schooldata.gradrisk = "Better than Average";
		}
		else if ( schooldata.gradrate >= global["group" + i + "	"] ) {
			schooldata.gradrisk = "About Average";
		}
		else {
			schooldata.gradrisk = "Worse than Average";
		}
	}
	if ( ( schooldata.gradrisk == "" ) || ( schooldata.gradrisk == undefined ) ) {
		schooldata.gradrisk = "<em>Not Available</em>";
	}
	// school.find(".gradrisk-text").html(schooldata.gradrisk);

	// Comparative Cohort Default Rate %
	if ( schooldata.defaultrate != undefined ) {
		if (schooldata.defaultrate == "NR") {
			schooldata.defaultrisk = "Not Reported";
		}
		else if (schooldata.defaultrate < global.cdravg) {
			schooldata.defaultrisk = "Better than Average";
		} 
		else if (schooldata.defaultrate == global.cdravg) {
			schooldata.defaultrisk = "About Average";
		} 
		else {
			schooldata.defaultrisk = "Worse than Average";
		}		
	}
	if ( ( schooldata.defaultrisk == "" ) || ( schooldata.defaultrisk == undefined ) ) {
		schooldata.defaultrisk = "<em>Not Available</em>";
	}

	// Comparative Average Student Loan
	if (schooldata.avgstuloandebt == "NR") {
		schooldata.loandebtrisk = "Not Reported";
	}
	else if ( schooldata.indicatorgroup != undefined ) {
		var i = schooldata.indicatorgroup;
		if ( schooldata.avgstuloandebt <= global["group" + i + "loanmed"] ) {
			schooldata.loandebtrisk = "Better than Average";
		}
		else if ( schooldata.avgstuloandebt <= global["group" + i + "loanhigh"] ) {
			schooldata.loandebtrisk = "About Average";
		}
		else {
			schooldata.loandebtrisk = "Worse than Average";
		}
	}
	if ( ( schooldata.loandebtrisk == "" ) || ( schooldata.loandebtrisk == undefined ) ) {
		schooldata.loandebtrisk = "<em>Not Available</em>";
	}
	// school.find(".median-borrowing-text").html(schooldata.loandebtrisk);

	// Get the most expensive sticker price (for chart width histogram)
	if (false === true) {
		$(".school").each(function() {
			var column = $(this).find("[data-column]").attr("data-column");
			draw_the_bars(column);
		});
	}
	else {
		draw_the_bars(column);
	}	

	left_to_pay = schooldata.gap;

	if (left_to_pay < 1){
		school.find("[data-nickname='gap']").text( "$0" );
		if ( ( schooldata.firstyrcostattend > 0 ) && ( global.reached_zero == 0 ) ) {
			if ( schools_zeroed[school_id] == undefined ) {
				_gaq.push(["_trackEvent", "School Interactions", "Reached Zero Left to Pay", school_id]);
				schools_zeroed[school_id] = true;
			}
		}
	}
	else {
		school.find("[data-nickname='gap']").text(num_to_money(left_to_pay));
	}

	school.check_max_alert();

} // end calculate_school()

// check_max_alert - Check fields against their maximums, changes input color if above max
jQuery.fn.check_max_alert = function() {
	/*
	var school_id = $(this[0]).attr("id");
	var schooldata = schools[school_id];
	$(this).find("input").each(function() { // Check each field against its maximum
		schooldata[$(this).attr("name")] = money_to_num($(this).val()); // get value
		var name = $(this).attr("name");
		var comp = schooldata[name]; 
		var max = schooldata[name + "_max"];
		if (max != undefined) {
			if (comp > max) {
				$(this).css("background-color", input_bg_error);
			}
			else {
				$(this).css("background-color", input_bg_default);
			}
		}
	});	
*/
}

// draw_the_bars - Redraw the bar graphs for the specified .school element
function draw_the_bars(column) {
	var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
	var school = $("[data-column='" + column + "']");
	var schooldata = schools[school_id];
	var chart_width = $("#institution-row [data-column='1']").width();
	var cost = money_to_num(school.find("[data-nickname='firstyrcostattend']").html());
	var pixel_price = chart_width / cost;
	var left = 0;

	// Set section_width
	var total_section_width = 0;
	var total_borrowed_section_width = 0;
	var total_outofpocket_section_width = 0;

	school.find(".bars-container").width(chart_width);

	if ( cost <= 0 ) {
		school.find(".meter").hide();
	}
	else {
		school.find(".meter").show();
		// find each .bar element and determine its width, then animate
		school.find(".bars-container").each(function() {
			var remaining_width = chart_width;
			$(this).find(".chart_mask_internal .bar").each(function() {
				var bar = $(this);
				var name = bar.attr("data-nickname");
				var value = schooldata[name];
				var section_width = Math.floor(value * pixel_price);
				if ( section_width > remaining_width ) {
					section_width = remaining_width;
				}
				if (section_width < minimum_chart_section_width) {
					section_width = 0;
					bar.stop(true, false).animate({width: 0}, transition_time, function() {
						bar.hide();
					});
				}
				else {
					bar.stop(true, false).animate({width: (section_width)}, transition_time);
				}

				if ( section_width != 0) {
					bar.show();
					total_section_width += section_width;
					if ( $(this).hasClass("fedloans") || $(this).hasClass("privloans") ){					
						total_borrowed_section_width += section_width;
					}
					else {
						total_outofpocket_section_width += section_width;
					}
				}
				else {
					bar.hide();
				}
				remaining_width -= section_width;
				if ( remaining_width < 0 ) {
					remaining_width = 0;
				}
			});
			if ((total_outofpocket_section_width + total_borrowed_section_width) > chart_width) {
				// school.find(".error_msg").fadeIn(400);
				// This code will resize the bar past the width of the total cost
				// school.find(".bars-container").width(total_outofpocket_section_width + total_borrowed_section_width);
				// marginright = (total_outofpocket_section_width + total_borrowed_section_width) - chart_width;
				// school.find(".tick.full").css("left", chart_width - 2 );
			}
			else {
				// school.find(".bars-container").width(chart_width);
				school.find(".error_msg").fadeOut(400);
			}
		});

	    // Borrowing Bar
	    school.find('.bar.borrowing').css("width", (total_borrowed_section_width));

	    left = 0 + total_outofpocket_section_width;
	    if ( left < 1 ) {
	    	// uncomment this line and the "total borrowed" will not float beyond the cost bar
	    	left = 0;
	    }
	    school.find(".bar.borrowing").css("left", left);
	    school.find(".bar.borrowing").css("width", total_borrowed_section_width);
	    school.find(".tick-borrowing").css("left", total_borrowed_section_width + left - 2);
	    school.find(".totalborrowing").css("padding-left", left);

	    if ( total_borrowed_section_width < 1 ) {
	        // school.find('.borrowing-container').hide(transition_time);
	        // Hiding borrowing section for now
	        school.find('.borrowing-container').hide();
	    }
	    else {
	        // school.find('.borrowing-container').show(transition_time);
	        // Hiding borrowing section for now
	        school.find('.borrowing-container').hide();
	    }
	    var breakdownheight = $(".meter").height();
	    school.find(".meter").closest("td").height(breakdownheight);
	}

    // Draw the pie chart

	$("#pie" + column).closest("td").children().show();
	var percentloan = Math.round( ( schooldata.loanmonthly / schooldata.salarymonthly ) * 100 );
    if ( percentloan > 100 ) {
    	percentloan = 100;
    }
    school.find(".payment-percent").html(percentloan + "%");
    var angle = percentloan / 100 * 2 * Math.PI;
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
	loans[column].attr("path", string);

} // end draw_the_bars()

function process_school_list(schools) {
	var op = "";
	$.each(schools, function(i, val) {
		op = op + i + "(" + val + ") ";
	});
	return op;
} // end process_school_list()

function school_search_results(query, column) {
	var dump = "";
	var qurl = "api/search-schools.json?q=" + query;
	var cell = $("#institution-row [data-column='" + column + "']");
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

// set_column_stage(column, stage)
//   where 'column' is the column number ([1,2,3], taken from the data-column attribute)
//     and 'stage' is the desired stage of the "Add a School" process

function set_column_stage(column, stage) {
	var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
	var school = $("[data-column='" + column + "']");

	// hide any '.staged' elements that do not match current stage; show others
	school.find(".staged").hide();
	school.find(".stage-" + stage).show();

	if (stage == 'default') {
		// 'default' is the starting state, where no windows are active and all values are default
		hide_column(column);
		// when the column is set to "default," we reset all form elements to their default.
		school.find(".search-results").hide();
		school.find(".school-search-box").val("");
		school.find(".program-select :radio").val("ba");
		school.find(".prgmlength-selection select").val("4");
		school.find("[data-nickname='xmlbukkit']").val("");
	}
	else {
		show_column(column);
		school.find(".staged.stage-default").hide()
	}
	if (stage == 'default' || stage == 'occupied') {
		school.find(".add-school-info").hide();
	}
	else {
		school.find(".add-school-info").show();
	}
}

/*----------------
	DOCUMENT.READY
--------------------*/

$(document).ready(function() {
	/* Notification for mobile screens */
	$("#pfc-notification-wrapper").hide();
    $("#pfc-notification-wrapper").delay(1500).slideDown(1000);

    $("#pfc-close-bar, #pfc-close-text").click(function() {
        $("#pfc-notification-wrapper").slideUp(1000);
    });
    
	/* --- Initialize Visualizations --- */
	// Pie Charts
	for (x = 1; x <= 3; x++ ) {
		pies[x] = Raphael($("#pie" + x)[0], 125, 125);
		pies[x].circle(62, 62, 50);
		circles[x] = pies[x].circle(62, 62, 50);
		circles[x].attr({fill: "Gray", stroke: "White", "stroke-width": 2});
		loans[x] = pies[x].path("M 62 62");
		loans[x].attr({fill: "Red", stroke: "White", "stroke-width": 2});	
	}

	// Default Rate Bars
	for (x = 1; x <= 3; x++ ) {
		bars[x] = Raphael($("#defaultbars" + x)[0], 200, 100);
		var bottomline = bars[x].path("M 0 100 L 200 100");
		bottomline.attr({"stroke": "#585858", "stroke-width": 3})
		averagebars[x] = bars[x].rect(120, 50, 60, 50);
		averagebars[x].attr({"fill":"#585858", "stroke": "#585858"});
		defaultbars[x] = bars[x].rect(20, 100, 60, 0);
		defaultbars[x].attr({"fill":"#585858", "stroke": "#585858"});
	}

	// Borrowing meter
	for (x = 1; x <= 3; x++ ) {
		meters[x] = Raphael($("#meter" + x)[0], 200, 100);
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
		$(this).closest('.arrw').toggleClass('arrw-collapse');
	});
	$('.private').click(function() {
		$('.private-row').toggleClass('tr-hide');
		$(this).closest('.arrw').toggleClass('arrw-collapse');
	});
	$('.contributions').click(function() {
		$('.contrib-row').toggleClass('tr-hide');
		$(this).closest('.arrw').toggleClass('arrw-collapse');
	});


	/* -----------
		"Add a school" user interface
	----------- */

	// User clicks "Add a School"
	$(".add-a-school").click( function() {
		var column = 0;
		column = $(this).closest("[data-column]").attr("data-column");
		set_column_stage(column, "search");
		$(".add-school-info").css("height", "100%");
		return false;
	});

	// User has typed into the school-search input - perform search and display results
	$(".add-school-info").on("keyup", ".school-search-box", function (ev) {
		var query = $(this).val();
		var column = $(this).closest("[data-column]").attr("data-column");
		$("#institution-row [data-column='" + column + "'] .search-results").show();
		$("#institution-row [data-column='" + column + "'] .search-results").html("<li><em>Searching...</em></li>");
		delay(function() {
			if ( query.length > 2 ) {
				school_search_results(query, column);
			}
			else {
				var msg = "<li><p>Please enter at least three letters to search.</p></li>"
				$("#institution-row [data-column='" + column + "'] .search-results").html(msg);
			}
		}, 500);
	});

	// User clicks on a school from the search-results list
	$(".add-school-info .search-results").on("click", ".school-result a", function(event) {
		event.preventDefault();
		var headercell = $(this).closest("[data-column]");
		var column = headercell.attr("data-column");
		var school_id = $(this).attr("href");
		headercell.attr("data-schoolid", school_id);

		// AJAX the schooldata
		var schooldata = new Object();
		var surl = "api/school/" + school_id + ".json";
		var request = $.ajax({
			async: false,
			dataType: "json",
			url: surl
		});
		request.done(function(response) {
			$.each(response, function(i, val) {
				i = i.toLowerCase();
				if (schooldata[i] == undefined) {
					schooldata[i] = val;
				}
			});
		});
		request.fail(function() {
			// Your fail message here.
		});	
		schools[school_id] = schooldata;
		set_column_stage(column, "program");
	});

	// User clicks "Add average public"
	$(".add-school-info .add-average-public").click( function (ev) {
		schools["average-public"] = presets["average-public"];
		var column = $(this).closest("[data-column]").attr("data-column");
		$("#institution-row [data-column='" + column + "']").attr("data-schoolid", "average-public");
		build_school_element(column);
		set_column_stage(column, "occupied");
		calculate_school(column);
		$(".add-average-public").hide();
	});

	// User clicks "Add average private"
	$(".add-school-info .add-average-private").click( function (ev) {
		schools["average-private"] = presets["average-private"];
		var column = $(this).closest("[data-column]").attr("data-column");
		$("#institution-row [data-column='" + column + "']").attr("data-schoolid", "average-private");
		build_school_element(column);
		set_column_stage(column, "occupied");
		calculate_school(column);
		$(".add-average-private").hide();
	});

	// User clicks Continue at the Program Selection ("program") stage
	$(".add-school-info .program-selection .continue").click( function() {
		var column = $(this).closest("[data-column]").attr("data-column");
		set_column_stage(column, "prgmlength");
	});

	// User clicks Continue at the Program Length ("prgmlength") stage
	$(".add-school-info .prgmlength-selection .continue").click( function() {
		var headercell = $(this).closest("[data-column]");
		var column = headercell.attr("data-column");
		var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
		var schooldata = schools[school_id];
		if ( schooldata.kbyoss == "TRUE") {
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
		var schooldata = schools[school_id];
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
		var schooldata = schools[school_id];

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
			schooldata.books = money_to_num(json.costs.books_and_supplies);
			schooldata.roombrd = money_to_num(json.costs.housing_and_meals);
			schooldata.otherexpenses = money_to_num(json.costs.other_education_costs);
			schooldata.transportation = money_to_num(json.costs.transportation);
			schooldata.tuitionfees = money_to_num(json.costs.tuition_and_fees);			
		}
		if ( json.grants_and_scholarships != undefined ) {
			schooldata.pell = money_to_num(json.grants_and_scholarships.federal_pell_grant);
			// other scholarships & grants comprises several json data
			schooldata.scholar = money_to_num(json.grants_and_scholarships.grants);
			schooldata.scholar += money_to_num(json.grants_and_scholarships.grants_from_state);
			schooldata.scholar += money_to_num(json.grants_and_scholarships.other_scholarships);
		}
		if ( json.loan_options != undefined ) {
			schooldata.staffsubsidized = money_to_num(json.loan_options.federal_direct_subsidized_loan);
			schooldata.staffunsubsidized = money_to_num(json.loan_options.federal_direct_unsubsidized_loan);
			schooldata.perkins = money_to_num(json.loan_options.federal_perkins_loans);
		}
		if ( json.other_options != undefined ) {
			schooldata.family = money_to_num(json.other_options.family_contribution);
		}
		if ( json.work_options != undefined ) {
			schooldata.workstudy = money_to_num(json.work_options.work_study);
		}

		for (key in schooldata) {
			if ( schooldata[key] == undefined ) {
				schooldata[key] = 0;
			}
		}

		school.find("input.school-data").each(function() {
			if ( $(this).hasClass("interest-rate") ) {
				var interest = schooldata[$(this).attr("data-nickname")] * 100;
				interest = Math.round( interest * 10) / 10;
				$(this).val( interest + "%") ;
			}
			else {
				$(this).val( num_to_money( schooldata[$(this).attr("data-nickname")] ) ) ;
			}
		});

		schools[school_id] = schooldata;

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
		if ( school_id == "average-public" ) {
			$(".add-average-public").show();
		}
		if ( school_id == "average-private" ) {
			$(".add-average-private").show();
		}
		$("#institution-row [data-column='" + column + "']").attr("data-schoolid", "");
		hide_column(column);
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
		if ( ( school_id != "average-private" ) && ( school_id != "average-public" ) ) {
			var panel = $("[data-column='" + column + "'] .gibill-panel");
			if ( panel.is(":hidden") ) {
				_gaq.push(["_trackEvent", "School Interactions", "GI Bill Calculator Opened", school_id]);
			}		
			panel.toggle();
		}
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
		calculate_school(column);
	});

	/* ----------------
		"Real-time" calculations
	--------------------- */

	// Perform a calculation when the user blurs inputs
	$("#comparison-tables").on("blur", "input.school-data", function (ev) {
		var column = $(this).closest("[data-column]").attr("data-column");
		var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
		calculate_school(column);
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
		var school = $("[data-column='" + column + "']");
		var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
		var value = money_to_num($(this).val());
		if ( $(this).hasClass("interest-rate") ) {
			value = value / 100;
		}
		var name = $(this).attr("data-nickname");
		// ...immediately when the user hits enter
		if (ev.keyCode == 13) {
			ev.preventDefault();
			calculate_school(column);
			return false;
		}
		// .. after a delay if any other key is pressed
		school.check_max_alert();
		delay(function() {
			if ( schools[school_id][name] != value ) {
				calculate_school(column);
			}
			/*
			if (ev.which >= 48 && ev.which <= 105) {
				calculate_school(column);
			}
			*/
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
	set_column_stage(1, "default");
	set_column_stage(2, "default");
	set_column_stage(3, "default");
	$("#institution-row [data-column='1']").attr("data-schoolid", "average-public");
	schools["average-public"] = presets["average-public"];
	build_school_element(1);
	$(".add-average-public").hide();

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

});


