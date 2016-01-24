import React from 'react';
import { render } from 'react-dom';
import RaisedButton from 'material-ui/lib/raised-button';

require('./main.scss');

export default class Homepage extends React.Component{
	render(){
		let styles = {
            height: "80%",
            backgroundColor: "#00bcd4",
            margin: "0px",
            textAlign: "center",
            color: "white",
            paddingTop: '13%'
        };
        let titleStyle = {
            margin: "0px",
            fontSize: "190px",
            fontWeight: "200",
            //lineHeight: "360px",
            //verticalAlign: 'middle',
            //top: '50%',
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