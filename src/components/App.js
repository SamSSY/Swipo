import React from 'react';
import { render } from 'react-dom';
import { Router, Route, Link, IndexLink, browserHistory } from 'react-router';

import SwipePane from './SwipePane';
import AppLeftNav from './AppLeftNav';
// material-ui
import RaisedButton from 'material-ui/lib/raised-button';
import Dialog from 'material-ui/lib/dialog';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import LightRawTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme';
import Colors from 'material-ui/lib/styles/colors';
import AppBar from 'material-ui/lib/app-bar';
import LeftNav from 'material-ui/lib/left-nav';
import IconButton from 'material-ui/lib/icon-button';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import FontIcon from 'material-ui/lib/font-icon';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';
import Snackbar from 'material-ui/lib/snackbar';
import Avatar from'material-ui/lib/avatar';
import injectTapEventPlugin from 'react-tap-event-plugin';

import './main.scss';

import io from 'socket.io-client';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

const initialState = {
    muiTheme: ThemeManager.getMuiTheme(LightRawTheme),
    currentIndex : 0,
    isMobile : false,
    isLeftNavOpen: false,
    isLogin: false,
    propValue : null,
    username : null,
    userID: null,
    autoHideDuration: 1000,
    userProfilePicUrl: null,
    isLoginDialogOpen : false,
    isSwiping: false,
    socket: io.connect()
}

class MainBody extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = initialState;
    }
    
    getChildContext() {
        return {
          muiTheme: this.state.muiTheme,
        };
    }

    componentDidMount(){

        window.user = null;
        //appID: 882849945170096
        window.fbAyncInit = function(){

            FB.init({
                version    : 'v2.5', // use version 2.5
                appId      : 887332791388478,
                cookie     : true,  // enable cookies to allow the server to access the session 1057383754306127/ 1521012484886298
                xfbml      : true  // parse social plugins on this page
            });    
                
            console.log('init');

            FB.getLoginStatus(function(response) {
                console.log("first check");
                this.statusChangeCallback(response);
            }.bind(this));

            FB.Event.subscribe('auth.login', function(r) {
                console.log(r.status);
                    if ( r.status === 'connected' ){
                        // a user has logged in
                        console.log("login! ");
                        this.checkLoginState();
                    }
                }.bind(this)
            );
        }.bind(this);


        // Load the SDK asynchronously
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js#version=v2.5&appId=887332791388478&cookie=1&xfbml=1";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

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
            this.setState({ isMobile: true});
        }

        const { socket } = this.state;
        // socket events
        socket.on('test', function(){
            console.log("in App");
        });

        // other events
        // not working now
        $(document).on('switchToNewsByCategory', function(){
            //console.log("XDDDD");
            //console.log(this.state.userID);
            //$.event.trigger('userID');
        }.bind(this));
    }

    componentWillMount() {
        let newMuiTheme = ThemeManager.modifyRawThemePalette(this.state.muiTheme, {
            accent1Color: Colors.deepOrange500,
        });
        this.setState({muiTheme: newMuiTheme});
    }

    testAPI() {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
            console.log(response);
            console.log('Successful login for: ' + response.name + " id: " + response.id);
            this.setState({username: response.name, userID: response.id});
            this._getUserProfilePic();
            this.setState({isLogin: true});
            this.state.socket.emit('init', {
                user: this.state.userID,
                location: 'main'
            });
            window.user = this.state.userID;
        }.bind(this));
    }

    // This is called with the results from from FB.getLoginStatus().
    statusChangeCallback(response) {
        console.log('statusChangeCallback');
        console.log(response);
        // The response object is returned with a status field that lets the
        // app know the current login status of the person.
        // Full docs on the response object can be found in the documentation
        // for FB.getLoginStatus().
        if (response.status === 'connected') {
            // Logged into your app and Facebook.
            this.testAPI();
            this.setState({isLoginDialogOpen: false});
            this._getUserProfilePic();
        } 
        else if (response.status === 'not_authorized') {
            console.log("user not authorized.");
        } 
        else {
            // The person is not logged into Facebook, so we're not sure if
            // they are logged into this app or not.
            console.log("something wrong. ");
        }
    }

    checkLoginState(){
      console.log("checkLoginState.");
      FB.getLoginStatus(function(response) {
        this.statusChangeCallback(response);
      }.bind(this));
    }

    handleFBLoginButtonClick() {
        FB.login(this.checkLoginState());
    }

    _handleLoginEnterKeyDown(){
        let username = this.refs.userNameInput.getValue();
        this.setState({username: username});
        console.log(this.state.username);
        //TODO: define callback function
    }

    _userLoginCheck(){
        if( this.state.username == null){
            this.refs.UserLoginAlert.show();
            return false;
        } 
        else return true;
    }

    _getUserProfilePic(){
        console.log("getUserProfilePic");
        let queryStr = `/${this.state.userID}/picture?type=large&redirect=true&width=250&height=250`;
        console.log(queryStr);
        // API call
        FB.api(queryStr, function (response) {
              if (response && !response.error) {
                    console.log(response);
                    this.setState({userProfilePicUrl: response.data.url});
              }
            }.bind(this)
        );
    }

    renderUserLoginAlertSnackBar () {
        console.log("renderUserLoginAlertSnackBar");
        if(this.state.messages.length > 0) setTimeout(this._updateScroll, 500); 
        return(
            <Snackbar
              message="Please login first."
              ref="UserLoginAlert"
              autoHideDuration={this.state.autoHideDuration}
              onActionTouchTap={this._handleAction}/>
        );
    }

    renderSingleSwipePane(content){
        return(
            <SwipePane 
                paneContent={this.state.currentIndex} 
                paneIndex={this.state.currentIndex} 
                updateIndex = {this.updateIndex.bind(this)} />
        );
    }

    renderMobileSwipePanes(){
        let { isSwiping } = this.state;
        return isSwiping ? (                
            <div className='swipePanes' style={{height: "100%" }} > 
                {this.renderSingleSwipePane()}
            </div>
        ) : null ;
    }

    renderAppBar(){
        let { isLeftNavOpen } = this.state;
        return this.state.isMobile ? null: (
            <AppBar title="Swipo" 
                    style={{boxShadow: "0px", position: 'fixed'}}
                    iconClassNameRight="fa fa-facebook fa-2x" 
                    onLeftIconButtonTouchTap={() => this.setState({isLeftNavOpen: !isLeftNavOpen })} 
                    onRightIconButtonTouchTap={ () => { 
                        this.setState({isLoginDialogOpen: true});
                    }} />
        );
    }

    handleLeftNavRequestChange(open){
        this.setState({isLeftNavOpen: open});
    }

    handleRequestChangeList(event, value) {
        console.log(value);
        if(value.indexOf("today") !== -1){
            var today = new Date();
            value = "/starred-news/view-by-date/" + today.getFullYear() + 
                    ((today.getMonth() + 1) < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1)) + today.getDate();
        }
        this.props.history.push(value);
        this.setState({
            isLeftNavOpen: false,
        });
    }

    renderLeftNav(){
        const iconStyles = {
            marginRight: 24,
        };
        const { history, location, children } = this.props;
        return(
            <AppLeftNav 
                    history={history} 
                    location={location} 
                    docked={false} 
                    width={300} 
                    open={this.state.isLeftNavOpen} 
                    onRequestChange={this.handleLeftNavRequestChange.bind(this)}
                    onRequestChangeList={this.handleRequestChangeList.bind(this)} 
                    iconStyles={iconStyles} />
        );
    }

    renderFooter(){
        return(
            <div className="footer">
                <small>&copy;2015 Sam Su, Ray Chang, David Hu, Michael Hsiang</small>
            </div>
        );
    }

    updateIndex(indexUpdate){
        let index = this.state.currentIndex + indexUpdate;
        this.setState({currentIndex: index});
    }

    renderLoginDialog(actions){
        return(         
            <Dialog
                title="User Login"
                actions={actions} 
                modal={false}  
                open={this.state.isLoginDialogOpen} 
                onRequestClose={this.handleLoginDialogClose.bind(this)} >
                <RaisedButton label="Login with Facebook" style={{'marginTop': '15px'}} secondary={true} onTouchTap={this.handleFBLoginButtonClick.bind(this)} />
            </Dialog>
        );
    }

    renderUserInfo(actions){
        const divStyle = { display: "inline-block",
                             verticalAlign: "top", 
                             fontSize: "30px", 
                             lineHeight: "150px",
                             marginLeft: "50px"
                         };
        return(
            <Dialog
                title="User Info"
                actions={actions} 
                modal={false}
                open={this.state.isLoginDialogOpen}
                onRequestClose={this.handleLoginDialogClose.bind(this)} >
                <Avatar size={250} src={this.state.userProfilePicUrl} />
                <div style={divStyle}>
                    {this.state.username}
                </div>
            </Dialog>
        );
    }

    handleLoginDialogClose(){
        this.setState({isLoginDialogOpen: false});
    }

    render() {
        const fullHeight = {height: "100%" };
        const displayNone = {display: 'none'};
        var {isMobile, isLogin, isSwiping } = this.state;
        var appBarStyle = {};

        const actions =[
            <FlatButton
                label="Cancel"
                secondary={true}
                onTouchTap={this.handleLoginDialogClose.bind(this)} />,
        ];

        return (
            <div style={fullHeight}>
                { this.renderAppBar() }
                { this.renderLeftNav() }
                { isMobile? this.renderMobileSwipePanes(): null }
                { isLogin? this.renderUserInfo(actions): this.renderLoginDialog(actions)}
                {this.props.children}
                { isSwiping? null: this.renderFooter() }
            </div>
        );
    }
}

MainBody.childContextTypes = {
    muiTheme: React.PropTypes.object,
}

module.exports = MainBody;
