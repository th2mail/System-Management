import EventBus from '../utils/EventBus.js'
import SdmvToMxgraph from '../utils/SdmvToMxgraph.js'
import AlarmView from './AlarmView.js';
import Dispatcher from '../controller/Dispatcher.js'
import Setting from '../controller/Setting.js'
import RackParser from '../utils/RackParser.js'
import Utils from '../utils/Utils.js'


class InfraView extends AlarmView {

    constructor () {
        super()
    }
    
    init () {
        this.overlays = {}
        
        // [주의] 화면에 전환되도 계속 수신함 => unsubscribe 해야 함
        const unsubscribe = EventBus.subscribe('evt.alm.new', this.evtAlmNew)
        this.unsubscribe = unsubscribe

        this.html =  `
        <!-- wrap_right -->
        <div class="wrap_right">
            <div id="contents">
                <h2>인프라</h2>
                <div class="tab_container -bgNone">
                    <div id="infra" class="panel-box" style="background-color: white; height: 800px;"></div>
                </div>
            </div>
        </div>    
        `
        w2ui['layout'].html('main', this.html);
        w2utils.lock('#contents', '잠시 기다려주세요', true);

        this.reqInfra();
    }

    reqInfra() {
        const reqObj = {
            url: '/infra', 
            cmd: 'request_infra_diagram', 
            opt: {
                cloud: 'labmec01', 
                project: 'cctv'
            }
        }

        Dispatcher.dispatch(reqObj, this.cbInfra);
    }

    cbInfra = (objResp) => {
        w2utils.unlock('#contents');

        // MxGraph 로드        
        let mxgraphHepler = new SdmvToMxgraph('infra')
        mxgraphHepler.loadDiagram(JSON.parse(objResp), this.cbInfraGraph)
    }

    cbInfraGraph = (graph, topologyData) => {
        this.graph = graph
        
        // 그래프 화면에 맞춤
        graph.getView().setScale(0.92)

        // 현재 알람 표시
        this.getAlmCur()

        const _this = this

        // 그래프 리스너 등록
        graph.addListener(mxEvent.CLICK, function(sender, evt){
            if (_this.parser == undefined) {
                _this.parser = new RackParser(topologyData);
            }

            var source = evt.getProperty('cell')
            const _id = source.getId()
            console.log(_id)

            const obj = _this.parser.getObjectById(_id)
            const comp_type = obj[0].comp_type
            
            if (source != null) {
                const edgeCount = source.getEdgeCount()
                
                if (comp_type === 'server-nic') {
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
                    _this.selectTab(_id);
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
                else if (comp_type === 'switch_port') {
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
                                    let script = `<script type="text/javascript">var netdataNoBootstrap = true;<\/script> \
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
                else {
                    if (edgeCount == 0) {
                        let target01 = null
                        let target02 = null

                        if (_id == 'nxf6iktdRz3XM0qd-vhA-9') {
                            target01 = graph.getModel().getCell('nxf6iktdRz3XM0qd-vhA-132')
                            target02 = graph.getModel().getCell('28')
                        }
                        else if (_id == 'nxf6iktdRz3XM0qd-vhA-14') {
                            target01 = graph.getModel().getCell('nxf6iktdRz3XM0qd-vhA-133')
                            target02 = graph.getModel().getCell('29')
                        }
                        else if (_id == 'nxf6iktdRz3XM0qd-vhA-24') {
                            target01 = graph.getModel().getCell('nxf6iktdRz3XM0qd-vhA-134')
                            target02 = graph.getModel().getCell('30')
                        }
                
                        graph.getModel().beginUpdate()
                        try {
                            graph.insertEdge(graph.getModel().getParent(source), null, '', source, target01, 'strokeWidth=2')
                            graph.insertEdge(graph.getModel().getParent(source), null, '', source, target02, 'strokeColor=#999999')
                        }
                        finally {
                            graph.getModel().endUpdate()
                        }
                    }
                    else {
                        graph.getModel().beginUpdate()
                        try {
                            const edge01 = source.getEdgeAt(0)
                            const edge02 = source.getEdgeAt(1)
                            graph.getModel().remove(edge01)
                            graph.getModel().remove(edge02)
                        }
                        finally {
                            graph.getModel().endUpdate()
                        }
                    }
                }
            }
        })
    }

    selectTab(_id){
        let id;
        let title;
        if(_id === 'dj/c/cgni01/c/rack01/30/bm/nova0100/system'){
            $('[data-id=server-1]').addClass('active')
            id = 'server-1';
            title = `서버1`;
        }else if(_id === 'dj/c/cgni01/c/rack01/28/bm/nova0101/system'){
            $('[data-id=server-2]').addClass('active')
            id = 'server-2';
            title = `서버2`;
        }else if(_id === 'dj/c/cgni01/c/rack01/26/bm/nova0102/system'){
            $('[data-id=server-3]').addClass('active')
            id = 'server-3';
            title = `서버3`;
        }else if(_id === 'dj/c/cgni01/c/rack01/24/bm/nova0103/system'){
            $('[data-id=server-4]').addClass('active')
            id = 'server-4';
            title = `서버4`;
        }
            
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
                let script = `
                    <script type="text/javascript">var netdataNoBootstrap = true;var netdataTheme = 'default'<\/script><script type="text/javascript" src="` + Setting.server[`${id}`] + `"><\/script>
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
                
                setTimeout(() => {
                    $("#netdata-chart").html(script); 
                })
            }
        }); 
    }
    
    cbPopupPlatform = (resObj) => {
        w2utils.unlock('#contents')
        this.openPopup('platform', resObj);
    }

    cbPopupVSwitch = (resObj) => {
        w2utils.unlock('#contents');     
        this.openVSwitchPopup('vswitch', resObj);
    }

    cbPopupAppContainers = (resObj) => {
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
        });
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
        })
    } 

    cbVSwitchPopup = (resObj, payload) => {
        w2utils.unlock('#gridMaster');
        console.log(resObj);
        $('#textSlave').text(resObj);
    }

}

export default new InfraView;