/*	Rewrite by wernerc */

/* A few default settings: */

var data = 
	{
	"global": // see GLOBALS.txt for descriptions of the parameters
		{"aaprgmlength": 2, "yrincollege": 1, "vet": false, "serving": "no", "program": "ba",
		"tier": 100, "gradprgmlength": 2, "familyincome": 48, "most_expensive_cost": 50000, "salary": 30922,
		"transportationdefault": 0, "roombrdwfamily": 0, "pellcap": 5500, "perkinscap": 5000,
		"subsidizedcapyr1": 3500, "subsidizedcapyr2": 4500, "subsidizedcapyr3": 5500, 
		"unsubsidizedcapyr1": 5500, "unsubsidizedcapyr2": 6500, "unsubsidizedcapyr3": 7500,
		"unsubsidizedcapindepyr1": 9500, "unsubsidizedcapindepyr2": 10500, "unsubsidizedcapindepyr3": 12500, 
		"unsubsidizedcapgrad": 20500, "state529plan": 0, "perkinsrate": 0.05, "subsidizedrate": 0.034, 
		"unsubsidizedrate": 0.068, "dloriginationfee": 1.01, "gradplusrate": 0.079, 
		"parentplusrate": 0.079, "plusoriginationfee": 1.04, "privateloanratedefault": 0.079, 
		"institutionalloantratedefault":0.079, "homeequityloanrate": 0.079, "deferperiod": 6, "salary": 30922, 
		"salaryaa": 785, "salaryba": 1066, "salarygrad": 1300, "lowdefaultrisk": 0.08, "meddefaultrisk": 0.14, 
		"group1gradmed": 37.3, "group1gradhigh": 56.7, "group2gradmed": 17.7, "group2gradhigh": 32.2,
		"group3gradmed": 24.1, "group3gradhigh": 50.1, "group4gradmed": 0, "group4gradhigh": 0, 
		"group5gradmed": 62.5, "group5gradhigh": 77.6, "cdrhigh": 100, "cdravg": 13.4, "cdrlow": 0.0, 
		"group1loanmed": 14000, "group1loanhigh": 20000, "group2loanmed": 6800, "group2loanhigh": 15000, 
		"group3loanmed": 6800, "group3loanhigh": 15000, "group4loanmed": 14000, "group4loanhigh": 20000, 
		"group5loanmed": 6800, "group5loanhigh": 15000, "tfcap": 18077, "avgbah": 1368, "bscap": 1000, 
		"tuitionassistcap": 4500, "kicker": 0, "yrben": 0, "rop": 1 
		},
	"presets" : {
		"average-public" :
			{"school":"Average Public 4-Year University", "tuitionfees": 8244, "roombrd": 8887,
			 "books": 1168, "transportation": 1082, "otherexpenses": 2066, "active": false,
			 "school_id": "average-public" },
		"average-private" :
			{"school":"Average Private 4-Year University", "tuitionfees": 28500, "roombrd": 10089,
			 "books": 1213, "transportation": 926, "otherexpenses": 1496, "active": false,
			 "school_id": "average-private" }
	}
};
 
// Determine if global data exists
if (data.global != "undefined") {
	global = data.global;
}
else {
	/*	If globals can't be loaded from the database, there ought to be
		some error handling. The application can still run without data, so a database failure
		shouldn't put it out of commission -wernerc */
}
var schools = data.presets;

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

function set_by_name(col_num, name, value) {
	var school_id = $("#comparison-tables #institution-row th:eq(" + col_num + ") h2").attr("id");
	var schooldata = schools[school_id];
	element = $("#comparison-tables td:eq(" + col_num + ") [name='" + name + "']");
	element.val(num_to_money(value));
}

jQuery.fn.setbyname = function(name, value, overwrite) {
	var school_id = $(this).find("[name='institutionname']").attr("id");
	var schooldata = schools[school_id];
	var element = $(this).find("[name='" + name +"']");

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
	var school_id = $(this).find("[name='institutionname']").attr("id");
	var schooldata = schools[school_id];
	var element = $(this).find("[name='" + name +"']");

	element.text(num_to_money(value));
	return false;
};

// exists - a simple way to determine if any instance of an element matching the selector exists
jQuery.fn.exists = function() {
	return this.length > 0;
}

// Hide a column so that "add a school" box looks better
function hide_column(col_num) {
	var column = $("[data-column='" + col_num + "']");
	column.each( function() {
		$(this).children().not(".add-a-school").hide();
		$(this).children(".add-a-school").show();
	});
}

// Show a column!
function show_column(col_num) {
	var column = $("[data-column='" + col_num + "']");
	column.each( function() {
		$(this).children().not(".hidden-box").show();
	});	
}


function fade_header() {
	var window_scroll = $(this).scrollTop();
	var table_top = $("#first-year-costs").offset().top;
	var headheight = $("#comparison-tables table > thead > tr").height();
	if (window_scroll < ( table_top - headheight ) ) {
		$('#comparison-tables table > thead > tr').removeClass('fixed');
	}
	else {
		$("#comparison-tables table > thead > tr").addClass('fixed');
	}

	var theight = $('table > thead > tr').height();
	var coffset = $('.contributions').offset().top - 500;
	if ( ( window_scroll > theight ) && ( window_scroll < coffset ) ) {
		$('.breakdown').addClass('fixed');
	}
	else {
		$('.breakdown').removeClass('fixed');
	}
}

function fix_widths() {
	var totalwidth = $("#comparison-tables").width();
	$(".width-holder").css("min-width", "25%");
	$(".fixed th").css("min-width", "25%");
}



// Fill in a column with the school's data
// school's data must be in the schools object first
function build_school_element(school_id) {
	var column = $("#" + school_id).attr("data-column");
	var school = $("[data-column='" + column + "']");
	school.find(".add-a-school").hide();
	school.find(".add-school-info").hide();
	school.find(".add-school-info input").val("");
	school.find(".search-results").html("");

	show_column(column);
	if (schools[school_id] != undefined) {
		var schooldata = schools[school_id];
	}
	else {
		return false;
	}

	// Set the data within the element
	school.find('[name="institutionname"]').text(schooldata.school);
	school.find("input.school-data").not(".interest-rate").val("$0");
	school.find("input[name='institutionalloanrate']").val(global.institutionalloantratedefault * 100 + "%");
	school.find("input[name='privateloanrate']").val(global.privateloanratedefault * 100 + "%");
	// Currently, we're not using schooldata from the database
	// As such, the following is only used for average schools
	if ( ( schooldata.school_id == "average-public" ) || ( schooldata.school_id == "average-private" ) ) {
		for (key in schooldata) {
		    school.find('input[name="' + key + '"]').val(schooldata[key]);
		}		
	}

	calculate_school(school_id);
}

function remove_school(school_id) {
	var column = $("#" + school_id).attr("data-column");
	var school = $("[data-column='" + column + "']");
	school.find(".add-a-school").show();

	hide_column(column);
}

/*----------
	CALCULATION FUNCTIONS
-----------*/

// calculate_school(school_id) - Calculate the numbers for a particular school
function calculate_school(school_id) {
	var column = $("#" + school_id).attr("data-column");
	var school = $("[data-column='" + column + "']");
	var schooldata = schools[school_id];

	// Supplement/replace data with customized fields
	school.find("input.school-data").each(function() {
		schooldata[$(this).attr("name")] = money_to_num($(this).val());
		if ( $(this).hasClass("interest-rate") ) {
			schooldata[$(this).attr("name")] = ( money_to_num( $(this).val() ) / 100 );
		}
	});

	// Get program type and length
	schooldata.program = school.find(".program").val();
	if ( schooldata.program == undefined ) {
		schooldata.program = "ba";
	}
	schooldata.prgmlength = school.find(".prgmlength").val();
	if ( schooldata.prgmlength == undefined ) {
		if (schooldata.program == "ba") {
			schooldata.prgmlength = 4
		}
		else if (schooldata.program == "aa") {
			schooldata.prgmlength = 2;
		}
		else {
			schooldata.prgmlength = 2;
		}
	}

	// For calculations, add transportation and otherexpenses into personalcosts

	schooldata.personal = schooldata.transportation + schooldata.otherexpenses;

	// global.depend?
	global.depend = false;

	// Set undergrad
	if ( ( schooldata.program == "ba" ) || ( schooldata.program == "aa" ) ) {
		schooldata.undergrad = true;
	}
	else {
		school.undergrad = false;
	}

	// tf in-state rate prepopulate (schooldata.tfinsprep)
	if ( ( schooldata.control =="public" ) && ( schooldata.program="grad" ) ) {
		schooldata.tfinstate = schooldata.tuitiongradins;
	}
	else {
		schooldata.tfinstate = schooldata.tuitionunderins;
	}


	// Settings for first release
	schooldata.program = "ba";

	// Unused (but required) variables
	schooldata.homeequity = 0;
	schooldata.parentplus = 0;
	schooldata.gradplus = 0;

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
	school.find('[name="firstyrcostattend"]').text( num_to_money( schooldata.firstyrcostattend ) );

	/*------- SCHOLARSHIPS & GRANTS --------*/
	// Pell Grants
	if ( global.pellcap < schooldata.firstyrcostattend ) {
		schooldata.pell_max = global.pellcap;
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
	var instate = $("[data-column='" + column + "'] [name='military-residency']").val();
	if ( ( instate === "instate" ) || ( instate === "indistrict" ) ) {
		schooldata.instate = true;
	}
	else {
		schooldata.instate = false;
	}
	// Set the instate in the military panel if it's blank
	if ( school.find("[name='military-instate-tuition']").val() == "") {
		school.find("[name='military-instate-tuition']").val(schooldata.tfinstate);
	}
	// Now set schooldata.tuitionunderins to the value in "in-state tuition"
	schooldata.tuitionunderins = school.find("[name='military-instate-tuition']").val();

	// Determine if global.vet is true or false:
	if ($("[data-column='1'] [name='military-status']").val() != "none") {
		global.vet = true;
	}
	else {
		global.vet = false;
	}

	// Tuition & Fees benefits:
	if (global.vet === false) {
		schooldata.gibilltf = 0; 
	}
	else {
		 global.tier = $("[data-column='1'] .military-tier-select").find(":selected").val();
		// Calculate veteran benefits:		
		if ( ( schooldata.control == "Public" ) && ( schooldata.instate === true ) ) {
			schooldata.gibilltf = ( schooldata.tuitionfees - schooldata.scholar - schooldata.tuitionassist ) * global.tier;
			if ( schooldata.gibilltf < 0 ) {
				schooldata.gibilltf = 0;
			}
		}
		else if ( ( schooldata.control == "Public" ) && ( schooldata.instate === false ) ) {
			schooldata.gibilltf = schooldata.tfinstate + (global.yrben * 2) - schooldata.scholar - schooldata.tuitionassist;
			if ( schooldata.gibilltf < 0 ) {
				schooldata.gibilltf = 0;
			}
			if ( schooldata.gibilltf > schooldata.tuitionfees) {
				schooldata.gibilltf = schooldata.tuitionfees;
			}
			schooldata.gibilltf = schooldata.gibilltf * global.tier;
		}
		else { // School is not public
			schooldata.gibilltf = global.tfcap + (global.yrben * 2) - schooldata.scholar - schooldata.tuitionassist;
			if ( schooldata.gibilltf < 0 ) {
				schooldata.gibilltf = 0;
			}
			schooldata.gibilltf = schooldata.gibilltf * global.tier;
			if ( schooldata.gibilltf > schooldata.tuitionfees ) {
				schooldata.gibilltf = schooldata.tuitionfees
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
			schooldata.gibillla = 345 * 9;
		}
		else {
			if (schooldata.online == "Yes" ) {
				schooldata.gibillla = ( ( global.avgbah / 2 * global.tier ) + global.kicker ) * global.rop;
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
	school.setbyname("gibill", schooldata.gibill, true);

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

	/*------- FEDERAL LOANS --------*/
	// Perkins Loan

	schooldata.perkins_max = schooldata.firstyrcostattend - schooldata.pell;
	if ( schooldata.perkins_max < 0 ) {
		schooldata.perkins_max = 0;
	}
	if ( schooldata.perkins_max > global.perkinscap ) {
		schooldata.perkins_max = global.perkinscap;
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
		if (schooldata.program == "aa" || schooldata.yrincollege == 1) {
			schooldata.staffsubsidized_max = schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins;
			if ( schooldata.staffsubsidized_max < 0 ) {
				schooldata.staffsubsidized_max = 0;
			}
			if ( schooldata.staffsubsidized_max > schooldata.subsidizedcapyr1 ) {
				schooldata.staffsubsidized_max = schooldata.subsidizedcapyr1;
			}
		}
		else if (schooldata.yrincollege == 2) {
			schooldata.staffsubsidized_max = schooldata.firstyrcostattend - schooldata.perkins - schooldata.staffsubsidized;
			if ( schooldata.staffsubsidized_max < 0 ) {
				schooldata.staffsubsidized_max = 0;
			}
			if ( schooldata.staffsubsidized_max > ( schooldata.subsidizedcapyr2 - schooldata.staffsubsidized ) ) {
				schooldata.staffsubsidized_max = schooldata.subsidizedcapyr2 - schooldata.staffsubsidized ;
			}
		}
		else if (schooldata.yrincollege == 3) {
			schooldata.staffsubsidized_max = schooldata.firstyrcostattend - schooldata.perkins - schooldata.staffsubsidized;
			if ( schooldata.staffsubsidized_max < 0 ) {
				schooldata.staffsubsidized_max = 0;
			}
			if ( schooldata.staffsubsidized_max > ( schooldata.subsidizedcapyr3 - schooldata.staffsubsidized ) ) {
				schooldata.staffsubsidized_max = schooldata.subsidizedcapyr3 - schooldata.staffsubsidized ;
			}
		}
	}
	if (schooldata.staffsubsidized > schooldata.staffsubsidized_max){
		schooldata.staffsubsidized = schooldata.staffsubsidized_max;
	}
	schools[school_id].staffsubsidized_max = schooldata.staffsubsidized_max;
	school.setbyname("staffsubsidized", schooldata.staffsubsidized, true);

	//unsubsidized loan max for independent students
	if ( schooldata.undergrad == "false") { 
		schooldata.staffunsubsidizedindep_max = schooldata.firstyrcostattend- schooldata.perkins- schooldata.staffsubsidized;
		if ( schooldata.staffunsubsidizedindep_max < 0 ) {
			schooldata.staffunsubsidizedindep_max = 0;
		}
		if ( schooldata.staffunsubsidizedindep_max > global.unsubsidizedcapgrad ) {
			schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapgrad;
		}
	} 
	else {
		if ( ( schooldata.program == "aa" ) || ( schooldata.yrincollege == 1 ) ) { 
			schooldata.staffunsubsidizedindep_max = schooldata.firstyrcostattend - schooldata.perkins- schooldata.staffsubsidized;
			if ( schooldata.staffunsubsidizedindep_max < 0 ) {
				schooldata.staffunsubsidizedindep_max = 0;
			}
			if ( schooldata.staffunsubsidizedindep_max > ( global.unsubsidizedcapindepyr1 - schooldata.staffsubsidized ) ) {
				schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr1;
			}
		}
		else if ( schooldata.yrincollege == 2) { 
			schooldata.staffunsubsidizedindep_max = schooldata.firstyrcostattend - schooldata.perkins- schooldata.staffsubsidized;
			if ( schooldata.staffunsubsidizedindep_max < 0 ) {
				schooldata.staffunsubsidizedindep_max = 0;
			}
			if ( schooldata.staffunsubsidizedindep_max > ( global.unsubsidizedcapindepyr2 - schooldata.staffsubsidized ) ) {
				schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr2;
			}
		}
		else if ( schooldata.yrincollege == 3) { 
			schooldata.staffunsubsidizedindep_max = schooldata.firstyrcostattend - schooldata.perkins- schooldata.staffsubsidized;
			if ( schooldata.staffunsubsidizedindep_max < 0 ) {
				schooldata.staffunsubsidizedindep_max = 0;
			}
			if ( schooldata.staffunsubsidizedindep_max > ( global.unsubsidizedcapindepyr3 - schooldata.staffsubsidized ) ) {
				schooldata.staffunsubsidizedindep_max = global.unsubsidizedcapindepyr3;
			}
		}
	}

	// Unsubsidized Stafford Loans
	if ( global.depend == "dependent") {
		// schooldata.staffunsubsidized_max = schooldata.staffunsubsidizeddep_max;
	}
	else {
		// schooldata.staffunsubsidized_max = schooldata.staffunsubsidizedindep_max;
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

	// Federal Total Loan
	schooldata.federaltotal = schooldata.perkins + schooldata.staffsubsidized + schooldata.staffunsubsidized + schooldata.gradplus;
	school.textbyname("federaltotal", schooldata.federaltotal);


	/*------- PRIVATE LOANS --------*/
	schooldata.privateloan_max = schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized - schooldata.institutionalloan;
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
	school.find("[name='privateloanrate']").val( (schooldata.privateloanrate * 100) + "%");

	// gap
	schooldata.gap = schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized - schooldata.workstudy - schooldata.savings - schooldata.family - schooldata.state529plan - schooldata.privateloan - schooldata.institutionalloan - schooldata.parentplus - schooldata.homeequity;
	if ( schooldata.gap < 0 ) {
		schooldata.gap = 0;
	} 
	
	// Institution Loans
	schooldata.institutionalloan_max = schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized - schooldata.parentplus - schooldata.homeequity;
	if ( schooldata.institutionalloan < 0 ) {
		schooldata.institutionalloan = 0;
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
	school.find("[name='institutionalloanrate']").val((schooldata.institutionalloanrate * 100) + "%");

	// Private Loan Total
	schooldata.privatetotal = schooldata.privateloan + schooldata.institutionalloan;

	/* --- Loan Calculation -- */
	// Borrowing Total
	schooldata.borrowingtotal = schooldata.privatetotal + schooldata.federaltotal;
	school.textbyname("borrowingtotal", schooldata.borrowingtotal);
	school.setbyname("debtburden", schooldata.borrowingtotal);

	// Out of Pocket Total
	schooldata.totaloutofpocket = schooldata.grantstotal + schooldata.savingstotal;
	
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
    schooldata.staffunsubsidizedgrad = (schooldata.staffunsubsidizedwithfee  * global.unsubsidizedrate / 12 * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * global.deferperiod))) + (schooldata.staffunsubsidizedwithfee  * schooldata.prgmlength);

	// Grad Plus with origination
	schooldata.gradpluswithfee = schooldata.gradplus * global.plusoriginationfee;

	// Grad Plus debt at graduation
	schooldata.gradplusgrad = (schooldata.gradplus * global.gradplusrate  / 12 * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * global.deferperiod))) + (schooldata.gradplus * schooldata.prgmlength);
	
	// Parent Plus Loans with origination fees
	schooldata.parentpluswithfee = schooldata.parentplus * global.plusoriginationfee;

	// Parent Plus Loans at graduation
	schooldata.parentplusgrad = schooldata.parentpluswithfee * schooldata.prgmlength;

    // Private Loan debt at graduation
    schooldata.privateloangrad = (schooldata.privateloan * schooldata.privateloanrate / 12  * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * global.deferperiod))) + (schooldata.privateloan * schooldata.prgmlength);

    // Institutional Loan debt at graduation
    schooldata.institutionalloangrad =  (schooldata.institutionalloan * schooldata.institutionalloanrate  / 12 * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * global.deferperiod))) + (schooldata.institutionalloan * schooldata.prgmlength);
	
	// homeequitygrad - "Home Equity Loans, Graduate" (?)
	schooldata.homeequitygrad =
		(schooldata.homeequity * .079 / 12 * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12)));

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
			* (global.unsubsidizedrate / 12) / (1 - Math.pow((1 + global.unsubsidizedrate / 12), (-schooldata.repaymentterm  * 12))))
		+ (schooldata.gradplusgrad * (global.gradplusrate / 12) / (1 - Math.pow((1 + global.gradplusrate /12), (-schooldata.repaymentterm * 12))))
		+ (schooldata.privateloangrad * (schooldata.privateloanrate / 12) / (1 - Math.pow((1 + schooldata.privateloanrate /12), (-schooldata.repaymentterm * 12))))
		+ (schooldata.institutionalloangrad 
			* (schooldata.institutionalloanrate / 12) / (1 - Math.pow((1 + schooldata.institutionalloanrate /12), (-schooldata.repaymentterm * 12))));
	school.setbyname("loanmonthly", schooldata.loanmonthly);
	
	// loanmonthlyparent
	schooldata.loanmonthlyparent = (schooldata.parentplus * (global.parentplusrate / 12) / (Math.pow(1 - (1 + global.parentplusrate / 12), (-schooldata.repaymentterm * 12)))) + (schooldata.homeequity * (global.homeequityloanrate / 12) / (Math.pow(1 - (1 + global.homeequityloanrate / 12), (-schooldata.repaymentterm * 12))));
	
	// loanlifetime
	schooldata.loanlifetime = schooldata.loanmonthly * schooldata.repaymentterm  * 12;

	// salaryneeded
	schooldata.salaryneeded = schooldata.loanmonthly * 12 / 0.14;
	
	// salaryexpected25yrs
	if (schooldata.program == "aa") {
		schooldata.salaryexpected25yrs = global.salaryaa * 52.1775;
	}
	else if (schooldata.program == "ba") {
		schooldata.salaryexpected25yrs = global.salaryba * 52.1775;
	}
	else {
		schooldata.salaryexpected25yrs = global.salarygrad * 52.1775;
	}
	
	// salaryexpectedoccup
	schooldata.salaryexpectedoccup = schooldata.occupationsalary * 52;
	
	// riskofdefault
	school.find('[name="riskdefault_icon"]').removeClass("high").removeClass("medium").removeClass("low").removeClass("none");
	if (schooldata.loanmonthly == 0) {
		schooldata.riskofdefault = "none";
	}
	else if ((schooldata.loanmonthly * 12) <= global.salary * global.lowdefaultrisk) {
		schooldata.riskofdefault = "low";
	}
	else if ((schooldata.loanmonthly * 12) <= global.salary * global.meddefaultrisk) {
		schooldata.riskofdefault = "medium";
		school.find('[name="riskdefault_icon"]').addClass("medium");
		school.find('[name="riskdefault_text"]').text("Medium");
	}
	else {
		schooldata.riskofdefault = "high";
		school.find('[name="riskdefault_icon"]').addClass("high");
		school.find('[name="riskdefault_text"]').text("High");
	}

	// ---- School Indicators ---- //
	if (schooldata.gradrate == "NR") {
		schooldata.gradrisk = "Not Reported";
	}
	else if (schooldata.indicatorcateg == 3) {
		schooldata.loandebtrisk = "Worse than Average";
	}
	else if ( (schooldata.indicatorcateg == 4) && (schooldata.loanrate <= lobal.group4loanmed) )  {
		schooldata.loandebtrisk = "Better than Average";
	}
	else if ( (schooldata.indicatorcateg == 4) && (schooldata.loanrate <= global.group4loanhigh) )  {
		schooldata.loandebtrisk = "About Average";
	}	
	else if ( schooldata.indicatorcateg == 4 )  {
		schooldata.loandebtrisk = "Worse than Average";
	}
	else if ( (schooldata.indicatorcateg == 5) && (schooldata.loanrate <= global.group5loanmed) )  {
		schooldata.loandebtrisk = "Better than Average";
	}
	else if ( (schooldata.indicatorcateg == 5) && (schooldata.loanrate <= global.group5loanhigh) )  {
		schooldata.loandebtrisk = "About Average";
	}
	else if ( schooldata.indicatorcateg == 5 )  {
		schooldata.loandebtrisk = "Worse than Average";
	}



	//--- Risk factors ---//
	// Graduation Rate
	var grad_rate_readable = " (" + Math.round(schooldata.gradrate * 100) + "%)";
	
	if (!schooldata.gradrate){
		schooldata.gradrisk = "Unavailable";
		school.find('[name="gradrisk"]').removeClass("high").removeClass("low").removeClass("medium").addClass("unavailable");
		school.find('[name="gradrisk"] span').text("Unavailable");
		school.find(".gradriskpercent").text("");
	}
	else {
		school.find(".gradriskpercent").text(grad_rate_readable);
		if (schooldata.gradrate >= .58) {
			schooldata.gradrisk = "Low";
			school.find('[name="gradrisk"]').removeClass("unavailable").removeClass("high").removeClass("medium").addClass("low");
			school.find('[name="gradrisk"] span').text("Better than Average");
		}
		else if (schooldata.gradrate >= .38) {
			schooldata.gradrisk = "Medium";
			school.find('[name="gradrisk"]').removeClass("unavailable").removeClass("low").removeClass("high").addClass("medium");
			school.find('[name="gradrisk"] span').text("About Average");
		}
		else {
			schooldata.gradrisk = "High";
			school.find('[name="gradrisk"]').removeClass("unavailable").removeClass("low").removeClass("medium").addClass("high");
			school.find('[name="gradrisk"] span').text("Worse than Average");
		}
	}
	
	// Retention Rate
	var retent_rate_readable = " (" + Math.round(schooldata.retentrate * 100) + "%)";
	if (!schooldata.retentrate){
		schooldata.retentrisk = "Unavailable";
		school.find('[name="retentrisk"]').removeClass("high").removeClass("low").removeClass("medium").addClass("unavailable");
		school.find('[name="retentrisk"] span').text("Unavailable");
		school.find(".retentriskpercent").text("");
	}
	else {	
		school.find(".retentriskpercent").text(retent_rate_readable);
		
		if (schooldata.retentrate >= .78) {
			schooldata.retentrisk = "Better than Average";
			school.find('[name="retentrisk"]').removeClass("unavailable").removeClass("high").removeClass("medium").addClass("low");
			school.find('[name="retentrisk"] span').text("Better than Average");
		}
		else if (schooldata.retentrate >= .63) {
			schooldata.retentrisk = "About Average";
			school.find('[name="retentrisk"]').removeClass("unavailable").removeClass("low").removeClass("high").addClass("medium");
			school.find('[name="retentrisk"] span').text("About Average");
		}
		else {
			schooldata.retentrisk = "Worse than Average";
			school.find('[name="retentrisk"]').removeClass("unavailable").removeClass("low").removeClass("medium").addClass("high");
			school.find('[name="retentrisk"] span').text("Worse than Average");
		}
	}
	
	// defaultrisk
	var default_rate_readable = " (" + Math.round(schooldata.defaultrate * 100) + "%)";
	
	if (!schooldata.defaultrate){
		schooldata.defaultrisk = "Unavailable";
		school.find('[name="defaultrisk"]').removeClass("high").removeClass("low").removeClass("medium").addClass("unavailable");
		school.find('[name="defaultrisk"] span').text("Unavailable");
		school.find(".defaultriskpercent").text("");
	}
	else {
		
		school.find(".defaultriskpercent").text(default_rate_readable);
		
		if (schooldata.defaultrate <= .05) {
			schooldata.defaultrisk = "Better than Average";
			school.find('[name="defaultrisk"]').removeClass("unavailable").removeClass("high").removeClass("medium").addClass("low");
			school.find('[name="defaultrisk"] span').text("Better than Average");
		}
		else if (schooldata.defaultrate <= .11) {
			schooldata.defaultrisk = "About Average";
			school.find('[name="defaultrisk"]').removeClass("unavailable").removeClass("low").removeClass("high").addClass("medium");
			school.find('[name="defaultrisk"] span').text("About Average");
		}
		else {
			schooldata.defaultrisk = "Worse than Average";
			school.find('[name="defaultrisk"]').removeClass("unavailable").removeClass("low").removeClass("medium").addClass("high");
			school.find('[name="defaultrisk"] span').text("Worse than Average");
		}
	}

	// Draw the visualization

	// Colorize Risk of Default
    school.find('.risk-default').removeClass("risk-default").addClass("risk-color");

	// Get the most expensive sticker price (for chart width histogram)
	if (check_highest_cost() === true) {
		$(".school").each(function() {
			var school_id = $(this).find("[data-column]").attr("data-column");
			draw_the_bars(school_id);
		});
	}
	else {
		draw_the_bars(school_id);
	}	

	left_to_pay = schooldata.gap;

	if (left_to_pay < 1){
		school.find('[name="gap"]').text( "$0" );
		_gaq.push(["_trackEvent", "Calculations", "Reached Zero Left to Pay", school_id]);
	}
	else {
		school.find('[name="gap"]').text(num_to_money(left_to_pay));
	}

	if (schooldata.firstyrcostattend < schooldata.borrowingtotal) {
		// add error handling
	}
	school.check_max_alert();

} // end calculate_school()

// check_highest_cost() - Boolean function, returns true if the bar graphs should be
// redrawn due to a change in the "highest_cost" available
function check_highest_cost() {
	var redraw = false;
	if (highest_cost != global.most_expensive_cost) {
		highest_cost = global.most_expensive_cost;
		redraw = true;
	}
	$(".school").each(function() {
		var federaltotal = money_to_num($(this).find("h6[name='federaltotal']").text());
		var privatetotal = money_to_num($(this).find("h6[name='privatetotal']").text());
		var borrowingtotal = federaltotal + privatetotal;
		var grantstotal = money_to_num($(this).find("h6[name='grantstotal']").text());
		var savingstotal = money_to_num($(this).find("h6[name='savingstotal']").text());
		var outofpockettotal = grantstotal + savingstotal;
		var totalfunding = outofpockettotal + borrowingtotal;
		var totalcost = money_to_num($(this).find("h2 span[name='firstyrcostattend']").text());
		var thismax = totalcost;
		if (totalfunding > totalcost) {
			// We no longer care if funding is bigger than cost for sizing concerns
			// thismax = totalfunding;
		}
		if (thismax > highest_cost) {
			highest_cost = thismax;
			redraw = true;
		}
	});
	return redraw;
}

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
function draw_the_bars(school_id) {
	var column = $("#" + school_id).attr("data-column");
	var school = $("[data-column='" + column + "']");
	var schooldata = schools[school_id];
	var chart_width = $("#institution-row [data-column='1']").outerWidth(false);
	var cost = money_to_num(school.find("[name='firstyrcostattend']").html());
	var pixel_price = chart_width / cost;
	var left = 0;

	// Set section_width
	var total_section_width = 0;
	var total_borrowed_section_width = 0;
	var total_outofpocket_section_width = 0;

	// find each .bar element and determine its width, then animate
	school.find(".chart_mask_internal .bar").each(function() {
		var bar = $(this);
		var name = bar.attr("name");
		var value = schooldata[name];
		var section_width = Math.floor(value * pixel_price);
		if (section_width < minimum_chart_section_width) {
			section_width = 0;
			bar.stop(true, false).animate({width: 0}, transition_time, function() {
				bar.hide();
			});
		}
		else {
			bar.stop(true, false).animate({width: (section_width - 2)}, transition_time);
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
	});
	if ((total_outofpocket_section_width + total_borrowed_section_width) > chart_width) {
		school.find(".error_msg").fadeIn(400);
		// This code will resize the bar past the width of the total cost
		// school.find(".bars-container").width(total_outofpocket_section_width + total_borrowed_section_width);
		// marginright = (total_outofpocket_section_width + total_borrowed_section_width) - chart_width;
		// school.find(".tick.full").css("left", chart_width - 2 );
	}
	else {
		// school.find(".bars-container").width(chart_width);
		school.find(".error_msg").fadeOut(400);
	}

    // Borrowing Bar
    school.find('.bar.borrowing').css("width", (total_borrowed_section_width - 1));

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
        school.find('.borrowing-container').hide(transition_time);
    }
    else {
        school.find('.borrowing-container').show(transition_time);
    }
    var breakdownheight = $(".meter").height();
    school.find(".meter").closest("td").height(breakdownheight);

	// Extend the chart's internal container to keep floating items from wrapping
	// school.find(".chart_mask_internal").width(total_section_width + 100);
} // end draw_the_bars()

function process_school_list(schools) {
	var op = "";
	$.each(schools, function(i, val) {
		op = op + i + "(" + val + ") ";
	});
	return op;
} // end process_school_list()

function school_search_results(query) {
	var dump = "";
	var qurl = "/comparisontool/api/search-schools.json?q=" + query;
	var request = $.ajax({
		async: false,
		dataType: "json",
		url: qurl
	});
	request.done(function(response) {
		$.each(response, function(i, val) {
			dump += '<li class="school-result">';
			dump += '<a href="' + val.id + '">' + val.schoolname + '</a></li>';
		});
	});
	request.fail(function() {
		// alert("ERROR");
	});
	return dump;
} // end school_search_results()



/*----------------
	DOCUMENT.READY
--------------------*/

$(document).ready(function() {
	// initialize page
	$("#military-calc-toggle").hide();
	hide_column(2);
	hide_column(3);
	fix_widths();
	$("#institution-row [data-column='1']").attr("id", "average-public");
	build_school_element("average-public");

	$(".add-a-school, .add-school-info").each( function() {
		$(this).width($(this).parent().width());
		$(this).height($(this).width());
	});
	$(".remove-confirm, .gibill-panel, .meter").each( function() {
		$(this).width($(this).parent().width());
	});

	// Check to see if there is restoredata
	if (restoredata != 0) {
		schools = restoredata;
		$.each(schools, function(index) {
			// This filters out only school entries, ignoring other data.
			if (index.substring(0,7) == "school_") {
				build_school_element(index);
			}
		});
	}

	// set tab indexes for header
	// NYI




/*------------------
	JQUERY EVENT HANDLERS
-------------------------*/

	$(window).scroll(function() {
		fade_header();
	});

	/* -------------
		Accordions (not the instrument, sadly)
	-----------------*/

	$('tr.show').click(function() {
		$(this).closest('tbody').children(':not(.show)').toggleClass('hide');
		$(this).closest('.arrw').toggleClass('arrw-collapse');
	});
	$('.grants').click(function() {
		$('.grants-row').toggleClass('tr-hide');
		$(this).closest('.arrw').toggleClass('arrw-collapse');
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

	// Start the 'add a school' process
	$(".add-a-school").click( function() {
		var column = 0;
		// If no school has been added, replace the 'default' in column 1
		if ( $("#institution-row [data-column='1']").attr("data-default") === "true" ) {
			column = 1;
			$("#institution-row [data-column='1']").attr("data-default", "false");
		}
		else {
			column = $(this).closest("[data-column]").attr("data-column");
			$(this).hide();
		}
		$("#institution-row [data-column='" + column + "'] .add-school-info").show();
		$(".add-school-info").css("height", "100%");
		return false;
	});

	// Do a search when the school-search input has keyup...
	$(".add-school-info").live('keyup', function (ev) {
		var query = $(this).find("[name='schoolname-search']").val()
		var results = school_search_results(query);
		$(this).find(".search-results").html(results);
	});

	// #school-search-results list links
	$(".add-school-info .search-results .school-result a").live("click", function(event) {
		event.preventDefault();
		var headercell = $(this).closest("[data-column]");
		var column = headercell.attr("data-column");
		var school_id = $(this).attr("href");
		headercell.attr("id", school_id);

		// AJAX the schooldata
		var schooldata = new Object();
		var surl = "/comparisontool/api/school/" + school_id + ".json";
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
			// alert("ERROR");
		});	
		schools[school_id] = schooldata;
		headercell.find(".school-search").hide();
		headercell.find(".program-selection").show();

		// build_school_element(school_id);
	});

	$(".add-school-info .program-selection .continue").click( function() {
		var column = $(this).closest("[data-column]").attr("data-column");
		$("[data-column='" + column + "'] .program-selection").hide();
		$("[data-column='" + column + "'] .prgmlength-selection").show();
	});

	$(".add-school-info .prgmlength-selection .continue").click( function() {
		var headercell = $(this).closest("[data-column]");
		var column = headercell.attr("data-column");
		var school_id = $("#institution-row [data-column='" + column + "']").attr("id");
		var schooldata = schools[school_id];
		if ( schooldata.kbyoss == "TRUE") {
			$("[data-column='" + column + "'] .prgmlength-selection").hide();
			$("[data-column='" + column + "'] .add-xml").show();
		}
		else {
			build_school_element(school_id);
			headercell.find(".add-school-info").hide();
			headercell.find(".add-school-info .hidden-box").hide();
			headercell.find(".add-school-info .school-search").show();
			calculate_school(school_id);			
		}
	});

	$(".add-school-info .add-xml .xml-magic-happens").click( function() {
		var headercell = $(this).closest("[data-column]");
		var column = headercell.attr("data-column");
		var school = $("[data-column='" + column + "']");
		var xml = $(".add-school-info .add-xml [name='xmlbukkit']").val();
		var json = $.xml2json(xml);
		var school_id = $("#institution-row [data-column='" + column + "']").attr("id");
		var schooldata = schools[school_id];

		build_school_element(school_id);

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
		schools[school_id] = schooldata;

		headercell.find(".add-school-info").hide();
		headercell.find(".add-school-info .hidden-box").hide();
		headercell.find(".add-school-info .school-search").show();
		calculate_school(school_id);
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
		$("#institution-row [data-default='true']").attr("data-default", "false");
		hide_column(column);
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
	$(".gibill-calculator").click( function(event) {
		event.preventDefault();
		var column = $(this).closest("[data-column]").attr("data-column");
		$("[data-column='" + column + "'] .gibill-panel").toggle();
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
	});

	// Selecting an option from tier sets all tier to that value
	$(".military-tier-select").change( function() {
		var value = $(this).val();
		$(".military-tier-select").each( function() {
			$(this).val(value);
		});
	});

	// Clicking "Calculate" button hides GI Bill panel and performs a calculation
	$(".military-residency-panel .military-calculate").click( function() {
		var column = $(this).closest("[data-column]").attr("data-column");
		$("[data-column='" + column + "'] .gibill-panel").hide();
		var school_id = $("#institution-row [data-column='" + column + "']").attr("id");
		calculate_school(school_id);
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
		loanrate = Math.round( loanrate * 100 ) / 100 + "%"
		rateinput.val( loanrate );
		var school_id = $("#institution-row [data-column='" + column + "']").attr("id");
		calculate_school(school_id);
	});

	/* ----------------
		Live calculations
	--------------------- */

	// Perform a calculation when the user blurs inputs
	$("#comparison-tables input.school-data").live('blur', function (ev) {
		var column = $(this).closest("[data-column]").attr("data-column");
		var school_id = $("#institution-row [data-column='" + column + "']").attr("id");
		calculate_school(school_id);
	});

	// Disable keydown and keypress for enter key - IE8 fix
	$("#comparison-tables input.school-data").live('keypress keydown', function(event) {
		if (event.keyCode == 13) {
			event.preventDefault();
			return false;
		}
	});

	// Perform a calculation when a keyup occurs in the school fields...
	$("#comparison-tables input.school-data").on('keyup', function (ev) {
		var column = $(this).closest("[data-column]").attr("data-column");
		var school = $("[data-column='" + column + "']");
		var school_id = $("#institution-row [data-column='" + column + "']").attr("id");
		// ...immediately when the user hits enter
		if (ev.keyCode == 13) {
			ev.preventDefault();
			calculate_school(school_id);
			return false;
		}
		// .. after a delay if any other key is pressed
		school.check_max_alert();
		delay(function() {
			calculate_school(school_id);
			/*
			if (ev.which >= 48 && ev.which <= 105) {
				calculate_school(school_id);
			}
			*/
		}, 500);
	});



	// toggle drawer
	$(".school-drawer-toggle").live("click", function() {
		var toggle = $(this);
		var drawer = $(this).prev(".school-drawer");
		var school_id = $(this).parents(".school").attr("id");
		var schooldata = schools[school_id];
		$(drawer).slideToggle(300, function(){
			if ($(drawer).is(":visible")) {
				$(toggle).html('Confirm & Collapse <span class="visual_cue">&mdash;</span>');
			}
			else {
				$(toggle).html('Edit Financial Aid <span class="visual_cue">+</span>');
			}
		});
		if ($("#introduction").is(":hidden")) {
			$("html, body").animate({"scrollTop": $(drawer).parent().offset().top}, 300);
			$(this).parents('.school').children('.school-drawer-left .data-header h3 a').focus();
		}
		return false;
	});


	$(".bar-info").live('mouseover', function() {
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
		ttc.find("#innertip").css("left", (tipset + 8));
		ttc.find("#outertip").css("left", (tipset + 5));
		var bgcolor = $(this).css("background-color");
		ttc.css("border-color", bgcolor);
		ttc.find("#outertip").css("border-bottom-color", bgcolor);
		ttc.find("p").html($(this).attr("data-tooltip"));
		
		$("html").on('click', function() {
			ttc.hide();
			$("html").off('click');
		});
	});

	$(".tooltip-info").live('click', function() {
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
		ttc.find("#innertip").css("left", (tipset + 8));
		ttc.find("#outertip").css("left", (tipset + 5));
		$("#tooltip-container > p").html($(this).attr("data-tooltip"));
		
		$("html").on('click', function() {
			$("#tooltip-container").hide();
			$("html").off('click');
		});
	});

	// Send email
	$("#send-email").live("click", function(){
	    $.post('email/',{
	        url: $('#unique').val(), 
	        email: $('#email').val()
	     }, function(){
	         alert("Your email has been sent!");
	     });
	});

	// toggle save drawer
	$("#save-drawer-toggle").live("click", function() {
		random = Math.random();
        posturl = "storage/?r=" + random;
        json_schools = JSON.stringify(schools);	
             
        $.ajax({
            type: 'POST',
            url: posturl,
            cache: false,
            dataType: 'json',
            data: json_schools,
            success: function(save_handle) {
                var geturl = "http://" + document.location.host
                    + "/paying-for-college/compare-financial-aid-and-college-cost/?restore="
                    + save_handle.id;
                $('#unique').attr('value', geturl);
                $("#save-drawer").slideToggle(300, function() {
                    if ($(this).is(":visible")) {
                        $("#save-drawer-toggle").val("Collapse");
                    }
                    else {
                        $("#save-drawer-toggle").val("Save & Share");
                    }
                });
            },
            failure: function(response) {
            	alert("Request failure: " + xhr.status + ", " + thrownError);
            },
            error: function(xhr, ajaxOptions, thrownError) {
            	alert("Request error: " + xhr.status + ", " + thrownError);
            }
		});
   
    });  
});


