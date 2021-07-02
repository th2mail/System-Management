import Utils from '../utils/Utils.js'
import EventBus from '../utils/EventBus.js'



class Model {

    constructor () {
        //
    }

    notify(evtType, reqObj,evtData, duration) {
        // 수신한 결과 데이터를 이벤트에 등록된 뷰에 전달한다.
        EventBus.publish(evtType, {source: this, body: evtData} )

        // 수신 결과 메시지를 상태바에 전달한다.
        Utils.send_evt(reqObj, duration)
    }
}

export default Model