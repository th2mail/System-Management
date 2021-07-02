import EventBus from '../utils/EventBus.js'
import Dispatcher from '../controller/Dispatcher.js'
import Setting from '../controller/Setting.js'
import Utils from '../utils/Utils.js'
import SdmvToMxgraph from '../utils/SdmvToMxgraph.js'
import RackParser from '../utils/RackParser.js'
import AlarmView from './AlarmView.js'

class DashboardView extends AlarmView {

    constructor () {
        super()

        EventBus.subscribe('evt.inv.summary', this.evtInfraSummary)
        EventBus.subscribe('evt.alm.summary', this.evtAlarmSummary)
        EventBus.subscribe('evt.resource.usage', this.evtResourceUsage)
    }

    init () {
        this.overlays = {}

        // [주의] 화면에 전환되도 계속 수신함 => unsubscribe 해야 함
        const unsubscribe = EventBus.subscribe('evt.alm.new', this.evtAlmNew)
        this.unsubscribe = unsubscribe

        this.html = `
            <!-- wrap_right -->
            <div class="wrap_right">
                <div id="contents">
                    <div id="contents">
                        <h2>대쉬보드</h2>
                        <div class="dis-flex justify-content-between"> 
                            <!-- LEFT -->
                            <div class="w370" style="height:780px;"><div id="dashboard-rack" style="float: left; width: 360px; height: 98%; top:-5px;"></div></div>
                            <!-- // LEFT --> 
                            <!-- RIGHT -->
                            <div class="dashboard-right"> 
                                <!-- 1단 현황 영역 -->
                                <div class="dis-flex justify-content-between w100p"> 
                                    <!-- 인벤토리 현황 -->
                                    <h3 class="vertical">인벤토리 &nbsp; 현황</h3>
                                    <div class=" w60p">
                                        <div class="dis-flex justify-content-between panel _03">
                                            <p class=""><i class="server">서버</i><span id="sel_inv" data-id="infra_server" class="cl_orange">0</span></p>
                                            <p class=""><i class="switch">스위치</i><span data-id="infra_switch" class="cl_green">0</span></p>
                                            <p class=""><i class="service ">서비스</i><span data-id="infra_project" class="cl_red">0</span></p>
                                        </div>
                                        <div class="dis-flex justify-content-between panel _03">
                                            <p><i class="pod">POD</i><span data-id="infra_pod">0</span></p>
                                            <p><i class="container">이미지</i><span data-id="infra_image" class="cl_yellow">0</span></p>
                                            <p><i class="network">네트워크</i><span data-id="infra_network">0</span></p>
                                        </div>
                                    </div>
                                    <!-- 장애 현황 -->
                                    <h3 class="vertical ml15">장애 &nbsp; 현황</h3>
                                    <div class=" w40p" data-id="alm-area">
                                        <div class="dis-flex justify-content-between panel _02">
                                            <p class=""><i class="server">서버</i><span data-id="alarm_server" class="cl_green">0</span></p>
                                            <p class=""><i class="switch">스위치</i><span data-id="alarm_switch" class="cl_red">0</span></p>
                                        </div>
                                        <div class="dis-flex justify-content-between panel _02">
                                            <p><i class="service">서비스</i><span data-id="alarm_service" class="cl_yellow">0</span></p>
                                            <p><i class="pod">POD</i><span data-id="alarm_pod">0</span></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- // 1단 현황 영역 --> 
                                <!-- 2단 현황 영역 -->
                                <h3 class="">리소스 사용 현황</h3>
                                <div class="inner_panel">
                                    <div class="dis-flex justify-content-between _03">
                                        <!-- 그래프-01 -->
                                        <div>
                                            <div id="highcharts1" style="width:100%;"></div>
                                            <ul>
                                                <li>Used<span data-id="cpu_used" class="cl_orange">0GHz</span></li>
                                                <li>Total<span data-id="cpu_total" class="cl_skyblue">100GHz</span></li>
                                            </ul>
                                        </div>							
                                        <!-- 그래프-02 -->
                                        <div>
                                            <div id="highcharts2" style="width:100%;"></div>
                                            <ul>
                                                <li>Used<span data-id="mem_used" class="cl_orange">0GiB</span></li>
                                                <li>Total<span data-id="mem_total" class="cl_skyblue">100GiB</span></li>
                                            </ul>
                                        </div>							
                                        <!-- 그래프-03 -->
                                        <div>
                                        <div id="highcharts3" style="width:100%;"></div>
                                            <ul>
                                                <li>Used<span data-id="disk_used" class="cl_orange">0GiB</span></li>
                                                <li>Total<span data-id="disk_total" class="cl_skyblue">100GiB</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <!-- // 2단 현황 영역 --> 
                                <!-- 3단 탭 영역 --> 
                                <!--탭메뉴 //S -->
                                <div class="posts mt20 dashboard-physical-tabs">
                                    <ul>
                                        <li class="active" data-id="server-1"><a class="hand">서버1</a><span></span></li>
                                        <li data-id="server-2"><a class="hand">서버2</a><span></span></li>
                                        <li data-id="server-3"><a class="hand">서버3</a><span></span></li>
                                        <li data-id="server-4"><a class="hand">서버4</a><span></span></li>
                                        <li data-id="switch-1"><a class="hand">스위치1</a><span></span></li>
                                        <li data-id="switch-2"><a class="hand">스위치2</a><span></span></li>
                                    </ul>
                                </div>
                                <!--// 탭메뉴  -->
                                <!--탭컨텐츠 -->
                                <div class="tab_container"> 
                                    <!-- 탭컨텐츠 01 -->
                                    <div id="tab" class="tab_content" style="height: 240px;">${this.getNetdata('server-1')}</div>
                                </div>
                                <!--// 탭컨텐츠 --> 
                                <!-- // 3단 현황 영역 --> 
                            </div>
                            <!-- // RIGHT --> 
                        </div>
                    </div>
                    <!--// 컨텐츠 끝 --> 
                </div>
                <!-- // wrap_right -->
            </div>
        `
        w2ui['layout'].html('main', this.html);     
        w2utils.lock('#contents', '잠시 기다려주세요', true);

        this.reqRack()        
    }

    reqRack() {
        const reqObj = {
            url: '/dashboard', 
            cmd: 'request_dashboard_rack_diagram', 
            opt: {
                "cloud": "labmec01"
            }
        }

        Dispatcher.dispatch(reqObj, this.cbUpdateRack);
    }

    cbUpdateRack = (objResp) => {
        w2utils.unlock('#contents');

        let _this = this;
        
        // 인프라 및 장애 현황 상세 조회
        $('span').click(function() {
            const evtid = $(this).attr('data-id')
            
            // 장애 현황 목록 조회
            if(evtid === 'alarm_server' // 서버
            || evtid === 'alarm_switch' // 스위치
            || evtid === 'alarm_service' // 서비스
            || evtid === 'alarm_pod'){ // 컨테이너
                _this.evtObstacleStatus(evtid);
            }else{ // 인벤토리 현황 목록 및 상세 조회
                _this.evtStatusDetail(evtid)
            }
        });

        //탭클릭
        $('.dashboard-physical-tabs ul li').on('click', function(){
            $(this).parent().children().removeClass('active');
            $(this).addClass('active');

            let id = $(this).attr('data-id')
            
            $('.tab_content').html(_this.getNetdata(id));
        });

        // gauge charg common options
        let common_options = Utils.gaugeChartCommonOptions()
        _this.chart1 = Utils.drawGaugeChart(common_options, 'CPU Usage',  'highcharts1','cpu_usage', 0)
        _this.chart2 = Utils.drawGaugeChart(common_options, 'Memory Usage',  'highcharts2','mem_usage', 0)
        _this.chart3 = Utils.drawGaugeChart(common_options, 'DISK Usage',  'highcharts3','disk_usage', 0)
        
        // MxGraph 로드
        const mxgraphHepler = new SdmvToMxgraph('dashboard-rack')
        mxgraphHepler.loadDiagram(JSON.parse(objResp), this.cbDashboardGraph)
    }

    cbDashboardGraph = (graph, model) => {
        this.graph = graph

        // 현재 알람 표시
        this.getAlmCur()

        // 인벤토리/알람 현황 조회
        this.reqStatus()

        // 리소스 사용 현황 조회
        this.reqResourceUseageStatus()

        const _this = this

        // 그래프 리스너 등록
        graph.addListener(mxEvent.CLICK, function(sender, evt) {
            if (_this.parser == undefined) {
                _this.parser = new RackParser(model)
            }

            var source = evt.getProperty('cell')
            const _value = source.getValue()
            const _id = source.getId()

            const obj = _this.parser.getObjectById(_id)
            const comp_type = obj[0].comp_type

            // Server-NIC 클릭 시
            if (comp_type === 'server-nic') {
                const edgeCount = source.getEdgeCount()
                if (edgeCount == 0) {
                    const target_id = _this.parser.getTargetIdById(obj)
                    const target = graph.getModel().getCell(target_id)
            
                    graph.getModel().beginUpdate()
                    try {
                        graph.insertEdge(graph.getModel().getParent(source), null, '', source, target, 'strokeWidth=2')
                    }
                    finally {
                        graph.getModel().endUpdate()
                    }
                } else {
                    graph.getModel().beginUpdate()
                    try {
                        const edge01 = source.getEdgeAt(0)
                        graph.getModel().remove(edge01)
                    }
                    finally {
                        graph.getModel().endUpdate()
                    }
                }
            }
            // System 클릭 시
            else if (comp_type === 'system-status') {
                console.log("System 클릭 시 처리 해야 함")
                _this.selectTab(_id);
            }
            // Console 클릭 시
            else if (comp_type === 'web-console-button') {
                console.log("Console 클릭 시 처리 해야 함")
            }
            // Platform 클릭 시
            else if (comp_type === 'platform-status') {
                const host = _this.parser.getHostNameById(_id)
                const reqObj = {
                    url: '/dashboard', 
                    cmd: 'request_dashboard_platform_status', 
                    opt: {
                        "cloud": "labmec01",
                        "host": host
                    }
                }

                w2utils.lock('#contents', "잠시 기다려주세요", true);
                Dispatcher.dispatch(reqObj, _this.cbPopupPlatform);
            }
            // vSwitch 클릭 시
            else if (comp_type === 'vswitch-status') {
                const host = _this.parser.getHostNameById(_id)
                const reqObj = {
                    url: '/dashboard', 
                    cmd: 'request_dashboard_vswitch_status', 
                    opt: {
                        "cloud": "labmec01",
                        "host": host
                    }
                }

                w2utils.lock('#contents', "잠시 기다려주세요", true);
                Dispatcher.dispatch(reqObj, _this.cbPopupVSwitch);
            }
            // App-Container 클릭 시
            else if (comp_type === 'app-containers-status') {
                const host = _this.parser.getHostNameById(_id)
                const reqObj = {
                    url: '/dashboard', 
                    cmd: 'request_dashboard_app_status', 
                    opt: {
                        "cloud": "labmec01",
                        "host": host
                    }
                }

                w2utils.lock('#contents', "잠시 기다려주세요", true);
                Dispatcher.dispatch(reqObj, _this.cbPopupAppContainers);
            }       
            else if (comp_type === 'switch') {
                _this.selectTab(_id);
            }          
        })   
    }

    selectTab(_id){
        //탭클릭
        $('.dashboard-physical-tabs ul li').parent().children().removeClass('active');

        let id;
        if(_id === 'dj/c/cgni01/c/rack01/30/bm/nova0100/system'){
            $('[data-id=server-1]').addClass('active')
            id = 'server-1';
        }else if(_id === 'dj/c/cgni01/c/rack01/28/bm/nova0101/system'){
            $('[data-id=server-2]').addClass('active')
            id = 'server-2';
        }else if(_id === 'dj/c/cgni01/c/rack01/26/bm/nova0102/system'){
            $('[data-id=server-3]').addClass('active')
            id = 'server-3';
        }else if(_id === 'dj/c/cgni01/c/rack01/24/bm/nova0103/system'){
            $('[data-id=server-4]').addClass('active')
            id = 'server-4';
        }else if(_id === 'dj/c/cgni01/c/rack01/41/sw/tor01'){
            $('[data-id=switch-1]').addClass('active')
            id = 'switch-1';
        }else if(_id === 'dj/c/cgni01/c/rack01/40/sw/tor02'){
            $('[data-id=switch-2]').addClass('active')
            id = 'switch-2';
        }
            
        $('.tab_content').html(this.getNetdata(id));
    }

    cbPopupPlatform = (resObj) => {
        w2utils.unlock('#contents');        
        this.openPopup('platform', resObj);
    }

    cbPopupVSwitch = (resObj) => {
        w2utils.unlock('#contents');
        this.openVSwitchPopup('vswitch', resObj);
    }

    cbPopupAppContainers = (resObj) => {
        // $('#contents').mLoading("hide");
        w2utils.unlock('#contents');
        this.openPopup('app-containers', resObj);
    }

    openPopup = (title, resObj) => {
        w2popup.open({
            title     : title,
            body      : '<div id="popup" style="position: relative; overflow-y:hidden;"></div>',
            width     : 1000,
            height    : 500,
            overflow  : 'hidden',
            color     : '#333',
            speed     : '0.1',
            opacity   : '0.8',
            modal     : true,
            showClose : true,
            showMax   : false,
            onOpen    : function (event) {
                if(w2ui['grid']){
                    w2ui['grid'].destroy();
                }
                $('#grid').remove();

                let grid = '<div id="grid" style="left: 0px; width: 100%; height: 450px;"></div>';

                let columns;
                if(title === 'vswitch'){
                    columns = Setting.DASHBOARD_CTRL_WORK_COLUMNS.VSWITCH;
                }else{
                    columns = Setting.DASHBOARD_CTRL_WORK_COLUMNS.OTHER;
                }

                setTimeout(() => {
                    $("#popup").append(grid);
            
                    $('#grid').w2grid({ 
                        name: 'grid', 
                        recid: 'NAME',
                        columns: columns,
                        records: Utils.addRecid(resObj),
                        show: { lineNumbers: true }
                    });
                },100);
            }
        })
    }

    openVSwitchPopup = (title, resObj) => {
        let _this = this;
        w2popup.open({
            title     : 'vSwitch',
            body      : '<div id="inventory-status-grid"></div> \
                         <div id="inventory-status-text"></div> \
                        ',
            width     : 1200,
            height    : 570,
            overflow  : 'hidden',
            color     : '#333',
            speed     : '0.1',
            opacity   : '0.8',
            modal     : true,
            showClose : true,
            showMax   : false,
            onOpen    : function (event) {
                if(w2ui['gridMaster']){
                    w2ui['gridMaster'].destroy();
                }
                $('#gridMaster').remove();
                let master = '<div id="gridMaster" style="left: 0px; width: 100%; height: 250px;"></div>';

                if(w2ui['textSlave']){
                    w2ui['textSlave'].destroy();
                }
                $('#textSlave').remove();
                let text = '<textarea id="textSlave" style="right: 0px; width: 100%; height: 250px; \
                                border-width: 2px;" readOnly></textarea>';
                
                let columns;
                if(title === 'vswitch'){
                    columns = Setting.DASHBOARD_CTRL_WORK_COLUMNS.VSWITCH;
                }else{
                    columns = Setting.DASHBOARD_CTRL_WORK_COLUMNS.OTHER;
                }

                setTimeout(() => {
                    $("#inventory-status-grid").append(master);            
                    $('#gridMaster').w2grid({ 
                        name: 'gridMaster', 
                        columns: columns,
                        records: Utils.addRecid(resObj),
                        show: { lineNumbers: true },
                        menu: [
                            { id: 1, text: 'vPort', icon: 'fa-star'},
                            { id: 2, text: 'Fow_Table', icon: 'fa-star'},
                        ],
                        onMenuClick: function (event) {
                            var grid = this;
                            event.onComplete = function() {
                                $('.w2ui-menu').css('overflow-y','hidden');

                                var sel_rec_ids = grid.getSelection();
                                if (sel_rec_ids.length) {
                                    var sel_record = grid.get(sel_rec_ids[0]);

                                    let cmd = ''
                                    if(event.menuIndex == 0){
                                        cmd = 'request_dashboard_vswitch_ports'
                                    }else if(event.menuIndex == 1){
                                        cmd = 'request_dashboard_vswitch_flows'
                                    }

                                    const reqObj = {
                                        "url": "/dashboard",
                                        "cmd": cmd,
                                        "opt": {
                                            "cloud": "labmec01",
                                            "vswitch": `${sel_record.NAME}`//"//sel_record.NAME
                                        }
                                    }
                                    w2utils.lock('#gridMaster', '잠시 기다려주세요', true);
                                    $('#textSlave').text('');
                                    Dispatcher.dispatch(reqObj, _this.cbVSwitchPopup);
                                }
                            }
                        }
                    });

                    $("#inventory-status-text").append(text);      
                },100);
            }
        });
    } 

    cbVSwitchPopup = (resObj, payload) => {
        w2utils.unlock('#gridMaster');
        $('#textSlave').text(resObj);
    }

    

    reqStatus() {
        // inventory, alarm 현황 가져오기 => 주기적으로 처리
        this.reqInfraStatus()
        this.reqAlarmStatus()
    }

    reqInfraStatus() {
        const reqObj = {
            url: '/dashboard', 
            cmd: 'request_dashboard_infra_status', 
            opt: {
                "host": "okd-master01.lab.okd.djtb"
            }
        }

        Dispatcher.dispatch(reqObj);
    }
    evtInfraSummary = (message) => {
        const ifr = message.body
        Object.entries(ifr).map(([key, value]) => {
            $(`span[data-id=infra_${key}]`).html(value);
        })
    }

    reqAlarmStatus() {
        const reqObj = {
            url: '/monitoring', 
            cmd: 'request_monitor_dashboard_alarm_status', 
            opt: {
                notification: 'true'
            }
        }

        Dispatcher.dispatch(reqObj);
    }    
    evtAlarmSummary = (message) => {
        const alms = message.body
        alms.forEach(alm => {
            Object.entries(alm).map(([key, value]) => {
                $(`span[data-id=alarm_${key}]`).html(value)
            })
        })
    }

    reqResourceUseageStatus() {
        const reqObj = {
            url: '/dashboard', 
            cmd: 'request_dashboard_resource_usage', 
            opt: {
                'cloud': 'labmec01'
            }
        }

        Dispatcher.dispatch(reqObj);
    }
    evtResourceUsage = (message) => {
        const resource = message.body
        for (const [key, value] of Object.entries(resource)) {
            if (key === 'cpu_usage') {
                this.chart1.series[0].data[0].update([Number(value)])
                this.chart1.series[0].data[1].update([Number(100 - value)])
                $(`.inner_panel .data-section p[data-id=${key}]`).html(value + '%')
            }
            else if (key === 'mem_usage') {
                this.chart2.series[0].data[0].update([Number(value)])
                this.chart2.series[0].data[1].update([Number(100 - value)])
                $(`.inner_panel .data-section p[data-id=${key}]`).html(value + '%')
            }
            else if (key === 'disk_usage') {
                this.chart3.series[0].data[0].update([Number(value)])
                this.chart3.series[0].data[1].update([Number(100 - value)])
                $(`.inner_panel .data-section p[data-id=${key}]`).html(value + '%')
            }
            else {
                let unit = (key === 'cpu_used' || key === 'cpu_total') ? ' GHz' : 'GiB'
                $(`.inner_panel div ul li span[data-id=${key}]`).html(value + unit)
            }
        }
    }

    /**
     * 인프라 및 장애 현황 상세정보
     * @param {*} id 
     */
    evtStatusDetail = (id) => {
        const command = `request_dashboard_${id}_list`
        console.log(command)

        const reqObj = {
            url: '/dashboard', 
            cmd: command, 
            opt: {
                "cloud": "labmec01"
            }
        }

        w2utils.lock('#contents', "잠시 기다려주세요", true);
        Dispatcher.dispatch(reqObj, this.cbPopupStatus);
    }
    cbPopupStatus = (resObj, payload) => {
        w2utils.unlock('#contents');   

        let _this = this;
        let popup_title = '';
        let columns;
        let detail_columns;
        let recid = '';
        let detail_recid;
        let command_detail = payload.cmd.replace("_list", "_detail");

        switch(payload.cmd){
            case "request_dashboard_infra_server_list":     // 서버
                popup_title = '서버';
                recid = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.SERVER_RECID;
                columns = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.SERVER;
                break;
            case "request_dashboard_infra_switch_list":     // 스위치
                popup_title = '스위치';
                recid = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.SWITCH_RECID;
                columns = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.SWITCH;
                detail_columns = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.SWITCH_DETAIL;
                break;
            case "request_dashboard_infra_project_list":    // 서비스
                popup_title = '서비스';
                recid = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.PORJECT_RECID;
                columns = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.PROJECT;
                break;
            case "request_dashboard_infra_pod_list":        // POD
                popup_title = 'POD';
                recid = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.POD_RECID;
                columns = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.POD;
            break;
            case "request_dashboard_infra_image_list":      // 컨테이너
                popup_title = '이미지';
                recid = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.IMAGE_RECID;
                columns = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.IMAGE;
            break;
            case "request_dashboard_infra_network_list":    // 네트워크
                popup_title = '네트워크';
                recid = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.NETWORK_RECID;
                columns = Setting.DASHBOARD_INVENTORY_STATUS_COLUMNS.NETWORK;
            break;
        }
        
        w2popup.open({
            title     : popup_title,
            body      : '<div id="inventory-status-grid"></div> \
                         <div id="inventory-status-text"></div> \
                        ',
            width     : 1200,
            height    : 570,
            overflow  : 'hidden',
            color     : '#333',
            speed     : '0.1',
            opacity   : '0.8',
            modal     : true,
            showClose : true,
            showMax   : false,
            onOpen    : function (event) {
                if(w2ui['gridMaster']){
                    w2ui['gridMaster'].destroy();
                }
                $('#gridMaster').remove();
                let master = '<div id="gridMaster" style="left: 0px; width: 100%; height: 250px;"></div>';

                if(w2ui['gridSlave']){
                    w2ui['gridSlave'].destroy();
                }
                $('#gridSlave').remove();
                let slave = '<div id="gridSlave" style="right: 0px; width: 100%; height: 250px;"></div>';

                if(w2ui['textSlave']){
                    w2ui['textSlave'].destroy();
                }
                $('#textSlave').remove();
                let text = '<textarea id="textSlave" style="right: 0px; width: 100%; height: 250px; \
                                border-width: 2px;" readOnly></textarea>';
                
                setTimeout(() => {
                    $("#inventory-status-grid").append(master);            
                    $('#gridMaster').w2grid({ 
                        name: 'gridMaster', 
                        columns: columns,
                        records: Utils.addRecid(resObj),
                        show: { lineNumbers: true },
                        onClick: function(event){
                            var grid = this;
                            event.onComplete = function() {
                                var sel_rec_ids = grid.getSelection();
                                if (sel_rec_ids.length) {
                                    var sel_record = grid.get(sel_rec_ids[0]);

                                    let reqObj;
                                    if(command_detail === 'request_dashboard_infra_server_detail'){
                                        reqObj = { 'url': '/dashboard', 'cmd': command_detail, 'opt': { 'cloud': 'labmec01', 'host': sel_record.NAME } }
                                    }
                                    else if(command_detail === 'request_dashboard_infra_switch_detail'){
                                        reqObj = { 'url': '/dashboard', 'cmd': command_detail, 'opt': { 'cloud': 'labmec01', 'switch': sel_record.switch_alias } }
                                    }
                                    else if(command_detail === 'request_dashboard_infra_project_detail'){
                                        reqObj = { 'url': '/dashboard', 'cmd': command_detail, 'opt': { 'cloud': 'labmec01', 'project': sel_record.NAME } }
                                    }
                                    else if(command_detail === 'request_dashboard_infra_pod_detail'){
                                        reqObj = { 'url': '/dashboard', 'cmd': command_detail, 'opt': { 'cloud': 'labmec01', 'pod': sel_record.NAME, 'project' : sel_record.NAMESPACE } }
                                    }
                                    else if(command_detail === 'request_dashboard_infra_image_detail'){
                                        reqObj = { 'url': '/dashboard', 'cmd': command_detail, 'opt': { 'cloud': 'labmec01', 'image': sel_record.NAME } }
                                    }
                                    else if(command_detail === 'request_dashboard_infra_network_detail'){
                                        reqObj = { 'url': '/dashboard', 'cmd': command_detail, 'opt': { 'cloud': 'labmec01', 'network': sel_record.NAME } }
                                    }
                                    w2utils.lock('#inventory-status-grid', "잠시 기다려주세요", true);
                                    Dispatcher.dispatch(reqObj, _this.cbInventoryStatusDetail);
                                } else {
                                    console.log("Nothing selected!");
                                }
                            }
                        }
                    });

                    if(command_detail === 'request_dashboard_infra_switch_detail'){
                        $("#inventory-status-text").append(slave);
                        $('#gridSlave').w2grid({ 
                            name: 'gridSlave', 
                            columns: detail_columns,
                            show: { lineNumbers: true }
                        });
                    }else{
                        $("#inventory-status-text").append(text);                        
                    }
                },100);
            }
        });     
    }
    cbInventoryStatusDetail = (resObj, payload) => {
        w2utils.unlock('#inventory-status-grid');   

        if(payload.cmd === 'request_dashboard_infra_switch_detail'){
            // 기존 데이터 삭제
            w2ui['gridSlave'].clear();
            w2ui['gridSlave'].refresh();

            // 데이터 추가
            w2ui['gridSlave'].add(Utils.addRecid(resObj));
            w2ui['gridSlave'].refresh();
        }else{
            $('#textSlave').text(resObj);
        }
    }
    
    /**
     * 장애현황 목록조회 이벤트 및 콜백
     */
    evtObstacleStatus = (id) => {
        const reqObj = {
            "url": "/monitoring",
            "cmd": "request_monitor_current_alarm_onetime",
            "opt": {
                "region": "dj",
                "cloud": "cgni01",
                "project": "admin"
            },
            "title": id
        }

        w2utils.lock('#contents', "잠시 기다려주세요", true);
        Dispatcher.dispatch(reqObj, this.cbObstacleStatus);
    }

    cbObstacleStatus = (resObj, payload) => {
        w2utils.unlock('#contents');      

        w2popup.open({
            title     : payload.title,
            body      : '<div id="obstacle-status-popup" style="position: relative; overflow-y:hidden;"></div>',
            width     : 1100,
            height    : 500,
            overflow  : 'hidden',
            color     : '#333',
            speed     : '0.1',
            opacity   : '0.8',
            modal     : true,
            showClose : true,
            showMax   : false,
            onOpen    : function (event) {
                if(w2ui['gridObstacle']){
                    w2ui['gridObstacle'].destroy();
                }
                $('#gridObstacle').remove();

                let gridObstacle = '<div id="gridObstacle" style="left: 0px; width: 100%; height: 450px;"></div>';

                setTimeout(() => {
                    $("#obstacle-status-popup").append(gridObstacle);

                    $('#gridObstacle').w2grid({ 
                        name: 'gridObstacle',
                        recid: 'category',
                        show: { lineNumbers: true }
                    });

                    if(resObj.length > 0){
                        // 신규 컬럼 추가
                        let new_schema = JSON.stringify(Object.keys(resObj[0]));
                        new_schema = new_schema.replaceAll("{","").replaceAll("}","").replaceAll("[","").replaceAll("]","").replaceAll("\"","");
                        let arr_schema = new_schema.split(",");
                        for (let y=0; y<arr_schema.length; y++){
                            w2ui['gridObstacle'].addColumn({ field: arr_schema[y], caption: arr_schema[y], size: '150px', sortable:true });
                        }
                        w2ui['gridObstacle'].refresh();

                        // 카테고리 가져오기
                        let category = payload.title.replace("alarm_","");

                        let pserver = 0;
                        let pswitch = 0;
                        let pservice = 0;
                        let pcontainer = 0;
                       
                        // 데이터 추가
                        let idx = 0;
                        for(let i=0; i<resObj.length; i++){
                            console.log(resObj[i].category);
                            if(resObj[i].category === "server"){
                                pserver++;
                            }else if(resObj[i].category === "switch"){
                                pswitch++;
                            }else if(resObj[i].category === "service"){
                                pservice++;
                            }else if(resObj[i].category === "pod"){
                                pcontainer++;
                            }

                            if(category === resObj[i].category){
                                idx++;
                                w2ui['gridObstacle'].add(resObj[i]);
                            }
                        }
                        let total = { 
                            w2ui: { summary: true }, 
                            "alarm_dt": '<span style="float: left;">합계</span>',
                            "alarm_info": `<span id="totCnt" style="float: left;">${idx}</span>`,
                            "alarm_location": '',
                            "category": '',
                            "dashboard_topology_id": '',
                            "description": '',
                            "event": '',
                            "hostname": '',
                            "infra_topology_id_mid": '',
                            "infra_topology_id_right": '',
                            "status": '',
                            "topology_id": ''
                        };
                        w2ui['gridObstacle'].add(total);
                        w2ui['gridObstacle'].refresh();
                    }
                },100);
            }
        });
    }
    
    /**
     * Netdata Chart 보여주기
     * @param {*} id 
     */
    getNetdata = (id) => {
        let html = '';
        if ( !(id == 'switch-1' || id == 'switch-2')){
            html = `
                <script type="text/javascript">var netdataNoBootstrap = true;var netdataTheme = 'default'<\/script><script type="text/javascript" src="` + Setting.server[`${id}`] + `"><\/script>
                <div class="netdata-container-easypiechart" style="margin-left: 40px;  width: 18%; height: 115px;" data-netdata="system.io"  data-dimensions="in"                        data-chart-library="easypiechart"           data-title="Disk Read"            data-width="18%" data-before="0" data-after="-720" data-points="720" data-common-units="system.io.mainhead"  role="application"></div>
                <div class="netdata-container-easypiechart" style="margin-left: 60px;  width: 18%; height: 115px;" data-netdata="system.io"  data-dimensions="out"                       data-chart-library="easypiechart"           data-title="Disk Write"           data-width="18%" data-before="0" data-after="-720" data-points="720" data-common-units="system.io.mainhead"  role="application"></div>
                <div class="netdata-container-gauge"        style="margin-left: 50px;  width: 28%; height: 110px;" data-netdata="system.cpu"                                             data-chart-library="gauge" data-title="CPU"                                   data-width="30%"                 data-after="-720" data-points="720"                                         role="application" data-units="%" data-gauge-max-value="100"        data-colors="#22AA99"></div>
                <div class="netdata-container-easypiechart" style="margin-left: 130px; maring-bottom: 5px; width: 18%; height: 115px;" data-netdata="system.net" data-dimensions="received"                  data-chart-library="easypiechart"           data-title="Net Inbound"          data-width="18%"                                   data-points="300" data-common-units="system.net.mainhead" role="application">  
                    <div id="easypiechart-system.net-4-chart" class="netdata-chart netdata-easypiechart-chart" style="height: 115px;; maring-bottom: 5px;"></div>
                </div>
                <div class="netdata-container-easypiechart" style="margin-left: 50px;  maring-bottom: 5px; width: 18%; height: 115px;" data-netdata="system.net" data-dimensions="sent"                      data-chart-library="easypiechart"           data-title="Net Outbound"         data-width="18%"                                   data-points="300" data-common-units="system.net.mainhead" role="application">  
                    <div id="easypiechart-system.net-5-chart" class="netdata-chart netdata-easypiechart-chart" style="height: 115px;; maring-bottom: 5px;"></div>
                </div>  
                <div class="netdata-container-easypiechart" style="margin-left: 80px;  maring-bottom: 5px; width: 18%; height: 115px;; maring-bottom: 5px;" data-netdata="system.ram" data-dimensions="used|buffers|active|wired" data-chart-library="easypiechart"           data-title="Used RAM"             data-width="18%"                 data-after="-720" data-points="720"     data-append-options="percentage"    role="application" data-units="%" data-easypiechart-max-value="100" data-colors="#EE9911"></div>
            `
        } 
        else {
            html += ` <script type="text/javascript">var netdataNoBootstrap = true;<\/script><script type="text/javascript" src="` + Setting.server[`${id}`] + `"><\/script> `
            if (id == 'switch-1') {
                html += ` <div data-netdata="snmptraffic.switch01_bandwidth"></div>`
            }
            else if (id == 'switch-2') {
                html += ` <div data-netdata="snmptraffic.switch02_bandwidth"></div> `
            }
        }

        return html;
    }
}

export default new DashboardView;