# Relations, Expectations, Mutations

When a widget needs another widget to do something, it has to find it in document first. The tool of choice for a web developer is a DOM traversal engines that can retrieve nodes from the document by a CSS selector expression that describes what kind of a node be found. 

If a widget needs another widget repeatedly, that it has two choices:

* Run a selector against DOM every time (bad performance)
* Save selector result and return it any time a widget needs it.

The first way is a naive approach that gets slower whenever the rate of widget selection and the document size grows. For example, there was a problem at Twitter, when a selector was ran every time a window is scrolled (and that may happen tens of times per second in browser) which dramatically reduced the page performance for **every** Twitter user of web site.

The second approach is way more performant, but then the cache needs to be invalidated whenever the elements are removed, replaced or updated, so the results returned are always sane and fresh. Caching is a straightforward and natural technique, but only when the developer is in control of its objects. Unfortunately, JavaScript does not really allow a developer to make hooks on built in functions that would invalidate the cache. More than that, there's no bulletproof way to tell when a specific element is removed from the DOM. And that means there has to be a lot of glue code, just to invalidate the caches. When the new way to manipulate elements is introduced (e.g. drag'n'drop of nodes), the code has to be extended to correctly handle the new manipulations.

Widgets of LSD act like regular elements, but they are totally under control. Changes to widgets (setting of a new attributes, classes moving a node) are easily tracked. On top of that, LSD offers realtime selectors.

Selectors concept was first introduced in CSS. Then with the rise of DOM-frameworks, it migrated in to javascript with a notable difference - selectors as people know them in javascript are not realtime. The great thing about CSS selectors is that you don't need to think about when and how the styles are applied. If an element is in DOM, matching style rules will be applied instantly, no matter what. And it's just not possible to do in javascript - you can only select a collection of elements **once** and from there you have to maintain the collection's integrity with the document. Even the modern CSS3 javascript capabilities like `document.querySelectorAll` only select elements one time and need to be rerun on changes.

It starts to be notorious when the number of selector grows. Imagine that you have 30 different selectors each corresponding to a function that defines the behavior of matching elements. When the page loads, you have to run all 30 of them, and it may be natural to do. Now let's assume that a small chunk of HTML on the page is replaced with the content the page received asynchronously. A clientside does not know what kind of elements are there in that updated chunk, but it needs to find it out to make the behave. What to do? Run 30 selectors against that small part of the page. And if the page has 3 dynamic areas that are updated at once? Ouch, that is going to be 90 selector runs.

And there's no work around for this in javascript. The only thing a developer could do is give up using selectors and walk the tree of elements manually. 

LSD has the solution, though. It walks the node tree of each updated chunk once, but it does it behind the scenes, while still allowing a developer use selectors.

There are three types of selector node retrieval that LSD does:

* **Selectors** - what you usually get with any other framework. Quite extendable and already doing everything under the moon.
* **Mutations** - the simplified utility subset that matches **DOM Elements** against selectors to turn them into widgets. They are used to initialize widgets in a DOM tree. 
* **Expectations** - the full blown realtime (like in CSS) selectors that run on already initialized widgets. 

                                     JS DOM selectors      Mutations     Expectations
        Realtime:                    No                    No            Yes
        Executed in one pass:        No                    Yes           Yes
        Feedback:                    Yes                   No            Yes
        Extendable traversal logic:  Yes                   No            Yes

      

# Mutations

A mutation is a key-value pair, where a key is a selector and value is a name of a role to apply to widget. If the value is `true`, then the element becomes "simply a widget", with no specific role.

Mutations accumulate a combined selector that does not need to walk DOM many times to match all selectors in stack, but rather walk the tree only once and match the right selectors against each node in a tree. It is possible because mutations do not return any results, nor build up element collections. They are used as a fast utility to initialize widgets. And then widgets can use **expactations**.

# Expectations

The other type of retrieval is much more interesting, because it's the only one that is **realtime**. It means that expectations can fire callback both when widget is matched for selector and when it can't be matched anymore.

A simple expectation like `form button` will match all buttons in a form and fire a callback on each of them. But if you remove a button that was matched from DOM, the callback will be fired again but with a 2nd argument set to `false`. 

    // Usual selectors:
    document.getElements('form button').each(function(button) {
      // do something
    });

    // Mutations:
    // Finds buttons and turns them into a `button` widget
    new LSD.Document({
      mutations: {
        'form button': 'button',
        'form input': function(input) {
          // do something. Return value is used as a mutation value.
        }
      }
    });
    
    // Expectations:
    LSD.document.body.watch('form button', function(widget, state) {
      if (state) { // true or false
        // this branch will fire when:
          // * A button was inserted into the form
          // * A form was inserted that already haD the button in it
        console.log('I just matched a button', widget);
      } else {
        // this branch may be fired in case
          // * Parent form is removed or a button is removed
          // * A button or form widget had changed the tag name
        console.log('A button can not be matched anymore', widget);
      }
    });
    
So expectation is a selector that lasts and reacts to changes in the widget tree. All things that may change a widget state fire the events, and LSD then checks if there're any expectations that will be possibly affected by the change and fires the callback if so. There is a lot of interesting things going on behind the scenes to make it fast, but for the user it's nothing but a CSS-like realtime selector.

## 

Relation is an object that connects widgets together. Once widgets are related, they can access each other instantly and even change each other's behavior.