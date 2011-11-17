# Introduction

The development of an application consists of 3 problems:

  * Development of back end
  * Markup and stylesheet authoring
  * Writing javascript 
  
The key to fast and maintainable work flow is to not repeat yourself on any of those steps. 

Server programmer community is pretty mature, so they developed a few solutions to the first problem. For example, we use Ruby on Rails, the MVC framework with a very well defined structure and purpose. Every user of Rails knows exactly what he needs to code (and where) to implement any of their ideas.

Frontend development is different. Before all, there's no certainty about how things really should be done in browser. And then, there're many problems to solve.

  
If you choose to pick a *large framework*, then the style and infrastructure is pretty much set for you. The downside of this, is the resulting application is hard to change and extend, because most of the application code is the code to glue components, requests and interactions together. So whenever application logic changes, or even small things in the flow get tweaked, the chance is that you'll need to mirror your changes both on clientside and backend.

The small framework is easily customizable, but then you author the whole thing, there's no magic, rather than a down to earth javascript coding. Changes cascade to front end from everywhere and the code has to be kept up to date, or else it very well might not work after a subtle change in a template.

Medium framework is what everyone wants, in theory. But the ones we have now lack the maturity it takes to be really customizable and adoptable to environment. The code is not modular enough, thus you can't reuse large chunks of otherwise useful things if you need to alter even a small bit in how it works.


                                         | Ext.js, Dojo      | jQuery, Backbone | jQuery UI           | Mootools + LSD
    Description:                         | Large framework   | Small framework  | Medium framework    | Complete framework
    Customizable HTML input              | Yes               | No               | Yes                 | No
    Customizable HTML output             | Yes               | No               | Yes                 | No
    Full style customization             | No                | Yes              | No                  | Yes
    Flexible JSON schema                 | No                | No               | No                  | Yes             
    Infrastructure for extensions        | Yes, monolith     | No               | Yes, inflexible     | Yes, flexible
    Mobile and desktop on the same code? | No                | Yes, if lucky    | Yes, if lucky       | Small to none
    Glue and app-specific code           | Lots              | Tons             | Lots                | No
    Package management                   | Yes               | No               | No                  | Yes, flexible
  

So the perfect tool lets a developer use whatever markup he has or wants (*Customizable HTML input*) and not stand in a way of customizing the element structure of widgets generated with it (*Customizable HTML output*). And it should not dictate any of styles for elements, so it could be used on legacy websites and applications.

The tool should not depend or rely on schema of what it gets from back end as JSON, so backend is always free to tweak its outputs (*Flexible JSON schema*). 

Framework should be easily extendable in all ways (*Infrastructure for extensions*) and have easy built-in ways to do ordinary and simple things. The developer should try to avoid writing any code that is relevant only within the current application (thus, having no *Glue and app-specific code*). It is also important to keep the code packaged and separated for future maintenance (*Package management*).
