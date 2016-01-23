const React = require('react');
const { render } = require('react-dom');
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import FlatButton from 'material-ui/lib/flat-button';
import CardText from 'material-ui/lib/card/card-text';
require('../main.scss');

export default class SwipePane extends React.Component{
	
    componentWillMount(){
        console.log("componentWillMount");
    }

    componentDidMount(){

        const {updateIndex, paneIndex} = this.props;
        
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
    }
    render(){
		const {paneContent, paneIndex} = this.props;
		/*return(
			<div className='pane'  id = { paneIndex }>
				{paneIndex}
			</div>
		);*/
        return(
            <div  className='pane' >
                <Card initiallyExpanded={true} style={{height: "96%", margin: "3% 1% 0 1%"}} >
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
