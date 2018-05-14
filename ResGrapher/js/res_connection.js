$(function () {
    let myChart = echarts.init(document.getElementById('main'));
    drawResGraph();
    document.getElementById('files').addEventListener('change', handleResData, false);

    function handleResData(evt) {
        let resNodes=[];
        let resValues=[];
        let file = evt.target.files[0]; // FileList object
    
        // Only process ascii files.
        //if (!f.type.match('txt.*')) {
        //    continue;
        //}
    
        let uploadFile = ((file) => {
            return new Promise(function(resolve, reject) {
                let reader = new FileReader();
                // Read in the netlist
                reader.readAsText(file);
                reader.onerror = (() => {
                    alert("File open error!");
                    reject("File open error!");
                    return;
                });
                reader.onload = function() {
                    myChart.showLoading({
                        text : 'loading netlist file...',
                        effect: 'whirling'
                    });
                    resolve(this.result)
                }
            })
        });
        uploadFile(file).then(function(result){
            let resList = [];
            let realData = [];
            let filetext = result.split("\n");
            let netFlag = false;
            if($.trim($("#netName").val()) != "") {
                for(let data of filetext){
                    if(data.startsWith('*|NET ' + $.trim($("#netName").val()) + " ")) {
                        netFlag = true;
                        realData.push(data);
                    }
                    else if(data.startsWith('R') && netFlag) {
                        realData.push(data);
                    }
                    else if(data.startsWith('*|NET ') && netFlag) {
                        break;
                    }
                }
            }
            else {
                alert("Please input the net name!");
            }
            for(let data of realData){
                if(data.startsWith('R') && data.length) {
                    //alert("data= " + data);
                    data = data.split(' ');
                    const [resName, resNode1, resNode2, resValue, tmpResValue] = data;
                    let realResValue = resValue;
                    if(resNode1 == "" || resNode2 == "" || resValue == "") {
                        alert("Syntax error!")
                        return;
                    }
                    else if(resValue == "resStar") {
                        if(tmpResValue == "" || !tmpResValue.startsWith("R=")) {
                            alert("Syntax error!")
                            return;
                        }
                        else {
                            realResValue = tmpResValue.substring(2);
                        }
                    }
                    
                    let [index1, index2] = [resNode1, resNode2].map(x => resList.indexOf(x));
                    if(index1 == -1) {
                        resList.push(resNode1);
                        index1 = resList.length - 1;
                        resNodes.push({
                                        name: resNode1,
                                        category: 1,
                                        draggable: true,
                                    });
                        //alert("index1 = " + index1);
                    }
                    if(index2 == -1) {
                        resList.push(resNode2);
                        index2 = resList.length - 1;
                        resNodes.push({
                                        name: resNode2,
                                        category: 1,
                                        draggable: true,
                                    });
                        //alert("index2 = " + index2);
                    }
                    resValues.push({
                                    source: index1,
                                    target: index2,
                                    value:  realResValue,
                                });
                }
            }
            updateResGraph(resNodes, resValues);
            myChart.hideLoading();
        });
    };

    function drawResGraph(resNodes, resValues) {
        //alert(resNodes);
        //alert(resValues);
        let option = {
            title: {
                text: 'Res connections Graph'
            },
            tooltip: {},
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        fontSize: 12
                    },
                }
            },
            edgeLabel: {
                normal : {
                    show : true,
                    textStyle: {
                        fontSize: 12
                    },
                },
            },
            legend: {
                x: "center",
                show: false,
                data: ["resNode1", "resNode2", "resValue"]
            },
            series: [

                {
                    type: 'graph',
                    layout: 'force',
                    symbolSize: 45,
                    focusNodeAdjacency: true,
                    roam: true,
                    categories: [{
                        name: 'resNode1',
                        itemStyle: {
                            normal: {
                                color: "#009800",
                            }
                        }
                    }, {
                        name: 'resNode2',
                        itemStyle: {
                            normal: {
                                color: "#4592FF",
                            }
                        }
                    }, {
                        name: 'resValue',
                        itemStyle: {
                            normal: {
                                color: "#3592F",
                            }
                        }
                    }],
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 12
                            },
                        }
                    },
                    force: {
                        repulsion: 1000,
                        //edgeLength: 100,
                        layoutAnimation: true
                    },
                    edgeSymbolSize: [4, 50],
                    edgeLabel: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 10
                            },
                            formatter: "{c}"
                        }
                    },
                    data: [],
                    links: [],
                    lineStyle: {
                        normal: {
                            color: 'rgba(205,50,155,1)',
                            opacity: 1,
                            width: 3,
                            curveness: 0
                        }
                    }
                }
            ],
        };
        myChart.setOption(option);
    };

    function updateResGraph(resNodes, resValues) {
        myChart.setOption({
            series: [{ 
                data: resNodes,
                links: resValues  
            }] 
        });
    };

});
