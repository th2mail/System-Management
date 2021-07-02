import Setting from './Setting.js'
import Controller from './Controller.js'

class InfraController extends Controller {

    constructor() {
        super()
        this.context['request_infra_diagram'] = this.request_infra_diagram
    }

    request(payload, callback) {
        const uri = 'http://' + Setting.ServerConfig.host + ':' + Setting.ServerConfig.port + payload.url
        this.execute(payload.cmd, this, payload, callback, uri)
    }

    request_infra_diagram(thisObj, payload, callback, uri) {
        let worker = thisObj.disposable()
        worker.call(uri, payload, -1,  function(result) {
            callback(result)    // 결과 View 전송
            worker.terminate()  // 처리가 끝난 Worker를 종료시킨다.
        })
    }

}

export default InfraController