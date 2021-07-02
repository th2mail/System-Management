/*주메뉴*/
var $devWidth;
var $limitSize=1920;
$(document).ready(function() {
/* 디바이스 사이즈 체크
$devWidth=$("body").width();
$(window).resize(function(){
	$devWidth=$("body").width(); 
})*/
var menu_clicked = "";
var menu_hovered = "";

	$(".gnblist > li > a").bind("mouseover focus",function() {
		  if($devWidth <$limitSize) return false;
			/* 태경 수정 *///$(this).next().show();

			/*$(".gnblist > li > a").css({
				'height':'62px',
				'background':'none'
			});*/

			menu_hovered = $(this).parent().attr('class');

			//태경 수정 0730 - hover 시에 파란 원 안생기게 변경
			// $(this).css('height','62px');
			//$(this).css('background','url("images/icon_m_over.png") no-repeat center 30px');
			$(this).css('color','#40A8DE');
	});

	$(".gnblist > li > a").mouseleave(function(){
		if($devWidth <$limitSize) return false;
		//태경 수정 0730 - 선택된 li의 클래스를 변수에 저장해 선택된것과 마우스가 올라갔던것과 비교
		if(menu_clicked != menu_hovered){
			$('.gnblist > li.'+menu_hovered.replace(" ",".")+'>a').css('color','#333949');
			$('.gnblist > li.'+menu_hovered.replace(" ",".")+'>a').css({
				'height':'62px',
				'background':'none'
			});
		}
		
			///* 태경 수정 */원래 메뉴 스타일로 돌아오는 코딩....
			
	//	$(".gnblist > li > a").css('color','#333949');
	//	$(".gnblist ul").stop().slideUp(50);
	//	$(".gnblist > li > a").css({
			// 'height':'62px',
			// 'background':'none'
	//	}); 
	});

	/* 태경 수정- 클릭시 다른것 다 숨기고 클릭 하위 ul만 표시*/
	$(".gnblist > li > a").bind("click",function() {

		menu_clicked = $(this).parent().attr('class');
		console.log(menu_clicked);

		//태경 수정- 다른부분 색을 다시 원상태로
		$(".gnblist > li > a").css('color','#333949');
		//태경 수정 0730 - 파란 원도 지우기
		$('.gnblist > li > a').css({
			'height':'62px',
			'background':'none'
		});
		$(".gnblist ul").hide();

		$(this).next().show();

		$(this).css('height','62px');
		$(this).css('background','url("images/icon_m_over.png") no-repeat center 30px');
		$(this).css('color','#40A8DE');  
  });
	
	/*탭메뉴*/
		
	$(document).ready(function() {

	//Default Action
	$(".tab_content").hide(); //Hide all content
	$(".posts ul li:first").addClass("active").show(); //Activate first tab
	$(".tab_content:first").show(); //Show first tab content
	
	//On Click Event
	$(".posts ul li").click(function() {
		$(".posts ul li").removeClass("active"); //Remove any "active" class
		$(this).addClass("active"); //Add "active" class to selected tab
		$(".tab_content").hide(); //Hide all tab content
		var activeTab = $(this).find("a").attr("href"); //Find the rel attribute value to identify the active tab + content
		$(activeTab).fadeIn(); //Fade in the active content
		return false;
	});

});



$(function () {
	faq();      //faq 슬라이드
    
});


/* *********************************************************************************
 *   FAQ 슬라이드
 * **********************************************************************************/
function faq() {
    var faq = $(".faq");
    faq.a = faq.find(">li>a");
    faq.con = faq.find(">li>.faq_a");

    faq.a.on("click",function () {
		var content = $(this).siblings('div.faq_a')
		
        if(content.is(":hidden")){
            faq.a.removeClass("on");
            faq.con.slideUp("fast");
            $(this).addClass("on");
            content.slideDown("fast");
        }else{
            $(this).removeClass("on");
            content.slideUp("fast");
        }
        return false;
    });
}

/*
$(document).ready(function() {
	$('#main-sidebar2').simpleSidebar({
		opener: '#toggle-sidebar2',
		wrapper: '#main',
		animation: {
			easing: "easeOutQuint"
		},
		sidebar: {
			align: 'right', // right는 오른쪽
			closinglinks: '.close-sb',
		},
		sbWrapper: {
			display: true
		}
	});
});


var speed = 500;
var header = 0;
*/

$(window).load(function () {	    

	$('*[data-button]').click(function() {
		$('html, body').animate({
			scrollTop: $('*[data-section="'+$(this).attr('data-button')+'"]').offset().top
		}, speed);
	});



	function resize(){		
		$('.tab').height(window.innerHeight);

		$('.tab-headline').each(function(index, element) {	
			$(this).css('margin-left',-$(this).width()/2);
			$(this).css('margin-top',-$(this).height()/2);		
		});	
		
		setNavPin();
	}


	$( window ).resize(function() {
		resize();
	});

	resize();
});

});
