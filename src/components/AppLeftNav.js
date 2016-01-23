import React from 'react';
import { render } from 'react-dom';
import LeftNav from 'material-ui/lib/left-nav';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import {SelectableContainerEnhance} from 'material-ui/lib/hoc/selectable-enhance';
import Colors from 'material-ui/lib/styles/colors';
import FontIcon from 'material-ui/lib/font-icon';
import ActionGrade from 'material-ui/lib/svg-icons/action/grade';
import {StylePropable} from 'material-ui/lib/mixins';

const SelectableList = SelectableContainerEnhance(List);

/*
        <AppLeftNav
          style={styles.leftNav}
          history={history}
          location={location}
          docked={docked}
          onRequestChangeLeftNav={this.handleChangeRequestLeftNav}
          onRequestChangeList={this.handleRequestChangeList}
          open={leftNavOpen}
        />

         <LeftNav docked={false}
                    width={300} 
                    open={this.state.isLeftNavOpen} 
                    onRequestChange={open => this.setState({isLeftNavOpen: open}) } >
                    <List subheader="Swipo">

*/


export default class AppLeftNav extends React.Component{
	
    mixins: [
    	StylePropable,
  	]

	render(){
		const { history, width, location, docked, onRequestChange, open, iconStyles} = this.props;
        return(
                <LeftNav docked={docked}
                    width={width} 
                    open={open} 
                    onRequestChange={onRequestChange} >
                    <List subheader="Swipo">
                    <ListItem primaryText="Home" leftIcon={<FontIcon
                        className="material-icons"
                        style={iconStyles}
                        color={Colors.lightBlue100}>home</FontIcon>}
                    />
                    <ListItem
                            key={1}
                            primaryText="Starred News"
                            leftIcon={<ActionGrade />}
                            initiallyOpen={true}
                            primaryTogglesNestedList={true}
                            nestedItems={[
                                <ListItem
                                    key={2}
                                    primaryText="Date"
                                    leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >date_range</FontIcon>}
                                    disabled={true}
                                    nestedItems={[
                                        <ListItem key={1} primaryText="Today" 
                                            leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >schedule</FontIcon>} 
                                        />,
                                        <ListItem key={2} primaryText="This Week" 
                                            leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >schedule</FontIcon>} 
                                        />,
                                    ]}
                                />,
                                <ListItem
                                    key={3}
                                    primaryText="Category"
                                    leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >class</FontIcon>}
                                    disabled={true}
                                    nestedItems={[
                                        <ListItem key={1} primaryText="Entertainment" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                        />,
                                        <ListItem key={2} primaryText="Politics" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                        />,
                                    ]}
                                />
                            ]}
                    />
                    <ListItem primaryText="Timeline" leftIcon={<FontIcon
                        className="material-icons"
                        style={iconStyles}
                        >timeline</FontIcon>} 
                    />
                    <ListItem primaryText="Dashboard" leftIcon={<FontIcon
                        className="material-icons"
                        style={iconStyles}
                        >dashboard</FontIcon>} 
                    />
                    <ListItem primaryText="Settings" leftIcon={<FontIcon
                        className="material-icons"
                        style={iconStyles}
                        >settings</FontIcon>} 
                    />
                    </List>
                </LeftNav>
        );
	}
}