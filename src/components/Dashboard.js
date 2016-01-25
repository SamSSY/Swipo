import React from 'react';
import { render } from 'react-dom';

import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardMedia from 'material-ui/lib/card/card-media';
import FlatButton from 'material-ui/lib/flat-button';
import CardText from 'material-ui/lib/card/card-text';

import Highcharts from 'highcharts';
import addFunnel from 'highcharts/modules/funnel';

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
        return(
            <div style={{height: "85%", paddingTop: '100px', margin: "0" }} >
                <div className="container" style={{height: "100%"}}>
                </div>
            </div>
        );
  }
}
