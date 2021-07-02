$(document).ready(function(){
	//rollOver
	$(".roll a").each(function(){
		var image = $(this).children("img");
		var imgsrc = $(image).attr("src");
		$(this).bind('mouseover keyup' , function()	{
			var on = imgsrc.replace(/_off.gif/,"_on.gif");
			$(image).attr("src",on);
		})
		$(this).bind('mouseout focusout' , function()	{
			var off = imgsrc.replace(/_on.gif/,"_off.gif");
			$(image).attr("src",off);
		})
	});//==rollOver

})