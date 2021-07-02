import Dispatcher from '../controller/Dispatcher.js'
import EventBus from '../utils/EventBus.js'
import Utils from '../utils/Utils.js'
import MxGraphModel from '../model/MxGraphModel.js'

/**
 * 제목 : 인벤토리 현황 summary 화면
 * 설명 : 인벤토리 현황 summary 정보를 서버에 요청하고 요청 결과를 EventBus를 통해 수신받아 화면에 반영하기 위한 클래스
 * 
 *      1. View
 *          - 요청 결과 수신을 위한 EventBus
 *          - 요청객체 생성 후 인벤토리 현황을 요청한다
 * 
 *      2. Dispatcher 
 *          - 요청객체의 url 매핑을 이용해 Controller를 lookup/execute 한다
 * 
 *      3. Controller
 *          - 위치 : /inventory/SummaryController
 *          - 서버에 요청 전송
 *          - 모든 요청은 Worker Thread를 구동시켜 별도 Thread에서 구동한다.
 * 
 *      4. Model
 *          - 위치 : /model/InvSummaryModel
 *          - 요청 결과로 받은 인벤토리 현황 summary 정보와 현재 알람 현황 summary 정보를 비교하여
 *            변경분에 해당하는 데이터만 EventBus로 전달한다.
 *      5. EventBus
 *          - 위치: /utils/EventBus
 *          - callback : evtInvSummary
 */
class InventoryView {
    
    constructor () {
        this.arr_schema = new Array();
        this.grd_show = '';
        this.table_name = '';
    }

    init () {
        let html =  `
            <div class="wrap_right">
                <div id="contents">
                    <h2>인벤토리</h2>
                    <div class="tab_container -bgNone">
                        <!-- 확대/축소 -->
                        <div class="btn_searchBox fr mt_33 mr20">
                            <a data-id="btn_zoom_in"  class="btn_search btn_scale_up   btn_round v_mid ml30 hand" title="확대"></a> 
                            <a data-id="btn_zoom_out" class="btn_search btn_scale_down btn_round v_mid      hand" title="축소"></a> 
                        </div>
                        <!--// 확대/축소 -->
                        <div id="inventory-diagram" class="panel-box" style="height: 800px; overflow: auto;"></div>
                    </div>
                    <div class="panel-box bd-r-t-none modal-wrapper" style="position: absolute; top: 500px; width: calc(100% - 8px); height: 332px;">
                        <div class="panel-tit">
                            <span id="tbNm"></span>
                            <a class="btn_search btn_close v_mid fr" href="#" title="닫기"></a> 
                        </div>
                        <div id="inventory-grid" style="width: 100%; height: 270px; overflow: hidden;" name="grid" class="w2ui-reset w2ui-grid w2ui-inactive table">
                        </div>
                    </div>
                </div>
            </div>
        `
        w2ui['layout'].html('main', html);
        w2utils.lock('#contents', '잠시 기다려주세요', true);

        let _this = this;        
        $(".btn_close").click(function(){
            if(_this.grd_show == 'Y'){
                $('.modal-wrapper').toggleClass('open');
                _this.grd_show = 'N';
            }
        }); 
        $(".btn_searchBox a").on("click", function() {
            let id = $(this).attr('data-id'); 
            
            if (id == 'btn_zoom_in') {
                _this.graph.zoomIn()
            } else if (id == 'btn_zoom_out') {
                _this.graph.zoomOut()
            }
        });
        
        this.grd_show = 'N'

        this.reqGrid()
        
        this.reqInventory();        
    }

    reqGrid() {
        if(w2ui['grid']){
            w2ui['grid'].destroy();
        }

        $('#inventory-grid').w2grid({ 
            name: 'grid',
            style: 'font-size: 5px; color: blue',
            show: { lineNumbers: true }
        })
    }

    reqInventory() {
        const reqObj = {
            "url": "/inventory",
            "cmd": "request_inventory_diagram",
            "opt": {
                "cloud": "labmec01"
            }
        }
        
        Dispatcher.dispatch(reqObj, this.cbInventoryDiagram);
    }

    cbInventoryDiagram = (objResp) => {   
        w2utils.unlock('#contents');
        
        // Checks if the browser is supported
        if (!mxClient.isBrowserSupported()) {
            mxUtils.error('Browser is not supported!', 200, false);
        }
        else {
            let _this = this;

            const container = document.getElementById('inventory-diagram')
            const graph = Utils.drawMxGraph(container, objResp)
            this.graph = graph

            let svg = document.getElementsByTagName('svg')
            if (svg!=undefined && svg!=null) {
                svg[0].style.minWidth='fit-content'
                svg[0].style.minHeight='fit-content'
            }

            graph.addListener(mxEvent.CLICK, function(sender, evt){
                var source = evt.getProperty('cell')

                if (source != null) {
                    let _id = source.getId(); 
                    _this.reqInventoryData(_id);
                }
            })

            // 툴팁 추가
            graph.setTooltips(true)

            /** 20.12.21 add, 우면동 환경 테스트시 추가함 */
            graph.zoomOut();
			graph.zoomIn();
            /********************************************/
        }
    }

    reqInventoryData = (id) => {
        this.table_name = MxGraphModel.INVENTORY_DIAGRAM_MAP.get(id)

        // if(this.table_name === 'cloud_type' || this.table_name === 'rack_type'){
        //     w2ui['grid'].recid = 'code';
        // }else{
        //     w2ui['grid'].recid = 'id';
        // }

        const reqObj = {
            "url": "/inventory",
            "cmd": "request_inventory_data",
            "opt": {
                "cloud": "labmec01",
                "target": this.table_name
            }
        }
        w2utils.lock('#contents', '잠시 기다려주세요', true);
        Dispatcher.dispatch(reqObj, this.cbInventoryData);
    }

    cbInventoryData = (objResp) => {
        w2utils.unlock('#contents');        
        
        // 기존 데이터 삭제
        w2ui['grid'].clear();
        w2ui['grid'].refresh();

        // 기존 컬럼 삭제
        for (let i=0; i<this.arr_schema.length; i++){
            w2ui['grid'].removeColumn(this.arr_schema[i]);
        }
        this.arr_schema = [];
        w2ui['grid'].refresh();

        // 신규 컬럼 추가
        let new_schema = JSON.stringify(Object.keys(objResp[0]));
        new_schema = new_schema.replaceAll("{","").replaceAll("}","").replaceAll("[","").replaceAll("]","").replaceAll("\"","");
        this.arr_schema = new_schema.split(",");
        for (let y=0; y<this.arr_schema.length; y++){
            w2ui['grid'].addColumn({ field: this.arr_schema[y], text: this.arr_schema[y], size: '120px', sortable:true });
        }
        w2ui['grid'].refresh();

        // 데이터 추가
        w2ui['grid'].add(Utils.addRecid(objResp));
        w2ui['grid'].refresh();

        $("#tbNm").text(this.table_name);

        if(this.grd_show == 'N'){
            $('.modal-wrapper').toggleClass('open');
            this.grd_show = 'Y';
        }
    }
    
}

export default new InventoryView;

