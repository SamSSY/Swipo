import React from 'react';
import { render } from 'react-dom';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardMedia from 'material-ui/lib/card/card-media';
import CardTitle from 'material-ui/lib/card/card-title';
import FlatButton from 'material-ui/lib/flat-button';
import CardText from 'material-ui/lib/card/card-text';
import io from 'socket.io-client';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './main.scss';

injectTapEventPlugin();

const initialState = {
    socket: io.connect(),
    metaDatas: [{title: "test", url:"123", source:"123"},],
    contentDatas: [{content: "211231321321321",images:[{url:"123", description:"123"}]},],
    isLoading: true,
    isMobile: false
}

export default class SwipePane extends React.Component{

    constructor(props){
        super(props);
        this.state= initialState;
    }

    componentWillMount(){
        console.log("componentWillMount: SwipePane");
    }

    componentDidMount(){
        
        $( ".pane" ).hammer().on( "swiperight", () => {
            $('.pane').animate({
                right: '-3000px',
             }, 200, function(){
                $('.pane').css("right", "0");
             });
            this.dislikeThePost();
        });
        $( '.pane' ).hammer().on( "swipeleft", () => {
            $('.pane').animate({
                right: '3000px'
             }, 200, function(){
                $('.pane').css("right", "0");
             });
            this.likeThePost();
        });
        $( ".pane" ).hammer().on( "tap", () => {
            console.log("tapped!");
            console.log($(".pane" ).css("left"));
            $('.pane').animate({
                right: '3000px'
             }, 200, function(){
                $('.pane').css("right", "0");
             });
            this.likeThePost();
        });

        const { socket } = this.state; 
        socket.on('returnNewMetaData', (newDatas) => {
            console.log("new swipe metadata: ");
            console.log(newDatas)
            let { metaDatas } = this.state;
            this.setState({metaDatas: metaDatas.concat(newDatas), isLoading: false});
        });
        socket.on('returnNewContentData', (newDatas) => {
            console.log("new swipe contentdata: ");
            console.log(newDatas)
            let { contentDatas } = this.state;
            this.setState({contentDatas: contentDatas.concat(newDatas), isLoading: false});
        });
        this.startSwiping();

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
        }
    }

    likeThePost(){
        const { socket, currentIndex, metaDatas, contentDatas } = this.state; 
        metaDatas.pop();
        contentDatas.pop();
        //console.log("XDDDDDDD");
        //console.log(metaDatas);
        //console.log(metaDatas[metaDatas.length]);
        socket.emit('likeThePost', {
            user: window.user,
            post: metaDatas[metaDatas.length - 1].id
        });
        this.checkNumberOfPosts();
        this.setState({metaDatas: metaDatas, contentDatas: contentDatas});
        //this.setState({currentIndex: currentIndex + 1});
    }

    dislikeThePost(){
        const { socket, currentIndex, metaDatas, contentDatas } = this.state; 
        metaDatas.pop();
        contentDatas.pop();
        socket.emit('dislikeThePost', {
            user: window.user,
            post: metaDatas[metaDatas.length - 1].id
        });
        this.checkNumberOfPosts();
        this.setState({metaDatas: metaDatas, contentDatas: contentDatas});
        //this.setState({currentIndex: currentIndex + 1});
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
        console.log("getNewSwipeData called!");
        const { socket } = this.state; 
        socket.emit('getNewSwipe', {
            user: window.user
        });
    }

    render(){
        let { metaDatas, contentDatas, currentIndex, isLoading, isMobile} = this.state;
        //console.log("!!!!!!");
        //console.log(this.state);
        //console.log(metaDatas);
        var metaData = metaDatas[metaDatas.length - 1];
        var contentData = contentDatas[contentDatas.length - 1];
        console.log("contentData: ");
        //console.log(contentData); 
        console.log(metaData.id);           
        return (
                <div className="pane" style={{height: "95%", top: isMobile? '0': '80px', margin: "3% 1% 0% 1%"}} >
                    <Card initiallyExpanded={true} style={{height: "100%"}} >
                        <CardHeader
                            itle= { metaData.title }
                            subtitle= { metaData.source }
                            actAsExpander={true}
                            showExpandableButton={false} />
                        <CardText expandable={false}>
                            {contentData.content}                      
                        </CardText>
                        <CardMedia overlay={<CardTitle title={contentData.images[0] ? contentData.images[0].description: ""} subtitle="Subtitle"/>}>
                            <img src={contentData.images[0]? contentData.images[0].url : null} />
                        </CardMedia>
                        <CardActions expandable={false}>
                            <FlatButton label="view source" linkButton={true} href={metaData.url} secondary={true}/>
                        </CardActions>
                    </Card>       
                </div>
                
        );
	}
}
