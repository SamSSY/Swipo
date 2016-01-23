const React = require('react');
const { render } = require('react-dom');

import { Router, Route, Link, browserHistory } from 'react-router';
import SwipePane from './component/SwipePane';

require('./main.scss');
// material-ui
const RaisedButton = require('material-ui/lib/raised-button');
const Dialog = require('material-ui/lib/dialog');
const ThemeManager = require('material-ui/lib/styles/theme-manager');
const LightRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
const Colors = require('material-ui/lib/styles/colors');
const AppBar = require('material-ui/lib/app-bar');
const LeftNav = require('material-ui/lib/left-nav');
import IconButton from 'material-ui/lib/icon-button';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ActionGrade from 'material-ui/lib/svg-icons/action/grade';
import ContentInbox from 'material-ui/lib/svg-icons/content/inbox';
import ContentDrafts from 'material-ui/lib/svg-icons/content/drafts';
import ContentSend from 'material-ui/lib/svg-icons/content/send';
import FontIcon from 'material-ui/lib/font-icon';
const FlatButton = require('material-ui/lib/flat-button');
const TextField = require('material-ui/lib/text-field');
const Snackbar = require('material-ui/lib/snackbar');
const Avatar = require('material-ui/lib/avatar');
const injectTapEventPlugin = require('react-tap-event-plugin');

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
    isLoginDialogOpen : false
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
        //appID: 882849945170096
        window.fbAyncInit = function(){
            FB.init({
                appId      : 882849945170096,
                cookie     : true,  // enable cookies to allow the server to access the session 1057383754306127/ 1521012484886298
                xfbml      : true,  // parse social plugins on this page
                version    : 'v2.5' // use version 2.5
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
                        this._getUserProfilePic();
                    }
                }.bind(this)
            );
        }.bind(this);

        // Load the SDK asynchronously
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js#version=v2.5&appId=882849945170096&cookie=1&xfbml=1";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        $(window).resize(() => {
            if($(window).width() < 450){
                this.setState({ isMobile: true});
            }
            else{
                this.setState({ isMobile: false});
            }
            console.log($(window).width(), this.state.isMobile);
        });
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

        } else if (response.status === 'not_authorized') {
            console.log("user not authorized.");
        } else {
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

    renderSwipePanes(){
        return(                
            <div className='swipePanes' style={{height: "100%" }} > 
                {this.renderSingleSwipePane()}
            </div>
        );
    }

    renderAppBar(){
        let { isLeftNavOpen } = this.state;
        return (
            <AppBar title="Swipo" 
                    style={{boxShadow: "0px"}}
                    iconClassNameRight="fa fa-facebook fa-2x" 
                    onLeftIconButtonTouchTap={() => this.setState({isLeftNavOpen: !isLeftNavOpen })} 
                    onRightIconButtonTouchTap={ () => { 
                        this.setState({isLoginDialogOpen: true});
                    }} />
        );
    }

    renderHomepage(){
        let styles = {
            height: "500px",
            backgroundColor: "#00bcd4",
            lineHeight: "360px",
            margin: "0px",
            textAlign: "center",
            color: "white",
        };
        let titleStyle = {
            margin: "0px",
            fontSize: "190px",
            fontWeight: "200",
            fontFamily: //'Shadows Into Light Two'//'Covered By Your Grace'//'Architects Daughter'//'Amatic SC'
            'Shadows Into Light'
        };
        let descriptStyle = {
            lineHeight: "0px",
            display: "block"

        }
        return(
            <div style={styles}>
                <h1 style={titleStyle}>Swipo</h1>
                <span style={descriptStyle}>Brand new world in a swipe.</span>
            </div>
        );
    }

    renderLeftNav(){
        const iconStyles = {
            marginRight: 24,
        };
        return(
            <LeftNav docked={false}
                    width={300} 
                    open={this.state.isLeftNavOpen} 
                    onRequestChange={open => this.setState({isLeftNavOpen: open}) } >
                    <List subheader="Swipo">
                    <ListItem primaryText="Home" leftIcon={<FontIcon
                        className="material-icons"
                        style={iconStyles}
                        color={Colors.blue500}>home</FontIcon>} 
                    />
                    <ListItem
                            key={1}
                            primaryText="Starred News"
                            leftIcon={<ActionGrade />}
                            initiallyOpen={true}
                            primaryTogglesNestedList={true}
                            nestedItems={[
                                <ListItem
                                    key={2}
                                    primaryText="Date"
                                    leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >date_range</FontIcon>}
                                    disabled={true}
                                    nestedItems={[
                                        <ListItem key={1} primaryText="Today" 
                                            leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >schedule</FontIcon>} 
                                        />,
                                        <ListItem key={2} primaryText="This Week" 
                                            leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >schedule</FontIcon>} 
                                        />,
                                    ]}
                                />,
                                <ListItem
                                    key={3}
                                    primaryText="Category"
                                    leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >class</FontIcon>}
                                    disabled={true}
                                    nestedItems={[
                                        <ListItem key={1} primaryText="Entertainment" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                        />,
                                        <ListItem key={2} primaryText="Politics" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                        />,
                                    ]}
                                />
                            ]}
                    />
                    <ListItem primaryText="Timeline" leftIcon={<FontIcon
                        className="material-icons"
                        style={iconStyles}
                        >timeline</FontIcon>} 
                    />
                    <ListItem primaryText="Dashboard" leftIcon={<FontIcon
                        className="material-icons"
                        style={iconStyles}
                        >dashboard</FontIcon>} 
                    />
                    <ListItem primaryText="Settings" leftIcon={<FontIcon
                        className="material-icons"
                        style={iconStyles}
                        >settings</FontIcon>} 
                    />
                    </List>
            </LeftNav>
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
        var {isMobile, isLogin} = this.state;
        var appBarStyle = {};
        const actions =[
            <FlatButton
                label="Cancel"
                secondary={true}
                onTouchTap={this.handleLoginDialogClose.bind(this)} />,
        ];
        return (
            <div style={fullHeight}>
                { isMobile? null: this.renderAppBar() }
                { isMobile? null: this.renderHomepage() }
                { isMobile? null: this.renderLeftNav() }
                { isMobile? this.renderSwipePanes(): null }
                { isLogin? this.renderUserInfo(actions): this.renderLoginDialog(actions)}
                { isMobile? null: this.renderFooter() }
            </div>
        );
    }
}

MainBody.childContextTypes = {
    muiTheme: React.PropTypes.object,
}

render(<MainBody />, document.getElementById('root'));