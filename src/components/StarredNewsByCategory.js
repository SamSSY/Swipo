import React from 'react';
import { render } from 'react-dom';
import RaisedButton from 'material-ui/lib/raised-button';
import io from 'socket.io-client';
import './main.scss';


export default class StarredNewsByCategory extends React.Component{
	
    constructor(props){
        super(props);
        this.state = {
            socket: io.connect()
        }
    }

    componentDidMount(){
        const { socket } = this.state;
        socket.emit('init', "from category");
        socket.on('test', function(){
            console.log("in category");
        });
    }

    render(){	
        let styles = {
            height: "100%",
            backgroundColor: "grey",
            margin: "0px",
            textAlign: "center",
            color: "white",
        };
        let titleStyle = {
            margin: "0px",
            fontSize: "190px",
            fontWeight: "200",
            lineHeight: "360px",
            fontFamily: 'Shadows Into Light'
        };
        let descriptStyle = {
            lineHeight: "0px",
            display: "block",
            height: "30px"
        }

        return(
            <div style={styles}>
                <h1 style={titleStyle}>Swipo</h1>
                <span style={descriptStyle}>Brand new world in a swipe.</span>
                <RaisedButton label="Swipo!" secondary={true} />
            </div>
        );
	}
}