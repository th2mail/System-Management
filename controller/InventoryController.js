import Setting from './Setting.js'
import Controller from './Controller.js'

class InventoryController extends Controller {

    constructor() {
        super()
        this.context['request_inventory_diagram'] = this.request_inventory_diagram
        this.context['request_inventory_data'] = this.request_inventory_data
        this.context['request_inventory_table'] = this.request_inventory_table
    }

    request(payload, callback) {
        const uri = 'http://' + Setting.ServerConfig.host + ':' + Setting.ServerConfig.port + payload.url
        this.execute(payload.cmd, this, payload, callback, uri)
    }

    request_inventory_diagram(thisObj, payload, callback, uri) {
        let worker = thisObj.disposable()
        worker.call(uri, payload, -1,  function(result) {
            callback(result)    // 결과 View 전송
            worker.terminate()  // 처리가 끝난 Worker를 종료시킨다.
        })
    }

    request_inventory_data(thisObj, payload, callback, uri) {
       let worker = thisObj.disposable()
        worker.call(uri, payload, -1,  function(result) {
            callback(result)    // 결과 View 전송
            worker.terminate()  // 처리가 끝난 Worker를 종료시킨다.
        })
    }

    request_inventory_table(thisObj, payload, callback, uri) {
        let worker = thisObj.disposable()
        worker.call(uri, payload, -1,  function(result) {
            callback(result)    // 결과 View 전송
            worker.terminate()  // 처리가 끝난 Worker를 종료시킨다.
        })
    }

}

export default InventoryController