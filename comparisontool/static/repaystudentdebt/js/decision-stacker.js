/*
 * Decision tree where each previous choice is visible
 */
(function ($) {

  function assignButtons( code ) {
    // this function relies on decisionStackerTargets object
    if (typeof decisionStackerTargets !== "object") {
      return false;
    }
    $elem = $('#q' + decisionStackerTargets[code]['question']);
    var sectionOrigin = $elem.attr('data-ds-origin');
    var sectionData = decisionStackerTargets[sectionOrigin];
    $elem.find('button').each(function() {
      var name = $(this).attr('data-name');
      if ( sectionData.hasOwnProperty( name ) ) {
        $(this).val(sectionData['question'] + sectionData[name]);
      }
    });
  }

  $.fn.decisionStacker = function () {
    assignButtons( '0' );
    // Set buttons up to lead to the next section, show appropriate text.
    $('.ds-section .ds-buttons button').click( function() {
      var code = $(this).val();

      var destination = decisionStackerTargets[code]['question'];
      // destination is a question
      if ( destination !== undefined ) {
        destination = '#q' + destination;
      }
      // destination is a module
      else {
        destination = '#' + decisionStackerTargets[code]['module'];
        $('.ds-clear-all.ds-clear-after-m').show();
      }
      $( destination ).slideDown( 200, function() {
        var scrollTop = $( destination ).offset().top;
        // customization:
        if ( destination.substring(0,2) == '#q' ) {
          scrollTop = $( '#your-situation' ).offset().top;
        }
        $( 'html, body' ).animate({
            scrollTop: scrollTop
        }, 800);
      });
      $( destination ).attr('data-ds-origin', code);
      assignButtons( code );
      var $section = $(this).closest('.ds-section');
      $section.find('[data-responds-to="' + $(this).attr('data-name') + '"]').show();
      $section.find('.ds-content').slideUp( 200 );
      $('.ds-clear-all.ds-clear-after-q').show();

    });
    $('.ds-response-container .go-back').click( function() {
      var $section = $(this).closest('.ds-section');
      var questionNumber = Number($section.attr('data-ds-qnum'));
      $('.ds-question').each( function() {
        if ( Number($(this).attr('data-ds-qnum')) > questionNumber ) {
          $(this).find('.ds-content').show();
          $(this).find('.ds-response-container div').hide();
          $(this).hide();
        }
      });
      $section.find( '.ds-response-container div' ).hide();
      $('.ds-module').hide();
      $section.find( '.ds-content' ).slideDown(400, function(){
        $( 'html, body' ).animate({
            scrollTop: $section.offset().top
        }, 800);
      });
      if ( questionNumber === 1 ) {
        $('.ds-clear-all').hide();
      }
    });
    $('.ds-clear-button').click( function() {
      $('#q1 .go-back').click();
    });
  };

}(jQuery));


