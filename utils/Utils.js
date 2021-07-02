import AlarmModel from '../model/AlarmModel.js'
import EventBus from '../utils/EventBus.js'

class Utils {

    static drawMxGraph(container, xml, over) {
        let graph = new mxGraph(container)

        graph.setEnabled(false)
        graph.setHtmlLabels(true)

        // graph.addListener(mxEvent.CLICK, function(sender, evt){
        //     const cell = evt.getProperty('cell')
        // });

        // 마우스 오버시 강조
        // if (over == true) {
        //     var highlight = new mxCellTracker(graph, '#00FF00');
        // }

        // Vertex 스타일 적용
        let vStyle = graph.getStylesheet().getDefaultVertexStyle()
        vStyle[mxConstants.STYLE_STROKECOLOR] = '#000000';
        vStyle[mxConstants.STYLE_FILLCOLOR] = 'white';

        // 화살표 없는 edge로 표현
        delete graph.getStylesheet().getDefaultEdgeStyle()['endArrow'];

        graph.getModel().beginUpdate()
        try {
            const doc = mxUtils.parseXml(xml);
            const codec = new mxCodec(doc);
            codec.decode(doc.documentElement, graph.getModel());
        }
        finally {
            graph.getModel().endUpdate()
        }

        graph.centerZoom = false;
        graph.fit();
        graph.view.rendering = true;
        graph.refresh();

        return graph
    }

    static gaugeChartCommonOptions() {
        let common_options = {
            chart: {
                type: 'solidgauge',
                height: '230px',
            },
    
            title: {
                useHTML: true,
                text: '',
                align: 'center',
                verticalAlign: 'middle',
                y: 30,
                x: 0,
            },
    
            tooltip: {
                enabled: false,
            },
    
            pane: {
                startAngle: 36,
                endAngle: 36,
                background: [{
                    backgroundColor: '#FFF',
                    borderWidth: 0
                }]
            },
    
            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: []
            },
    
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: false,
                    },
                    startAngle: 0,
                    endAngle: 360,
                    center: ['50%', '50%'],
                    colors: ['#4CAF50', '#F2F2F2'],
                    linecap: 'round',
                },
                solidgauge: {
                    dataLabels: {
                        enabled: false
                    },
                    linecap: 'round',
                    stickyTracking: false,
                    rounded: true
                }
            },
        
            series: [{
                type: 'pie',
                innerSize: '85%',
                data: [0, 0]
            },{
                name: 'Company',
                data: [{
                    color: '#FFF',
                    radius: '107%',
                    innerRadius: '99%',
                }]
            }]
        }

        return common_options
    }

    static drawGaugeChart(options, title, div_id, data_id, initial_value) {
        options.title.text = `
            <div class="data-section text-center">
            <p align="middle" class="cl_skyblue">${title}</p>
            <p data-id='${data_id}' align="middle" class="cl_orange">${initial_value}%</p>
            </div>
        `
        return Highcharts.chart(div_id, options);
    }

    /**
     * 컨테이너 (or POD)의 리소스(MEM, CPU, DISK) 사용현황을 Bar 차트로 보여준다.
     * 서로 다른 단위의 리소스 사용현황을 계산하기 위해 100% 기준으로 환산하여 사용량/잔여량을 계산한다.
     */
    static drawBarChart(ctx, labels, data, total) {
        // 사용량 계산 (100% 기준)
        const use = total.map(function (num, idx) {
            return Math.ceil(data[idx] / num * 100)
        })

        // 잔여량 기준 (100% 기준)
        const remain = use.map(function (num, idx) {
            return 100 - num
        })

        console.log("use:" + use)
        console.log("remain:" + remain)

        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: use,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(75, 192, 192, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }, {
                    data: remain,
                    backgroundColor: [
                        'rgba(255, 255, 255, 0.2)',
                        'rgba(255, 255, 255, 0.2)',
                        'rgba(255, 255, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                       label: function(tooltipItem) {
                           if (tooltipItem.xLabel == 'MEM') {
                                return data[0] +"G / (" + total[0] + "G)"
                           }
                           else if (tooltipItem.xLabel == 'CPU') {
                                return data[1] + "% / 100% (2core)"
                            }
                            else {
                                return data[2] + "G / (" + total[2] + "G)"
                            }

                            return text
                        }
                    }
                }, 
                scales: {
                    yAxes: [{
                        display: false, 
                        stacked: true
                    }], 
                    xAxes: [{
                        stacked: true
                    }]
                },
            }
        });

        return myChart
    }

    static getAlmCur = (thisObj) => {
        console.log(">>> [현재 알람]")
        const cur_alms = AlarmModel.getCurAlarm()

        cur_alms.forEach(cur_alm => {
            const cell = thisObj.graph.getModel().getCell(cur_alm.topology_id)
            if (cell != undefined) {
                Utils.clearAlarm(thisObj, cell, cur_alm)
            }
        })

        cur_alms.forEach(cur_alm => {
            const cell = thisObj.graph.getModel().getCell(cur_alm.topology_id)
            if (cell != undefined) {
                Utils.showAlarm(thisObj, cell, cur_alm)
            }
        })
    }

    static evtAlmNew = (thisObj, message) => {
        console.log(">>> [신규 알람 발생]")

        // const _this = thisObj

        const evt_alms = message.body
        evt_alms.forEach(evt_alm => {
            const cell = thisObj.graph.getModel().getCell(evt_alm.item.topology_id)
            
            if (cell != undefined) {
                // 알람 표시
                if(evt_alm.kind === 'N') {
                    Utils.showAlarm(thisObj, cell, evt_alm.item)
                }
                else if(evt_alm.kind === 'D') {
                    Utils.clearAlarm(thisObj, cell, evt_alm.item)
                }
            }
        })
    }

    static showAlarm = (thisObj, cell, item) => {
        // 해제 알람 발생 시 사용
        const _overlay = item.topology_id + "|" + item.event

        if (!thisObj.overlays[_overlay]) {
            // console.log(">>> >>> [알람 등록] " + _overlay)
            const image = `../images/${item.status.toLowerCase()}.gif`
            const overlay = thisObj.graph.setCellWarning(cell, 'Tooltip', new mxImage(image, 25, 25));
            thisObj.overlays[_overlay] = overlay

            // 알람 해제 테스트
            // Utils.clearAlarm(thisObj, cell, item)
        }
    }

    static clearAlarm = (thisObj, cell, item) => {
        const _overlay = item.topology_id + "|" + item.event
        const overlay = thisObj.overlays[_overlay]
        if (overlay) {
            // console.log(">>> >>> [알람 해제] " + _overlay)
            thisObj.graph.removeCellOverlay(cell, overlay)
            delete thisObj.overlays[_overlay]
        }
    }

    static send_evt = (resObj, duration) => {
        resObj['duration'] = duration
        EventBus.publish('evt.status.res', resObj)
    }

    static addRecid = (resObj) => {
        let retObj = [];
        let idx = 1;

        for(let res in resObj){
            resObj[res]['recid'] = String(idx++);
            retObj.push(resObj[res]);
        }


        let strSchema = JSON.stringify(Object.keys(resObj[0]));
        strSchema = strSchema.replaceAll("{","").replaceAll("}","").replaceAll("[","").replaceAll("]","").replaceAll("\"","");
        let arrSchema = strSchema.split(",");

        let summary = `{`;
        summary += `"w2ui" : { "summary" : true },`
        for(let i=0; i<arrSchema.length; i++){
            if(arrSchema[i] == 'recid'){
                summary += `"${arrSchema[i]}" : "S-1"`
            }else if(i == 0){
                summary += `"${arrSchema[i]}" : "<span style='float: left;'>합계</span>",`
            }else if(i == 1){
                summary += `"${arrSchema[i]}" : "<span id='totCnt' style='float: left;'>${idx-1}</span>",`
            }else{
                summary += `"${arrSchema[i]}" : "",`    
            }
        }
        summary += `}`;

        let temp = JSON.parse(summary);
        retObj.push(temp);
        
        return retObj;
    }
}

export default Utils