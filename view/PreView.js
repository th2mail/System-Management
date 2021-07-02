import EventBus from '../utils/EventBus.js'
import WorkerCleanup from '../utils/WorkerCleanup.js'



class PreView {

    constructor () {
        EventBus.subscribe('evt.status.req', this.evtStatusReq)
        EventBus.subscribe('evt.status.res', this.evtStatusRes)
    }

    init () {
        let html = `
        <div class="status-bar">
           <ul>
             <li id='status-bar-msg'>요청/응답<span>data sec</span> </li>
            </ul>
            <ul>
             <li>웹워커<span data-id='worker'>data</span></li>
             <li>메모리 사용량<span data-id='mem'>data</span></li>
             <li></li>
             <li></li>
            </ul>
        </div>
        `

        w2ui['layout'].html('preview', html);

        this.li = $('#status-bar-msg')

    }


    evtStatusReq = (reqObj) => {
        const _msg = `[요청] ${reqObj.url}/${reqObj.cmd} 요청 중 . . .`
        this.li.text(_msg)
        // $(`span[data-id=mem]`).html(performance.measureMemory())
    }

    evtStatusRes = (resObj) => {
        const _msg = `[응답] ${resObj.url}/${resObj.cmd} 결과 수신 `
        this.li.html(`${_msg} <span>${(resObj.duration/1000).toFixed(2)} sec</span>`)
        const mem = this.measureMemory()
        $(`span[data-id=mem]`).text(`Limit: ${mem[0]}, Total: ${mem[1]}, Used: ${mem[2]}`)

        const workers = WorkerCleanup.analyzed()
        $(`span[data-id=worker]`).text(`Global: ${workers.Global} Page: ${workers.Page}, Temp: ${workers.Temporary}`)
    }

    measureMemory = () => {
        const mem = [
            `${(window.performance.memory.jsHeapSizeLimit/1024/1024).toFixed(0)}`, 
            `${(window.performance.memory.totalJSHeapSize/1024/1024).toFixed(0)}`, 
            `${(window.performance.memory.usedJSHeapSize/1024/1024).toFixed(0)}`
        ]
        return mem
    }
}

export default PreView;