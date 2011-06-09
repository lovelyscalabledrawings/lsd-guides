LSD.Widget.Selectlist = new Class({
  options: {
    pseudos: Array.fast('list', 'form-associated'),
    tag: 'selectlist',
    has: {
      many: {
        items: {
          mutation: '> li',
          source: 'selectlist-option'
        }
      }
    }
  }
});
LSD.Widget.Selectlist.Option = new Class({
  options: {
    tag: 'option',
    pseudos: Array.fast('item', 'clickable')
  }
});
LSD.Widget.Grid = new Class({
  options: {
    tag: 'grid',
    pseudos: ['form', 'fieldset'],
    has: {
      one: {
        list: {
          selector: 'list',
          mutation: '> ul',
          source: 'grid-list',
/*
  A widget with **list** pseudoclass will fire `set` event
  when an item is *selected* and ind `unset` when it is unselected.
  
  Keep in mind, that `unset` event is not fired when another item
  is going to be selected right after, if there is only one selected 
  item allowed in a group (when list is a radiogroup).
  
  Strings as values are method names that are bound to the widget.
  So both `set` and `unset` method will trigger grid.onSelectionChange
*/
          events: {
            set: 'onSelectionChange',
            unset: 'onSelectionChange'
          },
/*
  Callbacks are the special events that happen with the relation.
  
  * `add` callback is fired when there is a widget found that satisfies
    the conditions to be related.
  * `remove` is triggered when the widget that used to be related 
    can not be related anymore (e.g. it was removed from the document
    or doesn't have required `item` pseudoclass anymore)
*/
          callbacks: {
            add: 'onSelectionChange',
            remove: 'onSelectionChange'
          }
        }
      },
/*
  Bar is either a **header** or **footer** element
  that is nested right into the grid. An array of bars
  is accessible as grid.bars
*/
      many: {
        bars: {
          selector: 'bar',
          mutation: '> header, > footer',
          source: 'grid-bar'
        }
      }
    }
  }
});
/*
  Bar widget is a grid toolbar. It holds buttons that do actions on items
  and a checkbox that selects all items.
*/
LSD.Widget.Grid.Bar = new Class({
  options: {
    tag: 'bar',
    /*
      **chain** option is a way to define a queue of actions
      to be executed in widget's chain routine. 
      
      `target` attribute selectors in templates do exactly this
      under the hood. 
      
      A single item in a chain is called **link**. Links can be of 
      the following types:
      
      * **Synchronous action** executes an action on target and
        immediately calls the next link for execution.
        
      * **Asynchronous action** has to wait until it's over to 
        pass the execution to next links. Sometimes, these actions
        may result in either success or failure, thus defining
        which links exactly will be executed.
        
      * **Arguments** link does no real action, but it prepares
        arguments for the next link. That kind of link, for example,
        retrieve and pass extra data for submission.
    */
    chain: {
      /*
        Perform link will be called when the button is clicked. But
        what is that action it should do to selected items?  
        
        A link is a function that defines which action is going
        to be called on which target and when. When chain is called,
        all links are called and actions get sorted by their priority.
      */
      perform: function() {
        /*
          Since the buttons are form associated, they can use `this.form`
          shortcut to access grid. `this.form.list` returns the list associated
          to parent grid.
          
          If a button has custom `action` attribute, the action with
          that name will be executed on selected items.
        */
        if (this.attributes.action) {
          return {name: this.attributes.action, target: this.form.list.selectedItems};
        /*
          Otherwise, serialized list data is left for the next action in chain
          that is a button submission. The button later gets sent to its
          `href` location using XmlHTTPRequest (if `transport` attribute is set to `xjr`)
          with the selected list ids in paramters. Request may look like this:
          
          POST /people/delete?people[]=ibolmo&people[]=subtleGradient
          
          where `people` is the name of the list and `ibolmo` is the id
          of selected item. `/people/delete` comes from the `href` attribute 
          of a button. And method (that is `POST`) is specified with `method` attribute.
        */
        } else {
          return {arguments: {data: this.form.list.getData()}, priority: 10}
        }
      },
      
      /*
        `refresh` link will trigger re-submission of a grid and will fetch new items.
        This is useful if the items are paginated. After one item gets deleted, 
        newly received items will fill the blanks. Response may also include updated
        paginator links and counters.
        
        The idea is to take action on items, and then receieve updated items back. 
      */
      refresh: function() {
        return {
          target: this.form,
          action: 'submit'
        }
      }
    },

    has: {
      /*
        ## Select all checkbox
        
        A bar may have a checkbox that will select all items in a grid list
        on check and unselect all items if on uncheck.
      */
      one: {
        checkbox: {
          selector: '> input[type=checkbox]',
          /*
            `bulkselect` is a link that putsa "check" action into a chain. 
            The target of action is set to all checkboxes of all items in
            the list. 
            
            Link also specifies `arguments` for the action as `this.checked`.
            This will change item checkboxes checkedness state to whatever
            checkedness state of bulk selecting checkbox is. So this action
            may be used both to uncheck and check items.
          */
          chain: {
            bulkselect: function() {
              if (this.form.list) ; 
                return {target: this.form.list.items.map(function(item) {
                  return item.checkbox
                }), action: 'check', arguments: this.checked};
            }
          }
        }
      },
      many: {
        buttons: {
          selector: 'button',
    /*
      `states.set` option mirrors `disabled` state of the bar on to
      its buttons. So whenever bar gets disabled or enabled, buttons
      inside of it do the same.  
    */
          states: {
            set: {
              'disabled': 'disabled'
            }
          },
    /*
      If you remember, `form-associated` pseudo class makes form 
      (and the grid is a form) recognize the widget as its element. 
      
      Usually, it is used to add values to form's dataset, but 
      here buttons dont really have values. 
      
      The other effect of widget being form associated, is that
      it recieves `widget.form` property that makes form (and grid)
      easily accessible for buttons. It will be used below. 
    */
          pseudos: ['form-associated']
        }
      }
    }
  },
  /*
    Our first real method (we didnt write any so far), will be a callback. It is defined
    as an instance method for ease of binding. So this function can be used as a listener
    for events on other widgets and objects and still have `this` pointing to grid widget.
    
    There're two item collections that relations maintain for us:
    
    * **items** contains all items in a list
    * **selectedItems** is a filtered subset of items that are selected now.
    
    So the the method does two things:
    
    * It disables bars if there're no items selected in list
    * It checks bar checkbox on if all items in a grid are selected and checks it off
      if atleast one item is not selected anymore.
  */
  onSelectionChange: function() {
    var selected = this.list ? this.list.selectedItems.length : 0;
    var items = this.list ? this.list.items.length : 0;
    if (items == selected) var mode = true;
    else if (items == selected + 1 || !selected) var mode = false;
    else return;
    return this.bars.each(function(bar) {
      bar[selected ? 'enable' : 'disable']();
      if (mode != null) bar.checkbox[mode ? 'check' : 'uncheck']
    })
  }
})
LSD.Widget.Grid.List = new Class({
  options: {
    tag: 'list',
    attributes: {
      multiple: true
    },
    pseudos: ['list', 'form-associated'],
    has: {
      many: {
        items: {
          mutation: '> li',
          source: 'grid-list-item'
        }
      }
    }
  }
});
LSD.Widget.Grid.List.Item = new Class({
  options: {
    tag: 'item',
    pseudos: ['item', 'clickable'],
    has: {
      one: {
        checkbox: {
          selector: 'input[type=checkbox]',
          states: {
            get: {
              'checked': 'selected'
            },
            set: {
              'selected': 'checked'
            }
          }
        }
      }
    }
  }
});
new LSD.Document({
  mutations: {
    '.grid': 'grid',
    'nav ul[name]': 'selectlist'
  }
});