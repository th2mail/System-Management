import Dispatcher from '../controller/Dispatcher.js'
import EventBus from '../utils/EventBus.js'
import SdmvToMxgraph from '../utils/SdmvToMxgraph.js'
import RackParser from '../utils/RackParser.js'
import AlarmView from './AlarmView.js'
import Setting from '../controller/Setting.js'

class ServiceView extends AlarmView {

    constructor () {
        super()

        EventBus.subscribe('evt.traffic.flow', this.evtTrafficFlow)
        EventBus.subscribe('evt.svc.pod', this.evtSvcPod)
    }
    
    init () {
        this.overlays = {}

        // [주의] 화면에 전환되도 계속 수신함 => unsubscribe 해야 함
        var unsubscribe = EventBus.subscribe('evt.alm.new', this.evtAlmNew)
        this.unsubscribe = unsubscribe
        
        let html =  `
        <style type="text/css">
            .flow02 {
                stroke-dasharray: 4;
                animation: dash 2.0s linear;
                animation-iteration-count: infinite;
            }

            .flow04 {
                stroke-dasharray: 4;
                animation: dash 1.5s linear;
                animation-iteration-count: infinite;
            }

            .flow06 {
                stroke-dasharray: 4;
                animation: dash 1.0s linear;
                animation-iteration-count: infinite;
            }

            .flow08 {
                stroke-dasharray: 4;
                animation: dash 0.5s linear;
                animation-iteration-count: infinite;
            }

            .flow10 {
                stroke-dasharray: 4;
                animation: dash 0.1s linear;
                animation-iteration-count: infinite;
            }

            @keyframes dash {
                to {
                    stroke-dashoffset: -8;
                }
            }
        </style>
        `

        html += `
        <div class="wrap_right">
            <div id="contents" style="height: 800px;">
                <h2>서비스</h2>
                <div data-id="tab" class="posts mt10">
                <ul>
                    <li data-id="CCTV" class="active"><a class="hand">사업장 CCTV</a><span></span></li>
                    <li data-id="CDN" ><a class="hand">Edge CDN</a><span></span></li>
                    <li data-id="SVC_1" ><a class="hand">서비스-1</a><span></span></li>
                    <li data-id="SVC_2" ><a class="hand">서비스-2</a><span></span></li>
                    <li data-id="SVC_3" ><a class="hand">서비스-3</a><span></span></li>
                    <li data-id="SVC_4" ><a class="hand">서비스-4</a><span></span></li>
                </ul>
                </div>

                <!--검색조건-->
                <div class="btn_searchBox fr mt_33 mr10">
                    <a data-id="btn_alarm_curn" class="btn_tit btn_darkGray v_mid hand" title="조회">장애현황</a> 
                    <a data-id="btn_zoom_in" class="btn_search btn_scale_up btn_round v_mid ml30 hand" title="확대"></a> 
                    <a data-id="btn_zoom_out" class="btn_search btn_scale_down btn_round v_mid hand" title="축소"></a> 
                </div>

                <!--탭컨텐츠 -->
                <div class="tab_container -bgNone"> 
                    <div id="tab1" class="tab_content " style="height:800px;">
                        <div class="panel-box" style="height:100%;overflow: auto;">
                            <div id="service" style='height:100%;'></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `

        w2ui['layout'].html('main', html)
        w2utils.lock('#contents', '잠시 기다려주세요', true);

        let _this = this
        
        $('div[data-id=tab] li').on('click', function(){
            if($(this).hasClass('active'))
                return
            $(this).parent().children().removeClass('active');
            $(this).addClass('active');

            if($(this).attr('data-id') == 'CCTV') {
                _this.reqCCTV()
            }
            else if($(this).attr('data-id') == 'CDN') {
                _this.reqCDN()
            }
        });

        $(".btn_searchBox a").on("click", function() {
            let id = $(this).attr('data-id');

            if (id == 'btn_alarm_curn') {
                _this.alarm_curn();
    
            }
            else if (id == 'btn_zoom_in') {
                _this.zoom_in()
            }
            else if (id == 'btn_zoom_out') {
                _this.zoom_out()
            }
        })

        this.reqCCTV();        
    }

    reqCCTV() {
        this.tab = 'CCTV'

        const reqObj = {
            url: '/service', 
            cmd: 'request_service_topology', 
            opt: {
                cloud: 'labmec01', 
                project: 'cctv'
            }
        }

        w2utils.lock('#contents', '잠시 기다려주세요', true);

        // 서버 호출 시
        Dispatcher.dispatch(reqObj, this.cbService)

        // 파일 호출 시
        // this.cbService(reqObj)
    }

    reqCDN() {
        this.tab = 'CDN'

        const reqObj = {
            url: '/service', 
            cmd: 'request_service_topology', 
            opt: {
                cloud: 'labmec01', 
                project: 'cdn'
            }
        }

        w2utils.lock('#contents', '잠시 기다려주세요', true)

        // 서버 호출 시
        Dispatcher.dispatch(reqObj, this.cbService)

        // 파일 호출 시
        // this.cbService(reqObj)
    }

    cbService = (objResp) => {
        w2utils.unlock('#contents');
        $("#service").empty()

        // MxGraph 로드
        this.mxgraphHepler = new SdmvToMxgraph('service')

        // 서버 호출 시
        this.mxgraphHepler.loadServiceTopology(JSON.parse(objResp), this.cbSvcGraph)

        // 파일 호출 시
        // this.mxgraphHepler.loadServiceTopology(objResp, this.cbSvcGraph)
    }

    cbSvcGraph = (graph, model) => {
        this.graph = graph
        const _this = this

        // 리스너 추가 (임시)
        graph.addListener(mxEvent.CLICK, function(sender, evt) {
            if (_this.parser == undefined) {
                _this.parser = new RackParser(model);
            }

            var source = evt.getProperty('cell')
            const _id = source.getId()
            const obj = _this.parser.getObjectById(_id)
            const comp_type = obj[0].comp_type
            
            if (source != null) {
                if (comp_type === 'switch_port'){
                    _this.selectSwitch(_id, obj);
                }
                else if(comp_type === 'host_port' || comp_type === 'host_bond' || comp_type === 'ovs_up_port' || comp_type === 'host'){
                    _this.selectSystem(_id, obj, comp_type);
                }
            }
        })
        
        // POD별 리소스 표시
        this.mxgraphHepler.drawServiceTopology(this)

        // 그래프 화면에 맞춤
        this.graph.getView().setScale(0.92)

        // 트래픽 표시
        const flows = new RackParser(model).getNetworkFlow()

        this.reqNet(flows)

        // 현재 화면 알람 삭제
        this.clearAllAlarms()

        // 현재 알람 표시
        this.getAlmCur()

        // POD 리소스 조회 => reqNet 실행 후 실행되야 함.
        this.reqPods(this.tab)
    }

    flow(graph, edge, style) {
        var state = graph.view.getState(edge)
        state.shape.node.getElementsByTagName('path')[0].removeAttribute('visibility');
        state.shape.node.getElementsByTagName('path')[1].setAttribute('class', style);
    }

    zoom_in() {
        this.graph.zoomIn()
    }

    zoom_out() {
        this.graph.zoomOut()
    }

    reqNet(nics) {
        const reqObj = {
            url: '/service', 
            cmd: 'request_netdata_allmatrics', 
            opt: {
                // 
            }, 
            ext: nics
        }

        Dispatcher.dispatch(reqObj, this.cbSwitch)
    }

    evtTrafficFlow = (objResp) => {
        objResp.body.forEach(conn => {

            // source의 traffic이 0이 아닌 경우 source의 traffic 사용하고
            let vtx_id = conn[0].id
            let flow = conn[0].out

            if (flow === 'flow00') {
                // source의 traffic이 0인 경우 target의 traffic 사용한다.
                flow = conn[1].in
            }

            if (flow != 'flow00') {
                let style = ServiceView.applyStyle(flow)
                
                const _edges = this.graph.getModel().getCell(vtx_id).edges

                if (flow != 'flow00') {
                    if (_edges.length === 1) {
                        // edge의 style을 animation으로 변환
                        this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, style, [_edges[0]])
                        this.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 4, [_edges[0]])
                        this.flow(this.graph, _edges[0], flow)
                    }
                    else {
                        // 하나의 vertex에 edge가 여러개인 경우 edge의 source의 id가 vertex id와 동일해야 한다.
                        _edges.forEach(edge => {
                            if (edge.source.id === vtx_id) {
                                if (_edges.length == 2) {
                                    this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, style, [edge])
                                    this.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 4, [edge])
                                    this.flow(this.graph, edge, flow)
                                }
                                else if (_edges.length === 3) {
                                    // [중요] target쪽 flow가 있는 경우만 표시해야 한다.
                                    let found = ServiceView.hasTraffic(objResp.body, edge.target.id)
                                    if (found === true) {
                                        this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, style, [edge])
                                        this.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 4, [edge])
                                        this.flow(this.graph, edge, flow)
                                    }
                                }
                                if (_edges.length === 4) {
                                        // [중요] edge는 두개가 나오므로 edge target과 conn destination이 같아야 한다.
                                        if (edge.target.id === conn[1].id) {
                                            if (conn[0].in === conn[1].in && conn[0].out === conn[1].out) {
                                                flow = conn[0].in
                                                style = ServiceView.applyStyle(flow)
                                            }
                                            else {
                                                flow = conn[1].in
                                                style = ServiceView.applyStyle(flow)
                                            }
    
                                            this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, style, [edge])
                                            this.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 4, [edge])
                                            this.flow(this.graph, edge, flow)
                                        }
                                }
                            }
                        })
                    }
                }
            }
        });
    }

    static hasTraffic = (objResp, vtx_id) => {
        // [주의] forEach는 return 처리가 안됨 (some 사용할 것)
        return objResp.some(conns => conns.some(conn => conn.id === vtx_id && conn.in != 'flow00'))
    }

    static applyStyle = (flow) => {
        let style = ''
        if (flow === 'flow02' || flow === 'flow04') {
            style = '#FFAE42'
        }
        else if (flow === 'flow06' || flow === 'flow08') {
            style = '#4166F5'
        }
        else if (flow === 'flow10') {
            style = '#8A0303'
        }
        return style
    }

    reqPods = (project) => {
        const reqObj = {
            url: '/service', 
            cmd: 'request_service_pod_usage', 
            opt: {
                cloud: 'labmec01', 
                project: project, 
                pod: this.host_pod_status['text']
            }
        }

        /**
         * [중요]
         * request_netdata_allmatrics에서 woker 종료를 시키므로 
         * 반드시 request_netdata_allmatrics을 실행한 후 request_service_pod_usage를 샐행해야 한다.
         */
        setTimeout(function() {
            Dispatcher.dispatch(reqObj, this.evtPodStatus)
        }, 1000)
    }

    evtSvcPod = (evt) => {
        for (const [key, value] of Object.entries(this.host_pod_status)) {
            if (key.includes(evt.body.pod)) {
                let _data = []
                const cpu = evt.body.usage.cpu_usage
                const mem = evt.body.usage.disk_usage
                const disk = evt.body.usage.mem_usage
                const t_cpu = 100 - cpu
                const t_mem = 100 - mem
                const t_disk = 100 - disk
                _data.push(cpu)
                _data.push(mem)
                _data.push(disk)
                _data.push(t_cpu)
                _data.push(t_mem)
                _data.push(t_disk)

                value.dataset.datasets.forEach(dataset => {
                    dataset.data = dataset.data.map(function(x, idx) {
                        return _data.splice(0, 1)[0]
                    });
                })

                value.chart.update()
            }
        }
    }

    alarm_curn() {
        if(w2ui['grid']){
            w2ui['grid'].destroy();
        }
        
        $('#grid').remove();
        let html = '<div id="grid" style="width: 100%; height: 530px; overflow: hidden;"></div>';

        // let timer;
        let _this = this;
        w2popup.open({
            title     : '장애현황',
            body      : html,
            width     : 800,
            height    : 580,
            overflow  : 'hidden',
            color     : '#333',
            speed     : '0.1',
            opacity   : '0.8',
            modal     : true,
            showClose : true,
            showMax   : false,
            onOpen    : function (event) { 
                // timer = setInterval(function(){
                //     _this.reqObstacle();
                // }, 5000);
            },
            onClose   : function (event) { 
                // clearInterval(timer);
            }
        });
        
        let total = { 
            w2ui: { summary: true }, 
            'alarm_dt': '<span style="float: right;">합계</span>', 
            'status': `<span id="totCnt" style="float: right;"></span>`,
            'category': '',
            'hostname': '',
            'alarm_location': '',
            'event': '',
            'alarm_info': '',
            'description': ''
        };
        let result = [];
        result.push(total);

        $('#grid').w2grid({ 
            name: 'grid', 
            columns: [    
                { field: 'alarm_dt', caption: '발생일자', size: '145px' },
                { field: 'status', caption: '등급', size: '100px' },
                { field: 'category', caption: '카테고리', size: '70px' },
                { field: 'hostname', caption: '장치이름', size: '200px' },
                { field: 'alarm_location', caption: '알람위치', size: '120px' },
                { field: 'event', caption: '알람내용', size: '300px' },
                { field: 'alarm_info', caption: '세부항목', size: '300px' },
                { field: 'description', caption: '설명', size: '1200px' },                
            ],
            recid: 'hostname',
            records: result
        }); 
        
        this.reqObstacle();
    }

    reqObstacle = ()=>{
        const reqObj = {
            "url": "/monitoring",
            "cmd": "request_monitor_current_alarm_onetime",
            "opt": {
              "region": "dj",
              "cloud": "cgni01",
              "project": "admin"
            }
        }
        
        Dispatcher.dispatch(reqObj, this.cbObstacle)
    }

    cbObstacle = (resObj, payload) => {
        if(w2ui['grid']){
            $('#grid').w2grid().records = resObj;
            $('#grid').w2grid().refresh();
            $('#totCnt').text(String(resObj.length));
        }
    }

    selectSwitch = (_id, obj) => {
        let searchTxt1 = 'dj/c/cgni01/c/rack01/41/sw/tor01';
        let searchTxt2 = 'dj/c/cgni01/c/rack01/40/sw/tor02';

        let switch_name = '';
        if (_id.indexOf(searchTxt1) > -1) {
            switch_name = `snmptraffic.switch01_Ethernet` + obj[0].text.text + `_bandwidth`;
        } else if (_id.indexOf(searchTxt2) > -1) {
            switch_name = `snmptraffic.switch02_Ethernet` + obj[0].text.text + `_bandwidth`;
        }

        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: `${Setting.server.service}${switch_name}`,
            headers: {},
            dataType: 'json',
            contentType: 'application/json',
            data: '',
            success: function(data, textStatus, jqXHR){
                w2popup.open({
                    title     : switch_name, 
                    body      : '<div id="netdata-chart" style="height: 300px; background: #FFFFFF;">',
                    width     : 1000,
                    height    : 350,
                    overflow  : 'hidden',
                    color     : '#333',
                    speed     : '0.1',
                    opacity   : '0.8',
                    modal     : true,
                    showClose : true,
                    showMax   : false,
                    onOpen    : function (event) {
                        let src_name = Setting.server['switch-1'];
                        let script = `<script type="text/javascript">var netdataNoBootstrap = true;var netdataTheme = 'default';<\/script> \
                                        <script type="text/javascript" src="${src_name}"><\/script> \
                                        <div data-netdata="${switch_name}"></div> \
                                    `;
                        
                        setTimeout(() => {
                            $("#netdata-chart").html(script); 
                        })
                    }
                });  
            },
            error: function(jqXHR, textStatus, errorThrown){
                w2alert("스위치 정보가 없습니다.", "알림") 
            }
        });
    }

    selectSystem = (_id, obj, comp_type) => {
        let addr = '';
        let switch_name = '';
        if(_id.indexOf("nova0102") != -1) {
            addr = Setting.server['server-3'];
            switch_name = Setting.server['worker-1'];
        }else if(_id.indexOf("nova0103") != -1) {
            addr = Setting.server['server-4'];
            switch_name = Setting.server['worker-2'];
        }
        
        let first = 'net.', second = '', val = '';
        if(addr != ''){
            if(comp_type === 'host_port'){
                second = _id.slice(-2);
                if(second === '01'){
                    second = 'eno1';
                }else if(second === '02'){
                    second = 'eno2';
                }else if(second === '07'){
                    second = 'ens2f0';
                }else if(second === '08'){
                    second = 'ens2f1';
                }else if(second === '09'){
                    second = 'ens4f0';
                }else if(second === '10'){
                    second = 'ens4f1';
                }else if(second === '11'){
                    second = 'ens5f0';
                }else if(second === '12'){
                    second = 'ens5f1';
                }
            }else if(comp_type === 'host_bond' || comp_type === 'ovs_up_port'){
                second = _id.substr(_id.lastIndexOf( "/" )+1, _id.length);
            }
            val = first + second;

            // console.log(`${id}   ${comp_type}`);

            let script = ``;
            let url;
            if(comp_type === 'host'){
                let title = '';
                if(_id.indexOf("nova0102") != -1) {
                    title = 'okd-worker01.lab.okd.djtb';
                }else if(_id.indexOf("nova0103") != -1) {
                    title = 'okd-worker02.lab.okd.djtb';
                }
                
                script = `
                <script type="text/javascript">var netdataNoBootstrap = true;var netdataTheme = 'default'<\/script><script type="text/javascript" src="${addr}"><\/script>
                    <div style="height: 150px;">
                        <div class="netdata-container-easypiechart"           style="height: 150px; width: 18%; margin-top: 15px; margin-left: 40px;" data-netdata="system.io"  data-dimensions="in"                        data-chart-library="easypiechart"           data-title="Disk Read"            data-width="18%" data-before="0" data-after="-720" data-points="720" data-common-units="system.io.mainhead"  role="application"></div>
                        <div class="netdata-container-easypiechart"           style="height: 150px; width: 18%; margin-top: 15px; margin-left: 60px;" data-netdata="system.io"  data-dimensions="out"                       data-chart-library="easypiechart"           data-title="Disk Write"           data-width="18%" data-before="0" data-after="-720" data-points="720" data-common-units="system.io.mainhead"  role="application"></div>
                        <div class="netdata-container-gauge"                  style="height: 150px; width: 28%; margin-top: 15px; margin-left: 50px;" data-netdata="system.cpu"                                             data-chart-library="gauge" data-title="CPU"                                   data-width="30%"                 data-after="-720" data-points="720"                                         role="application" data-units="%" data-gauge-max-value="100"        data-colors="#22AA99"></div>
                    </div>
                    <br/>
                    <div  style="height: 150px;" style="margin-top: 50px;">
                        <div class="netdata-container-easypiechart"           style="height: 150px; maring-bottom: 5px; margin-left: 130px;" data-netdata="system.net" data-dimensions="received"                  data-chart-library="easypiechart"           data-title="Net Inbound"          data-width="18%"                                   data-points="300" data-common-units="system.net.mainhead" role="application">  
                            <div id="easypiechart-system.net-4-chart" 
                            class="netdata-chart netdata-easypiechart-chart" ></div>
                        </div>
                        <div class="netdata-container-easypiechart"           style="height: 150px; maring-bottom: 5px; margin-left: 50px;" data-netdata="system.net" data-dimensions="sent"                      data-chart-library="easypiechart"           data-title="Net Outbound"         data-width="18%"                                   data-points="300" data-common-units="system.net.mainhead" role="application">  
                            <div id="easypiechart-system.net-5-chart" 
                            class="netdata-chart netdata-easypiechart-chart" ></div>
                        </div>  
                        <div class="netdata-container-easypiechart"           style="height: 150px; maring-bottom: 5px; margin-left: 80px;" data-netdata="system.ram" data-dimensions="used|buffers|active|wired" data-chart-library="easypiechart"           data-title="Used RAM"             data-width="18%"                 data-after="-720" data-points="720"     data-append-options="percentage"    role="application" data-units="%" data-easypiechart-max-value="100" data-colors="#EE9911"></div>
                    </div>
                `;
                w2popup.open({
                    title     : title, 
                    body      : '<div id="netdata-chart" style="height: 350px; background: #FFFFFF;">',
                    width     : 750,
                    height    : 400,
                    overflow  : 'hidden',
                    color     : '#333',
                    speed     : '0.1',
                    opacity   : '0.8',
                    modal     : true,
                    showClose : true,
                    showMax   : false,
                    onOpen    : function (event) {
                        setTimeout(() => {                                           
                            $("#netdata-chart").html(script); 
                        })
                    }
                }); 
            }else{
                script = `<script type="text/javascript">var netdataNoBootstrap = true;var netdataTheme = 'default';<\/script> \
                        <script type="text/javascript" src="${addr}"><\/script> \
                        <div data-netdata="${val}"></div> \
                `;
                url =`${switch_name}/api/v1/chart?chart=${val}`; 
                $.ajax({
                    type: 'GET',
                    crossDomain: true,
                    url: url,
                    headers: {},
                    dataType: 'json',
                    contentType: 'application/json',
                    data: '',
                    success: function(data, textStatus, jqXHR){
                        w2popup.open({
                            title     : val, 
                            body      : '<div id="netdata-chart" style="height: 300px; background: #FFFFFF;">',
                            width     : 800,
                            height    : 350,
                            overflow  : 'hidden',
                            color     : '#333',
                            speed     : '0.1',
                            opacity   : '0.8',
                            modal     : true,
                            showClose : true,
                            showMax   : false,
                            onOpen    : function (event) {
                                setTimeout(() => {
                                    $("#netdata-chart").html(script); 
                                })
                            }
                        }); 
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        w2alert("netdata에 정보가 없습니다.", "알림") 
                    }
                });
            }
        }
    }
    
}

export default new ServiceView;