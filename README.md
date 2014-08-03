# Mobile analyzing pletform 

An opensourced mobile analytics platform porting from [Countly github](https://github.com/Countly)

Prerequisites: Node(.js), Express, Jade, Backbone(.js), jQuery(.js)

## Records 

### 2014.08.02 

1) Using Jade template engine to replace original html files.

2) as we require to compile template on client side but jade engine is time-cost, I use handlebars(.js) mainly instead of including [Jade(.js)](http://jade-lang.com/)

3) This analytics platform mainly relies on [Backbone(.js)](http://backbonejs.org/#)  which provides superb MVC framework for event bining and collections for API functions [Model], declarative eventing handling [Views], dispatching and URLs management [Routers] and so on. 

- TO-DO-NEXT  

1. visualization tools porting

2. mongodb built-up and connection

