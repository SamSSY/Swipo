import React from 'react';
import { render } from 'react-dom';

import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardMedia from 'material-ui/lib/card/card-media';
import FlatButton from 'material-ui/lib/flat-button';
import CardText from 'material-ui/lib/card/card-text';

import Highcharts from 'highcharts';
import Highcharts3d from 'highcharts-3d';
import addFunnel from 'highcharts/modules/funnel';
import ReactHighcharts from 'react-highcharts/dist/bundle/highcharts';

import io from 'socket.io-client';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './main.scss';

injectTapEventPlugin();

export default class DashBoard extends React.Component{

    constructor(props){
        super(props);
        this.state= {
            socket: io.connect(),
            datas: []
        }
    }

    componentWillMount(){
        console.log("componentWillMount: DashBoard");
    }

    componentDidMount(){
        const { socket } = this.state; 
        socket.on('returnNewDashboardData', function(newDatas){
            console.log("New Dashboard data: ");
            console.log(newDatas)
            let { datas } = this.state;
            this.setState({datas: newDatas});
        });
        this.initDashboard();
    }

    initDashboard(){
        const { socket } = this.state; 
        socket.emit('init', {
            user: window.user,
            location: 'Dashboard',
        });
        this.getNewDashboardData();
        // Apply funnel after window is present
        addFunnel(Highcharts);

        let chart = this.refs.chart.getChart();
        //chart.series[0].addPoint({x: 10, y: 12});
    }

    getNewDashboardData(){
        const { socket } = this.state; 
        socket.emit('getNewDashboardData', {
            user: window.user
        });
    }

    renderDashboard(){
        
    }

    render(){
        let { datas } = this.state;
        let config = {
            title: {
                text: 'Monthly Average Usage',
                x: -20 //center
            },
            subtitle: {
                text: 'of Swipo',
                x: -20
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: {
                title: {
                    text: 'posts'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: ''
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: 'Sam',
                data: [70, 69, 95, 145, 82, 15, 25, 25, 23, 15, 39, 96]
            }, {
                name: 'Michael',
                data: [22, 80, 57, 13, 17, 22, 24, 24, 20, 41, 86, 25]
            }, {
                name: 'David',
                data: [90, 60, 35, 84, 35, 70, 86, 79, 43, 90, 39, 10]
            }, {
                name: 'Ray',
                data: [39, 42, 57, 85, 19, 52, 70, 66, 42, 103, 66, 49]
            }]
        };

        return(
            <div style={{height: "85%", paddingTop: '100px', margin: "0" }} >
                <div className="container" style={{height: "100%"}}>
                    <ReactHighcharts config={config} ref="chart"></ReactHighcharts>
                </div>
            </div>
        );
  }
}
