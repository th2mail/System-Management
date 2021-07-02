import AlarmModel from '../model/AlarmModel.js'



class AlarmView {

    constructor () {
        // this.overlays = {}
    }



    getAlmCur = () => {
        // console.log(">>> [현재 알람]")
        const cur_alms = AlarmModel.getCurAlarm()

        cur_alms.forEach(cur_alm => {

            // 알람 ID 생성 및 존재 여부 확인 => 현재 화면에 없으면 표시
            const alm_id = `${cur_alm.topology_id}$${cur_alm.alarm_info}`
            const exists = this.overlays.hasOwnProperty(alm_id)
            if(!exists) {
                const cell = this.graph.getModel().getCell(cur_alm.topology_id)
                if (cell != undefined) {
                    this.showAlarm(cell, cur_alm)
                }
            }
        })
    }

    evtAlmNew = (message) => {
        // console.log(">>> [신규 알람 발생]")

        // 화면 표시된 알람 중 현재 알람에 포함되지 않은 알람은 삭제해야 한다.
        // [주의] Object 복사 시 shallow copy를 하면 원본의 내용이 복사본에 반영되므로 반드시 deep copy를 해야 한다.
        const cloneObj = obj => JSON.parse(JSON.stringify(obj));
        let overlays_copy = cloneObj(this.overlays)

        const evt_alms = message.body

        // console.log(`발생알람 [${evt_alms.length}]`)
        // console.log(`화면알람 [${Object.keys(overlays_copy).length}]`)

        if(this.graph != undefined) {

            evt_alms.forEach(evt_alm => {
                
                // 알람 ID 생성 및 존재 여부 확인 => 현재 화면에 없으면 표시
                const alm_id = `${evt_alm.topology_id}$${evt_alm.alarm_info}`
                delete overlays_copy[alm_id]

                const exists = this.overlays.hasOwnProperty(alm_id)
                if(!exists) {
                    // console.log("화면에 없는 알람")

                    const is_cell_alm = this.processTopologyId(evt_alm)

                    // topology_id가 없으면 dashboard_topology_id를 비교한다. (KT 요구사항)
                    if (!is_cell_alm) {
                        this.processExtraTopologyId(evt_alm, evt_alm.dashboard_topology_id)
                    }

                    // infra
                    if (this.graph.container.id === 'infra') {
                        // infra_topology_id_mid 비교 (KT 요구사항)
                        this.processExtraTopologyId(evt_alm, evt_alm.infra_topology_id_mid)

                        // infra_topology_id_right 비교 (KT 요구사항)
                        this.processExtraTopologyId(evt_alm, evt_alm.infra_topology_id_right)
                    }
                }
                else {
                    // console.log("화면에 있는 알람")
                    if (evt_alm.category === 'pod') {
                        this.processExtraTopologyId(evt_alm, evt_alm.dashboard_topology_id)
                    }
                }
            })

            // console.log(`화면알람 [${Object.keys(this.overlays).length}]`)
            // console.log(`삭제대상알람 [${Object.keys(overlays_copy).length}]`)

            Object.keys(overlays_copy).forEach(key => {
                let overlay = delete this.overlays[key]
                let id = key.split('$')[0]
                // console.log(id)
                const cell = this.graph.model.getCell(id)
                if (cell) {
                    // console.log("알람 삭제")
                    this.graph.removeCellOverlays(cell, overlay)
                }
                // else {
                //     console.log("알람 삭제 에러")
                // }
            })
        }
    }

    processTopologyId = (evt_alm) => {
        // console.log(evt_alm.topology_id)

        const cell = this.graph.model.getCell(evt_alm.topology_id)
        if (cell) {
            // console.log("[Topology] 존재하는 CELL")
            this.showAlarm(cell, evt_alm)
            return true
        }
        else {
            // console.log("[Topology] 존재하지 않는 CELL")
            return false
        }
    }

    processExtraTopologyId = (evt_alm, topology_id) => {
        // console.log(topology_id)

        const cell = this.graph.model.getCell(topology_id)
        if (cell) {
            // console.log("[Dashboard] 존재하는 CELL")
            this.showAlarmExtra(cell, evt_alm, topology_id)
        }
        // else {
        //     console.log("[Dashboard] 존재하지 않는 CELL")
        // }
    }

    showAlarm = (cell, cur_alm) => {
        // console.log("알람 추가")
        const _overlay = cur_alm.topology_id + "$" + cur_alm.alarm_info
        // console.log(_overlay)

        if (!this.overlays[_overlay]) {
            // console.log(">>> >>> [알람 등록] " + _overlay)
            const image = `../images/${cur_alm.status.toLowerCase()}.gif`
            const overlay = this.graph.setCellWarning(cell, 'Tooltip', new mxImage(image, 25, 25));
            this.overlays[_overlay] = overlay
        }
    }

    showAlarmExtra = (cell, cur_alm, topology_id) => {
        // console.log("알람 추가")
        const _overlay = topology_id + "$" + cur_alm.alarm_info
        // console.log(_overlay)

        if (!this.overlays[_overlay]) {
            // console.log(">>> >>> [알람 등록] " + _overlay)
            const image = `../images/${cur_alm.status.toLowerCase()}.gif`
            const overlay = this.graph.setCellWarning(cell, 'Tooltip', new mxImage(image, 25, 25));
            this.overlays[_overlay] = overlay
        }
    }

    clearAlarm = (cell, item) => {
        console.log("알람 해제")
        const _overlay = item.topology_id + "$" + item.alarm_info
        const overlay = this.overlays[_overlay]
        if (overlay) {
            this.graph.removeCellOverlay(cell, overlay)
            delete this.overlays[_overlay]
        }
    }

    // 현재 화면의 모든 알람을 헤지한다.
    clearAllAlarms = () => {
        Object.keys(this.overlays).forEach(key => {
            let overlay = delete this.overlays[key]
            let id = key.split('$')[0]
            // console.log(id)
            const cell = this.graph.model.getCell(id)
            if (cell) {
                // console.log("알람 삭제")
                this.graph.removeCellOverlays(cell, overlay)
            }
            // else {
            //     console.log("알람 삭제 에러")
            // }
        })
    }

    // 현재 등록되어 있는 evt.alm.new 이벤트 수신자를 종료한다.
    clean = () => {
        this.unsubscribe()
    }
}

export default AlarmView