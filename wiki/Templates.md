# Interpolations and templating

  What is a template? It's a prepared fragment of document that renders a tree of elements. A simple portion of document is not that interesting in itself, unless it contains variable data. 

  Templating in javascript is a shady topic, because there's no solution that would **fit it all** by design. There're too many important things on a list to consider when choosing a templating system. The main three are:

## HTML interoperability

  HTML is lingua franca of the web and if one wants to display something on the page, he will have to output HTML to do it. It should be easy to export the template as HTML. It is even better if the template is itself HTML.

  Note that an obscure template syntax reduces the number of people that could potentially maintain and understand the code. 
  
### Partial updates

  Templates on the client side are different from server side templates in the way that the lifecycle of the templates generated on the server is finite and it's even better for HTML result to be cached. When things on the page change, the HTML is generated again and overwrites old cached values. 
  
  It's different when there're page interactions involved. Parts of the page may change and the templates have to be updated. A typical templating engine is only capable of translating an input template into HTML and hand it over to other subsystems (or the developer) to update the page. But there's not a lot you can do with HTML, because it's a template in itself - it has to be parsed. And it's impossible to match the previously rendered elements against a new ones coming from HTML to only replace the ones that are changed. This leaves the only option to replace old elements with the new ones. That means that every time a value in a template is changed, the template itself is rendered from scratch. And if there were any interactive elements that need to be initialized in javascript, another piece of code traverses the updated area (often using selector engine).
  
  What does it mean? Updating a HTML template is pretty hard and costly. So a perfect templating engine only updates necessary small bits and does not re-create elements at all.
  
## Data sources

  A template with placeholders for values needs those values to use and display. Often, an engine defines the way it receives it's data, so it's up to developer where he gets his objects from. It raises the level of code complexity, since there's a middle man that serves the data to template engine. Controllers do it in applications written in Model-View-Controller style, to the point it has its own letter in MVC acronym. But they are not that needed and there is a general wisdom to keep those controllers as small as possible, because they are in fact a glue code.

  Things get complicated, when the values in templates need to be updated when the source data is updated. If a template engine only generates HTML, it has nothing to do but to update the whole template. There is a concept of *bindings* that helps to set up lasting connections between spots in templates and data. For example, SproutCore lets a developer add extra markup (or extra code in javascript controller) to tell the engine to make a data binding. There are multiple types of bindings (e.g. one function to bind value by key in object and a separate function to bind value of the widget) to choose from.
  
  LSD works with data in different formats:
  
  * **Widget values** - any of the form fields or listings
  * **Microdata** - values extracted from elements that marked with the special HTML5 markup as valuable 
  * **Observable objects** - datasets, attributes, states
  * **Javascript objects and functions** - does not magically update placeholders as values change
  
  The important thing is that there's no glue code that tells LSD where it shout get the values from, it resolves values on its own. 
  
  Here is an example of a template using microdata:
  
    <article itemprop='person' itemscope>
      <menu>
        <li>Write {person.name} a letter</li>
        <li>Find all {pluralize(person.title)} in area</li>
      </menu>
      <h2 itemprop='name'>George Lucas</h2>
      <span itemprop='title'>Editor</span>
    </article>
    
  The example template is self-contained and does not need anything else to make the values resolved and used. Note that the order of appearance for data and the placeholders - the piece of of the template that retrieve `person.name` comes after `<h2 itemprop='name'>` but it nevertheless gets the value. The second item in the menu uses a helper function to transform the value (pluralize the "editor" string and make it "editors"). If a `person.title` gets updated, the function is called again.
    
![](http://24.media.tumblr.com/tumblr_lmwsdkiuZd1qbb5d0o1_500.jpg)
  
# Templates in HTML
  Writing templates directly in HTML is a big deal, because of how interoperable HTML is. Everything on the web uses HTML, so that means that your web application understands it and all the tools like syntax highlighters and parsers that work with HTML also work with the raw templates.
  
  Websites often render HTML on the back end and serve it to client. That enables browser to display and render loaded parts while the page is still loading. So when the javascripts are fully loaded, there's a lot of work browser have already done in parallel, so it only takes a few minor tweaks to the DOM to be ready and usable.
  
  Previous HTML example played the role of a source of data, but it only used the data to output values in placeholders. Following is a more sophisticated example uses **conditional comments** to hide menu if the `person.name` happens to be `George Lucas`:
  
    <article itemprop='person' itemscope>
      <!-- if person.name == 'George Lucas' -->
        <p> You can't find a guy like George Lucas.</p>
        And <strong>please</strong> don't write him too.
      <!-- else -->
        <menu>
          <li>Write {person.name} a letter</li>
          <li>Find all {pluralize(person.title)} in area</li>
        </menu>
      <!-- end -->
      <h2 itemprop='name'>George Lucas</h2>
      <span itemprop='title'>Editor</span>
    </article>
    
  When a template will be initialized, it will remove the `else` part of the `if` statement. The microdata here never changes, but the change can be triggered from javascript like this:
  
    widget.itemscope.set('name', 'Takeshi Kitano')
    
  Then a microdata `<h2>` header will be updated and page will display menu and show a special block for George Lucas:
  
    <article itemprop='person' itemscope>
      <!-- if person.name == 'George Lucas' -->
      <!-- else -->
        <menu>
          <li>Write Takeshi Kitano a letter</li>
          <li>Find all editors in area</li>
        </menu>
      <!-- end -->
      <h2 itemprop='name'>Takeshi Kitano</h2>
      <span itemprop='title'>Editor</span>
    </article>
    
  Possible keywords are *if*, *unless*, *else* and *elsif*. Conditional blocks may be nested and may have any kind of HTML (with textnodes preserved) in its branches. 
  
## Lazy branches

  Previous examples of conditional branches unconditionally rendered branches and simply removed them from the DOM if they were not supposed to be displayed initially. That means while the page is loaded, the content is shown and then quickly disappears.
  
  A block may be defined as **lazy** when wrapped in comments to avoid rendering it initially:
  
    <!-- if person.posts_count > 1 -->
      <!-- 
        <p>Ah, you're a great poster! You've got {pluralize(person.posts_count)} posts already!</p>
      -->
    <!-- else -->
      <h2>Not a single post</h2>
    <!-- end -->
    
  The header is there from the start, but the paragraph is not be rendered if the condition doesn't match. But if it does, the content of a comment will be unwrapped and rendered in that spot. That would also hide the header in `else` part of the statement.
  
  If a lazy HTML block has comments inside, they have to use the **short notation** (to have a single dash - `<!-`, `->`).
    
# Templates in JavaScript

  HTML is great and you should love it too, but readability is expressiveness isn't its best sides. It's also very hard to author HTML in javascript with all the line-breaks and whitespace.
  
  LSD provides a compact object template syntax that looks like a mix of HAML and JSON:

    widget.buildLayout({
      'input#slider[type=range][value=50][max=100]': true
      'if value(#slider) > 50': {                
        'h2.tip': 'The glass is half full'       
      },                                        
      'else': [                                 
        {'p': 'The glass is half empty},         
        {'p': 'What yarr gonna do?'}            
      ]
    })
    
  Let's take a closer look at bits of that:
    
    * It adds a slider widget at top. `true` as its value means that it has no child nodes.
    * Then, an `if` statement that uses `value` function on the widget returned by `#slider` selector. Whenever value changes, the condition is re-evaluated.
    * The block nested into an `if` statement renders a `h2` header when the value of a slider is greater than 50.
    * An `else` block is displayed when the value is less or equal than 50
    * Javascript doesn't allow multiple object values with the same key. There're two `p` paragraphs in the `else` block. Each of the paragraphs has its own object, so the keys dont interfere. The square brackets means that both objects are wrapped into a single array.
  
## Pattern matching
    
  HTML and Object notation have the same feature set, so you can do pretty much the same using the syntax of choice. But LSD lets you use both HTML and JSON templates at once.
  
  Most of the time, applications can get away only with HTML rendered on the back end and transmitted to clientside asynchronously. For example, sending a POST request to create an item, would return HTML to be inserted into the listing of items. But there are times, when the item can not be rendered by back end.
  
  A widget may define its template in JSON object and when it is initialized on an DOM element, it matches the template against elements to find matching nodes to use them and build the nodes it could not find.
  
    LSD.Widget.Article = new Class({
      options: {
        tag: 'article',
        layout: {
          'header': {
            'h1': '{title}'                // interpolation makes widget extract title from its h1 in header
          },
          'footer': {
            'a.delete': 'Delete {title}'
          }
        }
      }
    });
    
    var element = new Element('article').set('html','\
      <header>                                       \
        <h1>Greatest kids of all</h1>                \
      </header>                                      \
      <section>                                      \
        We'll talk about James Brittsweet.           \
      </section>                                     ');
    var widget = new LSD.Widget(element);
    
    /*
      The element will become this:
      
      <article>
        <header>
          <h1>Greatest kids of all</h1>
        </header>
        <section>
          We'll talk about James Brittsweet.
        </section>
        <footer>
          <a class='delete'>Delete Greatest kids of all</a>
        </footer>
      </article>
      
      Note how the footer element is built, while header is used from element.
      Interpolation in a footer link re-used `title` property extracted from 
      <h1> in <header>
    */
  
  Layout specified via options is rendered as lazy which enables pattern matching. But there's a way to render lazy layout and trigger finalization to build missing nodes programmatically.

## Reordering
  
  When lazy layout is rendered, it first makes promises instead of building nodes immediately. Then, if a widget was built with a DOM element given, layout walk its child nodes and uses promises made before to find nodes that would satisfy them. If a node is found, the promise uses that node and does not build a new one. Otherwise, the promise has to be realized by building the node. The newly created nodes are appended to the parent node and appear at the bottom.
  
  **Order combinators** come in handy when order of elements matters and has to be enforced. Order combinator follows a selector expression and defines a relative order to the next sibling. 
  
  `+` combinator makes the node precede the next sibling.
   
    // A <header> binds <nav> to follow it
    layout: {
      'header +': null,
      'nav': null
    }
    
    // On an element with these child nodes
    <header></header>
    <section></section>
    <nav></nav>
    
    // Will inject <nav> right after <header>
    <header></header>
    <nav></nav>
    <section></section>
    
  `~` combinator makes the node be before the next sibling, allowing other nodes between them.
  
    // A <header> binds <nav> to follow it
    layout: {
      'header ~': null,
      'footer': null
    }
    
    // On an element with these child nodes
    <footer></footer>
    <header></header>
    <nav></nav>
    
    // Will reorder header and footer
    <header></header>
    <footer></footer>
    <nav></nav>
    
    // BUT, it will not change the following, unlike `+`:
    <header></header>
    <nav></nav>
    <footer></footer>
    
    
  The important thing to know here, is that order combinators do not affect matching, elements are matched like if there were no combinators, and then reordered according those combinators.

## Combinators

  The templates are trees just like documents they represent. An object with template has selectors as keys, and nested layout as values. But there is a way to place child nodes before and after the nodes with usual **combinators**.
  
  Unlike order combinators, these combinators affect matching and do what they do in CSS.
  
  There're a few kinds of combinators, some CSS3 and Slick contributions:
  
  * `+` matches the node after the parent node, OR builds that node there. 
  * `!+` matches the node before parent node, OR builds that node there
  * `~` matches node following parent node, OR builds that node at the bottom of parent node's parent
  * `!~` matches node preceding parent node, OR builds that at the top of parent node's parent
  * `++` matches the node before or after the parent node, OR builds that node after parent node
  * `~~` matches the node around parent node, OR builds that node at the bottom of parent node's parent
  * `>` matches the direct child of parent node, OR builds a child node
  * ` ` (default) matches any node inside parent node or its child nodes, OR builds a child node
    
  So default space combinator does not strictly match child nodes, but all descendant nodes. That leads us to...
  
## Fuzzy matching

  A javascript template is often a last resort, and templates often become obsolete at the writing time. It is especially true for application environments that have their templates mostly rendered on back end. A javascript template suffers both from changes to CSS and HTML and can not be treated as a separate entity. How hard is to wrap the contents of the whole widget in a presentation-layer container without breaking things?
  
  A template like this:
  
    layout: {
      'header': null,
      'footer': null
    }
  
  matches all of these element setups:
  
    <!-- what it would build by default -->
    <header></header>
    <footer></footer>
  
    <!-- a node is nested one into another, and still they match -->
    <header>
      <footer></footer>
    </header>
  
    <!-- nodes are in wrong order and in a container and still match -->
    <div class="wrapper">
      <footer></footer>
      <header></header>
    </div>
  
  Combinators can be used to make template more strict:
  
    // Only matches <header> child element immediately followed by a <footer> 
    // (1st example above)
    layout: {
      '> header': null,
      '+ footer': null
    }
  
## Pseudo elements

  Templates in objects use selectors to match and build nodes. LSD allows to use pseudo element notation as a shortcuts for selectors. There are two entities in framework that provide those shortcuts:
  
  * **Allocations** are general-purpose objects generated and retrieved on demand. 
    * **::container** creates a `div.container` and makes all widget child nodes be appended into that container
    * **::menu** creates HTML5 context menu and proxies all `items` into it, if a widget allocating menu happens to be a `list`. 
    * **::dialog**[:of-kind(kind)] creates a dialog and makes widget invoke it. If a kind was given, it will try to find the template for the dialog.
    * **::scrollbar**[[mode=vertical]] a scrollbar with optional `mode` attribute
    * **::lightbox** creates body[type=lightbox], which should be implemented by a developer
    * **::message** absolutely positioned message attached to the widget
  * **Relations** also provide pseudo elements, but they need to be defined on the widget first. A widget with `:list` pseudo class becomes a list and defines `items` relation. That relation is usually modified by the widget class and defines the selector to match and build the nodes by. So `::items` pseudo class may be used to create an item widget specific to the list.
  
  We take container for example. It's pretty useful, because it allows to wrap content parts of the widget with an element. Even if general wisdom is to keep the templates clean and semantic, there are uses cases when you need one:
  
  * A container element can have its own line-height and font-size, making no side effect on widget element
  * A container may be used as a scrolling canvas as a wrapper of a bigger picture, that is not fully visible
  
  So, let's make a map widget that uses a container:
  
    LSD.Widget.Map = new Class({
      options: {
        'header + ': null,
        '::container': null,
        'footer': null
      }
    });
  
  When a container is allocated, it creates a proxy that redirects all child nodes of an element inside, except elements set in template. So an element tree like:
  
    <article id='map'>
      <ul>
        <li>Brothels</li>
        <li>Churches</li>
      </ul>
      <header>Map of Great Greatness</header>
    </article>
  
  would produce a:
  
    <article id='map'>
      <header>Map of Great Greatness</header>
      <div class='container>
        <ul>
          <li>Brothels</li>
          <li>Churches</li>
        </ul>
      </div>
      <footer></footer>
    </article>
  
  The great thing about it, is that original HTML may have `div.container` and it will be recognized and used, with help of a 'shortcut' of a '::container' allocation.
  
  Following is an excerpt from LSD.Widget.Input.Date implementation. 
  
    layout: {
      'if &:focused': {
        '::dialog:of-kind(input-date)': {
          'button.previous': 'Previous month',
          'button.next': 'Next month',
          'table[type=calendar]': true
        }
      }
    }
  
  It shows a dialog conditionally, only when input is focused. The dialog is defined as a pseudo element and provides a kind. That kind attribute is used to find a template named "input-date" which may augment or redefine the dialog. But there's no named templates in default LSD package, so the joy of dialog customization is left for the developer.

  Although dialog template provides an essential template with two buttons to go back and forth in time and a calendar table. To customize a dialog, developer may provide a piece of HTML as template that is matched against the default table. Fuzzy matched template enables all kind of HTML setups of a dialog.
  
  One way to define a named template is to include it in HTML in a lazy conditional block:
    
    <!-- template input-date -->
    <!--
      <nav>
        <button class='previous'>Previous</button>
        <button class='next'>Next</button>
      </nav>
      <table type="calendar"></table>
    -->
    <!-- end -->
    
  Other way is to create it as a JSON object:
  
    LSD.Template['input-date'] = {
      'button.previous': null,                // set to Previous month
      'table[type=calendar]': null,           // order is different
      'button.next': 'Month after this month' // redefines the default text  
    };
