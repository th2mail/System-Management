import TopView from '../view/TopView.js'
import PreView from '../view/PreView.js'
import Dispatcher from '../controller/Dispatcher.js'



document.addEventListener('DOMContentLoaded', () => {
    new TopView().init()
    new PreView().init()

    // 어플리케이션 범위(브라우져 종료시까지)에서 주기적으로 알람을 요청한다.
    reqAlarm()
})

function reqAlarm(){
    const reqObj = {
        "url": "/monitoring",
        "cmd": "request_monitor_current_alarm",
        "opt": {
          "region": "dj",
          "cloud": "cgni01",
          "project": "admin"
        }
    }
    
    Dispatcher.dispatch(reqObj)
}