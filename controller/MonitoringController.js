import Setting from './Setting.js'
import Controller from './Controller.js'
import WorkerCleanup from '../utils/WorkerCleanup.js'
import AlmSummaryModel from '../model/AlmSummaryModel.js'
import AlarmModel from '../model/AlarmModel.js'



class MonitoringController extends Controller {

    constructor() {
        super()
        
        // 일회성 요청
        this.context['request_monitor_current_alarm_onetime'] = this.request_monitor_current_alarm_onetime     
        this.context['request_monitor_history_alarm'] = this.request_disposable;
        this.context['request_monitor_history_group_alarm'] = this.request_disposable;

        // 페이지 단위 주기적 요청
        this.context['request_monitor_dashboard_alarm_status'] = this.request_monitor_dashboard_alarm_status

        // 어플리케이션 단위 주기적 요청
        this.context['request_monitor_current_alarm'] = this.request_monitor_current_alarm
    }

    request(payload, callback) {
        const uri = 'http://' + Setting.MonitoringServerConfig.host + ':' + Setting.MonitoringServerConfig.port + payload.url
        this.execute(payload.cmd, this, payload, callback, uri)
    }

    request_monitor_dashboard_alarm_status(thisObj, payload, callback, uri) {
        // 일단 한번 구동하고
        let disposable_worker = thisObj.disposable()
        disposable_worker.call(uri, payload, -1,  function(result, duration) {
            AlmSummaryModel.update(payload, result, duration)
            disposable_worker.terminate()
        })

        // 10초에 한번씩 구동
        let reusable_worker = thisObj.reusable()
        reusable_worker.call(uri, payload, 1000*10,  function(result, duration) {
            AlmSummaryModel.update(payload, result, duration)
        })
        WorkerCleanup.register('P', reusable_worker)
    }

    request_monitor_current_alarm = (thisObj, payload, callback, uri) => {
        // 일단 한번 구동하고
        let disposable_worker = thisObj.disposable()
        disposable_worker.call(uri, payload, -1,  function(result, duration) {
            AlarmModel.update(payload, result, duration)
            disposable_worker.terminate()
        })

        // 10초에 한번씩 구동
        let worker = thisObj.reusable()
        worker.call(uri, payload, 1000 * 10,  function(result, duration) {
            AlarmModel.update(payload, result, duration)
        })

        WorkerCleanup.register('A', worker)
    }

    request_monitor_current_alarm_onetime(thisObj, payload, callback, uri) {
        payload.cmd = "request_monitor_current_alarm";

        let worker = thisObj.disposable()
        worker.call(uri, payload, -1,  function(result) {
            callback(result, payload)    // 결과 View 전송
            worker.terminate()  // 처리가 끝난 Worker를 종료시킨다.
        })
    }
}

export default MonitoringController