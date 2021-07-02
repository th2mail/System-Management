// const tag = '[EventBus]'

/*
    ES6 싱글톤 모듈
    ES6에서는 다음처럼 클래스를 작성하고 인스턴스 생성 후 export를 하기만 하면 된다.
    ---------------------------------------------------------
    // singleton.js
    class Singleton {
    }
    export default new Singleton


    그리고 export를 하면 동일한 인스턴스를 가져올 수 있다.

    // main.js
    import singleton1 from './singleton'
    import singleton2 from './singleton'

    console.log(singleton1 === singleton2) // true
    ---------------------------------------------------------

    ES6 모듈을 확실하게 동일한 인스턴스인걸 보장한다.
    위 코드에서 인스턴스를 생성하는 시점은 singleton.js 모듈이 로드될 때 실행되기 때문이다.

    자바스크립트 싱글톤은 인스턴스로 중복 사용되는 메모리를 줄이고, 전역변수 사용을 없앨 수 있다.
    하지만 제대로 싱글톤을 하려면 꼭 클로저를 이용해서 private 멤버를 구현해야 한다.
*/
class EventBus {
    
    constructor() {
        // "1581336130514_reecjslrp"
        this._id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.subscriptions = { };


        // 이벤트 등록
        this.subscriptions['evt.inv.summary'] = { };
        this.subscriptions['evt.alm.summary'] = { };
        this.subscriptions['evt.alm.new'] = { };
        this.subscriptions['evt.resource.usage'] = { };
        this.subscriptions['evt.traffic.flow'] = { };
        this.subscriptions['evt.svc.pod'] = { };

        this.subscriptions['evt.status.req'] = { };
        this.subscriptions['evt.status.res'] = { };
    }

    get id() {
        return this._id 
    }

    subscribe = (eventType, callback) => {
        // 사용자마다 id를 하나씩 할당
        const id = Symbol('id')
        
        // LJG: MainController.js에 모든 이벤트를 먼저 등록해야만 사용할 수 있게 함. 등록된 이벤트가 없으면 먼저 등록하라고 에러를 보냄
        if (!this.subscriptions[eventType]) {
            //this.subscriptions[eventType] = { };
            const errmsg = `${eventType} 은 등록되지 않은 이벤트입니다 !!!\n먼저 이벤트를 등록하고 사용하세요`
            // throw errmsg
            alert(errmsg); return
        }
        // 이벤트에 사용자(id)를 key로 callback을 등록
        this.subscriptions[eventType][id] = callback;
        // console.info(`# ${eventType} 메시지 수신 가입`);

        const self = this;
        
        // return {
        //     unsubscribe: function unsubscribe() {
        //         delete self.subscriptions[eventType][id];
        //         // console.info(`# ${eventType} 메시지 수신 해지`);
        //         // LJG: 이벤트 사용자가 없어도 지우지 않는다. 성능에 큰 영향을 주지는 않을 것임.
        //         //      추후, 성능에 영향을 주면 그때 다시 살리자,
        //         //      지금은 MainController에서 이벤트를 공통관리하는 것이 더 중요

        //         // if (Object.getOwnPropertySymbols(self.subscriptions[eventType]).length === 0) {
        //         //     delete self.subscriptions[eventType];
        //         // }
        //     }
        // }

        
            function unsubscribe() {
                delete self.subscriptions[eventType][id];
                // console.info(`# ${eventType} 메시지 수신 해지`);
                // LJG: 이벤트 사용자가 없어도 지우지 않는다. 성능에 큰 영향을 주지는 않을 것임.
                //      추후, 성능에 영향을 주면 그때 다시 살리자,
                //      지금은 MainController에서 이벤트를 공통관리하는 것이 더 중요

                // if (Object.getOwnPropertySymbols(self.subscriptions[eventType]).length === 0) {
                //     delete self.subscriptions[eventType];
                // }
            }

            return unsubscribe
    }

    publish = (eventType, arg) => {
        // 등록된 이벤트가 없으면 먼저 등록하라고 에러를 보냄
        if (!this.subscriptions[eventType]) {
            //this.subscriptions[eventType] = { };
            const errmsg = `${eventType} 은 등록되지 않은 이벤트입니다 !!!\n먼저 이벤트를 등록하고 사용하세요`
            // throw errmsg
            alert(errmsg); return
        }
        
        // console.info(`# ${eventType} 메시지 전파`);
        Object.getOwnPropertySymbols(this.subscriptions[eventType]).forEach(key => {
                this.subscriptions[eventType][key](arg)
            }
        );
    }

    /*
        LJG: 이벤트를 남발하면 프로그램 분석이 어려우니 MainController에서 사용할 이벤트들을 먼저 등록하고
        만약, 등록이 되어있지 않다면 에러를 발생시킨다.
    */
    register = (eventType) => {
        // 등록된 이벤트가 없으면 먼저 등록
        if (!this.subscriptions[eventType]) {
            this.subscriptions[eventType] = { };
        }
    }
    
}

export default new EventBus;