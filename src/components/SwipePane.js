import CardTitle from 'material-ui/lib/card/card-title';
import React from 'react';
import { render } from 'react-dom';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardMedia from 'material-ui/lib/card/card-media';
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
            metaDatas: [{title: "test", url:"123", source:"123"}],
            contentDatas: [{content: "211231321321321",images:[{url:"123", description:"123"}]}],
            currentIndex: 0
        }
    }

    componentWillMount(){
        console.log("componentWillMount: SwipePane");
    }

    componentDidMount(){
        
        $( ".pane" ).hammer().on( "swiperight", swipeRightHandler );
        $( ".pane" ).hammer().on( "swipeleft", swipeLeftHandler );
        $( ".pane" ).hammer().on( "tap",function(){
             console.log("tapped!");
            console.log($(".pane" ).css("left"));
            $(this).animate({
                right: '3000px'
             }, 200, function(){
                $(this).css("right", "0");
             });
            this.likeThePost();
        });

        function swipeRightHandler( event ){       
            $(this).animate({
                right: '-3000px',
             }, 200, function(){
                $(this).css("right", "0");
             });
            this.dislikeThePost();
        }

        function swipeLeftHandler( event ){
            $(this).animate({
                right: '3000px'
             }, 200, function(){
                $(this).css("right", "0");
             });
            this.likeThePost();
        }

       function tapHandler() {
            console.log("tapped!");
            console.log($(".pane" ).css("left"));
            $(this).animate({
                right: '3000px'
             }, 200, function(){
                $(this).css("right", "0");
             });
            this.likeThePost();
        };

        const { socket } = this.state; 
        socket.on('returnNewMetaData', (newDatas) => {
            console.log("new swipe metadata: ");
            console.log(newDatas)
            let { metaDatas } = this.state;
            this.setState({metaDatas: metaDatas.concat(newDatas)});
        });
        socket.on('returnNewContentData', (newDatas) => {
            console.log("new swipe contentdata: ");
            console.log(newDatas)
            let { contentDatas } = this.state;
            this.setState({contentDatas: contentDatas.concat(newDatas) });
        });
        this.startSwiping();
    }

    likeThePost(){
        const { socket, currentIndex, metaDatas } = this.state; 
        socket.emit('likeThePost', {
            user: window.user,
            post: metaDatas[currentIndex].id
        });
        this.checkNumberOfPosts();
        this.setState({currentIndex: currentIndex + 1});
    }

    dislikeThePost(){
        const { socket, currentIndex, metaDatas } = this.state; 
        socket.emit('dislikeThePost', {
            user: window.user,
            post: metaDatas[currentIndex].id
        });
        this.checkNumberOfPosts();
        this.setState({currentIndex: currentIndex + 1});
    }
    
    checkNumberOfPosts(){
        const { metaDatas } = this.state;
        if( metaDatas.length < 3){
            this.getNewSwipeData();
        }
    }

    startSwiping(){
        const { socket } = this.state; 
        socket.emit('init', {
            user: window.user,
            location: 'SwipePane',
        });
        this.getNewSwipeData();
    }

    getNewSwipeData(){
        const { socket } = this.state; 
        socket.emit('getNewSwipe', {
            user: window.user
        });
    }

    render(){
        let { metaDatas, contentDatas, currentIndex } = this.state;

        console.log("!!!!!!", metaDatas);
        var metaData = null;
        var contentData = null;
        if( metaDatas.length >  0){
            metaData = metaDatas.pop();
            contentData = contentDatas.pop();
        }
        return  (
            <div className="pane" style={{height: "85%", top:'80px', margin: "0% 1% 0% 1%"}} >
                <Card initiallyExpanded={true} style={{height: "100%"}} >
                    <CardHeader
                      title= { metaData.title }
                      subtitle= { metaData.source }
                      actAsExpander={true}
                      showExpandableButton={false} />
                    <CardText expandable={false}>
                     {contentData.content}                      
                    </CardText>
                    <CardMedia overlay={<CardTitle title={contentData.images[0].description} subtitle="Subtitle"/>}>
                        <img src={contentData.images[0].url} />
                    </CardMedia>
                        <CardActions expandable={false}>
                            <FlatButton label="view source" linkButton={true} href={metaData.url} secondary={true}/>
                        </CardActions>
                </Card>
            </div>
        );
	}
}
