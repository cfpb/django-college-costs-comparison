/*----------------
	DOCUMENT.READY
--------------------*/

$(document).ready(function() {
	/* --- Initialize Visualizations --- */
	// Pie Charts
	var x;
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
		column = $(this).closest("[data-column]").attr("data-column");
		$(this).hide();
		$("#institution-row [data-column='" + column + "'] .add-school-info").show();
		$(".add-school-info").css("height", "100%");
		fade_header();
		return false;
	});

	// Do a search when the school-search input has keyup...
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

	// #school-search-results list links
	$(".add-school-info .search-results").on("click", ".school-result a", function(event) {
		event.preventDefault();
		var headercell = $(this).closest("[data-column]");
		var column = headercell.attr("data-column");
		var school_id = $(this).attr("href");
		headercell.attr("data-schoolid", school_id);
		headercell.find(".search-results").hide();

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
			// alert("ERROR");
		});	
		schools[school_id] = schooldata;
		headercell.find(".school-search").hide();
		headercell.find(".program-selection").show();
	});

	// Add average public
	$(".add-school-info .add-average-public").click( function (ev) {
		schools["average-public"] = presets["average-public"];
		var column = $(this).closest("[data-column]").attr("data-column");
		$("#institution-row [data-column='" + column + "']").attr("data-schoolid", "average-public");
		build_school_element(column);
		var headercell = $(this).closest("[data-column]");
		headercell.find(".add-school-info").hide();
		headercell.find(".add-school-info .hidden-box").hide();
		headercell.find(".add-school-info .school-search").show();
		calculate_school(column);
		$(".add-average-public").hide();
	});

	// Add average private
	$(".add-school-info .add-average-private").click( function (ev) {
		schools["average-private"] = presets["average-private"];
		var column = $(this).closest("[data-column]").attr("data-column");
		$("#institution-row [data-column='" + column + "']").attr("data-schoolid", "average-private");
		build_school_element(column);
		var headercell = $(this).closest("[data-column]");
		headercell.find(".add-school-info").hide();
		headercell.find(".add-school-info .hidden-box").hide();
		headercell.find(".add-school-info .school-search").show();
		calculate_school(column);
		$(".add-average-private").hide();
	});

	// If the click Continue in the XML option panel
	$(".add-school-info .program-selection .continue").click( function() {
		var column = $(this).closest("[data-column]").attr("data-column");
		$("[data-column='" + column + "'] .program-selection").hide();
		$("[data-column='" + column + "'] .prgmlength-selection").show();
	});

	$(".add-school-info .prgmlength-selection .continue").click( function() {
		var headercell = $(this).closest("[data-column]");
		var column = headercell.attr("data-column");
		var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
		var schooldata = schools[school_id];
		$("[data-column='" + column + "'] .prgmlength-selection").hide();
		if ( schooldata.kbyoss == "TRUE") {
			$("[data-column='" + column + "'] .add-xml").show();
		}
		else {
			$("[data-column='" + column + "'] .no-xml").show();		
		}
	});

	$(".add-school-info .xml-info .continue").click( function() {
		var headercell = $(this).closest("[data-column]");
		var column = headercell.attr("data-column");
		var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
		var schooldata = schools[school_id];
		build_school_element(column);
		headercell.find(".add-school-info").hide();
		headercell.find(".add-school-info .hidden-box").hide();
		headercell.find(".add-school-info .school-search").show();
		if ( $(this).closest(".xml-info").hasClass("add-xml") ) {
			_gaq.push(["_trackEvent", "School Interactions", "XML Continue Button Clicked", school_id]);
		}
		calculate_school(column);	
	});

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
				var interest = schooldata[$(this).attr("name")] * 100;
				interest = Math.round( interest * 10) / 10;
				$(this).val( interest + "%") ;
			}
			else {
				$(this).val( num_to_money( schooldata[$(this).attr("name")] ) ) ;
			}
		});

		schools[school_id] = schooldata;

		headercell.find(".add-school-info").hide();
		headercell.find(".add-school-info .hidden-box").hide();
		headercell.find(".add-school-info .school-search").show();
		calculate_school(column);
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
	$(".gibill-calculator, input[name='gibill']").click( function(event) {
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
	$("#comparison-tables input.school-data").on('keyup', function (ev) {
		var column = $(this).closest("[data-column]").attr("data-column");
		var school = $("[data-column='" + column + "']");
		var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
		var value = money_to_num($(this).val());
		if ( $(this).hasClass("interest-rate") ) {
			value = value / 100;
		}
		var name = $(this).attr("name");
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
	hide_column(2);
	hide_column(3);
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


