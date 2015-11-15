var myUser = '';
var socket = io.connect('http://localhost:3000');
socket.on('connect',function(){
	console.log('CONNECTED');
});
class ChatApp extends React.Component {
	constructor() {
		super();

		this.state = {
			data: [],
			room: 0
		};
	}

	NewMessage (msg) {
		 console.log(this.state.data[this.state.room].users);
		var newMessage = {
			message: msg,
			room: this.state.data[this.state.room].users
		};
		$.post( '/message', newMessage, function(){}, 'json');
	}

	ChangeThread (room) {
		this.setState({
			data: this.state.data,
			room: room
		});
	}

	componentDidMount() {
		$.get('/rooms', function(data) {
			this.setState({data: data});
		}.bind(this));
		socket.on('new message', function (msg) {
			var newData = this.state.data;
			newData[this.state.room].messages.unshift(msg);
			this.setState({data: newData});
		}.bind(this));
	}
	
	render() {
		var talking = '';
		var roomUsers = [];
		if(this.state.data[this.state.room]) {
			console.log(this.state.data);
			roomUsers = this.state.data[this.state.room].users;

			for (var i = 0; i < roomUsers.length; i++) {
				if ( roomUsers[i] != 'david' ) {
					talking = roomUsers[i];
					break;
				}
			};
		};
		if ( this.state.data.length > 0 )
			return (
				<div className="ChatApp">
					<div className="one-third column">
						<ThreadList data={this.state.data} onChangeThread={this.ChangeThread.bind(this)} />
					</div>
					<div className="one-third column">
						<h4>{talking}</h4>
						<TextBox onNewMessage={this.NewMessage.bind(this)}/>
						<MessageList data={this.state.data[this.state.room].messages} />
					</div>
					<div className="one-third column"></div>
				</div>
			);
		else return(<div />);
	}
}

class ThreadList extends React.Component {

	render () {
		var threads = this.props.data.map ( function (thread, i) {
				return <tr><td><ThreadItem  onClick={this.props.onChangeThread.bind(this, i)} key={i} data={thread} /></td></tr>
			}, this);
		return (
			<div className="ThreadList">
				<table>
					{threads}
				</table>

			</div>
		);
	}
}
class ThreadItem extends React.Component {
	render () {
		var users = this.props.data.users;
		var usersStr = '';
		console.log(users);
		for ( var i = 0; i < users.length; i++) {
			if (users[i] != 'david')
				usersStr += users[i] + '';
		}
				console.log(this.props.data);
		return (
			<div onClick={this.props.onClick} className="ThreadItem">
				<b>{usersStr}</b><br/>
				<span>{this.props.data.messages[0].user + ': '}</span>
				<span>{this.props.data.messages[0].message}</span>
				<span>{this.props.data.messages[0].time.toString}</span>
			</div>
		);
	}
}

class MessageList extends React.Component {
	render () {
		var messageItems = this.props.data.map ( function (message) {
			return <MessageItem data={message} />
		});
		return (
			<div className="MessageList">
				{messageItems}
			</div>
		);		
	}
}
class MessageItem extends React.Component {
	render () {

		if (this.props.data.user !== 'david') {
			return (
				<div>
				<div className="MessageItem u-pull-left">
					{this.props.data.message}
				</div><br/>
				</div>
			);
		} else {
			return (
				<div>
				<div className="MessageItem u-pull-right">
					{this.props.data.message}
				</div><br/>
				</div>
			);
		}
	}
}

class TextBox extends React.Component {
	handleNewMessage () {
		var message = React.findDOMNode(this.refs.message).value.trim();
		this.props.onNewMessage(message);
		React.findDOMNode(this.refs.message).value = '';
	}

	render () {
		return (
			<div className="TextBox">
				<input ref="message" type="text" placeholder="write message"></input>
				<button onClick={this.handleNewMessage.bind(this)}>enter</button>
			</div>

		);
	}
}

$.get('/user', function (data) {
	myUser = data.username;
	console.log(myUser);
	React.render(
		<ChatApp />,
		document.getElementById('content')
	);
});