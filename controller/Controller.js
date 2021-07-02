import EventBus from '../utils/EventBus.js'
import Utils from '../utils/Utils.js'

class Controller {

    constructor() {
        this.context = {}
    }

    execute(fname, thisObj, payload, callback, uri) {
        var args = Array.prototype.slice.call(arguments, 1);
        this.context[fname].apply(this.context, args)
    }

    disposable() {
        const worker = operative({
            call: function(uri, payload, delay, callback) {
                // console.log("[요청전송] " + uri + '/' + payload.cmd)
                start=performance.now()
                fetch(uri, {
                    method: 'POST', 
                    mode: 'cors', 
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    // console.log("[Controller] 결과 수신")
                    if(response.ok) {
                        return response.json()
                    }
                })
                .then(json => {
                    if(json) {
                        end = performance.now()
                        callback(json.result, (end-start))
                    }
                })
                .catch(error_o => {
                    console.log(`http status code: ${error_o}`)
                })
            }
        });

        return worker
    }

    reusable() {
        const worker = operative({
            call: function(uri, payload, delay, callback) {
                setInterval(function() {
                    start=performance.now()
                    
                    fetch(uri, {
                        method: 'POST', 
                        mode: 'cors', 
                        body: JSON.stringify(payload)
                    })
                    .then(response => {
                        if(response.ok) {
                            return response.json()
                        }
                    })
                    .then(json => {
                        if(json) {
                            end = performance.now()
                            callback(json.result, (end-start))
                        }
                    })
                    .catch(error_o => {
                        console.log(`http status code: ${error_o}`);
                    })
                }, delay)
            }
        });

        return worker
    }    
    
    reusable_traffic_worker() {
        let worker = new Worker("/utils/traffic.js", {type:"module"});
        return worker
    }

    reusable_pod_worker() {
        const worker = operative({
            call: function(uri, payload, delay, callback) {
                const _pods = payload.opt.pod
                setInterval(function() {
                    _pods.forEach(_pod => {
                        payload.opt.pod = _pod
                        start=performance.now()

                        fetch(uri, {
                            method: 'POST', 
                            mode: 'cors', 
                            body: JSON.stringify(payload)
                        })
                        .then(response => {
                            if(response.ok) {
                                return response.json()
                            }
                        })
                        .then(json => {
                            if(json) {
                                let _result = {
                                    'pod': _pod, 
                                    'usage': json.result
                                }
                                end = performance.now()
                                callback(_result, (end-start))
                            }
                        })
                        .catch(error_o => {
                            console.log(`http status code: ${error_o}`);
                        })
                    })
                }, delay)
            }
        });

        return worker
    }


    /**
     * 1회성 요청 명령으로 범용적으로 사용함.
     */
    request_disposable(thisObj, payload, callback, uri) {
        let worker = thisObj.disposable()
        worker.call(uri, payload, -1,  function(result, duration) {
            Utils.send_evt(payload, duration)
            callback(result, payload)
            worker.terminate()
        })
    }
}

export default Controller;