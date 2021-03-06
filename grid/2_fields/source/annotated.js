/*
  ## Javascript: Make widgets form fields
  
  We added markup for two instances of our custom widget that
  selects one or many items and works as a select box but if all its options
  were shown inline. 
*/
LSD.Widget.Selectlist = new Class({
  options: {
    /*
      Selectlist is a **list**, before all. List relation also defines 
      a **selected** scope (sub-relation), which creates a grid.selectedItems
      array that only holds items that are selected at the time.
      
      Second, it's a form field. **form-associated** pseudo class
      makes form recognize a widget as a field and use it in submission.
      The name for a field comes from a html attribute, so if there's no name
      the field will not be serialized and sent. Sometimes it's useful.
      
      **form-associated** also teaches a widget to work with value. 
    */
    pseudos: Array.fast('list', 'form-associated'),
    tag: 'selectlist',
    /*
      Again, **items** relation is mostly defined by **list** pseudo class, 
      although it's slightly altered to convert &lt;li&gt; children into
      LSD.Widget.Selectlist.Option widgets. 
    */
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
/*
  Option widget is set as **clickable**. There is a global click dispatcher
  routine that serves the event to the willing widgets. Usually, a widget that
  is simply clickable doesnt do anything, it does not even have *.click()* method.
  
  But it's different for **item**s. The list that holds the item, has a specific
  relation to its items. It makes them commands. So as it was said, there're two 
  types of commands defined by "list and item" relation:
  
    * **Radio** - only one item is selected at time
    * **Checkbox** - many items may be selected together
    
  So **clickable** a widget with a **command** will response to clicks and execute
  a command. If it's checkbox, then command will be checked and unchecked on sequential
  clicks, and if it's radio it will be selected only once.
  
  When an item command gets checked, the widget gets selected (selected class is applied
  on element). If an item widget is initialized on an element with "selected" class,
  the command will initiate click, that will select the option in a list.
*/
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
          source: 'grid-list'
        }
      }
    }
  }
});
LSD.Widget.Grid.List = new Class({
  options: {
    tag: 'list',
    /*
      **multiple** attribute sets the list into a "checkbox" mode,
      when there are many items many be checked at once. Grids often
      operate on many items at once, so we force all list widgets
      to have this attribute. If the element didnt have it, it will
      be applied.
    */
    attributes: {
      multiple: true
    },
    /*
      The main list of items on the grid may also be a form field.
      If a list widget will be initialized with a *name* attribute
      (and we added it in markup), it will be serialized on form
      submission.

      But what value is going to be sent? It tries in order:
       
      * **value** attribute (html forms)
      * **itemid** attribute (microdata)
      * **innerText** property (select options)
      
      We used itemid attribute with a username of a person, so serialized
      query string looks like this in case both of people are selected:
      
      `?people[]=ibolmo&people[]=subtleGradient`
    */
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
      /*
        Grant each item one checkbox. It will be accessible as
        item.checkbox 
      */
      one: {
        checkbox: {
          selector: 'input[type=checkbox]',
          /*
            states.get option links the "selected" state of item
            to a "checked" state of a checkbox. So whenever item 
            is selected, checkbox is checked.
          */,
          states: {
            get: {
              'checked': 'selected'
            },
          /*
            states.set makes item widget to check its checkboxes
            whenever it gets selected.
          */
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
/*
  Add one more mutation to document options that will
  convert any &lt;ul&gt; with name attribute inside &lt;nav&gt; element
  into selectlist widget  
*/
    'nav ul[name]': 'selectlist'
  }
});
/*
  Time to test the grid
*/
var grid = LSD.document.getElement('grid');

console.group('Information');
/*
  All widgets with names are automatically registered in a form in a special
  names object that has widgets as values and their names as keys. 
*/
console.log('Output all field names of all widgets in grid')
console.log('Object.keys(grid.names)', Object.keys(grid.names));
/* 
  There's also an .elements array that holds all form-associated widgets
*/
console.log('Output all fields')
console.log('grid.elements', grid.elements);
/*
  Submittable widgets are the ones that have name AND they are eligible to send.
  E.g. if it's a checkbox or radio, it should be checked to be listed in this collection 
*/
console.log('Output all submittable fields (checked checkboxes and inputs that have name)')
console.log('grid.submittableElements', grid.submittableElements);
console.log('grid.submittableElements', grid.submittableElements.map(function(widget) { return widget.source}));
/*
  Selected items are magically tracked for you. Select one item and it ends up in 
  .selectedItems array. 
  
  The list widget also has name, so it's submittable. That is why .getData method returns
  the list selection serialized.
*/
console.log('Output selected items, select one, and output selected items again');
console.log('grid.list.selectedItems', grid.list.selectedItems);
console.log('grid.list.getData()', grid.list.getData());
console.log('grid.list.items[0].select()', grid.list.items[0].select());
console.log('grid.list.selectedItems', grid.list.selectedItems);
console.log('grid.list.getData()', grid.list.getData());
console.groupEnd('Information');