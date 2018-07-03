'use strict';

let financialView = {
  $accordionToggle: $( '.accordion-toggle' ),

  init: function() {
    this.addAccordionListener();
  },

  addAccordionListener: function() {
    // TODO: This listener should be a button, not an anchor
    let expandText = "Expand";
    let collapseText = "Collapse";
    this.$accordionToggle.each( function( i, v ) {
      let target = $( this ).attr( 'data-accordion-target' );
      let $targets = $( '[data-accordion-name="' + target + '"]');
      let $text = $( this ).find( '.accordion-text' );
      $( this ).on( 'click', function( ev ) {
        ev.preventDefault();
        $targets.toggleClass( 'hidden' );
        $( this ).toggleClass( 'arrw' );
        if ( $( this ).hasClass( 'arrw' ) ) {
          $text.html( expandText );
        } else {
          $text.html( collapseText );
        }
      } );

    } );

    // // Show the instructions on expand the first time and let it be
    // $('tr.totalcont').click(function() {
    //     $('tr.instructions').removeClass('tr-hide');
    // });
    // $('.grants').click(function() {
    //     $('.grants-row:not(.instructions)').toggleClass('tr-hide');
    //     $(this).closest('.arrw-collapse').toggleClass('arrw');
    // });
    // $('.federal').click(function() {
    //     $('.federal-row:not(.instructions)').toggleClass('tr-hide');
    //     $(this).closest('.arrw-collapse').toggleClass('arrw');
    // });
    // $('.private').click(function() {
    //     $('.private-row:not(.instructions)').toggleClass('tr-hide');
    //     $(this).closest('.arrw-collapse').toggleClass('arrw');
    // });
    // $('.contributions').click(function() {
    //     $('.contrib-row:not(.instructions)').toggleClass('tr-hide');
    //     $(this).closest('.arrw-collapse').toggleClass('arrw');
    // });
  }

};

module.exports = financialView;
