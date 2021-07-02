import Model from './Model.js'


class TrafficFlowModel extends Model{

    constructor () {
        super()
    }

    update(reqObj, resObj, duration) {
        this.notify('evt.traffic.flow', reqObj, resObj, duration)
    }
}

export default new TrafficFlowModel