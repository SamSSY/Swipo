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
import createBrowserHistory from 'history/lib/createBrowserHistory';
import DatePicker from 'material-ui/lib/date-picker/date-picker';
import io from 'socket.io-client';
import './main.scss';

const history = createBrowserHistory();

const initialState = {
    socket: io.connect(),
    datas: [ {title: 'test1'}, {title: 'test2'} ],
    metaDatas: [],
    contentDatas: [],
    date: null,
    timerId: null,
    isInSearchByDate: false,
    textFieldValue: null
}

export default class StarredNewsByDate extends React.Component{
    
    constructor(props){
        super(props);
        this.state = initialState;
    }

    componentWillMount(){
        console.log('componentWillMount: StarredNewsByDate');
        let date = window.location.pathname.substr("/starred-news/view-by-date/".length);
        console.log("current date: ", date);
        this.setState({ date: date, isInSearchByDate: (date == 'searchbydate') ? true: false });
    }

    componentDidMount(){

        console.log("componentDidMount: StarredNewsByDate");
        console.log("state: ", this.state);
        console.log("In viewByDate: ");
        console.log("user: ", window.user);
        console.log(this.state.date);
        // detect if url changed
        let timerId = setInterval(() => {
            let date =  window.location.pathname.substr("/starred-news/view-by-date/".length);
            if(date !== this.state.date){
                console.log("url changed!");
                let newDate = new Date(2016, 0, 25, 0, 0, 0); 
                let today = newDate.getFullYear() + 
                        ((newDate.getMonth() + 1) < 10 ? '0' + 
                        (newDate.getMonth() + 1) : (newDate.getMonth() + 1)) + 
                        ((newDate.getDate() < 10) ? ('0' + newDate.getDate()) :  newDate.getDate());
                this.setState({ date: date, isInSearchByDate: (date == today) ? false: true });
                this.handleSwitchDate();
            }
        }, 100);
        
        console.log("timerId: ", timerId);
        this.setState({timerId: timerId});
        this.handleSwitchDate(); 
               
        const { socket } = this.state;
        socket.on('returnMetaDataByDate', (datas) => {
            console.log("StarredNewsByDate: ");
            console.log(datas)
            this.setState({metaDatas: datas});
        });
        socket.on('returnContentDataByDate', (datas) => {
            console.log("StarredNewsByDate: ");
            console.log(datas)
            this.setState({contentDatas: datas});
        });

        // other events
        $.event.trigger('switchToNewsByDate');
        //$(document).on('userID', function(){
            //console.log("!!!!!");
            //console.log(data);
        //});

    }

    componentWillUnmount(){
        console.log("componentWillUnmount");
        clearInterval(this.state.timerId);
    }

    handleSwitchDate(){
        const { socket, date } = this.state;
        let newDate = new Date(2016, 0, 25, 0, 0, 0); 
        let searchForDate = newDate.getFullYear() + 
                        ((newDate.getMonth() + 1) < 10 ? '0' + 
                        (newDate.getMonth() + 1) : (newDate.getMonth() + 1)) + 
                        ((newDate.getDate() < 10) ? ('0' + newDate.getDate()) :  newDate.getDate());
        console.log("switched to date: ", date);
        console.log(searchForDate, date);
        var temp;
        if(searchForDate == date){
            console.log("XXXXXXX");
            console.log(newDate);
            socket.emit('init', {
                user: window.user,
                location: 'viewByDate',
                date: newDate
            });
            socket.emit('getNewsByDate', {
                user: window.user,
                date: newDate
            });
        }
    }

    getStarredNewsByDate(date){
        const { socket } = this.state; 
        console.log("search by date: ");
        console.log(date);
        socket.emit('getNewsByDate', {
            user: window.user,
            date: date
        });
    }

    handleDatePickerValueChange(oldDate, newDate){
        console.log("date picker value changed!");
        let searchForDate = newDate.getFullYear() + 
                        ((newDate.getMonth() + 1) < 10 ? '0' + 
                        (newDate.getMonth() + 1) : (newDate.getMonth() + 1)) + 
                        ((newDate.getDate() < 10) ? ('0' + newDate.getDate()) :  newDate.getDate());
        console.log("search for date: ", searchForDate);
        history.push("/starred-news/view-by-date/" + searchForDate);
        this.getStarredNewsByDate(newDate);
    }

    renderNews(){
        let iconStyles = {
            marginRight: '25px',
            color: Colors.pink100
        }

        let { metaDatas, contentDatas } = this.state;
        var datas = [];
        for( var i = 0; i < metaDatas.length; ++i){
            let temp = { metaData: metaDatas[i], contentData: contentDatas[i]};
            datas.push(temp);
        }

        return ( datas.map( data => 
            <GridTile
              key={data.metaData.title}
              title={data.metaData.title}
              titlePosition="bottom"
              titleBackground={'rgba(0, 0, 0, 0.3)'}
              subtitle={<span>by <b>{data.metaData.title}</b></span>}
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
                      title={data.metaData.title}
                      subtitle={data.metaData.source}
                      actAsExpander={true}
                      showExpandableButton={false} />
                    <CardText expandable={false}>
                        {data.contentData.content}
                    </CardText>
                    <CardActions expandable={false}>
                        <FlatButton label="view source" linkButton={true} href={"http\:\/\/" + data.metaData.url} secondary={true}/>
                    </CardActions>
                </Card>
            </GridTile>
        ));
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
            justifyContent: 'space-around',
            paddingTop: '100px'
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
        let { isInSearchByDate } = this.state;
        let gridListStyle = {width: '100%', height: '95%', overflowY: 'auto', marginTop: '10px' };
        console.log("isInSearchByDate: ", isInSearchByDate);
        return(
            <div style={styles}>
                {isInSearchByDate? (<div>
                    <DatePicker
                      hintText="Search by Date"
                      onChange={this.handleDatePickerValueChange.bind(this)} />
                </div>) : null}
                <GridList
                  cols={2}
                  cellHeight={200}
                  padding={30}
                  style={gridListStyle} >
                {news}
                </GridList>
            </div>
        );
    }
}