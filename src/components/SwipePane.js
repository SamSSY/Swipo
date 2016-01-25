import React from 'react';
import { render } from 'react-dom';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import FlatButton from 'material-ui/lib/flat-button';
import CardText from 'material-ui/lib/card/card-text';
import io from 'socket.io-client';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './main.scss';

injectTapEventPlugin();

export default class SwipePane extends React.Component{

    constructor(props){
        super(props);
        this.state= {
            socket: io.connect(),
            datas: [],
            index: 0

        }
    }

    componentWillMount(){
        console.log("componentWillMount: SwipePane");
    }

    componentDidMount(){
        
        $( ".pane" ).hammer().on( "swiperight", swipeRightHandler );
        $( ".pane" ).hammer().on( "swipeleft", swipeLeftHandler );
        $( ".pane" ).hammer().on( "tap", tapHandler );

        function swipeRightHandler( event ){       
            $(this).animate({
                right: '-3000px',
             }, 200, function(){
                updateIndex(1);
                $(this).css("right", "0");
             });
        }

        function swipeLeftHandler( event ){
            $(this).animate({
                right: '3000px'
             }, 200, function(){
                updateIndex(1);
                $(this).css("right", "0");
             });
        }

        function tapHandler(){
            console.log("tapped!");
            console.log($(".pane" ).css("left"));
        }

        const { socket } = this.state; 
        socket.on('returnNewSwipe', function(datas){
            console.log("new swipe data: ");
            console.log(datas)
            this.setState({datas: datas});
        });

    }

    startSwiping(){
        const { socket } = this.state; 
        socket.emit('init', {
            user: window.user,
            location: 'SwipePane',
        });
    }

    getNewSwipeData(){
        const { socket } = this.state; 
        socket.emit('getNewSwipe', {
            user: window.user
        });
    }

    render(){
        return(
            <div className="pane" style={{height: "85%", top:'80px', margin: "0% 1% 0% 1%"}} >
                <Card initiallyExpanded={true} style={{height: "100%"}} >
                    <CardHeader
                      title="Without Avatar"
                      subtitle="Subtitle"
                      actAsExpander={true}
                      showExpandableButton={false} />
                    <CardText expandable={false}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
                      Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
                      Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
                    </CardText>
                    <CardText expandable={false}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
                      Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
                      Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
                    </CardText>
                </Card>
            </div>
        );
	}
}
