/*	Rewrite by wernerc */

/* When school database is live, we probably want to AJAX data from it, allowing users to add and
	remove schools on the fly. However, data on averages and general setup data will still come from
	that database, so some form of "starting data" will still need to be pulled. This is stand-in data
	for that eventual database code. -wernerc */

var data = 
	{
	"global":
		{"aaprgmlength": 2, "yrincollege": 1, "vet": false, "serving": "no", "program": "ba",
		 "tier": 100, "gradprgmlength": 2, "familyincome": 48, "most_expensive_cost": 50000, "salary": 30922 },
	"presets" : {
		"average_public" :
			{"institutionname":"Average Public 4-Year University", "tuitionfees": 8244, "roombrd": 8887,
			 "books": 1168, "transportation": 1082, "otherexpenses": 2066, "active": false },
		"average_private" :
			{"institutionname":"Average Private 4-Year University", "tuitionfees": 28500, "roombrd": 10089,
			 "books": 1213, "transportation": 926, "otherexpenses": 1496, "active": false }
	}
};

/* end stand-in code */

// Determine if global data exists
if (data.global != "undefined") {
	global = data.global;
}
else {
	/*	If, school when data is live, globals can't be loaded from the database, there ought to be
		some error handling. The application can still run without data, so a database failure
		shouldn't put it out of commission -wernerc */
}

// Schools object is initialized, then filled later
var schools = new Object();
schools.csrfmiddlewaretoken = csrftok;

presets = data.presets;

//-------- Initialize --------//
var pixel_price = 0, // The ratio of pixels to dollars for the bar graph
	transition_time = 200, // The transition time of bar graph animations
	minimum_chart_section_width = 1, // The minimum width of a bar graph section
	input_bg_default = "#E6E6E6", // default bg color for inputs
	input_bg_error = "#F6D5D5", // bg color for inputs that are above max
	schoolcounter = 0, // an internal counter to keep school ids unique
	thisequals =  {
		"gas": {"name": "TANKS OF GAS", "price": 40, "menuname": "Tanks of Gas"},
		"smartphones": {"name": "SMARTPHONES", "price": 100, "menuname": "Smartphones" },
		"carpayments": {"name": "CAR PAYMENTS", "price": 300, "menuname": "Car Payments" }
	},
	highest_cost = global.most_expensive_cost; // The most expensive cost of any school


//-------- FUNCTIONS --------//
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


// jQuery prototypes

// setbyname - set an element to the matching schooldata object property (converted to money string)
jQuery.fn.setbyname = function(name, value, overwrite) {
	school_id = $(this[0]).attr("id");
	schooldata = schools[school_id];
	element = $(this[0]).find("[name='" + name +"']");

	element.val(num_to_money(value, ""));
	
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
	element = $(this[0]).find("[name='" + name + "']");
	element.text(num_to_money(value));
	return false;
};

// exists - a simple way to determine if any instance of an element matching the selector exists
jQuery.fn.exists = function() {
	return this.length > 0;
}

//---- Functions used by calculate_school() ----//

// calc_this_equals - Calculate and fill the "This Equals" comparison
jQuery.fn.calc_this_equals = function(item) {
	var defaultitem = "gas";
	var compareitem = thisequals[item];
	if (compareitem === undefined) {
		compareitem = thisequals[defaultitem];
	}
	var loanmonthly = money_to_num($(this).find("h3[name='loanmonthly']").text());
	$(this).find("[name='thisequalsname']").text("$" + compareitem.price + " " + compareitem.name);
	$(this).find("moreitems").attr("href", "#" + item);
	$(this).find("[name='thisequalscount']").text(Math.floor(loanmonthly / compareitem.price));
}

// check_highest_cost() - Boolean function, returns true if the bar graphs should be
// redrawn due to a change in the "highest_cost" available
function check_highest_cost() {
	var redraw = false;
	if (highest_cost != global.most_expensive_cost) {
		highest_cost = global.most_expensive_cost;
		redraw = true;
	}
	$(".school").not("#template").each(function() {
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
}

// draw_the_bars - Redraw the bar graphs for the specified .school element
jQuery.fn.draw_the_bars = function() {
	var school = $(this);
	var pixel_price = 496 / highest_cost;
	var cost = money_to_num($(this).find("h4 span[name='firstyrcostattend']").text());
	var chart_width = Math.round(cost * pixel_price);
	var marginright = 0;
	school.find(".bars").width(chart_width);

	// Set section_width
	var total_section_width = 0;
	var total_borrowed_section_width = 0;
	var total_outofpocket_section_width = 0;
	var show_average_grants_scholarships = false;

	// find each .bar element and determine its width, then animate
	school.find(".chart_mask_internal .bar").each(function() {
		var bar = $(this);
		var name = bar.attr("name");
		var value = money_to_num(school.find('input[name="' + name + '"]').val());
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
		if (bar.hasClass("active-state") && section_width != 0) {
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


	if (show_average_grants_scholarships){
    	school.find('.tick.discount, .calc.discount').show();
    }
    else {
    	school.find('.tick.discount, .calc.discount').hide();
    }

    // Borrowing Bar
    school.find('.bar.borrowing').css("width", (total_borrowed_section_width - 2));

    marginright = chart_width - total_borrowed_section_width - total_outofpocket_section_width + 2;
    if (marginright < 1) {
    	// uncomment this line and the "total borrowed" will not float beyond the cost bar
    	// marginright = 0;
    }
    if (marginright < (-5 - total_borrowed_section_width)) {
    	marginright = (-1 * total_borrowed_section_width) - 5;
    } 
    school.find('.borrowing-container').css("margin-right", marginright);

    if (schooldata.borrowingtotal < 1) {
        school.find('.borrowing-container').hide(transition_time);
    }
    else {
        school.find('.borrowing-container').show(transition_time);
    }

	// Extend the chart's internal container to keep floating items from wrapping
	school.find(".chart_mask_internal").width(total_section_width + 100);

}

// center_lightbox() - Center the lightbox. Called after each fadeIn because IE8 hates hidden elements.
function center_lightboxes() {
	$(".lightbox").each(function(){
		var o_height = $(this).outerHeight();
		var o_width = $(this).outerWidth();
		var margin_t = o_height/2;
		var margin_l = o_width/2;
		$(this).css({"margin-left":-margin_l,"margin-top":-margin_t});
	});
}

// calculate_school(school_id) - Calculate the numbers for a particular school
function calculate_school(school_id) {
	var school = $("#school-container #" + school_id +".school");
	var schooldata = schools[school_id];

	// Set default terms
	schooldata.perkinsterm = 10;
	schooldata.staffsubsizedterm = 10;
	schooldata.parentplusterm = 10;
	schooldata.homeequityterm = 10;
	schooldata.staffunsubsidizedterm = 10;
	schooldata.gradplusterm = 10;
	schooldata.privateloanterm = 10;
	schooldata.institutionalloanterm = 10;
	schooldata.color = true;
	schooldata.state529plan = 0;

	// Supplement/replace data with customized fields
	school.find("input").each(function() {
		schooldata[$(this).attr("name")] = money_to_num($(this).val());
	});	

	// For calculations, add transportation and otherexpenses into personalcosts

	schooldata.personal = schooldata.transportation + schooldata.otherexpenses;

	// If the school is user-added, then there's less work to do.
	if (schooldata.source === "user") {

	}
	// If the school is not user-added, then there's more work.
	else {
		// ADD THE DATA-DRIVEN STUFF BACK IN HERE
	}

	// Set undergrad
	if (schooldata.program == "ba" || schooldata.program == "aa") {
		schooldata.undergrad = true;
	}
	else {
		school.undergrad = false;
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
	school.setbyname("tuitionfees", schooldata.tuitionfees, true);
	school.setbyname("roombrd", schooldata.roombrd, true);
	school.setbyname("books", schooldata.books, true);
	// school.setbyname("personal", schooldata.personal, true);
	school.setbyname("transportation", schooldata.transportation, true);
	school.setbyname("otherexpenses", schooldata.otherexpenses, true);

	school.setbyname("scholar", schooldata.scholar, true);
	school.setbyname("savings", schooldata.savings, true);
	school.setbyname("family", schooldata.family, true);
	school.setbyname("state529plan", schooldata.state529plan, true);
	school.setbyname("workstudy", schooldata.workstudy, true);
	school.setbyname("institutionalloan", schooldata.institutionalloan, true);
	school.setbyname("privateloan", schooldata.privateloan, true);


	// Start calculations
	// Cost of First Year
	schooldata.firstyrcostattend = schooldata.tuitionfees + schooldata.roombrd + schooldata.books + schooldata.personal;
	school.find('[name="firstyrcostattend"]').text( num_to_money( schooldata.firstyrcostattend ) );

	// Pell Grants
	schooldata.pell_max = 0;
	if (schooldata.undergrad == true) {
		schooldata.pell_max = 5550;
	}
	if (schooldata.pell > schooldata.pell_max){
		schooldata.pell = schooldata.pell_max;
	}
	school.setbyname("pell", schooldata.pell, true);

	// Military Tuition Assistance
	schooldata.tuitionassist_max = 0;
	schooldata.tuitionassist_max = Math.min(4500, schooldata.tuitionfees);
	if (schooldata.tuitionassist > schooldata.tuitionassist_max) {
		schooldata.tuitionassist = schooldata.tuitionassist_max;
	}
	school.setbyname("tuitionassist", schooldata.tuitionassist, true);

	// GI Bill (more accurate than user input(?))
/*
	if (global.vet == false) {
		schooldata.gibilltf = 0;
	}
	else { 			
		if (schooldata.public == true && schooldata.instate == true) {
			schooldata.gibilltf =
				Math.max(0, (schooldata.tuitionfees - schooldata.scholar - schooldata.tuitionassist)) * global.tier;
		}
		else {
			if (schooldata.public == true && schooldata.instate == false) {
				if (schooldata.undergrad == true) {
					schooldata.gibilltf = Math.min(schooldata.tuitionunderins, Math.max(0, (schooldata.tuitionfees - schooldata.scholar - schooldata.tuitionassist))) * global.tier;
				}
				else {
					schooldata.gibilltf = Math.min(schooldata.tuitiongradins, Math.max(0, (schooldata.tuitionfees - schooldata.pell - schooldata.scholar - schooldata.tuitionassist))) * global.tier;
				}
			}
			else {
				schooldata.gibilltf = Math.min(Math.max(0, (schooldata.tuitionfees - schooldata.scholar - schooldata.tuitionassist)), 17500) * global.tier;
			}
		}
	}

	if (global.vet == false) {
		schooldata.gibillla = 0;
	}
	else { 
		if (global.serving == "ad") { 
			schooldata.gibillla = 0;
		}
		else {
			if (global.tier == 0 && global.serving == "ng") {
				schooldata.gibillla = 345 * 9;
			}
			else {
				if (schooldata.online == true) {
					schooldata.gibillla = 684 * 9 * global.tier;
				}
				else {
					schooldata.gibillla = schooldata.bah * 9 * global.tier;
				}
			}
		}
	}	
	if (global.vet == false) {
		schooldata.gibillbs = 0;
	}
	else {
		schooldata.gibillbs = (1000 * global.tier);
	}

	schooldata.gibill = schooldata.gibilltf + schooldata.gibillla + schooldata.gibillbs;
*/
	school.setbyname("gibill", schooldata.gibill, true);

	// Total Grants
	schooldata.grantstotal = schooldata.pell + schooldata.scholar + schooldata.gibill + schooldata.tuitionassist;
	school.textbyname("grantstotal", schooldata.grantstotal);

	// First Year Net Cost
	schooldata.firstyrnetcost = schooldata.firstyrcostattend - schooldata.grantstotal;

	// Perkins Loan
	if (schooldata.undergrad == true) {
		schooldata.perkins_max = Math.min(5500, Math.max(0,(schooldata.firstyrcostattend - schooldata.pell)));
	}
	else {
		schooldata.perkins_max = Math.min(8500, Math.max(0,(schooldata.firstyrcostattend - schooldata.pell)));
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
		if (schooldata.program == "aa" || global.yrincollege == 1){
			schooldata.staffsubsidized_max = Math.min(3500, Math.max(0, (schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins)));
		}
		else {
			if (global.yrincollege == 2) {
				schooldata.staffsubsidized_max = Math.min(4500, Math.max(0, (schooldata.firstyrcostattend - schooldata.pell - schooldata.perkins)));
			}
			else {
				schooldata.staffsubsidized_max = Math.min(5500, Math.max(0, (schooldata.firstyrcostattend - schooldata.pell- schooldata.perkins)));
			}
		}
	}
	if (schooldata.staffsubsidized > schooldata.staffsubsidized_max){
		schooldata.staffsubsidized = schooldata.staffsubsidized_max;
	}
	schools[school_id].staffsubsidized_max = schooldata.staffsubsidized_max;
	school.setbyname("staffsubsidized", schooldata.staffsubsidized, true);



	// Unsubsidized Stafford Loans
	schooldata.staffunsubsidized_max = 5500;
	if (schooldata.undergrad == false) {
		schooldata.staffunsubsidized_max = Math.min(Math.max(0, (schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized)), (20500 - schooldata.staffsubsidized));
	}
	else {
		if (schooldata.program == "aa" || global.yrincollege == 1) {
			schooldata.staffunsubsidized_max = Math.min(Math.max(0, (schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized)), (9500 - schooldata.staffsubsidized));
		} 
		else {
			if (global.yrincollege == 2) {
				schooldata.staffunsubsidized_max = Math.min(Math.max(0, (schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized)), (4500 - schooldata.staffsubsidized));
			} 
			else {
				schooldata.staffunsubsidized_max = Math.min(Math.max(0, (schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized)), (5500 - schooldata.staffsubsidized));
			}
		}
	}
	if (schooldata.staffunsubsidized > schooldata.staffunsubsidized_max) {
		schooldata.staffunsubsidized = schooldata.staffunsubsidized_max;
	}
	school.setbyname("staffunsubsidized", schooldata.staffunsubsidized, true);

	// Gradplus (?)
	if (schooldata.undergrad == true) {
		schooldata.gradplus = 0;
	}
	else {
		// schooldata.gradplus = schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized;
	}
	if (schooldata.undergrad == true) {
		schooldata.gradplus_max = 0;
	}
	else {
		schooldata.gradplus_max = schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized;
	}
	if (schooldata.gradplus > schooldata.gradplus_max) {
		schooldata.gradplus = schooldata.gradplus_max;
	}

	// Add up federal loans
	schooldata.federaltotal = schooldata.perkins + schooldata.staffsubsidized + schooldata.staffunsubsidized;
	school.textbyname("federaltotal", schooldata.federaltotal);

	// Private Loans
	schooldata.privateloan_max =
		Math.max(0, (schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized - schooldata.institutionalloan));
	if (schooldata.privateloan > schooldata.privateloan_max) {
		schooldata.privateloan = schooldata.privateloan_max;
	}
	school.setbyname("privateloan", schooldata.privateloan, true);

	// gap
	schooldata.gap = Math.max(0, (schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized - schooldata.workstudy - schooldata.savings - schooldata.family - schooldata.state529plan - schooldata.privateloan - schooldata.institutionalloan - schooldata.parentplus - schooldata.homeequity));
	
	// Institution Loans
	schooldata.institutionalloan_max =
		Math.max(0, (schooldata.firstyrnetcost - schooldata.perkins - schooldata.staffsubsidized - schooldata.staffunsubsidized - schooldata.parentplus - schooldata.homeequity));
	if (schooldata.institutionalloan > schooldata.institutionalloan_max) {
		schooldata.institutionalloan = schooldata.institutionalloan_max;
	}
	school.setbyname("institutionalloan", schooldata.institutionalloan, true);
	
	// Total Out of Pocket
	schooldata.totaloutofpocket = schooldata.perkins + schooldata.staffsubsidized + schooldata.staffunsubsidized + schooldata.gradplus + schooldata.savings + schooldata.family + schooldata.state529plan + schooldata.workstudy + schooldata.institutionalloan + schooldata.privateloan + schooldata.parentplus + schooldata.homeequity;
	
	// remainingcost -- "Left to Pay"
	schooldata.remainingcost = schooldata.firstyrnetcost - schooldata.totaloutofpocket;
	//school.textbyname("remainingcost", schooldata.remainingcost);
	
	// loandebt1yr -- "Estimated Total Borrowing"
		schooldata.loandebt1yr = schooldata.perkins + schooldata.staffsubsidized + schooldata.staffunsubsidized + schooldata.gradplus + schooldata.privateloan + schooldata.institutionalloan + schooldata.parentplus + schooldata.homeequity;
		//school.textbyname("loandebt1yr", schooldata.loandebt1yr);
		
	// prgmlength - "Program Length"
	if (schooldata.program == "ba") {
		schooldata.prgmlength = 5 - global.yrincollege;
	}
	else if (schooldata.program == "aa") {
		schooldata.prgmlength = 2;
	}
	else {
		schooldata.prgmlength = global.gradprgmlength;
	}
	
	// perskinsgrad - "Perkins Graduate Loan"(?)
	schooldata.perkinsgrad = schooldata.perkins * schooldata.prgmlength;

	// staffsubsidizedwithfee - "Direct Subsidized Loan with 1% Origination Fee"
	schooldata.staffsubsidizedwithfee = schooldata.staffsubsidized * 1.01

	// staffunsubsidizedgrad  - "Direct Unsubsidized Loan with 1% Origination Fee"
	schooldata.staffunsubsidizedwithfee = schooldata.staffunsubsidized * 1.01
		
	// staffsubsidizedgrad - "Stafford Subsidized Graduate Loan"
	schooldata.staffsubsidizedgrad = schooldata.staffsubsidizedwithfee  * schooldata.prgmlength;
	
    // staffunsubsidizedgrad  - "Stafford Subsidized Graduate Loan"
    schooldata.staffunsubsidizedgrad = 
		(schooldata.staffunsubsidizedwithfee  * .068 / 12 *
		((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * 6)))
			+ (schooldata.staffunsubsidizedwithfee  * schooldata.prgmlength);

	// gradplusgrad - "Grad Plus, Graduate" (?)
	schooldata.gradplusgrad = (schooldata.gradplus * .079 / 12 * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * 6))) + (schooldata.gradplus * schooldata.prgmlength);
	
    // privateloangrad - "Private Loan, Graduate" (?)
    schooldata.privateloangrad = 
    	(schooldata.privateloan * .079 / 12 
    	* ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * 6)))
		+ (schooldata.privateloan * schooldata.prgmlength);

	// gapgrad2 - "Gap Loan, Graduate" (?)
	schooldata.gapgrad2 = (schooldata.gap * .079/12 * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * 6))) + (schooldata.gap * schooldata.prgmlength);	

    // institutionalloangrad - "Institutional Loan, Graduate" (?)
    schooldata.institutionalloangrad = 
    	(schooldata.institutionalloan * .079 / 12
    		* ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12 + schooldata.prgmlength * 6)))
			+ (schooldata.institutionalloan * schooldata.prgmlength);

	// parentplusgrad - "Parental Loans Etc, Graduate" (?)
	schooldata.parentplusgrad =
		(schooldata.parentplus * .079 / 12 
			* ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12)));
	
	// homeequitygrad - "Home Equity Loans, Graduate" (?)
	schooldata.homeequitygrad =
		(schooldata.homeequity * .079 / 12 * ((schooldata.prgmlength * (schooldata.prgmlength + 1) / 2 * 12)));
	
	// Add up private loans
	schooldata.privatetotal = schooldata.privateloan + schooldata.institutionalloan;
	school.textbyname("privatetotal", schooldata.privatetotal);
	
	// Add up savings
	schooldata.savingstotal = schooldata.savings + schooldata.family + schooldata.state529plan + schooldata.workstudy;
	school.textbyname("savingstotal", schooldata.savingstotal);
	
	// borrowingtotal
	schooldata.borrowingtotal = schooldata.privatetotal + schooldata.federaltotal;
	school.textbyname("borrowingtotal", schooldata.borrowingtotal);
	
	// loanmonthly - "Monthly Payments"
	schooldata.loanmonthly =
		(schooldata.perkinsgrad * (.05 / 12) / (1-Math.pow((1 + .05 / 12), (-schooldata.perkinsterm * 12))))
		+ (schooldata.staffsubsidizedgrad 
			* (.034 / 12) / (1 - Math.pow((1 + .034 / 12), (-schooldata.staffsubsizedterm * 12))))
		+ (schooldata.staffunsubsidizedgrad 
			* (.068 / 12) / (1 - Math.pow((1 + .068 / 12), (-schooldata.staffunsubsidizedterm * 12))))
		+ (schooldata.gradplusgrad * (.079 / 12) / (1 - Math.pow((1 + .079/12), (-schooldata.gradplusterm * 12))))
		+ (schooldata.privateloangrad * (.079 / 12) / (1 - Math.pow((1 + .079/12), (-schooldata.privateloanterm * 12))))
		+ (schooldata.institutionalloangrad 
			* (.079 / 12) / (1 - Math.pow((1 + .079/12), (-schooldata.institutionalloanterm * 12))));
	if (!schooldata.color) {
		schooldata.loanmonthly += 
			(schooldata.gap * (.079 / 12) / (Math.pow(1 - (1 + .079 / 12),(-schooldata.privateloanterm * 12))));
	}
	school.textbyname("loanmonthly", schooldata.loanmonthly);
	
	// loanmonthlyparent
	schooldata.loanmonthlyparent = (schooldata.parentplus * (.079 / 12) / (Math.pow(1 - (1 + .079 / 12), (-schooldata.parentplusterm * 12)))) + (schooldata.homeequity * (.079 / 12) / (Math.pow(1 - (1 + .079 / 12), (-schooldata.homeequityterm * 12))));
	
	// loanlifetime
	schooldata.loanlifetime = ((schooldata.perkinsgrad * (.05 / 12) / (Math.pow(1 - (1 + .05/12), (-schooldata.perkinsterm * 12)))) * (schooldata.perkinsterm * 12)) + ((schooldata.staffsubsidizedgrad * (.034 / 12) / (Math.pow(1 - (1 + .034 / 12), (-schooldata.staffsubsizedterm * 12)))) * (schooldata.staffsubsizedterm * 12)) + ((schooldata.staffunsubsidizedgrad * (.068 / 12) / (Math.pow(1 - (1 + .068 / 12), (-schooldata.staffunsubsidizedterm * 12)))) * (schooldata.staffunsubsidizedterm * 12)) + ((schooldata.gradplusgrad * (.079 / 12) / (Math.pow(1 - (1 + .079 / 12),(-schooldata.gradplusterm * 12)))) * (schooldata.gradplusterm * 12)) + ((schooldata.privateloangrad * (.079 / 12) / (Math.pow(1 - (1 + .079 / 12), (-schooldata.privateloanterm * 12)))) * (schooldata.privateloanterm * 12)) + ((schooldata.institutionalloangrad * (.079 / 12) / (1 - (1 + .079 / 12)^(-schooldata.institutionalloanterm * 12))) * (schooldata.institutionalloanterm * 12)) + ((schooldata.parentplus * (.079 / 12) / (Math.pow(1 - (1 + .079 / 12), (-schooldata.parentplusterm * 12)))) * (schooldata.parentplusterm * 12) * schooldata.prgmlength) + ((schooldata.homeequity * (.079 / 12) / (Math.pow(1 - (1 + .079 / 12), (-schooldata.homeequityterm * 12)))) * (schooldata.homeequityterm * 12) * schooldata.prgmlength);
	
	// salaryneeded
	schooldata.salaryneeded = schooldata.loanmonthly * 12 / 0.14;
	
	// salaryexpected25yrs
	if (schooldata.program == "aa") {
		schooldata.salaryexpected25yrs = 767 * 52;
	}
	else if (schooldata.program == "ba") {
		schooldata.salaryexpected25yrs = 1038 * 52;
	}
	else {
		schooldata.salaryexpected25yrs = 1272 * 52;
	}
	
	// salaryexpectedoccup
	schooldata.salaryexpectedoccup = schooldata.occupationsalary * 52;
	
	// riskofdefault
	school.find('[name="riskdefault_icon"]').removeClass("high").removeClass("medium").removeClass("low").removeClass("none");
	if (schooldata.loanmonthly == 0) {
		schooldata.riskofdefault = "none";
		school.find('[name="riskdefault_icon"]').addClass("none");
		school.find('[name="riskdefault_text"]').text("None");		
	}
	else if ((schooldata.loanmonthly * 12) <= global.salary * .08) {
		schooldata.riskofdefault = "low";
		school.find('[name="riskdefault_icon"]').addClass("low");
		school.find('[name="riskdefault_text"]').text("Low");
	}
	else if ((schooldata.loanmonthly * 12) <= global.salary * .14) {
		schooldata.riskofdefault = "medium";
		school.find('[name="riskdefault_icon"]').addClass("medium");
		school.find('[name="riskdefault_text"]').text("Medium");
	}
	else {
		schooldata.riskofdefault = "high";
		school.find('[name="riskdefault_icon"]').addClass("high");
		school.find('[name="riskdefault_text"]').text("High");
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
		$(".school").not("#template").each(function() {
			$(this).draw_the_bars();
		});
	}
	else {
		school.draw_the_bars();
	}	

	left_to_pay = schooldata.gap;

	if (left_to_pay < 1){
		school.find('[name="gap"]').text( "$0" );
	}
	else {
		school.find('[name="gap"]').text(num_to_money(left_to_pay));
	}

	if (schooldata.firstyrcostattend < schooldata.borrowingtotal) {
		// add error handling
	}
	school.check_max_alert();

	var item = school.find("a.moreitems").attr("href").substr(1);
	school.calc_this_equals(item);


} // end calculate_school()

// Build a section.school element for a school, fill in data
// school's data must be in the schools object first
function build_school_element(school_id) {
	if (schools[school_id] != undefined) {
		var schooldata = schools[school_id];
	}
	else {
		return false;
	}

	$('#school-container').append($("#template").html());
	var school = $('#school-container .school:last');
	school.attr("id", school_id);

	// Set the data within the element
	school.find('[name="institutionname"]').text(schooldata.institutionname);
	for (key in schooldata) {
	    school.find('input[name="' + key + '"]').val(schooldata[key]);
	}

	// Reset tabindex for schools
	i = 0;
	$(".school").not("#template").each(function(index) {
		i = index + 1;
		$(this).find('[tabindex]').attr("tabindex", function(j, val) {
			return 1000 + (i * 100) + j; 
		});
	});

	// Hide FA button if a default school (currently N/A)
	if (schooldata.active == false) {
		school.find('.school-drawer-toggle').hide();
		school.find('.campus-toggle').hide();
	}

	school.find('#campus-off').attr('value', 'false');
	//console.log(schooldata);

	// if school is user-input, hide the risk and on/off campus fields
	if (schooldata.source === "user") {
		$(".data-school-risk").hide();
		$(".campus-toggle").hide();
	}
	calculate_school(school_id);
	school.calc_this_equals(thisequals[0]);
}

function process_school_list(schools) {
	var op = "";
	$.each(schools, function(i, val) {
		op = op + i + "(" + val + ") ";
	});
	return op;
}

function school_search(query) {
	if (query.length > 2) {
		var qurl = "http://127.0.0.1:8000/comparisontool/api/search-schools.json?q=" + query;
		var request = $.ajax({
			url: qurl,
			dataType: "json"
		});
		request.done(function(data) {
			dump = "";
			$.each(data, function(i, val) {
				dump += '<li>';
				dump += val[0] + '</li>';
			});
			$("#school-search-results").html("SCHOOL");
			$("#school-search-results").append(dump);
		});
		request.fail(function() {
			// alert("ERROR");
		});
	}
}


//-------- DOCUMENT.READY --------//

$(document).ready(function() {
	// initialize page

	$("#intro-form").append($("#school-search-template").html());
	$("#intro-form").find($("#school-search")).show();

	// Check to see if there is restoredata
	if (restoredata != 0) {
		schools = restoredata;
		$("#introduction").hide();
		$.each(schools, function(index) {
			// This filters out only school entries, ignoring other data.
			if (index.substring(0,7) == "school_") {
				build_school_element(index);
			}
		});
		if ($("#school-container .school").length >= 3) {
			$("#add_a_school").hide();
		}
		else {
			$("#add_a_school").show();
		}
	}

	// set tab indexes for header
	// NYI

	// Fill out the "thisequals" select
	$.each(thisequals, function(index) {
		var html = '<li>...<a class="this_equals_select" href="#' + index + '">' + this.menuname + '</a></li>';
		$("#template .this_equals_menu ul").append(html);
	});

	// Hide the Save & Share button and the Start Over button initially.
	$("#save-drawer-toggle").hide();
	$("#start-again").hide();

	$("#template").hide();
	$("#add_a_school").hide();

	center_lightboxes();

	// Set tabindex for lightboxes
	$('.lightbox').find('[tabindex]').attr("tabindex", function(i, val) {
		return parseInt(val) + (i * 10); 
	});

	$("#template").hide();

//-------- JQUERY EVENT HANDLERS --------//

	// thisequals menu
	$("a.moreitems").live("click", function(ev) {
		ev.disableDefault;
		$(this).parents(".thisequals").children("div.this_equals_menu").fadeIn(200);
		$("html").on('click', function() {
			$("div.this_equals_menu").fadeOut(200);
		});
	});
	$("a.this_equals_select").live("click", function(ev) {
		var item = $(this).attr("href").substr(1);
		var school = $(this).parents(".school");
		school.calc_this_equals(item);
		$(this).parents(".thisequals").children("div.this_equals_menu").fadeOut(200);
	});

	// Pop up the option to add a school
	$("#start_it_up").live("click", function() {
		$("#lightbox-intro").fadeOut(300);
		$("#lightbox-add").fadeIn(500);
		center_lightboxes();
	});

	// Pop up the option to add a school
	$("#add_a_school").live("click", function() {
		$("#add_average_private").show();
		$("#add_average_public").show();
		if ($("#average_private").exists()) {
			$("#add_average_private").hide();
		}
		if ($("#average_public").exists()) {
			$("#add_average_public").hide();
		}
		$("#overlay").show();
		$("#lightbox-add").show();
		$("#template").hide();
		center_lightboxes();

	});

	//---- Add a school element to the comparison ----//
	$(".add_to_comparison").live("click", function(ev) {
		var schooldata = new Object();
		var school_id = "school_" + "custom_" + (schoolcounter++);
		costbuilder = $(this).parents(".costbuilder");
		schooldata.institutionname = costbuilder.find("input[name='cb_institutionname']").val();
		if (schooldata.institutionname.length < 1) {
			schooldata.institutionname = "Unnamed University";
		}
		schooldata.tuitionfees = money_to_num(costbuilder.find("input[name='cb_tuitionfees']").val());
		schooldata.roombrd = money_to_num(costbuilder.find("input[name='cb_roombrd']").val());
		schooldata.books = money_to_num(costbuilder.find("input[name='cb_books']").val());
		schooldata.transportation = money_to_num(costbuilder.find("input[name='cb_transportation']").val());
		schooldata.otherexpenses = money_to_num(costbuilder.find("input[name='cb_otherexpenses']").val());
		schooldata.source = "user";

		schools[school_id] = schooldata;

		build_school_element(school_id);
		var school = $("#school-container #" + school_id +".school");

		// If there are 3 or more school elements, hide the "add a school" link
		if ($("#school-container .school").length >= 3) {
			$("#add_a_school").hide();
		}
		// If this is the first school, hide some elements, show others
		if ($(this).hasClass('start_comparing')) {
			$("#introduction").slideUp(500);
			$("#add_a_school").fadeIn(200);
			$("#save-drawer-toggle").show();
			$("#start-again").show();
			school.find(".school-drawer-toggle").trigger('click');
		}

		$("#overlay").fadeOut(500);
		$("#lightbox-add").fadeOut(300);

		// Clear out the form so it will be blank for the next call
		$(".costbuilder input").val('');
		school.find("a[name='school_target']").focus();
	});

	$('.add_average_private').live("click", function(ev) {
		/* if (!$("#average_private").exists()) {
			build_school_element('average_private');
			$("#overlay").fadeOut(500);
			$("#lightbox-add").fadeOut(300);
		} */
		var average_private = presets["average_private"];
		costbuilder = $(this).parents(".costbuilder");
		costbuilder.find("input[name='cb_institutionname']").val(average_private.institutionname);
		costbuilder.find("input[name='cb_tuitionfees']").val(average_private.tuitionfees);
		costbuilder.find("input[name='cb_roombrd']").val(average_private.roombrd);
		costbuilder.find("input[name='cb_books']").val(average_private.books);
		costbuilder.find("input[name='cb_transportation']").val(average_private.transportation);
		costbuilder.find("input[name='cb_otherexpenses']").val(average_private.otherexpenses);
	});

	$('.add_average_public').live("click", function(ev) {
		/* if (!$("#average_public").exists()) {
			build_school_element('average_public');
			$("#overlay").fadeOut(500);
			$("#lightbox-add").fadeOut(300);
		} */
		var average_public = presets["average_public"];
		costbuilder = $(this).parents(".costbuilder");
		costbuilder.find("input[name='cb_institutionname']").val(average_public.institutionname);
		costbuilder.find("input[name='cb_tuitionfees']").val(average_public.tuitionfees);
		costbuilder.find("input[name='cb_roombrd']").val(average_public.roombrd);
		costbuilder.find("input[name='cb_books']").val(average_public.books);
		costbuilder.find("input[name='cb_transportation']").val(average_public.transportation);
		costbuilder.find("input[name='cb_otherexpenses']").val(average_public.otherexpenses);
	});

	$(".remove_school_link").live("click", function(ev) {
		ev.preventDefault();
		var school_id = $(this).parents(".school").attr("id");
		$("#school_id_to_remove").val(school_id);
		var institutionname = $("#"+school_id).find("h2[name='institutionname']").text(); 
		$("#school_being_removed").text(institutionname);
		$("#overlay").fadeIn(300);
		$("#lightbox-remove-check").fadeIn(500);
		center_lightboxes();
	});

	$("#remove_school").live("click", function() {
		school_id = $("#school_id_to_remove").val();
		$("#"+school_id).remove();
		delete schools[school_id];
		$("#lightbox-remove-check").fadeOut(200);
		if ($("#school-container .school").length === 0) {
			$("#lightbox-add").fadeIn(400);
			center_lightboxes();
		}
		else {
			$("#overlay").fadeOut(300);
		}
		$("#add_a_school").show();

		// Check the costs versus highest cost, in case we removed highest cost school
		if (check_highest_cost() === true) {
			$(".school").not("#template").each(function() {
				$(this).draw_the_bars();
			});
		}
	});

	$(".close-lightbox, .lightbox-content #cancel").live("click", function() {
		$(this).parents(".lightbox").fadeOut(100);
		$("#overlay").fadeOut(200);
	});

	// Perform a calculation when the user blurs inputs
	$('.school input').live('blur', function (ev) {
		school_id = $(this).parents(".school").attr("id");
		calculate_school(school_id);
	});

	// Disable keydown and keypress for enter key - IE8 fix
	$('.school input').live('keypress keydown', function(ev) {
		if (ev.keyCode == 13) {
			ev.preventDefault();
			return false;
		}
	});

	// Do a search when the school-search input has keyup...
	$('#school-search').live('keyup', function (ev) {
		var query = $("#school-search [name=schoolname]").val()
		school_search(query);
	});

	// Perform a calculation when a keyup occurs in the school fields...
	$('.school input').live('keyup', function (ev) {
		// ...immediately when the user hits enter
		if (ev.keyCode == 13) {
			ev.preventDefault();
			school_id = $(this).parents(".school").attr("id");
			calculate_school(school_id);
			return false;
		}
		// .. after a delay if any other key is pressed
		school_id = $(this).parents(".school").attr("id");
		$(this).parents(".school").check_max_alert();
		delay(function() {
			calculate_school(school_id);
			/*
			if (ev.which >= 48 && ev.which <= 105) {
				calculate_school(school_id);
			}
			*/
		}, 500);
	});

	// toggle Military calculator
	$("#military-calc-toggle").click(function(){
		$("#military-calc-panel").toggleClass("hidden");
		$("#military-calc-toggle").addClass("active").html("Military Benefit Calculator <span>&#9650;</span>");
	});


	// toggle drawer
	$(".school-drawer-toggle").live("click", function() {
		var toggle = $(this);
		var drawer = $(this).prev(".school-drawer");
		var school_id = $(this).parents(".school").attr("id");
		var schooldata = schools[school_id];
		if (!schooldata.color){
			// edit_school(school_id);
		}
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

	$("#start-again").live("click", function() {
		$("#overlay").fadeIn(200);
		$("#lightbox-start-over").fadeIn(300);
		center_lightboxes();
	});

	$("#lightbox-start-over #proceed").live("click", function() {
		$(".school").not("#template").each(function() {
			school_id = $(this).attr("id");
			$("#"+school_id).remove();
			$("#overlay").fadeOut(200);
			$("#lightbox-start-over").fadeOut(300);
			$("#introduction").slideDown(500);
			$("#add_a_school").hide();		
		});
		schools = {};	
	});


	$(".bar-info").live('mouseover', function() {
		$(this).qtip({
			overwrite: false, 
			content: $(this).attr("tooltip"),
			position: {
				corner: {
					target: "bottomLeft",
					tooltip: "topLeft"
				},
				adjust: {
					x: 2,
					y: -5,
					screen: true,
					scroll: true	
				}
			},
			show: {
				ready: true
			},
			solo: true,
			style: {
				tip: {
					corner: "topLeft",
					color: false,
					size: {x: 10, y: 10}
				},
			},	
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
		$("#tooltip-container > p").html($(this).attr("tooltip"));
		
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
            failure: function(data) {
            	alert("Request failure: " + xhr.status + ", " + thrownError);
            },
            error: function(xhr, ajaxOptions, thrownError) {
            	alert("Request error: " + xhr.status + ", " + thrownError);
            }
		});
   
    });  
});


