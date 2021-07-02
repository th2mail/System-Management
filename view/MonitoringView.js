import EventBus from '../utils/EventBus.js'
import Dispatcher from '../controller/Dispatcher.js'
import Setting from '../controller/Setting.js'
import Utils from '../utils/Utils.js'

class MonitoringView {

    constructor () {
        this.almhist_data = [];
        this.almcur_data = [];
        this.myChart;
    }

    init () {
        let _this = this;

        let html = `
            <!-- wrap_right -->
            <div class="wrap_right">
                <div id="contents">
                    <h2>모니터링</h2>
                        <!--탭메뉴 //S -->
                        <div data-id="tab" class="posts mt10">
                            <ul>
                                <li data-id="status" class="active"><a class="hand">경보상태</a><span></span></li>
                                <li data-id="history" ><a class="hand">경보이력</a><span></span></li>
                            </ul>
                        </div>
                        <!--검색조건-->
                        <div class="btn_searchBox fr mt_33 mr10">
                            <!-- 날짜검색 -->
                            <div class="history sear_date mr10" id="rangedate" style="display:none;float: left;margin-right:10px;">
                                <span class="mr10 calendar"> <input id="fdate" name="fdate" type="us-date1" onKeyPress="if (event.keyCode!=46 && event.keyCode!=45 && event.keyCode<48 || event.keyCode>57)) event.returnValue=false" maxlength="10" ><a  class="hand">달력</a> </span>
                                <span class="calendar"><input id="tdate" type="us-date2" onKeyPress="if (event.keyCode!=46 && event.keyCode!=45 && event.keyCode<48 || event.keyCode>57)) event.returnValue=false" maxlength="10"> <a class="hand">달력</a> </span>
                            </div>    
                            <!-- // 날짜검색-->
                            <div class="sear_word_sel mr10">
                                <select name="" id="filter" title="상태">
                                    <option value="">모두보기</option>
                                    <option value="CRITICAL">CR</option>
                                    <option value="WARNING">WR</option>
                                </select>
                            </div>
                            <a id="btn_search" class="btn_search search btn_round v_mid hand history" style="display:none;"  title="조회"></a> 
                        </div>
                        <!--// 검색조건 -->
                        <!--// 탭메뉴  --> 
                        <!--탭컨텐츠 -->
                        <div class="tab_container -bgNone"> 
                            <!-- 탭컨텐츠 01 -->
                            <div id="tab1" class="tab_content ">
                                <div class="panel-box"></div>
                                <div class="panel-box mt20">
                                    <div><div id="calendar" style="width:100%;height:200px;"></div>
                                </div>
                            </div>
                        </div>
                        <div id="tab2" class="tab_content"></div>
                    </div>
                    <!--// 탭컨텐츠 --> 
                </div>
                <!--// 컨텐츠 끝 --> 
            </div>
            <!-- // wrap_right --> 
        `;
        w2ui['layout'].html('main', html);

        $('input[type=us-date1]').w2field('date', { format: 'yyyy-mm-dd', end:   $('input[type=us-date2]') });
        $('input[type=us-date2]').w2field('date', { format: 'yyyy-mm-dd', start: $('input[type=us-date1]') });

        // "경보상태 또는 경보이력" 탭클릭 이벤트
        $('div[data-id=tab] li').on('click', function(){
            if($(this).hasClass('active'))
                return;
            $(this).parent().children().removeClass('active');
            $(this).addClass('active');

            if($(this).attr('data-id') == 'status'){
                _this.selectAlarm();
                $(".history").hide();
            }else if($(this).attr('data-id') == 'history'){
                $(".history").show();
                _this.selectAlarmHist();
            }
            $('#filter').val('')
        });
        
        let fromDay = new Date();
        var endDay = new Date();
        let fromDayStr = fromDay.Format("yyyy-MM-dd");
        
        $('#fdate').val(fromDayStr)
        $('#tdate').val(fromDayStr)

        //달력클릭
        $('.calendar a').on('click', function(){
            $(this).prev().focus();
        })

        //필터 선택
        $('#filter').on('change',function(){
            if($('div[data-id=tab] li[data-id=status]').hasClass('active')
            || $('div[data-id=tab] li[data-id=history]').hasClass('active')){
                _this.grid_filter($(this).val());
            }
        });

        //조회버튼 클릭
        $('#btn_search').on('click', function(){
            _this.selectAlarmHist();
        });

        this.selectAlarm();

        //########## Heat Map Initialize ########## Start
        let dom = document.getElementById("calendar");
        this.myChart = echarts.init(dom);

        this.myChart.on('click', function (params) {
            $('div[data-id=tab] li[data-id=history]').trigger('click');

            $('#fdate').val(params.value[0])
            $('#tdate').val(params.value[0])

            $('#btn_search').trigger('click');
        });      
        
        // Get HeatMap Data
        this.selectVisualMap();
        //########## Heat Map Initialize ########## End 
    }

    selectAlarm = ()=>{
        const reqObj = {
            "url": "/monitoring",
            "cmd": "request_monitor_current_alarm_onetime",
            "opt": {
              "region": "dj",
              "cloud": "cgni01",
              "project": "admin"
            }
        }
        
        w2utils.lock('#contents', '잠시 기다려주세요', true);
        Dispatcher.dispatch(reqObj, this.alarmCur)
    }

    alarmCur = (resObj, payload) => {
        if(w2ui['grid']){
            w2ui['grid'].destroy();
        }
        $('#grid').remove();
        let html = '<div id="grid" style="width: 100%; height: 530px; overflow: hidden;"></div>';
        $(".tab_content").children(":first").prepend(html);

        let total = { 
            w2ui: { summary: true }, 
            'alarm_dt': '<span style="float: left;">합계</span>', 
            'status': `<span id="totCnt" style="float: left;">${resObj.length}</span>`,
            'category': '',
            'hostname': '',
            'alarm_location': '',
            'event': '',
            'alarm_info': '',
            'description': ''
        };
        let result = [];
        for(let i=0; i<resObj.length; i++){
            result.push(resObj[i]);
        }
        result.push(total);

        $('#grid').w2grid({ 
            name: 'grid', 
            columns: [    
                { field: 'alarm_dt', text: '발생일자', size: '145px', sortable:true  },
                { field: 'status', text: '등급', size: '100px', sortable:true  },
                { field: 'category', text: '카테고리', size: '70px', sortable:true  },
                { field: 'hostname', text: '장치이름', size: '200px', sortable:true  },
                { field: 'alarm_location', text: '알람위치', size: '120px', sortable:true  },
                { field: 'event', text: '알람내용', size: '300px', sortable:true  },
                { field: 'alarm_info', text: '세부항목', size: '300px', sortable:true  },
                { field: 'description', text: '설명', size: '1200px', sortable:true  }
            ],
            recid: 'hostname',
            records: result,
            show: { lineNumbers: true },
            onContextMenu: function(event) {
                
            }
        });        
        
        this.grid_filter($('#filter').val());
        w2utils.unlock('#contents');
    }

    selectAlarmHist() {
        if(!this.isValidateDate($('#fdate').val())){
            alert('날짜를 정확하게 입력해주세요.')
            $('#fdate').focus();
            return false;
        }

        if(!this.isValidateDate($('#tdate').val())){
            alert('날짜를 정확하게 입력해주세요.')
            $('#tdate').focus();
            return false;
        }

        this.reqAlarmHistory();
    }

    // 경보이력 조회 이벤트
    reqAlarmHistory() {
        const reqObj = {
            "url": "/monitoring",
            "cmd": "request_monitor_history_alarm",
            "opt": {
              "region": "dj",
              "cloud": "cgni01",
              "project": "admin",
              "condition": $('#fdate').val() + " 00:00:00, " + $('#tdate').val() + " 23:59:59"
            }
        }

        // $('#grid_grid_body').mLoading("show");
        w2utils.lock('#contents', "잠시 기다려주세요", true);
        Dispatcher.dispatch(reqObj, this.cbHistory);
    }

    // 경보이력 조회 콜백
    cbHistory = (objResp, payload) => {
        if(w2ui['grid']){
            w2ui['grid'].destroy();
        }
        $('#grid').remove();
        let html = '<div id="grid" style="width: 100%; height: 530px; overflow: hidden;"></div>';
        $(".tab_content").children(":first").prepend(html);

        let total = { 
            w2ui: { summary: true }, 
            'alarm_dt': '<span style="float: left;">합계</span>', 
            'status': `<span id="totCnt" style="float: left;">${objResp.length}</span>`,
            'category': '',
            'hostname': '',
            'alarm_location': '',
            'event': '',
            'alarm_info': '',
            'description': ''
        };
        let result = [];
        for(let i=0; i<objResp.length; i++){
            result.push(objResp[i]);
        }
        result.push(total);

        $('#grid').w2grid({ 
            name: 'grid', 
            columns: [
                { field: 'alarm_dt', text: '발생일자', size: '145px', sortable:true },
                { field: 'status', text: '등급', size: '100px', sortable:true },
                { field: 'category', text: '카테고리', size: '70px', sortable:true },
                { field: 'hostname', text: '장치이름', size: '200px', sortable:true },
                { field: 'alarm_location', text: '알람위치', size: '120px', sortable:true },
                { field: 'event', text: '알람내용', size: '300px', sortable:true },
                { field: 'alarm_info', text: '세부항목', size: '300px', sortable:true },
                { field: 'description', text: '설명', size: '1200px', sortable:true }
            ],
            recid: 'hostname',
            records: result,
            show: { lineNumbers: true }
        })

        this.grid_filter($('#filter').val());
        w2utils.unlock('#contents');    
    }

    selectVisualMap() {
        const reqObj = {
            url: '/monitoring', 
            cmd: 'request_monitor_history_group_alarm', 
            opt: {
                "region": "dj",
                "cloud": "cgni01",
                "project": "admin"
            }
        }
        Dispatcher.dispatch(reqObj, this.cbVisualMap);
    }

    cbVisualMap = (resObj) => {
        let option = null;
        let year = new Date().getFullYear();

        let data = this.getVirtulData(year, resObj);

        option = {
            tooltip: {
                position: 'top',
                formatter: function(p){
                    var format = echarts.format.formatTime('yyyy-MM-dd', p.data['value'][0]) + "(" + p.data['value'][2] + ")";
                    return format;
                }
            },            
            visualMap: {
                min: 0,
                max: 1000,
                calculable: true,
                orient: 'vertical',
                left: '670',
                // color: ['#075A0E', '#5DA663', '#A5E9AA'],
                inRange: {          // visual configuration items in selected range
                    color: ['lightgreen', '#121122', 'darkgreen'], // defines color list of mapping
                                                                   // The largest value will be mapped to 'red',
                                                                   // and others will be interpolated
                    symbolSize: [10, 1000]  // the smallest value will be mapped to size of 30,
                                            // the largest to 100,
                                            // and others will be interpolated
                },
                itemStyle:{
                    borderColor: '#E10769',
                    borderWidth:5,
                    // borderType: 'dotted'
                },
                lineStyle:{
                    show: false
                },
                show: false,
                top: 'center'
            },        
            calendar: [{
                // orient: 'vertical',
                left: 20,
                // bottom: 0,
                cellSize: [19, 19],
                lineStyle:{
                    show: false
                },
                itemStyle:{
                    borderColor: '#dfdfdf',
                    borderWidth:5,
                    // borderType: 'dotted'
                },
                yearLabel:{
                    show: false
                },
                splitLine:{
                    show: false
                },
                range: year//'2020'//['2015-09-19', '2015-10-19']
            }],        
            series: [{
                type: 'heatmap',
                coordinateSystem: 'calendar',
                calendarIndex: 0,
                data: data
            }]
        };

        if (option && typeof option === "object") {
            this.myChart.setOption(option, true);
        }
    }

    //heatmap 데이터 만들어주기 
    getVirtulData = (year, resObj) =>{        
        year = year || '2017';
        let date = +echarts.number.parseDate(year + '-01-01');
        let end = +echarts.number.parseDate((+year + 1) + '-01-01');
        let dayTime = 3600 * 24 * 1000;
        let data = [];
        data.push({
            itemStyle: {
                borderColor: "rgba(10, 190, 31, 1)",
                borderWidth: 4.5
            }
        })
        
        let color = ['red', 'yellow'];
        
        //서버에서 데이터 가져오면 
        let arr_alarm_num = resObj.map(function(v){ return v.alarm_num; });
        let max_alarm_num = Math.max.apply(null, arr_alarm_num);

        for(var i=0; i<resObj.length; i++){
            let alarm_num_percent = parseInt(Number(resObj[i].alarm_num) / max_alarm_num * 100);
            // console.log("max_alarm_num = " + max_alarm_num + ", alarm_num = " + resObj[i].alarm_num + ", percent = " + alarm_num_percent + "(" + (alarm_num_percent*10)+ ")");

            let colorIndex = (resObj[i].max_grade_level == '5') ? 0 : 1;
            data.push({
                value:[
                    echarts.format.formatTime('yyyy-MM-dd', resObj[i].date_s),
                    alarm_num_percent * 10,
                    resObj[i].alarm_num
                ], 
                itemStyle: {
                    borderColor: color[colorIndex],
                    borderWidth: 2
                }
            });        
        }

        return data;
    } // End of cbVisualMap

    grid_filter = (val)=>{
        w2ui['grid'].search('status', val);
        if(val != ''){
            let idx = 0;
            for(let i=0; i<$('#grid').w2grid().records.length; i++){
                if($('#grid').w2grid().records[i].status === val)
                    idx++;
            }
            $("#totCnt").text(idx);
        }
    }

    //날자 포맷 맞는지 여부 
    isValidateDate = (date)=> {
        date = $.trim(date);
        let reg = /^(\d{4})-(\d{2})-(\d{2})$/;
        reg.exec(date);
        if (!reg.test(date) && RegExp.$2 <= 12 && RegExp.$3 <= 31) {
            return false;
        }
        let year, month, day;
        year = parseInt(date.split("-")[0], 10);
        month = parseInt(date.split("-")[1], 10);
        day = parseInt(date.split("-")[2], 10);
        if (! ((1 <= month) && (12 >= month) && (31 >= day) && (1 <= day))) {
            return false;
        }
        if ((month <= 7) && ((month % 2) == 0) && (day >= 31)) {
            return false;
        }
        if ((month >= 8) && ((month % 2) == 1) && (day >= 31)) {
            return false;
        }
        if (month == 2) {
            if ((year % 400 == 0) || ((year % 4 == 0) && (year % 100 != 0))) {
                if (day > 29) {
                    return false;
                }
            } else {
                if (day > 28) {
                    return false;
                }
            }
        }
        return true;
    }    
    
}

export default new MonitoringView;