# Widgets

Widget is a smallest entity in the framework. Each powers up a single interactive element on the page. But at the same time widgets have the richest API all things LSD are focused on widgets, documents of widgets and relations of widgets.

Some of the things LSD offers are perhaps already in the modern browsers, but they are not exposed to public. The visible part of the DOM is strictly regulated in HTML5 specification and additions to it take painfully much time to adopt in mainstream browsers.

Widget is a DOM Element's twin brother. Its API is designed to follow Element behavior closely. Many of the tools that work with elements work with widgets just as well and may not know a thing about powerful widget nature of the  object they were given. The resemblance can be seen in structure too:
                                                                                       
                             | Element                 | Widget                  
                             ---------                 ---------
    Base class name          | Element                 | LSD.Widget              
                             
    Tag-specific class name  | Element class           | Widget role             
                             
    (static & hidden in DOM) | (FormElement)           | (LSD.Widget.Form)       
                             
    Element interfaces       | Interface               | Mixin                   
    (not exposed in DOM)     | (ElementFocusable)      | (LSD.Mixin.Focusable)   
                             
                             
    Document class name      |  Document               | LSD.Document            
                             


So there are three tiers that define a node's behavior. I'll use the word `node` where both widget and element is applicable.

  * **A base class** is what all nodes have in common. Methods to set attributes and events, adopt and remove children.
  * **A role** - a lot smaller part that has logic to do things specific to the **node tag name**.
  * **Mixins** - a bits of behavior that may be applied conditionally, e.g. setting `tabindex` makes a node focusable. 

The only tier that may not be shared across different nodes is **role**. It is a class that stacks upon the base tier and defines node's relations, purpose and reactions to events. 

The main purpose of LSD is to initialize all widgets on the page. It walks through the whole document and inspects every element on its way if it may be interpreted as widget or not. If an element is found to be a widget, LSD creates a widget instance attached to that element. Then LSD continues to inspect that widget element's children, to find even more widgets.

## Anatomy of widget

The role is the the only tier that is specific to widget, and it also is the thinnest tier. A role often only defines options and event listeners, inheriting other things from base widget.

The interesting thing here is that a role applied on top of already initialized widget, not before. So roles are not real classes, they are a lightweight modules that may extend a single instance of a widget.

Mixins are similar to roles in a way that they are only applied to instances of widgets and in runtime. The difference is that they are more general and can work as a part of a different widgets.


### Mixins

A mixin is module that gets applied to widgets conditionally. Each mixin has it's own condition which triggers the inclusion specified with a selector. LSD watches the DOM for those selectors, and applies them in realtime:

  var widget = new LSD.Widget;
  widget.focus // undefined
  widget.setAttribute('tabindex', 0);
  widget.focus();

As you can see, there's no explicit trigger that makes the widget focusable. It just becomes so when attribute is set.  
  
Let's make a quick overview of mixins available out of the box:

  * Command `:pseudo`
    Makes widget generate command. A command is a useful abstraction that can be used for widget action composition and accessibility.
  * Request `[target], [href], :form[action]`
    Allows widget to send requests. If a widget has `transport` attribute set to `xhr`, they will be asynchronous.
  * Target `[target]`
    Initialize an action chain by parsing a `target` attribute. Read more in the [Interactions](Interactions) chapter.
  * Focusable `[tabindex][tabindex!=-1]`
    Turns widget into a focusable widget. For old versions of safari that don't support focusing of a random DOM node, it uses a QFocuser workaround that creates an invisible focusable input inside of that node. So it works for all elements. 
  * List `:list`
    Makes widget a list and its children items. One or many items can be selected at once.
  * Value `:form-associated, :value`
    A widget can have value to keep it or send it to back end. All form inputs have this by default.  
  * Validity `:form-associated, :value`
    Validates a field according to html5 validation spec. 
  * Fieldset `:fieldset`
    Widget becomes aware of the inputs inside of it. It keeps name index, handles inputs being cloned and serializes widget values before form submission 
  * Root `:root`
    A root widget makes all descendant widgets know that they belong to that root. When a widget inside that root will need to fetch other widgets from DOM, it will look in that root widget.
  * Submittable `:submittable`
    A submittable widget exists to request additional data or pass execution to the related widget. A dialog, a form and a submit button are all examples of a submittable widget.
  * Resource `[itemscope]`
    Every microdata-rich widget will be able to work with a resource representation of it, update, create or delete it. It uses a simple clientside REST-ORM called mootools-resource.
  * Uploader `:uploader`
    Creates an asynchronous uploader that uses mootools-uploader (HTML5, Flash or Iframe method) to upload files. There may be many nodes that open the "Browse files dialog" related to one uploader.
  * ContentEditable `[contenteditable]`
    Makes widget a wysiwyg editor. It uses a compact version of CKEditor loaded asynchronously.
  * Sortables `:sortable`
    Makes its children with `:reorderable` pseudo class be sortable withing the widget.
  * Draggable `[draggable]`
    Makes widget draggable. It may have a widget dedicated to be the dragging handle
  * Resizable `[resizable]`
    Makes widget resizable. A separate handle is usually a good idea
  * Scrollable `[scrollable]`
    Shows custom scrollbars whenever the content overflows the widget. 
  * Touchable `:touchable`
    Makes widget respond to touches and set `active` state when it's being held
  * Placeholder `[placeholder]`
    Implements placeholder attribute in browsers that dont support it.
    
### Other behaviours without a dedicated mixin

  * :clickable
    Makes widget respond to `click` event
  * :activatable
    Makes widget respond to `mousedown` event.
  * :form-associated
    Associates widget with form. A widget then know which form it is in, and the form will be able to submit that widget as value
  * :reoderable
    Makes a widget reoderable in a sortable list
  * :uploading
    Makes widget show "Browse files" dialog when the parent widget is uploader