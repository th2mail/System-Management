import Setting from './Setting.js'
import Controller from './Controller.js'
import WorkerCleanup from '../utils/WorkerCleanup.js'
import ServicePodModel from '../model/ServicePodModel.js'
import TrafficFlowModel from '../model/TrafficFlowModel.js'



class ServiceController extends Controller {

    constructor() {
        super()

        // 일회성 요청
        this.context['request_service_topology'] = this.request_disposable

        // 페이지 단위 주기적 요청
        this.context['request_netdata_allmatrics'] = this.request_netdata_allmatrics
        this.context['request_service_pod_usage'] = this.request_service_pod_usage
    }


    request(payload, callback) {
        const uri = 'http://' + Setting.ServerConfig.host + ':' + Setting.ServerConfig.port + payload.url
        this.execute(payload.cmd, this, payload, callback, uri)
    }


    request_netdata_allmatrics(thisObj, payload, callback, uri) {
        // console.log("[Controller] /ServiceController/request_netdata_allmatrics")

        // 이 워커가 양쪽에서 처리됨 => 호출되면 강제 종료 시키고 시작한다.
        // request_service_pod_usage의 워커도 같이 종료시킨다.
        WorkerCleanup.analyze()

        let traffic_worker = thisObj.reusable_traffic_worker()
        traffic_worker.onmessage = function (result) {
            TrafficFlowModel.update(payload, result.data.flow, result.data.duration)
        }

        const params = {
            worker01: { uri: `${Setting.NetdataConfig.host}:${Setting.NetdataConfig.port}/host/${Setting.Worker01.id}/api/v1/allmetrics?format=json`, ext: payload.ext },
            worker02: { uri: `${Setting.NetdataConfig.host}:${Setting.NetdataConfig.port}/host/${Setting.Worker02.id}/api/v1/allmetrics?format=json`, ext: payload.ext }
        }

        for (const entry of Object.entries(params)) {
            traffic_worker.postMessage(entry)
        }

        WorkerCleanup.register('P', traffic_worker)
    }

    request_service_pod_usage(thisObj, payload, callback, uri) {
        // console.log("[Controller] /ServiceController/request_service_pod_usage")

        // 20초에 한번씩 구동한다.
        let reusable_worker = thisObj.reusable_pod_worker()
        reusable_worker.call(uri, payload, 1000 * 10, function (result, duration) {
            ServicePodModel.update(payload, result, duration)
        })
        WorkerCleanup.register('P', reusable_worker)
    }
}



export default ServiceController