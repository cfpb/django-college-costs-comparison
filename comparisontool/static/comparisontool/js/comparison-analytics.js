
$(function() {
	var total_schools_added = 0;

	function fire_school_added(school_id) {
		// a school was added, increment
		total_schools_added += 1;
		
		// fire when school is added, get school_id
        ga('send', {
			'hitType': 'event',         
			'eventCategory': 'School Interactions',  
			'eventAction': 'School Added',     
			'eventLabel': 'School ID',
			'eventValue': school_id
        });

		// fire when school is added, get totals school added
        ga('send', {
			'hitType': 'event',         
			'eventCategory': 'School Interactions',  
			'eventAction': 'School Added',     
			'eventLabel': 'Total Schools Added',
			'eventValue': total_schools_added
        });
	}

	$(document).ready( function() {

		// Track adding a school by handling the 'continue' button click event in the XML screen
		$(".add-school-info .xml-info .continue").click( function() {
			var headercell = $(this).closest("[data-column]");
			var column = headercell.attr("data-column");
			var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
			fire_school_added(school_id);
	    });

		// Track adding a school by handling the 'process' button click event in the XML screen
	    $(".add-school-info .add-xml .xml-process").click( function() {
	    	var headercell = $(this).closest("[data-column]");
			var column = headercell.attr("data-column");
			var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
			fire_school_added(school_id);
	    });

	    // Track 'Reached Zero Left to Pay'
	    // _gaq.push(["_trackEvent", "School Interactions", "Reached Zero Left to Pay", school_id]);

	    // Track XML Process Button Pressed
		$(".add-school-info .add-xml .xml-process").click( function() {
			var headercell = $(this).closest("[data-column]");
			var column = headercell.attr("data-column");
			var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");

			var xml = headercell.find(".xml-text").val();
			if ( xml == "" ) {
		        ga('send', {
					'hitType': 'event',         
					'eventCategory': 'School Interactions',  
					'eventAction': 'Apply XML button clicked - no text detected',     
					'eventLabel': 'School ID',
					'eventValue': school_id
		        });
			}
			else {
				ga('send', {
					'hitType': 'event',         
					'eventCategory': 'School Interactions',  
					'eventAction': 'Apply XML button clicked - with text',     
					'eventLabel': 'School ID',
					'eventValue': school_id
		        });
			}
		});

		// Track XML Continue Button Clicked
		$(".add-school-info .xml-info .add-xml").click( function() {
			var headercell = $(this).closest("[data-column]");
			var column = headercell.attr("data-column");
			var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
	        ga('send', {
				'hitType': 'event',         
				'eventCategory': 'School Interactions',  
				'eventAction': 'XML Continue Button Clicked',     
				'eventLabel': 'School ID',
				'eventValue': school_id
	        });			
		});

	    // Track school removal
		$(".remove-confirm a.remove-yes").click( function(event) {
			event.preventDefault();
			var headercell = $(this).closest("[data-column]");
			var column = headercell.attr("data-column");
			var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
	        ga('send', {
				'hitType': 'event',         
				'eventCategory': 'School Interactions',  
				'eventAction': 'School Removed',     
				'eventLabel': 'School ID',
				'eventValue': school_id
	        });	
		});

		// Track GI Bill panel opening
		$(".gibill-calculator, input[name='gibill']").click( function(event) {
			event.preventDefault();
			var column = $(this).closest("[data-column]").attr("data-column");
			school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
			if ( ( school_id != "average-private" ) && ( school_id != "average-public" ) ) {
				var panel = $("[data-column='" + column + "'] .gibill-panel");
				if ( panel.is(":hidden") ) {
					ga('send', {
						'hitType': 'event',         
						'eventCategory': 'School Interactions',  
						'eventAction': 'GI Bill Calculator Opened',     
						'eventLabel': 'School ID',
						'eventValue': school_id
			        });	
				}		
			}
		});

		// Track GI Bill submit
		$(".gibill-panel .military-calculate").click( function() {
			var column = $(this).closest("[data-column]").attr("data-column");
			var school_id = $("#institution-row [data-column='" + column + "']").attr("data-schoolid");
			ga('send', {
				'hitType': 'event',         
				'eventCategory': 'School Interactions',  
				'eventAction': 'GI Bill Calculator Submit',     
				'eventLabel': 'School ID',
				'eventValue': school_id
	        });	
		})

		// Track Tooltip Click
		$(".tooltip-info").click( function(event) {
			var tooltip = $(this).attr("data-tipname");
			ga('send', {
				'hitType': 'event',         
				'eventCategory': 'Page Interactions',  
				'eventAction': 'Tooltip Clicked',     
				'eventLabel': 'Tooltip ID',
				'eventValue': tooltip
	        });	
		});

		// Track email sent
		$("#send-email").click( function(){
			// _gaq.push([ "_trackEvent", "School Interactions", "Save and Share", "Send email"] );
			ga('send', {
				'hitType': 'event',         
				'eventCategory': 'School Interactions',  
				'eventAction': 'Save and Share',     
				'eventLabel': 'Send email'
	        });
		});

		// Track toggle save drawer
		$("#save-and-share").click( function( event, native ) {
			if ( native == undefined) {
				ga('send', {
					'hitType': 'event',         
					'eventCategory': 'School Interactions',  
					'eventAction': 'Save and Share',     
					'eventLabel': 'toggle button'
		        });
			}
		});

		// Track Save current worksheet
		$("#save-current").click( function() {
			ga('send', {
				'hitType': 'event',         
				'eventCategory': 'School Interactions',  
				'eventAction': 'Save and Share',     
				'eventLabel': 'Save current worksheet'
	        });
		});

		// Track School Information clicks
		$(".navigator-link").click( function() {
			var school_id = $(this).closest("[data-column]").attr("data-schoolid");
			ga('send', {
				'hitType': 'event',         
				'eventCategory': 'School Interactions',  
				'eventAction': 'School Information link clicked',     
				'eventLabel': 'School ID',
				'eventValue': school_id
	        })
		});

		// Track copying of the URL
		$("#unique").click( function() {
			ga('send', {
				'hitType': 'event',         
				'eventCategory': 'School Interactions',  
				'eventAction': 'Save and Share',     
				'eventLabel': 'Copy URL'
	        });
		});

		$("#save-drawer .save-share-facebook").click( function() {
			ga('send', {
				'hitType': 'event',         
				'eventCategory': 'School Interactions',  
				'eventAction': 'Save and Share',     
				'eventLabel': 'Facebook_saveshare'
	        });
		});

		$("#save-drawer .save-share-twitter").click( function() {
			ga('send', {
				'hitType': 'event',         
				'eventCategory': 'School Interactions',  
				'eventAction': 'Save and Share',     
				'eventLabel': 'Twitter_saveshare'
	        });
		});


	});
}(jQuery));