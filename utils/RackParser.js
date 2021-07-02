class RackParser {

    constructor(json) {
        this.json = json

        this.id_to_name = {
            'nova0100': 'master01', 
            'nova0101': 'master02', 
            'nova0102': 'worker01', 
            'nova0103': 'worker02', 
        }
    }

    /**
     * 다이어그램 모델(JSON)에서 id에 해당하는 element를 반환한다.
     * @param {*} id 
     */
    getObjectById = (id) => {
        const element = this.json.children.filter(function(obj) {
            return obj.id === id
        })
        return element
    }

    /**
     * Server-NIC(소스)에서 연결할 대상 (Switch-Port)의 id를 찾차 반환한다.
     * 
     * @param {*} obj server-nic
     * @returns switch-port
     */
    getTargetIdById = (obj) => {
        const target_string = obj[0].data_d
        const target = JSON.parse(target_string)
        return target.peer_port.peer_port_dn
    }

    getServerNameById = (id) => {
        // id 형식: dj/c/cgni01/c/rack01/30/bm/nova0100/platform
        const ids = id.split('/')
        const server_id = ids[ids.length-2]
        return this.id_to_name[server_id]
    }

    getHostNameById = (id) => {
        const value = this.getServerNameById(id)
        return `okd-${value}.lab.okd.djtb`
    }

    /**
     * 다이어그램 모델(JSON)에서 모든 host_pod_nic을 가져온다.
     */
    getHostPodNics = () => {
        const nics = this.json.children.filter(function(obj) {
            return obj.comp_type === 'host_pod_nic'
        })
        return nics
    }

    /**
     * 다이어그램 모델 (JSON)을 파싱해서 최하단 포트(host_pod_nic)에서 시작해서 모든 연결 정보를 생성한다.
     * 1. 최하단 포트 (host_pod_nic)에 해당하는 객체를 가져온다.
     * 2. host_pod_nic에서 연결정보(data_d)를 가져온다.
     * 3. data_d를 이용해 모든 연결정보를 생성한다.
     * 4. 연결정보는 source -> destination 순으로 구성되고 source/destination은 {value:id}형태로 생성한다.
     */
    getNetworkFlow = () => {
        const flow = new Object()
        flow.worker01 = new Array()
        flow.worker02 = new Array()

        let flag = 0
        const nics = this.getHostPodNics()
        
        nics.forEach(nic => {
            if (nic.data_d.includes('nova0102')) {
                flag = 1
            }
            else {
                flag = 2
            }

            const data_d = JSON.parse(nic.data_d)
            data_d.links.forEach(link => {
                const vertices = link.id.split('<->')
                const id0 = this.getObjectById(vertices[0])
                const id1 = this.getObjectById(vertices[1])

                const edge = {}
                edge[id0[0].text.text] = {}
                edge[id0[0].text.text].id = vertices[0]
                edge[id0[0].text.text].in = 0
                edge[id0[0].text.text].out = 0

                edge[id1[0].text.text] = {}
                edge[id1[0].text.text].id = vertices[1]
                edge[id1[0].text.text].in = 0
                edge[id1[0].text.text].out = 0

                if (flag === 1) {
                    flow.worker01.push(edge)
                }
                else if (flag === 2) {
                    flow.worker02.push(edge)
                }
            })
        })

        return flow
    }
}

export default RackParser