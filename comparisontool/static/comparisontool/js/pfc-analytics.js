/*jshint maxerr: 10000 */

// Paying for College custom analytics file

var PFCAnalytics = (function() {
    //-- Delay calculations after keyup --//
    var delay = (function(){ 
            var t = 0;
            return function(callback, delay) {
                clearTimeout(t);
                t = setTimeout(callback, delay);
            };
    })(); // end delay()

    //-- findEmptyColumn() - finds the first empty column, returns column number [1-3] --//
    function findEmptyColumn() {
        var column = false;
        for (var x = 1; x <= 3; x++) {
            var school_id = $("#institution-row [data-column='" + x + "']").attr("data-schoolid");
            if ( school_id === "" ) {
                column = x;
                break;
            }
        }
        return column;
    } // end findEmptyColumn()

    var global = {
        'schoolsAdded': 0, 'emptyColumn': 1
    }
    var schoolsZeroed = ['example'];

    // Fire an event when a school is removed.
    $('.remove-confirm .remove-yes').click( function() {
        var columnNumber = $(this).parents('[data-column]').attr('data-column');
        var schoolID = $('#institution-row [data-column="' + columnNumber + '"]').attr('data-schoolid');
        _gaq.push([ "_trackEvent", "School Interactions", "School Removed", ] );
        // Important to add a School tracking - reset the global.emptyColumn var
        global.emptyColumn = findEmptyColumn();
    });

    // Fire an event when Left to Pay = $0 and Costs > $0
    $('#comparison-tables').on('keyup', 'input.school-data', function (ev) {
        var columnNumber = $(this).parents('[data-column]').attr('data-column');
        delay(function(){
            var totalCosts = $('.breakdown [data-column="' + columnNumber + '"] .costs-value').html();
            var leftToPay = $('.breakdown [data-column="' + columnNumber + '"] [data-nickname="gap"]').html();
            var schoolID = $('#institution-row [data-column="' + columnNumber + '"]').attr('data-schoolid');
            if (leftToPay === "$0" && totalCosts !== "$0") {
                _gaq.push(["_trackEvent", "School Interactions", "Reached Zero Left to Pay", schoolID]);            
            }
        }, 1000);
    });

    // Fire an event when a tooltip is clicked
    $(".tooltip-info").click( function(event) {
        var tooltip = $(this).attr("data-tipname");
        _gaq.push(["_trackEvent", "Page Interactions", "Tooltip Clicked", tooltip]);
    });

    // Fire an event when clicking "Calculate" button 
    $(".gibill-panel .military-calculate").click( function() {
        var columnNumber = $(this).closest("[data-column]").attr("data-column");
        var school_id = $("#institution-row [data-column='" + columnNumber + "']").attr("data-schoolid");
        _gaq.push(["_trackEvent", "School Interactions", "GI Bill Calculator Submit", school_id]);        
    });

    // Fire an event when Send Email is clicked
    $("#send-email").click( function(){
        _gaq.push([ "_trackEvent", "School Interactions", "Save and Share", "Send email"] );
    });

    // Fire an event when save draw is opened
    $("#save-and-share").click( function( event, native ) {
        if ( native == undefined) {
            _gaq.push([ "_trackEvent", "School Interactions", "Save and Share", "toggle button"] );
        }        
    });

    // Fire an event when save current is clicked
    $("#save-current").click( function() {
        _gaq.push([ "_trackEvent", "School Interactions", "Save and Share", "Save current worksheet"] );
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

    // Fire an event when Get Started is clicked
    $('#get-started-button').click(function() {
        _gaq.push([ "_trackEvent", "School Interactions", "School Cost Comparison", "Get Started Button"] ); 
    });

    // Fire an event when Add a School is cancelled
    $('#introduction .add-cancel').click( function() {
        _gaq.push([ "_trackEvent", "School Interactions", "School Cost Comparison", "Cancel Button"] ); 
    });

    // Fire an event when Continue is clicked
    $('#introduction .continue').click( function() {
        _gaq.push([ "_trackEvent", "School Interactions", "School Cost Comparison", "Continue Button"] ); 
    });

    // Fire an event when Add another school is clicked
    $('#introduction .add-another-school').click( function() {
        _gaq.push([ "_trackEvent", "School Interactions", "School Cost Comparison", "Add another school Button"] ); 
    });

    // Fire an event when adding a school.
    function newSchoolEvent() {
        var schoolID = $("#school-name-search").attr("data-schoolid");
        var program = $('#step-one input:radio[name="program"]:checked').val();
        var prgmlength = String($('#step-one select[name="prgmlength"]').val());
        var offer = "No";
        global.schoolsAdded++;
        var schoolCount = String(global.schoolsAdded);
        if ( $("#finaidoffer").is(":checked")) {
            offer = "Yes";
        }
        _gaq.push([ "_trackEvent", "School Interactions", "Total Schools Added", schoolCount ] );
        _gaq.push([ "_trackEvent", "School Interactions", "School Added", schoolID ] );
        _gaq.push([ "_trackEvent", "School Interactions", "Program Type", program ] );
        _gaq.push([ "_trackEvent", "School Interactions", "Program Length", prgmlength ] );
        _gaq.push([ "_trackEvent", "School Interactions", "Financial Aid Clicked", offer ] );
    }

    // Check for a new school added when .continue and .add-another-school are clicked
    $('#introduction .continue, #introduction .add-another-school').click( function() {
        delay(function() {
            var newEmpty = findEmptyColumn();
            console.log("===> Column Compare: " + newEmpty);
            if (newEmpty != global.emptyColumn) {
                newSchoolEvent();
                global.emptyColumn = newEmpty;
            }
        }, 500);

    });

    // Fire event when user clicks the arrows to open sections
    $('.arrw-collapse').click(function() {
        var arrwName = $(this).attr('data-arrwname');
        _gaq.push([ "_trackEvent", "School Interactions", arrwName, "Drop Down" ] );
    });


    //## OLDER CODE BELOW ##//

    // Main image on /paying-for-college/
    $('.hero-link').click(function() {
        _gaq.push(['_trackEvent', 'Hero', 'Click', 'Image']);
    });
    // Permalink field on /paying-for-college/ Will need to add class
    /* $('.pfc-short-link').focus(function() {
        _gaq.push(['_trackEvent', 'Form Field', 'Click', 'Permalink Box']);
    }); */
    // Collapsed content click tracking
    // Let's split these out per interaction (all three types)
    /* $('.bubble').click(function() {
        _gaq.push(['_trackEvent', 'Page Interactions', 'Click', 'Collapsed_Tabs_Key_Questions']);
    }); */
    $('.ec').click(function() {
        _gaq.push(['_trackEvent', 'Page Interactions', 'Click', 'Collapsed_Accordion_Options']);
    });
    $('.bubble-top-text').click(function() {
        _gaq.push(['_trackEvent', 'Page Interactions', 'Click', 'Collapsed_Accordion_Options_Questions']);
    });
    // Link tracking for timeline
    // Build delay on on exit links (500ms)
    $('.timeline-exit-link').click(function() {
        var link_text = $(this).find(".bottom-process-label").html();
        var link_url = $(this).attr('href');
        _gaq.push(['_trackEvent', 'Exit Link', link_text, link_url]);
            function setTimeout() { 
            if (_target == undefined || _target.toLowerCase() !== '_blank' || _target.toLowerCase() !== '_new') {
                setTimeout(function() { location.href =  _href; }, 500);
                return false;
            }
        }
    });
    // Link tracking project-wide
    // Build delay on on exit links (500ms)
    $('.exit-link').click(function() {
        var link_text = $(this).text();
        var link_url = $(this).attr('href')
        _gaq.push(['_trackEvent', 'Exit Link', link_text, link_url]);
            function setTimeout() { 
            if (_target == undefined || _target.toLowerCase() !== '_blank' || _target.toLowerCase() !== '_new') {
                setTimeout(function() { location.href =  _href; }, 500);
                return false;
            }
        }
    });
    $('.internal-link').click(function() {
        var link_text = $(this).text();
        var link_url = $(this).attr('href')
        _gaq.push(['_trackEvent', 'Internal Link', link_text, link_url]);
    });
    // Email address submission on /paying-for-college/
    /* $('.email-button').click(function() {
        var link_text = $(this).text();
        var link_url = $(this).attr('href')
        _gaq.push(['_trackEvent', 'Submission', link_text, link_url]);
    }); */
    // Track social sharing and following project-wide
    // Bottom sharing box
    $('.botshare > .share-facebook').click(function(e) {

        // Save the href so we can change the url with js
        var link_url = $(this).attr('href');

        // Stop the link from going anywhere
        // (it's ok we saved the href and we'll fire it later)
        e.preventDefault();

        // Use a try statement in case there are google analytics errors
        // that could prevent the rest of this code from changing the url
        // thus breaking the link completely instead of delaying it!

        try { _gaq.push(['_trackEvent', 'Social', 'Share', 'Facebook_Bottom']); }
        catch( error ) {}

        // Give google analytics time to do its thing before changing the page url
        // http://support.google.com/analytics/answer/1136920?hl=en
        setTimeout(function() { document.location.href = link_url; }, 500);

    });
    $('.botshare > .share-twitter').click(function(e) {
        
        // Save the href so we can change the url with js
        var link_url = $(this).attr('href');

        // Stop the link from going anywhere
        // (it's ok we saved the href and we'll fire it later)
        e.preventDefault();

        // Use a try statement in case there are google analytics errors
        // that could prevent the rest of this code from changing the url
        // thus breaking the link completely instead of delaying it!

        try { _gaq.push(['_trackEvent', 'Social', 'Share', 'Twitter_Bottom']); }
        catch( error ) {}

        // Give google analytics time to do its thing before changing the page url
        // http://support.google.com/analytics/answer/1136920?hl=en
        setTimeout(function() { document.location.href = link_url; }, 500);

    });
    $('.botshare > .share-email').click(function(e) {
        
        // Save the href so we can change the url with js
        var link_url = $(this).attr('href');

        // Stop the link from going anywhere
        // (it's ok we saved the href and we'll fire it later)
        e.preventDefault();

        // Use a try statement in case there are google analytics errors
        // that could prevent the rest of this code from changing the url
        // thus breaking the link completely instead of delaying it!

        try { _gaq.push(['_trackEvent', 'Social', 'Share', 'Email_Bottom']); }
        catch( error ) {}

        // Give google analytics time to do its thing before changing the page url
        // http://support.google.com/analytics/answer/1136920?hl=en
        setTimeout(function() { document.location.href = link_url; }, 500);

    });
    // Social following
    $('#follow-button').click(function() {
        _gaq.push(['_trackEvent', 'Social', 'Follow', 'Twitter_PFC']);
    });
    $('.pluginButton').click(function() {
        _gaq.push(['_trackEvent', 'Social', 'Follow', 'Facebook_PFC']);
    });
    // Tracks file downloads project-wide
    $('a[href$="zip"],a[href$="pdf"],a[href$="doc"],a[href$="docx"],a[href$="xls"],a[href$="xlsx"],a[href$="ppt"],a[href$="pptx"],a[href$="txt"],a[href$="csv"]').click(function() {
        var link_text = $(this).text();
        var link_url = $(this).attr('href')
        _gaq.push(['_trackEvent','Downloads', link_text, link_url]);
    });
})(jQuery);

// Tracks video embed interactions on page (must use iFrames)
/*
    YouTube Analytics
    Code adapted from:
        http://www.lunametrics.com/blog/2012/10/22/automatically-track-youtube-videos-events-google-analytics/
        http://lunametrics.wpengine.netdna-cdn.com/js/lunametrics-youtube.js
    Code adapted by Alex Mueller for ISITE Design http://isitedesign.com
*/

// load the YouTube iframe API
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// initialize our arrays to hold video and player information
var playerArray = [],
    videoArray = [];

// safely pass the jQuery object as $
(function($) {
    // enables tracking of all YouTube videos on the page
    function trackYouTube() {
        // iterate through every iframe on the page
        $('iframe').each(function(i) {
            // grab the video source and other properties
            var baseUrlLength,
                $iframe = $(this),
                iframeSrc = $iframe.attr('src'),
                isYouTubeVideo = false,
                videoID;

            // if the video uses the http protocol
            if (iframeSrc.substr(0,29) == "http://www.youtube.com/embed/") {
                baseUrlLength = 29;
                isYouTubeVideo = true;
            }
            // otherwise if the video uses the https protocol
            else if (iframeSrc.substr(0,30) == "https://www.youtube.com/embed/") {
                baseUrlLength = 30;
                isYouTubeVideo = true;
            }

            // if we're dealing with a YouTube video, store its information in our arrays
            if (isYouTubeVideo) {
                // grab the videoID
                videoID = iframeSrc.substr(baseUrlLength);

                // if the ID ends with extra characters...
                if (videoID.indexOf('?') > -1) {
                    // ...remove the extra characters
                    videoID = videoID.substr(0, videoID.indexOf('?'));
                }

                // put an object in our array with the videoID...
                videoArray[i] = {};
                videoArray[i].id = videoID;

                // ...and the video title (pulled from the YouTube data API)
                $.ajax({
                    dataType: 'JSON',
                    url: 'https://gdata.youtube.com/feeds/api/videos/' + videoID + '?v=2&alt=json'
                })
                .done(function(data) {
                    videoArray[i].title = data.entry.title.$t;
                });

                // put the videoID on the iframe as its id
                $iframe.attr('id', videoID);
            }
        });
    }

    $(function() {
        // initiate tracking on document ready
        trackYouTube();
    });
})(jQuery);



// when the YouTube iframe API has loaded
function onYouTubeIframeAPIReady() {
    // insert YouTube Player objects into our playerArray
    for (var i = 0; i < videoArray.length; i++){
        playerArray[i] = new YT.Player(videoArray[i].id,{
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

// when the player changes states
function onPlayerStateChange(event) {
    var videoIndex = event.target.id - 1;
        
    // if the video begins playing, send the event
    // Add seconds played instead of ended
    if (event.data == YT.PlayerState.PLAYING) {
        _gaq.push(['_trackEvent', 'Videos', 'Play', videoArray[videoIndex].title ]);
    }

    if (event.data == YT.PlayerState.PAUSED) {
            _gaq.push(['_trackEvent', 'Videos', 'Pause', videoArray[videoIndex].title ]);
    }
    // if the video ends, send the event
    if (event.data == YT.PlayerState.ENDED) {
        _gaq.push(['_trackEvent', 'Videos', 'Ended', videoArray[videoIndex].title ]);
    }
}