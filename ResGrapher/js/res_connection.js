$(function () {

    function handleResData(evt) {
        let resNodes=[];
        let resValues=[];
    
        let files = evt.target.files; // FileList object
        for (let i = 0, f; f = files[i]; i++) {
    
            // Only process ascii files.
            //if (!f.type.match('txt.*')) {
            //    continue;
            //}
    
            let reader = new FileReader();
            // Read in the netlist
            reader.readAsText(f);
    
            reader.onerror = (() => {
                alert("File open error!");
                return;
            });

            // Closure to capture the file information.
            reader.onload = ((theFile) => {
                return (e) => {
                    let resList = [];
                    let filetext = e.target.result.split("\n");
                    for(let data of filetext){
                        if(data.startsWith('R') && data.length) {
                            data = data.split(' ');
                            const [resNode1, resNode2, resValue] = data;
                            if(resNode1 == "" || resNode2 == "" || resValue == "") {
                                alert("Syntax error!")
                                return;
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
                                            value:  resValue,
                                        });
                        }
                    }
                };
            })(f);
    
        }
        drawResGraph(resNodes, resValues);
    }
    
    document.getElementById('files').addEventListener('change', handleResData, false);

    
    let myChart = echarts.init(document.getElementById('main'));

    function drawResGraph(resNodes, resValues) {
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
                    data: resNodes,
                    links: resValues,
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

});
