class WorkerTraffic {

    constructor () {
        // 
    }

    parse(data, json) {
        const flows = data[1].ext

        let _in = 0
        let _out = 0

        if (data[0] == 'worker01') {

            const worker01 = new Array()

            flows.worker01.forEach((flow, idx) => {

                let conn = new Array()

                Object.keys(flow).forEach(key => {
                    let port = {}
                    try {
                        if (key === 'vxlan0') {
                            // Netdat에서는 vxlan0 없슴 => vxlan_sys_4789으로 변경 (확인필요)
                            _in = json[`net.vxlan_sys_4789`]['dimensions']['received']['value'] / 1000
                            _out = json[`net.vxlan_sys_4789`]['dimensions']['sent']['value'] / 1000    
                        }
                        else {
                            _in = json[`net.${key}`]['dimensions']['received']['value'] / 1000
                            _out = json[`net.${key}`]['dimensions']['sent']['value'] / 1000
                        }

                        port['id'] = flow[key].id
                        port['in'] = this.get_in_flow(_in)
                        port['out'] = this.get_out_flow(_out)
                    }
                    catch(e) {
                        port['id'] = flow[key].id
                        port['in'] = 'flow00'
                        port['out'] = 'flow00'
                    }

                    conn.push(port)
                })

                worker01.push(conn)
            })

            return worker01
        }
        else if (data[0] == 'worker02') {

            const worker02 = new Array()

            flows.worker02.forEach((flow, idx) => {

                let conn = new Array()

                Object.keys(flow).forEach(key => {
                    let port = {}
                    try {
                        if (key === 'vxlan0') {
                            // Netdat에서는 vxlan0 없슴.
                            _in = json[`net.vxlan_sys_4789`]['dimensions']['received']['value'] / 1000
                            _out = json[`net.vxlan_sys_4789`]['dimensions']['sent']['value'] / 1000    
                        }
                        else {
                            _in = json[`net.${key}`]['dimensions']['received']['value'] / 1000
                            _out = json[`net.${key}`]['dimensions']['sent']['value'] / 1000
                        }
                        
                        port['id'] = flow[key].id
                        port['in'] = this.get_in_flow(_in)
                        port['out'] = this.get_out_flow(_out)
                    }
                    catch(e) {
                        port['id'] = flow[key].id
                        port['in'] = 'flow00'
                        port['out'] = 'flow00'
                    }

                    conn.push(port)
                })

                worker02.push(conn)
            })

            return worker02
        }
    }

    get_in_flow(traffic) {
        let flow = ''
        if (traffic === 0) {
            flow = 'flow00'
        }
        else if (traffic < 1) {
            flow = 'flow02'
        }
        else if (traffic < 10) {
            flow = 'flow04'
        }
        else if (traffic < 100) {
            flow = 'flow06'
        }
        else if (traffic < 1000) {
            flow = 'flow08'
        }
        else {
            flow = 'flow10'
        }

        return flow
    }

    get_out_flow(traffic) {
        let flow = ''
        if (traffic === 0) {
            flow = 'flow00'
        }
        else if (traffic > -1) {
            flow = 'flow02'
        }
        else if (traffic > -10) {
            flow = 'flow04'
        }
        else if (traffic > -100) {
            flow = 'flow06'
        }
        else if (traffic > -1000) {
            flow = 'flow08'
        }
        else {
            flow = 'flow10'
        }

        return flow
    }

}

export default new WorkerTraffic;