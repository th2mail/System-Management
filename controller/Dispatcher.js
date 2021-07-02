import EventBus from '../utils/EventBus.js'



/**
 * Request 요청을 Controller에 처리를 위임하기 위한 분배 모듈로 ES6 싱글톤 패턴을 사용한다.
 * 모든 컨트롤러는 Dispatcher에 의해 Dynamic 하게 생성된다
 */
class Dispatcher {

    constructor() {
        this._id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    get id() {
        return this._id
    }

    dispatch = (reqObj, callback) => {
        // Dynamic class instance creation
        const paths = reqObj.url.split('/')
        let module = ''
        for (let i=0; i<paths.length; i++) {
            if (i < paths.length-1) {
                module = module + paths[i] + '/'
            }
            else {
                module = module + paths[i].charAt(0).toUpperCase() + paths[i].slice(1)
            }
        }

        const fqcn = '/controller' + module + 'Controller.js'
        import(fqcn).then((module) => {
            let clazz = module.default
            new clazz().request(reqObj, callback)

            // 요청 이벤트 상태 출력
            EventBus.publish('evt.status.req', reqObj)
        });
    }
    
}

export default new Dispatcher