class SwitchTraffic {

    constructor () {
        this.switches = ['switch01', 'switch02']
        this.ports = [
            'Ethernet1', 'Ethernet2', 'Ethernet3', 'Ethernet4', 'Ethernet11', 'Ethernet12', 'Ethernet21', 'Ethernet22', 
            'Ethernet31', 'Ethernet32', 'Ethernet45', 'Ethernet46', 'Ethernet47', 'Ethernet48', 
            'Management1', 'Vlan10', 'Vlan110', 'Vlan210', 'Vlan310', 'Vlan810', 'Vlan4094'
        ]
    }

    parse(json) {
        console.log('switch traffic parse')

        let _in = 0
        let _out = 0
        
        let _this = this
        _this.switches.forEach(function(item_switch, sindex) {
            _this.ports.forEach(function(item_port, pindex) {
                try {
                    // Netdata 포트별 in/out
                    _in = json[`snmptraffic.${item_switch}_${item_port}_bandwidth`]['dimensions'][`${item_switch}_${item_port}_in`]['value']
                    _out = json[`snmptraffic.${item_switch}_${item_port}_bandwidth`]['dimensions'][`${item_switch}_${item_port}_out`]['value']
                    console.log(`${item_switch}_${item_port} in : ${_in}`)
                    console.log(`${item_switch}_${item_port} out : ${_out}`)

                    // traffic 흐름의 많고 적음의 기준은 ?
                }
                catch(e) {
                    // 
                }
            })
        })
    }

}

export default new SwitchTraffic;