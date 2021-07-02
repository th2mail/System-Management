import Setting from './Setting.js'
import Controller from './Controller.js'
import InvSummaryModel from '../model/InvSummaryModel.js'
import ResourceUsageModel from '../model/ResourceUsageModel.js'
import WorkerCleanup from '../utils/WorkerCleanup.js'

/**
 * 인벤토리 현황 요청을 처리하기 위한 컨트롤러
 * 
 * 서버에 인벤토리 현황을 요청한 후 요청 결과를 InventoryModel에 저장한다.
 * InventoryModel 데이터는 callback을 통해 UI에 반영한다.
 * 
 * InventoryModel 데이터는 
 *   - 서버에서 EventPush로 변경사항을 전달받거나
 *   - 클라이언트에서 주기적으로 ServerPolling을 통해 가져온 데이터를 통해 업데이트한다.
 * 
 * [주의]
 * 페이지 로딩시마다 worker가 계속 생성될 수 있으므로 페이지가 이동하는 경우 worker를 종료시켜야 한다.
 */
class DashboardController extends Controller {

    constructor() {
        super()

        // 일회성 요청
        this.context['request_dashboard_rack_diagram'] = this.request_disposable
        this.context['request_dashboard_platform_status'] = this.request_disposable
        this.context['request_dashboard_vswitch_status'] = this.request_disposable
        this.context['request_dashboard_app_status'] = this.request_disposable
        this.context['request_dashboard_infra_server_list'] = this.request_disposable
        this.context['request_dashboard_infra_switch_list'] = this.request_disposable
        this.context['request_dashboard_infra_project_list'] = this.request_disposable
        this.context['request_dashboard_infra_pod_list'] = this.request_disposable
        this.context['request_dashboard_infra_image_list'] = this.request_disposable
        this.context['request_dashboard_infra_network_list'] = this.request_disposable
        this.context['request_dashboard_infra_server_detail'] = this.request_disposable
        this.context['request_dashboard_infra_switch_detail'] = this.request_disposable
        this.context['request_dashboard_infra_project_detail'] = this.request_disposable
        this.context['request_dashboard_infra_pod_detail'] = this.request_disposable
        this.context['request_dashboard_infra_image_detail'] = this.request_disposable
        this.context['request_dashboard_infra_network_detail'] = this.request_disposable
        this.context['request_dashboard_vswitch_ports'] = this.request_disposable
        this.context['request_dashboard_vswitch_flows'] = this.request_disposable

        // 페이지 단위 주기적 요청
        this.context['request_dashboard_infra_status'] = this.request_dashboard_infra_status
        this.context['request_dashboard_resource_usage'] = this.request_dashboard_resource_usage
    }

    request(payload, callback) {
        const uri = 'http://' + Setting.ServerConfig.host + ':' + Setting.ServerConfig.port + payload.url
        this.execute(payload.cmd, this, payload, callback, uri)
    }

    request_dashboard_infra_status(thisObj, payload, callback, uri) {
        // 일단 한번 구동하고
        let disposable_worker = thisObj.disposable()
        disposable_worker.call(uri, payload, -1,  function(result, duration) {
            console.log("==================== 결과")
            console.log(result)
            InvSummaryModel.update(payload, result, duration)
            disposable_worker.terminate()
        })

        // 1시간에 한번씩 구동한다.
        let reusable_worker = thisObj.reusable()
        reusable_worker.call(uri, payload, 1000*60*60,  function(result, duration) {
            InvSummaryModel.update(payload, result, duration)
        })
        WorkerCleanup.register('P', reusable_worker)
    }

    request_dashboard_resource_usage(thisObj, payload, callback, uri) {
        // 일단 한번 구동하고
        let disposable_worker = thisObj.disposable()
        disposable_worker.call(uri, payload, -1,  function(result, duration) {
            ResourceUsageModel.update(payload, result, duration)
            disposable_worker.terminate()
        })

        // 20초에 한번씩 구동한다.
        let reusable_worker = thisObj.reusable()
        reusable_worker.call(uri, payload, 1000*20,  function(result, duration) {
            ResourceUsageModel.update(payload, result, duration)
        })
        WorkerCleanup.register('P', reusable_worker)
    }
}

export default DashboardController