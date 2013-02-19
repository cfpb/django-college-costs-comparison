$(function(){
    
    
    	
		$("#school-1, #school-2, #school-3").autocomplete({
			source: 'autocomplete.json',
			autoFocus: true,
			select: function(event, ui) {
			
				// Enable compare buttom once at least one school is selected
				$("#compare-button").removeAttr("disabled");
				// $("#compare-button").attr("disabled","disabled");
			
				// Only show in/out state if this is a public school
				if(ui.item.public == true){
					$(this).parent().children(".school-state-select").removeClass("hidden");
				}
				$(this).prev('.unitid').attr('value', ui.item.unitid);
				
			}
		});
		
		
		//////////////////////////////////////////////////////////////////////////////
		
		
		 // hide school in state selector if empty
		$(".school-input").blur(function(){
			if(!$(this).val()){
				$(this).next().addClass("hidden");
			}
		});
		
		
		// Save ids for next page
		$("#compare-button").click(function(){
			
			// Can serialize data here
			
			form=$('#selectschools');

			form.submit()
			
			return false;
		});
    
    
    
})
