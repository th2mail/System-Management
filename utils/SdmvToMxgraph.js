import Utils from '../utils/Utils.js'

class SdmvToMxgraph {

    constructor(container){
        this.graphContainer = document.getElementById(container)
        this.graph = new mxGraph(this.graphContainer);
        this.graph.model.clear();
        this.gridSize = 10;
        // this.containerWidth = 1000;
        // this.containerHeight = 800;
        this.itemPaddingLeft = 0;
        this.itemPaddingTop = 0;
        this.encoder = new mxCodec(mxUtils.createXmlDocument());
        
		this.graph.setConnectable(true);
		this.graph.setMultigraph(false);
		this.graph.setGridEnabled(true);
		this.graph.setGridSize(5);
		this.graph.setTooltips(true);
		this.graph.setHtmlLabels(true);
		this.graph.setEnabled(false);
		// this.graph.setResizeContainer(true);
		// this.graph.doResizeContainer(this.graph.container.offsetWidth, this.graph.container.offsetHeight);
		// this.graph.minimumContainerSize = new mxRectangle(0, 0, this.graph.container.offsetWidth, this.graph.container.offsetHeight);
		// this.graph.expandedImage = new mxImage(null, 0, 0);
        // this.graph.collapsedImage = new mxImage(null, 0, 0);
        
        this.canvas = document.createElement("canvas");
		this.canvas.style.position = "absolute";
		this.canvas.style.top = "0px";
		this.canvas.style.left = "0px";
		this.canvas.style.zIndex = "-1";
		this.graph.container.appendChild(this.canvas);
		this.ctx = this.canvas.getContext("2d");
		this.graph.view.validateBackground = this.validateBackground;
		this.validateBackground();

        mxCodec.prototype.reference = function(obj) {
			if("mxCell" === mxUtils.getFunctionName(obj.constructor)) {
				return obj.getId();
			} else {
				return null;
			}
		};
    }

    /**
	 * sample json(AMF, SMF, 물리서버) json데이터를 노출 하기 전 container의 사이즈 및 기본값 설정
	 * @param meta
	 * @param callback
	 */
	initTopologyCanvas(meta, callback){
		try {
			this.graph.model.clear();

			this.topologyData = meta;

			this.gridSize = meta.cellWidth;
			// this.containerWidth = (meta.cols * meta.cellWidth) + (meta.paddingLeft * meta.cellWidth) + (meta.paddingRight * meta.cellWidth);
			// this.containerHeight = (meta.rows * meta.cellWidth) + (meta.paddingTop * meta.cellWidth) + (meta.paddingBottom * meta.cellWidth);
			this.itemPaddingLeft = meta.paddingLeft * meta.cellWidth;
			this.itemPaddingTop = meta.paddingTop * meta.cellWidth;

			// this.graph.minimumContainerSize = new mxRectangle(0, 0, Math.max(this.containerWidth, this.graph.container.offsetWidth), Math.max(this.containerHeight, this.graph.container.offsetHeight));
			// this.graph.doResizeContainer(Math.max(this.containerWidth, this.graph.container.offsetWidth), Math.max(this.containerHeight, this.graph.container.offsetHeight));
		} finally {
			callback();
		}
    };

    /**
	 * sample json데이터의 meta data로 vertex의 스타일 지정
	 * @param item
	 * @param constituent
	 */
	setVertexStyle(item, constituent){
		let styles = new Array();

		let labelVertical;

		if("hanging" === item.text.alignment.vertical) {
			labelVertical = mxConstants.ALIGN_TOP;
		} 
		else if("ideographic" === item.text.alignment.vertical) {
			labelVertical = mxConstants.ALIGN_BOTTOM;
		} 
		else {
			labelVertical = item.text.alignment.vertical;
		}

		let fillColor;
		let fillOpacity;
		if("none" === item.fill.fill) {
			fillColor = "rgba(255, 255, 255, 1)";
			fillOpacity = "50";
		} 
		else {
			fillColor = "none" === item.fill.color ? "rgba(255, 255, 255, 1)" : item.fill.color;
			fillOpacity = '50'
		}

		let strokeColor;
		let strokeOpacity;
		if("none" === item.stroke.stroke || "none" === item.stroke.color) {
			strokeColor = "rgba(150, 150, 150, 1)";
			strokeColor = "";
			strokeOpacity = "0";
		} 
		else {
			strokeColor = "rgba(150, 149, 149, 1)";
			strokeOpacity = String(item.stroke.opacity * 100);
		}

		styles.push("constituent=".concat(constituent ? String(constituent) : "0"));

		if (item.comp_type == 'server-pod') {
			styles.push(mxConstants.STYLE_FILL_OPACITY.concat("=", '50'));
			styles.push(mxConstants.STYLE_FILLCOLOR.concat("=", '#d6d4d4'));
		}
		else {
			styles.push(mxConstants.STYLE_FILL_OPACITY.concat("=", 100));
			styles.push(mxConstants.STYLE_FILLCOLOR.concat("=", fillColor));
		}

		styles.push(mxConstants.STYLE_STROKECOLOR.concat("=", strokeColor));
		styles.push(mxConstants.STYLE_STROKE_OPACITY.concat("=", strokeOpacity));
		styles.push(mxConstants.STYLE_STROKEWIDTH.concat("=", String(item.stroke.width)));
		
		styles.push(mxConstants.STYLE_FONTCOLOR.concat("=", '#545353'));
		styles.push(mxConstants.STYLE_FONTFAMILY.concat("=", item.text.fontFamily));
		styles.push(mxConstants.STYLE_FONTSIZE.concat("=", String(item.text.fontSize)));
		styles.push(mxConstants.STYLE_FONTSTYLE.concat("=", item.text.fontStyle));

		styles.push(mxConstants.STYLE_VERTICAL_ALIGN.concat("=", labelVertical));

		return styles.join(";");
	};
    
    /**
	 * sample json데이터의 meta data로 mxgraphe cell object 생성
	 * @param item
	 * @param constituent
	 */
	createCell(item, constituent){
		let cell= new mxCell();
		cell.setId(item.id);
		cell.setValue(item.text ? item.text.text : "");
		cell.setVertex(true);
		
		if(item.text.alignment != undefined){
			cell.setStyle(this.setVertexStyle(item, constituent));
		}

		if(item.action !== null && typeof item.action !== "undefined") {
			cell["action"] = JSON.stringify(item.action);
		}

		return cell;
    };

    /**
	 * sample json데이터의 id값 중, 특수문자를 포함하는 edge id를 고유의 uuid로 변환
	 */
	uuidv4() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
			let r = Math.random() * 16 | 0;
			let v = c === "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
    };
    
    /**
	 * sample json데이터의 meta data로 vertex의 스타일 지정
	 * @param item
	 */
	setEdgeStyle(item){
		let styles = new Array();

		let arrowStart = mxConstants.ARROW_CLASSIC;
		if("opened-arrow" === item.arrow.startArrowHead) {
			arrowStart = mxConstants.ARROW_OPEN;
		} else if("none" === item.arrow.startArrowHead) {
			arrowStart = "none";
		}
		let arrowEnd = mxConstants.ARROW_CLASSIC;
		if("opened-arrow" === item.arrow.endArrowHead) {
			arrowEnd = mxConstants.ARROW_OPEN;
		} else if("none" === item.arrow.endArrowHead) {
			arrowEnd = "none";
		}

		styles.push(mxConstants.STYLE_STROKECOLOR.concat("=", item.stroke.color));
		styles.push(mxConstants.STYLE_STROKE_OPACITY.concat("=", String(item.stroke.opacity * 100)));
		styles.push(mxConstants.STYLE_STROKEWIDTH.concat("=", String(item.stroke.width)));
		styles.push(mxConstants.STYLE_STARTARROW.concat("=", arrowStart));
		styles.push(mxConstants.STYLE_ENDARROW.concat("=", arrowEnd));

		return styles.join(";");
	};
    
    /**
	 * sample json데이터의 meta data로 mxgraphe edge object 생성
	 */
	createEdges = () => {
		let edgeIds = new Array();
		this.topologyData.children.forEach((item) => {
			if(item.arrow) {
				let regexp = "^([\\w|\\/|\\-]+)(\\<\\-\\>)([\\w|\\/|\\-|\\:]+)$";
				let sourceId = item.id.split('|')[0].replace(new RegExp(regexp, "gi"), "$1");
				let targetId = item.id.split('|')[0].replace(new RegExp(regexp, "gi"), "$3");

				let containEdge = this.topologyData.children.find((edge) => {
					return edge.arrow && targetId.concat("<->", sourceId) === edge.id;
				});

				if(containEdge !== null && typeof containEdge !== "undefined") {
					edgeIds.push(containEdge.id);
				}

				if(!edgeIds.includes(item.id)) {
					if(sourceId !== null && typeof sourceId !== "undefined" && targetId !== null && typeof targetId !== "undefined") {
						let source = this.graph.model.getCell(sourceId);
						let target = this.graph.model.getCell(targetId);

						if(source !== null && typeof source !== "undefined" && target !== null && typeof target !== "undefined") {
							let edge = new mxCell()
							edge.setId(this.uuidv4())
							edge.setEdge(true)
							edge.setGeometry(new mxGeometry())
							// edge.setStyle(this.setEdgeStyle(item));
							edge.setTerminal(source, true)
							edge.setTerminal(target, false)

							if(item.action !== null && typeof item.action !== "undefined") {
								edge["action"] = JSON.stringify(item.action)
							}

							this.graph.addCell(edge)
							edgeIds.push(item.id)
						}
					}
				}
			}
		})

		// Edge 스타일 변경: Arrow 삭제, 회색 적용
		let style = this.graph.getStylesheet().getDefaultEdgeStyle()
		delete style['endArrow']
		style['strokeColor'] = '#b3b1b1'
    };
    
    /**
	 * parent - children cell의 geometry를 상대값으로 update
	 * @param cells
	 */
	updateVertexGeometry = (cells) => {
		if(cells !== null && typeof cells !== "undefined") {
			cells.forEach((cell) => {
				let meta = this.topologyData.children.find((item) => {
					return cell.id === item.id;
				});

				if(meta !== null && typeof meta !== "undefined") {
					let width = meta.size.gridWidth * this.gridSize;
					let height = meta.size.gridHeight * this.gridSize;
					let x = (meta.location.gridX * this.gridSize) + this.itemPaddingLeft;
					let y = (meta.location.gridY * this.gridSize) + this.itemPaddingTop;

					if(cell.parent !== this.graph.getDefaultParent()) {
						let state = this.graph.view.getState(cell.parent);
						x -= state.origin.x;
						y -= state.origin.y;
					}

					this.graph.model.setGeometry(cell, new mxGeometry(x, y, width, height));
				}

				if(cell.children !== null && typeof cell.children !== "undefined" && cell.children.length > 0) {
					this.updateVertexGeometry(cell.children);
				}
			});
		}
    };
    
    /**
	 * string으로 파싱된 xml string을 container에 노출
	 * @param xmlString
	 */
	drawTopology(xmlString) {
		let xml;
		if(xmlString === null || typeof xmlString === "undefined") {
			xml = new XMLSerializer().serializeToString(this.encoder.encode(this.graph.model));
		} 
		else {
			xml = xmlString;
		}

		let xmlDocument = mxUtils.parseXml(xml);
		if(xmlDocument.documentElement !== null && xmlDocument.documentElement.nodeName === "mxGraphModel") {
			let decoder = new mxCodec(xmlDocument);
			let node = xmlDocument.documentElement;

			this.graph.model.beginUpdate();
			try {
				decoder.decode(node, this.graph.model);
			} finally {
				this.graph.model.endUpdate();
			}
		}
	};
	
	validateBackground = () => {
		if(this.ctx !== null) {
			let bounds = this.graph.getGraphBounds();

			let width = Math.max(bounds.x + bounds.width, this.graph.container.offsetWidth);
			let height = Math.max(bounds.y + bounds.height, this.graph.container.offsetHeight);

			let sizeChanged = width !== this.w || height !== this.h;

			if(this.graph.view.scale !== this.s || this.graph.view.translate.x !== this.tr.x || this.graph.view.translate.y !== this.tr.y || this.gs !== this.graph.gridSize || sizeChanged) {
				this.tr = this.graph.view.translate.clone();
				this.s = this.graph.view.scale;
				this.gs = this.graph.gridSize;
				this.w = width;
				this.h = height;

				if(!sizeChanged) {
					this.ctx.clearRect(0, 0, this.w, this.h);
				} else {
					this.canvas.setAttribute("width", String(this.w));
					this.canvas.setAttribute("height", String(this.h));
				}

				let tx = this.tr.x * this.s;
				let ty = this.tr.y * this.s;

				let minStepping = this.graph.gridSize;
				let stepping = minStepping * this.s;

				if(stepping < minStepping) {
					let count = Math.round(Math.ceil(minStepping / stepping) / 2) * 2;
					stepping = count * stepping;
				}

				let xs = Math.floor((0 - tx) / stepping) * stepping + tx;
				let xe = Math.ceil(this.w / stepping) * stepping;
				let ys = Math.floor((0 - ty) / stepping) * stepping + ty;
				let ye = Math.ceil(this.h / stepping) * stepping;

				xe += Math.ceil(stepping);
				ye += Math.ceil(stepping);

				let ixs = Math.round(xs);
				let ixe = Math.round(xe);
				let iys = Math.round(ys);
				let iye = Math.round(ye);

				this.ctx.strokeStyle = "#f3f3f3";
				this.ctx.beginPath();

				for(let x = xs; x <= xe; x += stepping) {
					x = Math.round((x - tx) / stepping) * stepping + tx;
					let ix = Math.round(x);

					this.ctx.moveTo(ix + 0.5, iys + 0.5);
					this.ctx.lineTo(ix + 0.5, iye + 0.5);
				}

				for(let y = ys; y <= ye; y += stepping) {
					y = Math.round((y - ty) / stepping) * stepping + ty;
					let iy = Math.round(y);

					this.ctx.moveTo(ixs + 0.5, iy + 0.5);
					this.ctx.lineTo(ixe + 0.5, iy + 0.5);
				}

				this.ctx.closePath();
				this.ctx.stroke();
			}
		}
	}
	

	loadDiagram = (obj, callback) => {
		this.initTopologyCanvas(obj, () => {
			this.topologyData.children.forEach((item) => {
				if ("dj/c/cgni01/infra" === item.id) {
					let cell = this.createCell(item);
					this.graph.addCell(cell);
				} 
				else if("server" === item.comp_type
						|| "switch_port" === item.comp_type
						|| "server-role" === item.comp_type
						|| "app-containers-status" === item.comp_type) {
					let cell = this.createCell(item, 1);

					let nicRegexp = "^(".concat(item.id, ")(\\/)(\\w+)$");
					let childRegexp = "^(".concat(item.id, ")(\\/)([\\w|\\_]+)$");
					this.topologyData.children.forEach((child) => {
						if("server_nic" === child.comp_type && child.id.match(nicRegexp)
						|| "server_back_imag" === child.comp_type) {
							let serverChild = this.createCell(child);
							this.graph.addCell(serverChild, cell);
						} 
						else if(("svr_stat_rect" === child.comp_type
							|| "host_stat_label" === child.comp_type
							|| "host_cpu_stat" === child.comp_type
							|| "host_mem_stat" === child.comp_type
							|| "host_disk_stat" === child.comp_type
							|| "host_load_stat" === child.comp_type
							|| "host_etc_stat" === child.comp_type
							|| "vm_stat_label" === child.comp_type
							|| "vm_cpu_stat" === child.comp_type
							|| "vm_mem_stat" === child.comp_type
							|| "vm_disk_stat" === child.comp_type
							|| "vm_load_stat" === child.comp_type
							|| "vm_process_stat" === child.comp_type) && child.id.match(childRegexp)
							|| "server_back_imag" === child.comp_type) {
							let serverChild = this.createCell(child);
							this.graph.addCell(serverChild, cell);
						}
					});

					this.graph.addCell(cell);
				}
				else if("switch" === item.comp_type
						|| "server-pod" === item.comp_type
						|| "platform-status" === item.comp_type
						|| "vswitch-status" === item.comp_type
						|| "system-status" === item.comp_type
						|| "server-nic" === item.comp_type) {
					let cell = this.createCell(item);
					
					let portRegexp = "^(".concat(item.id, ")(\\/)([\\w|\\:]+)$");
					
					let portThis = this;
					
					this.topologyData.children.forEach((port) => {
						if ("server_back_image" === port.comp_type){
							console.log(`port.id = ${port.id}`);
							/** 대전 환경에서는 다음과 같이 해야 한다. */
							if ("dj/c/cgni01/c/rack01/30/bm/nova0100/image" === port.id
								|| "dj/c/cgni01/c/rack01/30/bm/nova0100/image" === port.id
								|| "dj/c/cgni01/c/rack01/28/bm/nova0101/image" === port.id
								|| "dj/c/cgni01/c/rack01/26/bm/nova0102/image" === port.id
								|| "dj/c/cgni01/c/rack01/24/bm/nova0103/image" === port.id
								|| "dj/c/cgni01/c/rack01/10/bm/nova1010/image" === port.id
								|| "dj/c/cgni01/c/rack01/09/bm/nova0909/image" === port.id){
							/* 우면동 버전일 때는 다음과 같이 해야 한다.
							if ("wm/c/cgni01/c/rack01/30/bm/nova0100/image" === port.id
							 || "wm/c/cgni01/c/rack01/30/bm/nova0100/image" === port.id
							 || "wm/c/cgni01/c/rack01/28/bm/nova0101/image" === port.id
							 || "wm/c/cgni01/c/rack01/26/bm/nova0102/image" === port.id
							 || "wm/c/cgni01/c/rack01/24/bm/nova0103/image" === port.id
							 || "wm/c/cgni01/c/rack01/10/bm/nova1010/image" === port.id
							 || "wm/c/cgni01/c/rack01/09/bm/nova0909/image" === port.id){
							*/
								var parent = this.graph.getDefaultParent();

								var style = new Object();
								style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
								style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
								style[mxConstants.STYLE_IMAGE] = 'images/5gmec_device.jpg';
								this.graph.getStylesheet().putCellStyle(port.id, style);
								
								try {
									this.graph.insertVertex(
										parent, null, '', 
										port.location.gridX, port.location.gridY, port.size.gridWidth, port.size.gridHeight+15, 
										port.id);
								} finally {
									// Updates the display
									// this.graph.getModel().endUpdate();
								}
							}
						}
					});

					this.graph.addCell(cell);
				}
			})

			this.createEdges()
			this.updateVertexGeometry(this.graph.getChildCells(this.graph.getDefaultParent(), true, false))
			this.drawTopology()
			
			// Highlights
			new mxCellTracker(this.graph);

			callback(this.graph, this.topologyData)
		});
	};

	loadServiceTopology(obj, callback) {
		// 서버 호출 시는 아래 두줄 주석처리
		// const uri = `/metadata/${obj.opt.project}.json`
		// fetch(uri).then(response => response.json()).then(obj => {
			this.initTopologyCanvas(obj, () => {
				this.topologyData.children.forEach((item) => {
					if("dj/c/cgni01/cctv" === item.id) {
						let cell = this.createCell(item);
						this.graph.addCell(cell);
					}
					else if("server" === item.comp_type
					      || "switch" === item.comp_type
					      || "switch_port" === item.comp_type
						  ||  "host_port" === item.comp_type
					      || "host_bond" === item.comp_type
					      || "ovs_dn_port" === item.comp_type
					      || "host_sw" === item.comp_type
					      || "ovs_up_port" === item.comp_type
					      || "host_pod_nic" === item.comp_type
					      || "host_pod" === item.comp_type
						  || "host_pod_status" === item.comp_type
						  || "service" === item.comp_type
						  || "sriov" === item.comp_type
						  || "host_stat_label" === item.comp_type
						  || "host_cpu_stat" === item.comp_type
						  || "host_mem_stat" === item.comp_type
						  || "host_disk_stat" === item.comp_type
						  || "host_load_stat" === item.comp_type
						  || "host_etc_stat" === item.comp_type
						  || "vm_stat_label" === item.comp_type
						  || "vm_cpu_stat" === item.comp_type
						  || "vm_mem_stat" === item.comp_type
						  || "vm_disk_stat" === item.comp_type
						  || "vm_load_stat" === item.comp_type
						  || "vm_process_stat" === item.comp_type
						  ||  "host_port" === item.comp_type
						  || "host" === item.comp_type) {
						let cell = this.createCell(item, 1);
						this.graph.addCell(cell);
					}
				});

				this.createEdges();
				this.updateVertexGeometry(this.graph.getChildCells(this.graph.getDefaultParent(), true, false));

				// Highlights
				new mxCellTracker(this.graph);

				callback(this.graph, this.topologyData)
			});
		// })
	};

	drawServiceTopology = (thisObj, xmlString) => {

		let _datasets = {
			labels: ["MEM", "CPU", "DISK"],
			datasets: [{
				data: [20, 40, 60],
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
				data: [80, 60, 40],
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
		}
		
		thisObj.host_pod_status = {}
		thisObj.host_pod_status['text'] = []
		this.topologyData.children.forEach(obj => {
			if (obj.comp_type === 'host_pod_status') {
				thisObj.host_pod_status[obj.id] = {}
				thisObj.host_pod_status[obj.id]['dataset'] = _datasets
				
				const texts = obj.id.split('/')
                thisObj.host_pod_status['text'].push(texts[texts.length-2])
			}
		})
		
		var graphConvertValueToString = this.graph.convertValueToString;
		this.graph.convertValueToString = function(cell) {
			if (thisObj.host_pod_status.hasOwnProperty(cell.id)) {
				var node = document.createElement('canvas');
				document.body.appendChild(node)
				var ctx = node.getContext("2d")

				thisObj.host_pod_status[cell.id]['chart'] = new Chart(ctx, {
					type: 'bar',
					data: thisObj.host_pod_status[cell.id]['dataset'],
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
				
				node.style.width = `${cell.geometry.width + 36}px`
				node.style.height = `${cell.geometry.height + 36}px`
				
				return node;
			}
			
			// 여기 없어도 되는거 같당...
			return graphConvertValueToString.apply(this, arguments);
		}

		let xml;
		if(xmlString === null || typeof xmlString === "undefined") {
			xml = new XMLSerializer().serializeToString(this.encoder.encode(this.graph.model));
		} 
		else {
			xml = xmlString;
		}

		let xmlDocument = mxUtils.parseXml(xml);
		if(xmlDocument.documentElement !== null && xmlDocument.documentElement.nodeName === "mxGraphModel") {
			let decoder = new mxCodec(xmlDocument);
			let node = xmlDocument.documentElement;

			this.graph.model.beginUpdate();
			try {
				decoder.decode(node, this.graph.model);
			} finally {
				this.graph.model.endUpdate();
			}
		}
	};
}

export default SdmvToMxgraph