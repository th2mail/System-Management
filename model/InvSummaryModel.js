import Model from './Model.js'


class InvSummaryModel extends Model {

    constructor () {
        super()
    }


    update(reqObj, resObj, duration) {
        this.notify('evt.inv.summary', reqObj, resObj, duration)
    }
}

export default new InvSummaryModel