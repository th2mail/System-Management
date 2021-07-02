import SwitchTraffic from '../model/SwitchTraffic.js'
import WorkerTraffic from '../model/WorkerTraffic.js'

addEventListener('message', e => {
    // console.log(`[Netdata 트래픽 처리 시작] ${e.data[0]}`)

    setInterval(function() {
        const start = performance.now()
        fetch(e.data[1].uri, {
            method: 'GET'
        })
        .then(response => {
            if(response.ok) {
                return response.json()
            }
        })
        .then(json => {
            if(json) {
                const end = performance.now()
                const flows = WorkerTraffic.parse(e.data, json)
                const result = {
                    'flow': flows, 
                    'duration': end-start
                }
                postMessage(result)
            }
        })
        .catch(error_o => {
            console.log(`http status code: ${error_o}`);
        })
    }, 5000)
})