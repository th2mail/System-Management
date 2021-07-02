
/**
 * Description: 실행된 Worker는 페이지가 바뀌어도 인스턴스가 계속실행되므로 처리를 중단할 수 있는
 *  방법이 있어야 한다. WorkerClenaup은 실행된 Worker중 해당 페이지에서만 주기적으로 실행되어야 하는
 *  Worker의 페이지가 변경된 경우 기존 페이지에서 실행되는 Worker를 중지시킨다.
 * 
 * howto: 5분 간격으로 현재 실행중인 Worker와 페이지를 검사하여 해당 범위 밖에서 실행중인 Worker를 찾아
 *  terminate() 시킨다.
 * 
 * pattern: WorkerClenaup은 페이지 구동시 Worker가 구동 및 중지시마다 호출되고 해당 인스턴스를 
 *  관리해야 하므로 하나의 인스턴스가 존재해야 한다. - Singleton
 * 
 * Properties
 *  1) workerType: worker의 종류를 구분한다.
 *     - T (Temporary) : 한번만 수행되고 종료되는 worker
 *     - P (Page) : 페이지 단위로 수행되고 종료되는 worker
 *     - A (Application) : Application 단위로 수행되는 worker
 */

class WorkerCleanup {

    constructor() {
        this.workers = {}
        this.workers['T'] = []
        this.workers['P'] = []
        this.workers['A'] = []

    }

    register(workerType, worker) {
        this.workers[workerType].push(worker)
    }

    analyze() {
        this.workers['P'].forEach(worker => {
            worker.terminate()
            // worker.destroy()
        })

        this.workers['P'] = []
    }

    analyzed() {
        const _worker = {
            'Global': Object.keys(Object.entries(this.workers['A'])).length, 
            'Page': Object.keys(Object.entries(this.workers['P'])).length, 
            'Temporary': Object.keys(Object.entries(this.workers['T'])).length
        }
        return _worker
    }
}

export default new WorkerCleanup