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
import RaisedButton from 'material-ui/lib/raised-button';
import io from 'socket.io-client';
import './main.scss';

const gridListStyle = {width: '90%', height: '95%', overflowY: 'auto', margin: 24};

export default class StarredNewsByCategory extends React.Component{
	
    constructor(props){
        super(props);
        this.state = {
            socket: io.connect(),
            datas: [ {title: 'test1'}, {title: 'test2'} ]
        }
    }

    componentDidMount(){
        const { socket } = this.state;
        
        // socket events
        socket.emit('init', {
            user: window.user,
            location: 'viewByCategory'
        });

        socket.on('returnNewsByCategory', function(datas){
            console.log("StarredNewsByCategory: ");
            console.log(datas)
            this.setState({datas: datas});
        });

        socket.on('test', function(){
            console.log("in category");
        });

        // other events
        $.event.trigger('switchToNewsByCategory');
        //$(document).on('userID', function(){
            //console.log("!!!!!");
            //console.log(data);
        //});
        console.log("In viewByCategory: ");
        console.log(window.user);
    }

    renderNews(){

        return this.state.datas.map( data => 
            <GridTile
              key={data.title}
              title={data.title}
              titlePosition="top"
              cols={2}
              rows={2}
              >
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
                  padding={1}
                  style={gridListStyle}
                  >
                {news}
                </GridList>
            </div>
        );
	}
}