# Mobile analyzing pletform 

An opensourced mobile analytics platform porting from [Countly github](https://github.com/Countly)

Prerequisites: Node(.js), Express, Jade, Backbone(.js), jQuery(.js)

## Records 

### 2014.08.19

#### As the source codes released by Countly is under AGPLv3, all modifications should be opened and published under the same license publicly. See the [official website](https://count.ly/resources/faq/licencing) for more details.

1) modified 'propertiesValue' and '_sessionObject'.

2) Faciliate with [Flot](http://www.flotcharts.org/) for data visualization inside Countly.

- TO-DO-NEXT

1. mongodb built-up and write-in

2. Complete sessionObject

3. Complete date-selectorObject

### 2014.08.02 

1) Using Jade template engine to replace original html files.

2) as we require to compile template on client side but jade engine is time-cost, I use handlebars(.js) mainly instead of including [Jade(.js)](http://jade-lang.com/)

3) This analytics platform mainly relies on [Backbone(.js)](http://backbonejs.org/#)  which provides superb MVC framework for event bining and collections for API functions [Model], declarative eventing handling [Views], dispatching and URLs management [Routers] and so on. 

- TO-DO-NEXT  

1. visualization tools porting

2. mongodb built-up and connection

