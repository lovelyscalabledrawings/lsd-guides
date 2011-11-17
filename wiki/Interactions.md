# Interactions

## Why need to invent

The reason why DOM frameworks became so popular in recent years is simple: it enables everybody write dynamic scenarios for their websites and chain them together. Javascript's functional nature works really good when we need to split execution down to steps and execute them in order:

* When I click at submit button...
* Form gets asynchronously submitted
* Replace #content element with response
* Fade it in
* After that, fade out the form

The usual approach is something along these (mootools, pseudocode) lines:

    var form = document.getElement('form');
    button = form.getElement('button[type=submit]');
    button.addEvent('click', function() {
      form.send(function(response) {
        var fragment = document.createFragment(response);
        var content = document.id('content');
        document.id(fragment);
        content.parentNode.replaceChild(fragment, content).fade('in').chain(function() {
          form.fade('out');
        })
      })
    })

DOM frameworks have functional but somewhat sparse tools. It's not the worst possible code, but it is a:

  * **glue code** - A spaghetti of different domains connected together to make something useful. Event listener, submission flow, data retrieval, an update and animation in only a few lines of code.
  * **nested callback hell** - The only way to set flow is to nest callbacks. When there are more layers added on top, like error handling and branching, it gets even worse. Some people are trying to solve the problem by introducing pseudo-continuations, promises and other functional abstractions and compositions, but at the heart of all it still stays ugly and slow.

## Chains

Another approach is to look at the scenario in a more abstract way. We could try to represent scenario as a **chain** of commands to apply an **action** on a **target**.

* When I click at the button...
* Form gets asynchronously submitted
  `(target: form,     action: submit)`
* Update #content element with response
  `(target: #content, action: replace)`
* Fade it in
  `(target: #content, action: display, state: true)`
* After that, fade out the form
  `(target: form,     action: display, state: false)`

The **chain** executes as it reads - from top to bottom. When it reaches asynchronous step (like submitting a form), it stops execution until it gets the successful response. The response is passed to the next step, and the chain goes on.

Every time a chain starts or continues after the break, it does so with arguments. An action that requests data will continue the chain after request is done and pass the response to the next action. And that action should make use of that response, because following actions will not be able to access it anymore.

## Actions

LSD has around 20 built in actions that can be executed on widgets and elements.

### Synchronous actions

Some actions can be executed right away and they will not need to wait until something is finished. Those are **synchronous** actions.

#### Irreversible

For those what's done is done. There's no way back, and there's no need to.

* **Update** - updates a node with the new content. Often used as callback to actions that request data. **Update** itself empties the node and puts the new content in. But there's the whole family of self-content update actions:
   * **Replace** - replaces a node with the given content. It doesn't matter if content has more nodes than one.
   * **Append** - put the given content at the *bottom* of the node
   * **Prepend** - put the given content at *top* of the node
   * **Before** - put content before the node
   * **After** - put content after the node

* **Clone** - clones a tree and insert it below original. When an input with index in name (like `person[organizations][1]`) is cloned, the containing form will increment the index until it finds an untaken one. This action allows all kinda of clonable field sets possible.

* **History** - grabs a node's `href` or `action` attribute and makes a history checkpoint as if the link was visited. Back button will return to the original url (or a previous checkpoint)

* **Set** - Set a node's value to a object given in arguments. If the node is an input, the `value` attribute will be set. If the node is marked with microdata and the argument is object, the microdata `item` will be set and all matched `itemprop`s will be updated. If it's a simple node, the innerHTML will be set.


#### Reversible

The actions that can be undone are called **reversible**. They are often are executed in indeterminate state. That means, that the action is specified, but wether it should be done or undone, is upon action.

* **Toggle** - toggles the checkbox state. LSD makes use of HTML5 commands abstractions, so most checkbox may not look like them. For example, selecting an item in a list can be done with `check` too. Toggle will either **check** if target is unchecked, or **uncheck** otherwise.

* **Counter** parses any HTML element and if it contains a phrase like "10 comments", the action will increment it (and pluralize the word). It's pretty smart and will still work even if the number or the noun is wrapped into some html tag. The opposite of that is **Decrement** action, that reduces the found number by one.

  Defines **Increment** and **Decrement** actions as aliases.

* **State**(name) - changes the state of the node. Requires state name argument. If a node is an element, the action will toggle the class with the name of the state. If it's a widget, it will try to set the state with that name.

* **Focus** - focuses the node. Provides **Blur** action alias that does opposite.

#### Possibly asynchronous

Some actions are only asynchronous on condition.

* **Delete** - removes a tree of nodes from the DOM. If the deleted node is a `resourceful` widget (`itemtype`, `itemscope` and `itemid` are set), it sends a DELETE request to `itemtype`, stops chain execution and continues only if request comes backs successful. For nodes that are not resourceful widgets, it simply disposes the target synchronously and continues.

* **Display** - hides or shows the node. It toggles display state of the node usually. But if the node is a widget, action calls `hide` or `show` methods on it. Widget may decide to use animation to hide or show and return animation object back to action. In that case, the action will be considered asynchronous and execution chain will be broken until animation is complete.

  Defines **Show** and **Hide** actions as aliases.

### Asynchronous actions

An action that triggers some process and waits until's done is called **asynchronous**. It breaks the execution chain and proceeds only when the waiting is over. Asynchronous action may not be reversed, but it may be cancelled while in progress.

* **Submit** - triggers submission for element. Submission is applicable to a:
  * **submittable** node like `form` or `dialog`.
  * **link** node or a widget that has either `href` or `src` attribute
  * **clickable** node. Submission calls `.click()` method on it.
  * **resourceful** widget with HTML5 microdata `itemscope` & `itemtype` attributes. Submission of a resourceful widget without `itemid` attribute result in a POST to the url in `itemtype`. Submission of widget with `itemid` will result in a PUT to `itemtype`/`itemid`. In other words, it a resource with `itemid` attribute is considered saved.

* **Dialog** - clones a target node with all its children and displays it as dialog. Proceeds only when dialog is successfully submitted.

* **Edit** - turns a node into an editable form. It converts all microdata-marked elements with `editable` attribute and turn them into a form fields. The form will submit the resource and update it and hide itself upon getting successful response.


## Create action chain

### Chain in options

Defining a chain in options is pretty straightforward. **chain** option accepts an object of *links* with keys of labels and values of functions that return the **link** objects.

A link is a simple object with `target` and `action` properties. If there's no target given or a link is a string, it uses the widget itself as the target.

Let's see how a form that updates #content element may be implemented:

    LSD.Widget.Form = new Class({
      options: {
        pseudos: ['fieldset', 'form'],
        chain: {
          submission: function() {
            return {target: this, action: 'submit'}
          },
          update: function() {
            return {target: document.id('content'), action: 'update'}
          }
        }
      }
    });
    var form = new LSD.Widget({tag: 'form'});
    form.callChain(); //sends form, updates #content

A form submits itself and breaks the chain. When it gets the response, it continues the chain and updates the element with the content from the previous step (passed to `update` action behind the scenes). Chain execution is triggered with `callChain()` method. Usually it's done under the hood, but we'll get to it later.

### Commands

Most of the interactive elements on the page execute their actions in response to a user interaction. Checking the checkbox on can check the dependent checkboxes, or clicking a button can open a dialog.

There is a good abstraction to this in HTML5 commands spec. It says, basically, that each widget on the page may have one command. Each widget has its way trigger the command (click the button, change text value), but a single widget has a single outcome.

A typical command has name, **type** and **action**. There are three types of the commands:

  * **Command** - is a irreversible action. Sending a form is an example of that.
  * **Checkbox** - reversible action that can be done and undone by repeating interaction.
  * **Radio** - a "choose one" kind of a action. Checking item in a group, unchecks others.

Every interactive widget on the page falls into one of the three groups. For example `<select>` is a radiogroup of `<option>` commands, and `<select multiple>` is a set of checkbox commands defined by `<option>` elements.

Often widgets don't have a specified command and they figure it out from the widget configuration. For example, a widget with a `href` or `action` attribute is considered as a widget that sends requests by LSD. And this recognition also defines the **action** of a command.

So given that we use `form` widget with `action` attribute that turns it asynchronous, we make form define a command that will
have `submit` as its action. `command` pseudo class makes widget generate command.

    LSD.Widget.Form = new Class({
      options: {
        pseudos: ['fieldset', 'form', 'command'],
        chain: {
          update: function() {
            return {target: document.id('content'), action: 'update'}
          }
        }
      }
    });
    var form = new LSD.Widget({tag: 'form'});
    form.callChain(); //sends form, updates #content

The submission link was removed, but the form is still sent when .callChain() is called.

And there's still an `update` action that has a hardcoded `target` element which makes it hard to reuse in different situations. But there's a solution to that.

### Chain in target expressions

In a perfect world there is a small number of distinct entities and infinite possibilities to composite them. But the burden of quick thinking composition is often legacy code and inflexible ad-hoc solutions that take more time to change, than to rewrite from scratch.

And here you should demand more - a way to tie pieces together in a way that does not leave any code behind, and **target** selectors are the solution.

Previous examples used an `#content` element to be updated with response that comes from the widget, like this:

    <form action="/people" transport="xhr">
      <button type="submit">Submit</button>
    </form>
    <div id="content"></div>

In a regular html a layout like the following would send a form into a new tab:

    <form action="/people" target="_blank">
    </form>

LSD reuses `target` attribute to access other nodes on the page and even call actions on them. In the following example, a form generates the same action chain (submit & update) as before, but it doesnt have any of those defined in the class itself.

    <form action="/people" transport="xhr" target="$$ #content">
      <button type="submit">Submit</button>
    </form>
    <div id="content"></div>

    LSD.Widget.Form = new Class({
      options: {
        pseudos: ['fieldset', 'form', 'command']
      }
    });

    var form = new LSD.Widget(document.getElement('form'));
    form.callChain();

As you can guess, `target` attribute also defines the action with the target retrieved by selector in attribute. The default action for asynchronous widgets is **update**, but it can be overridden in the selector itself:

    <form action="/people" transport="xhr" target="$$ #content :append()">
    </form>

Let's take a closer look at selector.

    $$ #content :append()
    ^  ^         ^- and append content to it
    |  '- element with id=content
    '- Find in <body>

It reads as "`append` content to `#content` element". The two-dollar is a special **combinator** and it means "document.body". There are 4 combinators like that:

  * **&&** (default) - Find in root widget. Finds widget in LSDOM.
  * **&** - Find in this widget.
  * **$$** - Find an element in document.body
  * **$** - Find elements in this element.

>The part at the end is a name of the action. Parenthesizes is optional, but it's there for a better readability. The action should be separated from selector with space.

Multiple selectors may be separated with comma in one expression. Each selector and action is converted into **chain link** where they are executed in order.

When the action is not set in expression, the default target action is used for the widget (and for asynchronous widgets it's `update`).

A few examples of other `target` values:

    target="grid item :delete()"
    // Delete all items in the grid

    target="& :toggle()"
    // Make widget toggle its checkedness (applicable to checkboxes)

    target="$ + a :submit(), $ :hide()"
    // Submit the next element to this node (which is a link), and hide the node after it's done

When the only thing that glues widgets together is a selector in template, and the actual widget classes are clean, it is easy to maintain and change. So if someone changes markup in the application, he can change selectors accordingly without looking for the right place in myriads of javascript files.

## Pseudos

In order to be able to manipulate your objects in a more intuitive way, you can use several pseudos. They work perfectly in a combination with the rest of selectors, and solve most of the traditional problems.

There are following pseudos:
  first-of-class: matches the first element of the given class
  last-of-class: matches the last element of the given class
  only-of-class: matches the element, if it's the only element of the given class

You can combine them to get the desirable result, for example:

   target = "&& fieldset:last-of-class(address) :clone()"
   // Find the last possible fieldset that has an 'address' class in given scope, and clone it.

   target = "&& fieldset:first-of-class(address) :clone()"
   // Likewise, find the first fieldset that has 'address' class in the given scope, and clone it.

   target = "&& fieldset:last-of-class(address):not(:only-of-class(address)) :delete()"
   // Find the fieldset that has an 'address' class, and delete it, if it is not the only element that has 'address' class in given scope

Using these principles you don't have to write complex JavaScript logic to manipulate DOM anymore. Most of the things are easy to cover using that powerful concept, combined with the other ones described in that chapter.

## Promises

A button that submits the form and waits for the response from back end is easy. A button that submits many forms is way more sophisticated. There's no good reason to submit many forms at once, but the chances are you happened to delete many things at once.

`Delete` is one of the actions that may be asynchronous if the element has the right attributes. So whenever LSD decides that element it deletes is resourceful, it sends a DELETE request and halts chain execution.

When `delete` action is invoked on many targets at once (via selector that matches multiple targets), some of the targets (or all of them) may be resourceful and send a deletion request. In that case, the chain will wait for all the requests to complete, before chain goes forward.

It's pretty useful in an expression like this:

    `grid item::selected :delete(), grid :submit()`
    // When every selected item is deleted, update the grid once

## Priority chains

The links in chain are executed in order, but the order of the links can be changed to make some actions appear earlier in the chain than they otherwise should be. Each link can have a priority. It is a number, the higher priority is, it earlier link executes.

The order in which actions are executed by default is this:

  1. Before-actions, priority 50 (e.g. "Are you sure?" dialog)
  2. Command action, priority 10 (e.g. Submit the form)
  3. Target action,  priority 0 (e.g. update element specified in `target` with response)
  4. Other actions specified in chain
  5. After-actions, priority -50

Priority is easily set in options:

    {action: 'delete', target: this, priority: 5}
    // will insert action between 2) and 3)

And there is a way to tell a `target expression` to define **before** or **after** action with a keyword in the beginning:

    target="#content :delete(), before #content :hide()"
    // will hide #content before it will delete it

## Picking up the chain

So far we've used `callChain` to execute the chain. For our form, it triggered both `submit` and `update` actions. But forms have `submit` method, why can't we simply do a `form.send()` instead of `form.callChain()`?

In fact, there's no reason. `submit` is the action that is defined by form's `command`, it is executed with priority 10. What we can do here, is to submit the form with `form.submit()`, get the response and only execute links in chain that have priority 0 or less. And the code that sends widgets asynchronously does it.

So that means, that if you call `form.callChain()`, the whole chain of actions will be processed. But if you do `form.submit()` only the optional part of the chain will run, submission will happen before the chain.


## Forking

A chain has the beginning and the end. After a chain is complete, it stays in its "complete" state until you decide to call the chain again, which will rewind it to the beginning. Sometimes the action chain of one widget is not enough to describe a complex relation.

A button that submits form, then form submits dialog, then dialog submits the link it was attached to.

In this situation, a chain ends on calling a chain of another widget. And the only action that forks off execution of another chain
is **Submit**.  You can submit pretty much every widget. It will:

  * Submit widget if it's submittable. A dialog or a form will start their own chains that way.
  * Send widget, if it's asynchronous. Then it will pick up and start the optional chain.
  * Click widget, if it's clickable. Clickable widgets execute their commands and chains on click.
  * Just call the chain, if there's one. If everything else fails, it'll just call the chains.

Actually, simply calling chain (4th point) would work on any of the groups first three points and still execute the actions. The reason why it does not do it, is because a widget can have its own semantics in terms of what to do and how to react to interactions. It leaves more freedom in how widget should be implemented.

And if you'll try to submit an element and not a widget, it'll try the same three things - `submit()`, `send()` or `click()`.


## Branching

It's all fun and games, until you have to sensibly handle errors from asynchronous requests. What makes it harder is the fact that some of requests may fail and some may not at the same time, leaving us with both "success" and "failure" outcomes at once.

LSD uses two keywords for links that make branching

  * **or** - executes action on each failed item
  * **else** - executes action after all requests are complete IF any of requests failed

And two for links that alter the specify the execution model
  * **and** - called for items that returned success
  * **then** - (implied when there's no keyword) waits for all, and only executes action if atleast on request has succeed.

Each comma separated part of the `target` selector may have one keyword (followed by whitespace) in the beginning.

    target="grid items :delete(),
              or :invalidate('Item can not be deleted'),
              else grid :invalidate('There were failures'),
            grid :validate('All cool'),
            grid :update()"

If a selector starts with a keyword, it gets bound to the closest asynchronous action to the left of it. Will it be executed or not depends on the outcome of asynchronous event.


### Callbacks executed preventively

  Most of the asynchronous chains have their asynchronous action followed by a callback that is not triggered until the asynchronous action results in successful outcome. The following is a pretty typical scenario:

  * A user clicks "Follow" link, waits for a second, and then the state changes.
  * A user clicks "Unfollow" link, waits for a second, it changes again
  * A user clicks "Follow" link, waits for a second, request fails. State was not changed. Show error message

  A user waits 1 second every click, because he has to know if request was successful or not. And users kind of expect waiting, but only because the web technologies dictate the user experience and the delay is taken for granted.

  When a developer approaches the problem and wants his callbacks (and state changes) be applied instantly, he leaves just another pile of glue code behind, because he has to handle errors, undo callbacks, show messages all by himself and hardcoded.

  But in the world of reversible actions things are different. There is an **and** keyword that links a callback to asynchronous action and rolls back if it fails. How does it work?

    <a href="/follow" transport="xhr" target ="and $$ :state(followed), or $ :invalidate('Failed to follow'), #content">Follow</a>

  A link widget like this will generate three links in the chain (pseudocode):

    chain: {
      submission: function() {
        return {target: this, action: 'submit'}
      },
      instantcallback: function() {
        // this is applied just a little bit after the submission request is made
        // state is a reversible action, so failed request can simply undo it
        return {keyword: 'and', target: document.body, action: 'state', arguments: ['followed']}
      },
      errorhandler: function() {
        // shows error message on element with content that came from failed request
        // if it didnt have on error string from arguments, it would use the failed response as error message
        return {keyword: 'or', target: this.element, action: 'invalidate', arguments: ['Failed to follow']}
      },
      update: function() {
        // Only happens if request is successful
        // Gets the response and updates the target with it
        return {action: 'update', target: document.id('content')}
      }
    }

  So a request that fails would make those steps:

    * Submit a link
    * Apply "followed" state on body instantly
    * Receive unsuccessful response
    * Unapply "followed" state on body
    * Invalidate the button element with a message 'Failed to follow'

  Why is this important? because there's no code at all to do all that and interaction happens seemingly instantly for the user.