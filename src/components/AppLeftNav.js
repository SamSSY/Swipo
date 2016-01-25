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

export default class AppLeftNav extends React.Component{
	
    mixins: [
    	StylePropable,
  	]

	render(){
		const { history, width, location, docked, onRequestChange, onRequestChangeList, open, iconStyles} = this.props;
        return(
                <LeftNav docked={docked}
                    width={width} 
                    open={open} 
                    onRequestChange={onRequestChange} >
                    <SelectableList valueLink={{value: location.pathname, requestChange: onRequestChangeList}} >
                    <ListItem primaryText="Home" leftIcon={<FontIcon
                        className="material-icons"
                        style={iconStyles}
                        color={Colors.lightBlue100}>home</FontIcon>}
                        value=""
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
                                            value="/starred-news/view-by-date/today" 
                                        />,
                                        <ListItem key={2} primaryText="This Week" 
                                            leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >schedule</FontIcon>} 
                                            value="/starred-news/view-by-date/thisweek" 
                                        />,
                                        <ListItem key={2} primaryText="Search by date" 
                                            leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >schedule</FontIcon>} 
                                            value="/starred-news/view-by-date/searchbydate" 
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
                                        <ListItem key={1} primaryText="Headline" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                             value="/starred-news/view-by-category/headline"
                                        />,
                                        <ListItem key={2} primaryText="Society" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                            value="/starred-news/view-by-category/society"
                                        />,
                                        <ListItem key={3} primaryText="Life" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                            value="/starred-news/view-by-category/life"
                                        />,
                                        <ListItem key={4} primaryText="Finance" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                            value="/starred-news/view-by-category/finance"
                                        />,
                                        <ListItem key={5} primaryText="International" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                            value="/starred-news/view-by-category/international"
                                        />,
                                        <ListItem key={6} primaryText="Society" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                            value="/starred-news/view-by-category/china"
                                        />,
                                        <ListItem key={7} primaryText="Entertainment" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                            value="/starred-news/view-by-category/entertainment"
                                        />,
                                        <ListItem key={8} primaryText="Sports" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                            value="/starred-news/view-by-category/sports"
                                        />,
                                        <ListItem key={9} primaryText="Local" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                            value="/starred-news/view-by-category/local"
                                        />,
                                        <ListItem key={10} primaryText="Supplement" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                            value="/starred-news/view-by-category/supplement"
                                        />,
                                        <ListItem key={11} primaryText="Forum" leftIcon={<FontIcon
                                                className="material-icons"
                                                style={iconStyles}
                                              >bookmark</FontIcon>} 
                                            value="/starred-news/view-by-category/forum"
                                        />
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
                        value="/dashboard"
                    />
                    <ListItem primaryText="Settings" leftIcon={<FontIcon
                        className="material-icons"
                        style={iconStyles}
                        >settings</FontIcon>} 
                    />
                    </SelectableList>
                </LeftNav>
        );
	}
}