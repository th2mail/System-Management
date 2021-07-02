import EventBus from '../utils/EventBus.js'
import Model from './Model.js'



class AlmSummaryModel extends Model {

    constructor () {
        super()
    }


    update(reqObj, resObj, duration) {
        this.notify('evt.alm.summary', reqObj, resObj, duration)
    }
    
}

export default new AlmSummaryModel