class Timer {

    constructor(){
        this._sWorkName = '';
        this._old = null;
        this._now = null;
        this._gap = 0;
    }

    start = () => {
        this._old = new Date();
    }
   
    end = () => {
        this._now = new Date();
        // this._gap = this._now.getTime() - this._old.getTime();
        this._gap = this._now - this._old;
    }

    _alert = (_sWorkName) => {
        this._sWorkName = _sWorkName;
        let min_gap = Math.floor((this._gap% (1000 * 60 * 60)) / (1000 * 60));
        let sec_gap = Math.floor((this._gap % (1000 * 60)) / 1000);
        // alert(`${this._sWorkName} 작업이 ${min_gap}분 ${sec_gap}초가 걸렸습니다`);
        console.log("###############################################################")
        console.log("###############################################################")
        console.log(`${this._sWorkName} 작업이 ${min_gap}분 ${sec_gap}초가 걸렸습니다`);
        console.log("###############################################################")
        console.log("###############################################################")
    }

}

export default Timer
