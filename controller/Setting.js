const ServerConfig = {
    host: '127.0.0.1',
    port: 50004
}

const MonitoringServerConfig = {
    host: '127.0.0.1',
    port: 50005
}

const NetdataConfig = {
    host: '127.0.0.1',
    port: 19999
}

const Worker01 = {
    id: 'okd-worker01.lab.okd.djtb'
}

const Worker02 = {
    id: 'okd-worker02.lab.okd.djtb'
}

const StompConfig = {
    url: 'ws://127.0.0.1:12345/ws',
    id: 'guest',
    password: 'guest',
    destination: {
        inventory: {
            summary: 'topic.inventory.summary',
            list: 'topic.inventory.list'
        },
        alarm: {
            summary: 'topic.alarm.summary',
            infra: 'topic.alarm.infra',
            list: 'topic.alarm.list'
        }
    }
}

/**
 * 대쉬보드 platform, vswitch, app-containers 팝업화면의 컬럼정보
 */
const DASHBOARD_CTRL_WORK_COLUMNS = {
    VSWITCH: [
        { field: 'AGE', text: 'AGE', size: '50px', sortable: true },
        { field: 'IP', text: 'IP', size: '100px', sortable: true },
        { field: 'LABELS', text: 'LABELS', size: '300px', sortable: true },
        { field: 'NAME', text: 'NAME', size: '290px', sortable: true },
        { field: 'NODE', text: 'NODE', size: '200px', sortable: true },
        { field: 'NOMINATED_NODE', text: 'NOMINATED_NODE', size: '150px', sortable: true },
        { field: 'READINESS GATES', text: 'READINESS GATES', size: '150px', sortable: true },
        { field: 'READY', text: 'READY', size: '80px', sortable: true },
        { field: 'RESTARTS', text: 'RESTARTS', size: '80px', sortable: true },
        { field: 'STATUS', text: 'STATUS', size: '100px', sortable: true },
    ],
    OTHER: [
        { field: 'AGE', text: 'AGE', size: '50px', sortable: true },
        { field: 'IP', text: 'IP', size: '100px', sortable: true },
        { field: 'LABELS', text: 'LABELS', size: '300px', sortable: true },
        { field: 'NAME', text: 'NAME', size: '290px', sortable: true },
        { field: 'NAMESPACE', text: 'NAMESPACE', size: '290px', sortable: true },
        { field: 'NODE', text: 'NODE', size: '200px', sortable: true },
        { field: 'NOMINATED_NODE', text: 'NOMINATED_NODE', size: '150px', sortable: true },
        { field: 'READINESS GATES', text: 'READINESS GATES', size: '150px', sortable: true },
        { field: 'READY', text: 'READY', size: '80px', sortable: true },
        { field: 'RESTARTS', text: 'RESTARTS', size: '80px', sortable: true },
        { field: 'STATUS', text: 'STATUS', size: '100px', sortable: true }
    ]
}

/**
 * 대쉬보드 인벤토리 현황 팝업화면의 컬럼정보
 */
const DASHBOARD_INVENTORY_STATUS_COLUMNS = {
    SERVER_RECID: 'NAME',
    SERVER: [
        { field: 'AGE', text: 'AGE', size: '200px', sortable: true },
        { field: 'NAME', text: 'NAME', size: '380px', sortable: true },
        { field: 'ROLES', text: 'ROLES', size: '200px', sortable: true },
        { field: 'STATUS', text: 'STATUS', size: '200px', sortable: true },
        { field: 'VERSION', text: 'VERSION', size: '200px', sortable: true }
    ],

    SWITCH_RECID: 'switch_alias',
    SWITCH: [
        { field: 'cloud', text: 'cloud', size: '70px', sortable: true },
        { field: 'cloud_alias', text: 'cloud_alias', size: '90px', sortable: true },
        { field: 'cloud_code', text: 'cloud_code', size: '90px', sortable: true },
        { field: 'cloud_type', text: 'cloud_type', size: '90px', sortable: true },
        { field: 'ne_fullname', text: 'ne_fullname', size: '200px', sortable: true },
        { field: 'ne_port_id', text: 'ne_port_id', size: '200px', sortable: true },
        { field: 'ne_size', text: 'ne_size', size: '90px', sortable: true },
        { field: 'ne_type', text: 'ne_type', size: '90px', sortable: true },
        { field: 'port_desc', text: 'port_desc', size: '100px', sortable: true },
        { field: 'port_enable', text: 'port_enable', size: '100px', sortable: true },
        { field: 'port_fullname', text: 'port_fullname', size: '100px', sortable: true },
        { field: 'port_id', text: 'port_id', size: '100px', sortable: true },
        { field: 'port_link_ne', text: 'port_link_ne', size: '100px', sortable: true },
        { field: 'port_link_ne_port_id', text: 'port_link_ne_port_id', size: '150px', sortable: true },
        { field: 'port_link_ne_type', text: 'port_link_ne_type', size: '150px', sortable: true },
        { field: 'port_link_port', text: 'ne_tport_link_portype', size: '150px', sortable: true },
        { field: 'port_link_port_mac', text: 'port_link_port_mac', size: '150px', sortable: true },
        { field: 'port_mac_address', text: 'port_mac_address', size: '150px', sortable: true },
        { field: 'port_net_bridge', text: 'port_net_bridge', size: '150px', sortable: true },
        { field: 'port_net_cidr', text: 'port_net_cidr', size: '150px', sortable: true },
        { field: 'port_net_desc', text: 'port_net_desc', size: '150px', sortable: true },
        { field: 'port_net_fullname', text: 'port_net_fullname', size: '150px', sortable: true },
        { field: 'port_net_name', text: 'port_net_name', size: '150px', sortable: true },
        { field: 'port_net_type', text: 'port_net_type', size: '150px', sortable: true },
        { field: 'port_num', text: 'port_num', size: '150px', sortable: true },
        { field: 'port_phy_name', text: 'port_phy_name', size: '150px', sortable: true },
        { field: 'port_type', text: 'port_type', size: '100px', sortable: true },
        { field: 'rack', text: 'rack', size: '100px', sortable: true },
        { field: 'rack_code', text: 'rack_code', size: '100px', sortable: true },
        { field: 'rack_size', text: 'rack_size', size: '100px', sortable: true },
        { field: 'rack_type', text: 'rack_type', size: '100px', sortable: true },
        { field: 'recid', text: 'recid', size: '100px', sortable: true },
        { field: 'region', text: 'region', size: '100px', sortable: true },
        { field: 'region_code', text: 'region_code', size: '100px', sortable: true },
        { field: 'shelf_num', text: 'shelf_num', size: '100px', sortable: true },
        { field: 'switch', text: 'switch', size: '100px', sortable: true },
        { field: 'switch_alias', text: 'switch_alias', size: '100px', sortable: true },
        { field: 'switch_fullname', text: 'switch_fullname', size: '300px', sortable: true },
        { field: 'switch_role', text: 'switch_role', size: '100px', sortable: true }
    ],
    SWITCH_DETAIL: [
        { field: 'cloud', text: 'cloud', size: '70px', sortable: true },
        { field: 'cloud_alias', text: 'cloud_alias', size: '80px', sortable: true },
        { field: 'cloud_code', text: 'cloud_code', size: '90px', sortable: true },
        { field: 'cloud_type', text: 'cloud_type', size: '80px', sortable: true },
        { field: 'ne_fullname', text: 'ne_fullname', size: '200px', sortable: true },
        { field: 'ne_port_id', text: 'cloud_type', size: '80px', sortable: true },
        { field: 'ne_size', text: 'ne_size', size: '80px', sortable: true },
        { field: 'ne_type', text: 'ne_type', size: '80px', sortable: true },
        { field: 'port_desc', text: 'port_desc', size: '80px', sortable: true },
        { field: 'port_enable', text: 'port_enable', size: '100px', sortable: true },
        { field: 'port_fullname', text: 'port_fullname', size: '250px', sortable: true },
        { field: 'port_id', text: 'port_id', size: '80px', sortable: true },
        { field: 'port_link_ne', text: 'port_link_ne', size: '150px', sortable: true },
        { field: 'port_link_ne_port_id', text: 'port_link_ne_port_id', size: '150px', sortable: true },
        { field: 'port_link_ne_type', text: 'port_link_ne_type', size: '150px', sortable: true },
        { field: 'port_link_port', text: 'port_link_port', size: '150px', sortable: true },
        { field: 'port_link_port_mac', text: 'port_link_port_mac', size: '150px', sortable: true },
        { field: 'port_mac_address', text: 'port_mac_address', size: '150px', sortable: true },
        { field: 'port_net_bridge', text: 'port_net_bridge', size: '150px', sortable: true },
        { field: 'port_net_cidr', text: 'port_net_cidr', size: '150px', sortable: true },
        { field: 'port_net_desc', text: 'port_net_desc', size: '200px', sortable: true },
        { field: 'port_net_fullname', text: 'port_net_fullname', size: '200px', sortable: true },
        { field: 'port_net_name', text: 'port_net_name', size: '150px', sortable: true },
        { field: 'port_net_type', text: 'port_net_type', size: '150px', sortable: true },
        { field: 'port_num', text: 'port_num', size: '150px', sortable: true },
        { field: 'port_phy_name', text: 'port_phy_name', size: '150px', sortable: true },
        { field: 'port_type', text: 'port_type', size: '80px', sortable: true },
        { field: 'rack', text: 'rack', size: '80px', sortable: true },
        { field: 'rack_code', text: 'rack_code', size: '80px', sortable: true },
        { field: 'rack_size', text: 'rack_size', size: '80px', sortable: true },
        { field: 'rack_type', text: 'rack_type', size: '80px', sortable: true },
        { field: 'recid', text: 'recid', size: '100px', sortable: true },
        { field: 'region', text: 'region', size: '80px', sortable: true },
        { field: 'region_code', text: 'region_code', size: '100px', sortable: true },
        { field: 'shelf_num', text: 'shelf_num', size: '80px', sortable: true },
        { field: 'switch', text: 'switch', size: '80px', sortable: true },
        { field: 'switch_alias', text: 'switch_alias', size: '100px', sortable: true },
        { field: 'switch_fullname', text: 'switch_fullname', size: '300px', sortable: true },
        { field: 'switch_role', text: 'switch_role', size: '100px', sortable: true }
    ],

    PORJECT_RECID: 'NAME',
    PROJECT: [
        { field: 'NAME', text: 'NAME', size: '580px', sortable: true },
        { field: 'STATUS', text: 'STATUS', size: '580px', sortable: true }
    ],

    POD_RECID: 'NAME',
    POD: [
        { field: 'AGE', text: 'AGE', size: '80px', sortable: true },
        { field: 'IP', text: 'IP', size: '100px', sortable: true },
        { field: 'LABELS', text: 'LABELS', size: '300px', sortable: true },
        { field: 'NAME', text: 'NAME', size: '200px', sortable: true },
        { field: 'NAMESPACE', text: 'NAMESPACE', size: '200px', sortable: true },
        { field: 'NODE', text: 'NODE', size: '200px', sortable: true },
        { field: 'NOMINATED_NODE', text: 'NOMINATED_NODE', size: '150px', sortable: true },
        { field: 'READINESS GATES', text: 'READINESS GATES', size: '150px', sortable: true },
        { field: 'READY', text: 'READY', size: '100px', sortable: true },
        { field: 'RESTARTS', text: 'RESTARTS', size: '100px', sortable: true },
        { field: 'STATUS', text: 'STATUS', size: '100px', sortable: true }
    ],
    POD_DETAIL: [],

    IMAGE_RECID: 'NAME',
    IMAGE: [
        { field: 'IMAGE_REFERENCE', text: 'IMAGE_REFERENCE', size: '580px', sortable: true },
        { field: 'NAME', text: 'NAME', size: '580px', sortable: true }
    ],

    NETWORK_RECID: 'NAME',
    NETWORK: [
        { field: 'IMAGE_REFERENCE', text: 'IMAGE_REFERENCE', size: '580px', sortable: true },
        { field: 'NAME', text: 'NAME', size: '580px', sortable: true }
    ],
}

let server = {
    'server-1': 'http://' + NetdataConfig.host + ':' + NetdataConfig.port + '/host/okd-controller01.lab.okd.djtb/dashboard.js',
    'server-2': 'http://' + NetdataConfig.host + ':' + NetdataConfig.port + '/host/okd-controller02.lab.okd.djtb/dashboard.js',
    'server-3': 'http://' + NetdataConfig.host + ':' + NetdataConfig.port + '/host/okd-worker01.lab.okd.djtb/dashboard.js',
    'server-4': 'http://' + NetdataConfig.host + ':' + NetdataConfig.port + '/host/okd-worker02.lab.okd.djtb/dashboard.js',
    'switch-1': 'http://' + NetdataConfig.host + ':' + NetdataConfig.port + '/dashboard.js',
    'switch-2': 'http://' + NetdataConfig.host + ':' + NetdataConfig.port + '/dashboard.js',
    'worker-1': 'http://' + NetdataConfig.host + ':' + NetdataConfig.port + '/host/okd-worker01.lab.okd.djtb',
    'worker-2': 'http://' + NetdataConfig.host + ':' + NetdataConfig.port + '/host/okd-worker02.lab.okd.djtb',
    'service': 'http://' + NetdataConfig.host + ':' + NetdataConfig.port + '/api/v1/chart?chart='
}

export default {
    ServerConfig,
    MonitoringServerConfig,
    NetdataConfig,
    DASHBOARD_CTRL_WORK_COLUMNS,        // platform, vswitch, app-containers 팝업화면의 컬럼정보
    DASHBOARD_INVENTORY_STATUS_COLUMNS, // 인벤토리 현황 팝업화면의 컬럼정보
    server,
    Worker01,
    Worker02
}