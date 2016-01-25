import React from 'react';
import { render } from 'react-dom';
import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardMedia from 'material-ui/lib/card/card-media';
import CardTitle from 'material-ui/lib/card/card-title';
import FlatButton from 'material-ui/lib/flat-button';
import CardText from 'material-ui/lib/card/card-text';
import FontIcon from 'material-ui/lib/font-icon';
import Colors from 'material-ui/lib/styles/colors';
import RaisedButton from 'material-ui/lib/raised-button';
import io from 'socket.io-client';
import './main.scss';

const gridListStyle = {width: '100%', height: '95%', overflowY: 'auto', marginTop: '80px'};

const initialState = {
    socket: io.connect(),
    datas: [ {title: 'test1'}, {title: 'test2'} ],
    metaDatas: [],
    contentDatas: [],
    category: null,
    timerId: null
}

export default class StarredNewsByCategory extends React.Component{
	
    constructor(props){
        super(props);
        this.state = initialState;
    }

    componentWillMount(){
        console.log('componentWillMount: StarredNewsByCategory');
        let category = window.location.pathname.substr("/starred-news/view-by-category/".length);
        console.log("current category: ", category);
        this.setState({ category: category });
    }

    componentDidMount(){
        console.log('componentDidMount: StarredNewsByCategory');
        console.log("In viewByCategory: ");
        console.log(window.user);
        console.log(this.state.category);
        // detect if url changed
        let timerId = setInterval(() => {
            let category =  window.location.pathname.substr("/starred-news/view-by-category/".length);
            if(category !== this.state.category){
                console.log("url changed!");
                this.setState({ category: category });
                this.handleSwitchCategory();
            }
        }, 100);
        
        console.log("timerId: ", timerId);
        this.setState({timerId: timerId});
        this.handleSwitchCategory(); 
               
        const { socket } = this.state;
        socket.on('returnMetaDataByCategory', function(datas){
            console.log("StarredNewsByCategory(meta): ");
            console.log(datas)
            this.setState({metaDatas: datas});
        });
        socket.on('returnContentDataByCategory', function(datas){
            console.log("StarredNewsByCategory(content): ");
            console.log(datas)
            this.setState({contentDatas: datas});
        });

        // other events
        $.event.trigger('switchToNewsByCategory');
        //$(document).on('userID', function(){
            //console.log("!!!!!");
            //console.log(data);
        //});

    }

    componentWillUnmount(){
        console.log("componentWillUnmount");
        clearInterval(this.state.timerId);
    }

    handleSwitchCategory(){
        const { socket } = this.state; 
        socket.emit('init', {
            user: window.user,
            location: 'viewByCategory',
            category: this.state.category
        });
    }

    renderNews(){
        let iconStyles = {
            marginRight: '25px',
            color: Colors.pink100
        }

        return this.state.datas.map( data => 
            <GridTile
              key={data.title}
              title={data.title}
              titlePosition="bottom"
              titleBackground={'rgba(0, 0, 0, 0.3)'}
              subtitle={<span>by <b>{data.title}</b></span>}
              actionIcon={<FontIcon
                        className="material-icons"
                        style={iconStyles}
                        >favorite</FontIcon>}
              cols={1}
              rows={2}
              style={{boxShadow: '0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.24)'}}
              >
                <Card initiallyExpanded={true} style={{height: '100%'}}>
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
            </GridTile>
        );
    }

    render(){	
        let styles = {
            height: "100%",
            //backgroundColor: "grey",
            margin: "0px",
            textAlign: "center",
            //color: "white",
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'space-around'
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

        let news = this.renderNews();
        return(
            <div style={styles}>
                <GridList
                  cols={2}
                  cellHeight={200}
                  padding={30}
                  style={gridListStyle}
                  >
                {news}
                </GridList>
            </div>
        );
	}
}