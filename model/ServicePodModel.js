import Model from './Model.js'


class ServicePodModel extends Model {

    constructor () {
        super()
    }


    update(reqObj, resObj, duration) {
        this.notify('evt.svc.pod', reqObj, resObj, duration)
    }
}

export default new ServicePodModel