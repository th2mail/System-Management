import Model from './Model.js'


class ResourceUsageModel extends Model{

    constructor () {
        super()
    }

    update(reqObj, resObj, duration) {
        const cpu_total = resObj.cpu_total / (1000 * 1000 * 1000) / 24
        const cpu_used = resObj.cpu_used / (1000 * 1000 * 1000) / 24
        const cpu_usage = resObj.cpu_usage
        const disk_total = resObj.disk_total / (1024 * 1024)
        const disk_used = resObj.disk_used / 1024 / 1024
        const disk_usage = resObj.disk_usage
        const mem_total = resObj.mem_total / 1024 / 1024 / 1024
        const mem_used = resObj.mem_used / 1024 / 1024 / 1024
        const mem_usage = resObj.mem_usage

        const usgObj = {
            cpu_total: cpu_total.toFixed(2), 
            cpu_used: cpu_used.toFixed(2), 
            cpu_usage: cpu_usage.toFixed(2), 
            disk_total: disk_total.toFixed(2), 
            disk_used: disk_used.toFixed(2), 
            disk_usage: disk_usage.toFixed(2), 
            mem_total: mem_total.toFixed(2), 
            mem_used: mem_used.toFixed(2),
            mem_usage: mem_usage.toFixed(2)
        }

        this.notify('evt.resource.usage', reqObj, usgObj, duration)
    }
}

export default new ResourceUsageModel