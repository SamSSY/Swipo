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
                chart: {
                    type: 'pie',
                    options3d: {
                        enabled: true,
                        alpha: 45
                    }
                },
                title: {
                    text: 'Contents of Highsoft\'s weekly fruit delivery'
                },
                subtitle: {
                    text: '3D donut in Highcharts'
                },
                plotOptions: {
                    pie: {
                        innerSize: 100,
                        depth: 45
                    }
                },
                series: [{
                    name: 'Delivered amount',
                    data: [
                        ['Bananas', 8],
                        ['Kiwi', 3],
                        ['Mixed nuts', 1],
                        ['Oranges', 6],
                        ['Apples', 8],
                        ['Pears', 4],
                        ['Clementines', 4],
                        ['Reddish (bag)', 1],
                        ['Grapes (bunch)', 1]
                    ]
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
