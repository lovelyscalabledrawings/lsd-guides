# Getting started

## Guide assumptions

LSD is based on [mootools](http://mootools.net). While many other Javascript frameworks try to hide the true beautiful nature of the language behind many levels of abstractions, mootools attempts at augmenting Javascript and making more sense of what is already in the language and the browsers. Mootools is considered a framework for javascript developers that want to understand and make more use of their environment.

The programming with bare javascript framework (like mootools) may require much experience in building applications and architecting the code to keep it clean and maintainable. LSD fills the blanks in its way by providing a strong vision on how things are accomplished and structured. And if for the most parts you won't need to be writing javascript code at all, understanding of Javascript, DOM and CSS will make your skills multifold more powerful.

So if you feel overwhelmed, official [mootools API documentation](http://docs.mootools.net) is there to help.


## What is LSD?

**Lovely Scalable Drawings** is a user interface development framework written in Javascript. It is designed to make programming and prototyping of interfaces easy, painless and maintainable by providing flexible and well defined tools for every aspect of development. It allows you to write less code while accomplishing what other frameworks are not capable of. 

LSD is opinionated software. It assumes that there is a best way to do things and it is designed to encourge you that way. Most of the time it's hard to bring the old habits, because LSD tries to avoid common pitfalls. Here are few points that we were trying to stick with:

* DRY – “Don’t Repeat Yourself” – suggests that writing the same code over and over again is a bad thing.
* Convention Over Configuration – means that LSD makes assumptions about what you want to do and how you’re going to do it, rather than requiring you to specify every little thing through endless configuration files.
* DOM is the way to go - instead of trying to reinvent or abstract away the document object model, embrace it. 

## Document object model

**DOM** is a language-independent convention for representing and interacting with objects in HTML, XML and others. Most Javascript frameworks are DOM-oriented, because it is the only way to create and manipulate elements on the page, and that is what the language was invented in the first place. You can hear quite often the opinions like "[DOM is a mess](http://ejohn.org/blog/the-dom-is-a-mess/)". Major pain points are that the DOM provided in browsers is:

* **Inconsistent** - as in different from one browser to another. There are quite a few new features were introduced in recent revisions of DOM related to CSS3, good example is `querySelectAll` and `nativeMatchesSelector` support. It's hard to debug and use new features in an evergrowing browser stack.
* **Not extendable** - Extending native DOM objects doesn't quite work with the old browsers. It is one of the reasons why native prototype extension is so much of a taboo now in immature Javascript world. And it's impossible to alter default behavior of elements in DOM.

The way LSD handles this is that it actually operates on two object models at the same time.

* **DOM** is the plain old document with **HTML elements**. One important thing, is that thanks to mootools, elements are extended with various helpful methods to make doing manipulations a lot easier.
* **LSDOM** is also a document and a tree, but for **widgets**. Widget is a smallest entity in framework and represents an interactive element on the page. . 

They have mostly the same API, so it is immediately clear how to do things with widgets to any programmer familiar with Javascript and HTML. More than that, third party javascript tools that rely on DOM API to do something can work with widget tree and not even know about it. Good example is a Slick selector engine, that powers up CSS-like selectors on DOM elements in mootools. It's broadly used in LSD to select widgets by complex CSS queries.

## Widgets

Widgets and elements are very much alike. Consider widget a **richer** element that has a more customizable behavior. How much richer?

* Widgets are HTML5. The number of widgets is a straight implementation of those added in HTML5 and which we won't see in browsers soon. There are other concepts from HTML5 that is extensibly used in LSD that is still not picked up by mainstream community (microdata, commands, menus) and this is ready to be used now.
* Widgets behavior is extendable, and often declarative. Simply marking up the microdata properties `itemtype` and `itemid` will enable widget to send resource requests to backend, for example delete a resource together with the widget. 
* Widgets are context sensitive. An `<option>` widget inside `<select>` and inside `<menu>` are different and have act differently. Widgets influence each other, interact, give feedback and invoke chains of actions. 
* Widgets are built using composition principles. You will create create your own variation of selectbox with autocompletion and popup capabilities from the parts that other builtin widgets use. Imagine if browser vendors ate their own dogfood and had their form controls implemented in a nice reusable way in Javascript. 
* A widget can change it's tag name and thus its behavior and purpose. A `<select>` with all its `<option>` children can be converted into a toolbar with a simple `.setTag('menu')`  
  
## Layout

LSD Layout engine traveses regular DOM elements and translates them into a widget structure. Not every element on the page is a widget, for example paragraphs with texts are not. But if there needs to be an interactive element on the page, it very well might be a widget. Layout elements-to-widgets conversion is an important routine that happens in the beginning of the page life cycle and triggers most of the nice things in framework.

There are more than one way to create a tree of widgets in LSD, but using HTML as the source of widgets is more natural for the web as it allows using LSD on regular websites that are not designed to be a full stack clientside web application (unlike large frameworks, that force the mentality of a desktop-like application). In fact, LSD is designed to be reasonably humble and flexible to be used in any HTML layouts. 

Selecting the right elements to make them interactive is not a solved question yet in javascript world. The mainstream approach is to use an engine that allows selecting elements by CSS selectors. The number of selectors grows with the application and soon becomes slow, hard to maintain and optimize. Simple changes to HTML often break the heavy selector-dependent code. 

Another approach is to have a defined set of special attributes that define the purpose of the widget and maybe the even name of the class that should be instantiated on that element. Then a single pass of a layout code translates it into something meaningful for the code. But the HTML becomes ugly and bloated right from the start. An integration of such framework with the existing site would mean re-marking up many of otherwise ready pages. Needless to say, that it makes it hard to jump off such a framework to something different (or even a new release with slightly changed syntax). The decision to use a framework that dictates markup is like an engagement. You give away freedom and flexibility in exchange for power and hopefully speed.

LSD takes good things of both approaches, and it boils down to this:

* We use selectors to find widgets in HTML, but the actual "hit" to DOM only happens once. Instead of running many separately selectors, there is one smart "combined" selector that walks around every element on the page and checks which of the selectors it matches. There are a few tricks involved in this, like reversing the selector and selector index, but it all happens behind the scences. It gives an impressive 5-20x increase in speed over many selectors approach. 
* Layout can deduct what class should be used for every given element but **without** trashy invalid markup. 

Widget class names are also meaningful. They are named after tag names and types by convention:

    <body>                => LSD.Widget.Body
    <input>               => LSD.Widget.Input
    <input type=radio>    => LSD.Widget.Input.Radio
    <input type=checkbox> => LSD.Widget.Input.Checkbox

So to make LSD recognize a custom `<input type=voice>` widget one would simply define `LSD.Widget.Input.Voice` class.

There is a concept of **mutation** that helps in cases when markup does not match widget class names. It tells a layout to convert an element to specific class when it matches given selector. It may look like this:

    new LSD.Document({
      mutations: {
        'nav > aside': 'aside',
        'div.checkbox': 'input-checkbox'
      }
    })

So in this document, a `<div class=checkbox>` would be interpreted as a checkbox widget. Mutations are accumulated in a widget, so a layout engine can mutate the whole DOM tree efficiently in one pass. What that means for the user, is that there is no performance obligation on adding more mutations for customization. Parent widgets may also specify which widget classes should be instantiated for which of their child nodes, so framework can adapt to any markup.
  
`input-checkbox` string in example is called **source**. It is used internally to find the right class, in this example it is  LSD.Widget.Input.Checkbox. So you can consider a dash in source a dot in a class name.

## Widget contexts

The most common reason why most of the modern web applications can not run smooth both on mobile and desktop with the native experience is that interactive elements are really different. And if a team manages to make two versions of their code, one for mobile and one for desktop, they can't run it on the same code. Often, a mobile version of the site uses a framework orthogonal to the one used on a regular website, even if both conceptually do the same thing. 

LSD solution is to have multiple distinct categories of widgets that may or may not be used in run time. 

Good news is that neither of those categories is required. The idea is to have as little code in widgets is possible, so they consist primarily of various feature definitions, but not the code. It is perfectly legitimate to use only your own widgets. But chances are, that the ones we provided will do.

There are three groups of widgets built for LSD:

* **[LSD.Native](http://github.com/inviz/lsd-native)** widgets that wrap around the native form fields. They are not many, but they include HTML4 standart `<input>`s, `<textarea>` and `<select>`. Their appearance is not much more customizable, because they are regular form fields like you know it, but with a richer behavior.
* **[LSD.Widget](http://github.com/inviz/lsd-widget)** is the main container for widgets that resemble natives, but with no real form fields. They can be rendered with layers and are fully customizable (even the shape). Widgets that are not universally implemented across browsers, like `<input type="date">` can be also found here.
* **[LSD.Mobile](http://github.com/inviz/lsd-mobile)** is about widget that resemble controls on mobile devices, like mobile full screen datepickers, dialogs and pages.

And there's an `LSD.Element`, the default context that doesnt have its own widgets, but it can include multiple other contexts. So when the files are loaded, some contexts may be included on condition. LSD may detect a mobile device and include LSD.Mobile into LSD.Element's pool. 

When LSD makes a query to a Element context, it will try to look in every attached widget pool in order. Some applications need their custom `<input>` fields with gradients and round corners, so they will have `LSD.Widget` early in the pool. And some applications may not need native widgets at all, so LSD.Native is not included in the pool.

Every context is packaged separately. 
  
## Dealing with packages

LSD is a modular framework that uses mootools packages format. That means it's compatible with [Mootools forge](http://mootools.net/forge).

A package usually means its own git repository, it's own readme and manifest. The key facts are:

* Packages are built to be independent (or loosely dependent) on each other for greater interoperability
* Packages allow flexibility in directory structure of your project, so they are not necessarily have to be on the same level, and even include one another. A package can be added by dropping it in or replaced simply by replacing the directory. There's not a single configuration file that has to be maintained and there's no installation process. 
* Packages dictate the way files declare their dependencies, they do it in a comment at top of each file. Each file also states what global variables it provides, which enables some advanced techniques for serving the files small and in portions. 
* Your project is a package too, so you can re-use the code from it without having to deal with integration.

The packaging tools is a whole story in itself. A few things that [jsus](https://github.com/jsus/jsus) helps us to do:

* Handle cross-package dependencies with wildcards 
* Serve files with dependencies interactively through GET requests. A clientside asks jsus to compile a file that contains a definition of a specific class with all its dependencies. And jsus delivers. 
* A package may be created sololely to extend a third party package. A packager software will ensure the code is injected in the right time. This helps to avoid needless forks that should be maintained from version to version.
* jsus [can generate](https://github.com/jsus/murdoc) a docco-style documentation off the package sources with cross links to the dependencies and index page. 


## Installation

### Get dependencies 

First, you need to get all the LSD code to let it help you. The easy way to get all at once is to clone `javascripts` repository that has all required packages as submoules. Updating the submodules will bring everything you need in.

    git clone git@github.com:orwik/javascripts.git
    cd javascripts
    git submodules update --init
    cd ..


### Create your project package

The code that you're going to write will go into it's own package. There is a tutorial on mootools forge, that [will help you to make a new package form scratch](http://mootools.net/forge/how-to-add) (except you don't need to add it to mooforge after you're done).

But there is already a nice boilerplate that is ready to be used as the based for any new project.

`git://github.com/lovelyscalabledrawings/lsd-boilerplate.git my_project`

Where my_project is a desired project name. Then go into that folder and find [README.md](https://github.com/lovelyscalabledrawings/lsd-boilerplate/tree/master/README.md) file that will guide you through following steps:

  * Overview of the package structure
  * Fetching the dependencies
  * Compiling javascripts for development
  * Including javascripts on the page
  * and will give a few tips about compiling code for production

### Using on the page

So once you've created your application and compiled the files, they are ready to be used in action.

    <script src="my_project/Compiled/includes.js">


