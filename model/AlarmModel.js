import Model from './Model.js'



class AlarmModel extends Model {

    constructor () {
        super()
        this.cur_alms = undefined
    }

    getCurAlarm = () => {
        return this.cur_alms
    }

    update(reqObj, resObj, duration) {
        if (resObj.length != 0) {
            this.cur_alms = resObj
            this.notify('evt.alm.new', reqObj, resObj, duration)
        }
        
    }
}

export default new AlarmModel