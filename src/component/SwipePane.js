const React = require('react');
const { render } = require('react-dom');
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
		return(
			<div className='pane'  id = { paneIndex }>
				{paneIndex}
			</div>
		);
	}
}
