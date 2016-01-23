import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';
import App from './components/App';
import Homepage from './components/Homepage';
import StarredNewsByDate from './components/StarredNewsByDate';
import StarredNewsByCategory from './components/StarredNewsByCategory';


export default (
	<Route path="/" component={App}>
	    <IndexRoute component={Homepage} />
	    <Route path="starred-news" >
		    <Route path="view-by-date" component={StarredNewsByDate} />
		    <Route path="view-by-category" component={StarredNewsByCategory} />
		</Route>
	</Route>
);

/*
<Route path="/" component={App}>
		<IndexRoute component={Home} />
		<Route path="/about-us" component={AboutUs} />
		<Route path="/posts">
		    <IndexRoute component={PostList} />
		    <Route path=":postId" component={SinglePost} />
		    </Route>
		<Redirect from="/abc" to="/" />
		<Route path="*" component={NotFound} />
</Route>
*/