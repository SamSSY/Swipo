import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';
import App from './components/App';
import Homepage from './components/Homepage';
import StarredNewsByDate from './components/StarredNewsByDate';
import StarredNewsByCategory from './components/StarredNewsByCategory';
import SwipePane from './components/SwipePane';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';


export default (
	<Route path="/" component={App}>
	    <IndexRoute component={Homepage} />
	    <Route path="swipe" component={SwipePane} />
	    <Route path="starred-news" >
		    <Route path="view-by-date" >
		    	<Route path=":date" component={StarredNewsByDate} />
		    </Route>
		    <Route path="view-by-category" >
		    	<Route path=":category" component={StarredNewsByCategory} />
		    </Route>
		</Route>
		<Route path="timeline" component={Timeline} />
		<Route path="dashboard" component={Dashboard} />
	</Route>
);
