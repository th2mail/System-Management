import DashboardView from '../view/DashboardView.js'
import InfraView from '../view/InfraView.js'
import ServiceView from '../view/ServiceView.js'
import MonitoringView from '../view/MonitoringView.js'
import WorkerCleanup from '../utils/WorkerCleanup.js'
import Dispatcher from '../controller/Dispatcher.js'
import InventoryView from '../view/InventoryView.js'

class TopView {

    constructor() {
        DashboardView.init()
    }

    init() {
        let html = `
            <!-- wrap_left -->
            <div class="wrap_left"> 
            <!-- header -->
            <div id="header"> 
                <!-- logo -->
                <h1 class="logo"> <a href="" target="self">Alian</a> </h1>
            </div>
            <!-- // header --> 
            
            <!-- MainMenu -->
            <ul class="lnb">
                <li class="active m_dashboard" data-id="dashboard"><a class="hand"><i>대쉬보드</i> </a></li>
                <li class="m_infra" data-id="infra"><a class="hand"><i>인프라</i> </a> </li>
                <li class="m_service" data-id="service"><a class="hand"><i>서비스</i> </a></li>
                <li class="m_monitoring" data-id="monitoring"><a class="hand"><i>모니터링</i> </a></li>
                <li class="m_inventory" data-id="inventory"><a class="hand"><i>인벤토리</i> </a></li>
                
            </ul>
            <!-- // MainMenu --> 
            </div>
            <!-- // wrap_left --> 
        `

        w2ui['layout'].html('left', html);

        $('.lnb li').on('click', function (event) {
            if ($(this).hasClass('active'))
                return;
            // Page 범위 worker 정리
            WorkerCleanup.analyze()

            $(this).parent().children().removeClass('active');
            $(this).addClass('active');

            try {
                switch ($(this).attr('data-id')) {
                    case 'dashboard':
                        DashboardView.init()
                        InfraView.clean()
                        ServiceView.clean()
                        break;
                    case 'infra':
                        InfraView.init()
                        DashboardView.clean()
                        ServiceView.clean()
                        break;
                    case 'service':
                        ServiceView.init()
                        DashboardView.clean()
                        InfraView.clean()
                        break;
                    case 'monitoring':
                        MonitoringView.init();
                        DashboardView.clean()
                        InfraView.clean()
                        ServiceView.clean()
                        break;
                    case 'inventory':
                        InventoryView.init()
                        DashboardView.clean()
                        InfraView.clean()
                        ServiceView.clean()
                        break;
                }
            }
            catch (e) {
                // 
            }
        })
    }

}

export default TopView;