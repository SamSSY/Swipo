import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, IndexLink, browserHistory } from 'react-router';
import RaisedButton from 'material-ui/lib/raised-button';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './main.scss';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();
const history = createBrowserHistory();

export default class Homepage extends React.Component{
	
    constructor(props){
        super(props);
        this.state = {
            isMobile: false
        }
    }

    componentDidMount(){
        console.log("componentDidMount: Homepage");
        $(window).resize(() => {
            var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
            if(width < 1000){
                this.setState({ isMobile: true});
            }
            else{
                this.setState({ isMobile: false});
            }
            console.log(width, this.state.isMobile);
        });
        var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        if(width < 1000){
            this.setState({ isMobile: true });
            $.event.trigger('mobileHomepage');
        }
    }

    render(){

        let { isMobile } = this.state;

		let styles = {
            height: isMobile ? '100%' : '80%',
            backgroundColor: "#00bcd4",
            margin: "0px",
            textAlign: "center",
            color: "white",
            paddingTop: isMobile ? '10%' : '10%'
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
                {isMobile ? (<RaisedButton containerElement={<Link to="/swipe" activeClassName="active" /> }
                    linkButton={true} label="Swipo!" secondary={true} >
                </RaisedButton>): null}
            </div>
        );
	}
}