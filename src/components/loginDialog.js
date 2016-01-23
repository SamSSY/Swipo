const React = require('react');
const { render } = require('react-dom');
const Dialog = require('material-ui/lib/dialog');
const RaisedButton = require('material-ui/lib/raised-button');
const TextField = require('material-ui/lib/text-field');
require('../main.scss');


export default class LoginDialog extends React.Component{
	render(){
		return(
			<Dialog
				title="User Login"
				actions={standardActions}
				ref="loginDialog" >
				<TextField hintText="Your name" ref="userNameInput" onEnterKeyDown = {this._handleLoginEnterKeyDown.bind(this)}/>
				<p>Or</p>
				<RaisedButton label="Login with Facebook" style={{'marginTop': '15px'}} secondary={true} onTouchTap={this.handleFBLoginButtonClick.bind(this)} />
			</Dialog>
		);
	}
}

