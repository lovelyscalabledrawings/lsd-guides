/* 
  # Set up widget classes
  
  A grid is actually a form, if you look at it. It has various
  fields that define how data is filtered, just like form do.
*/


LSD.Widget.Grid = new Class({
  options: {
    tag: 'grid',
/*
  **fieldset** pseudo makes widget know about related form elements
  and use them. **form** pseudo makes fields know that this widget
  is their form.
*/    
    pseudos: ['form', 'fieldset'],
/*
  The main function of a grid is to operate over a list of items.
  Has-one option defines a singular relation on a widget named *list*
  
  **selector** expresses the criterias on which widget would match.
  Here it's simply a *list* which means that it will look for a widget
  with *list* tagName.
  
  When the widget is matched for a singular relation, it becomes 
  accessible as grid.list.
  
  **mutate** option serves the purpose of converting grid's child 
  &lt;ul&gt; element into a list widget. 
  
  **source** here specifies the widget class. so *grid-list* 
  often means LSD.Widget.Grid.List. 
*/
    has: {
      one: {
        list: {
          selector: 'list',
          mutate: '> ul',
          source: 'grid-list'
        }
      }
    }
  }
});

/*
  The list widget is pretty simple. It consists of a widget
  definition, pseudoclass that turns it into a list mode,
  and a mutation on items. The important thing here, is that
  it could very well be a table with 'table' as tag and 'tbody > tr'
  as mutation. 
*/
LSD.Widget.Grid.List = new Class({
  options: {
    tag: 'list',
/*
  **list** pseudo makes widget aware of *items*, usually its direct 
  child widgets. They become accessible as list.items array.
  
  Once again, mutation sets all "li" children as item widgets of 
  LSD.Widget.Grid.List.Item class.
*/
    pseudos: ['list'],
    has: {
      many: {
        items: {
          mutate: '> li',
          source: 'grid-list-item'
        }
      }
    }
  }
});

/*
  **item** pseudoclass doesn't do much to widget itself, but
  make it findable by parent list widget.
*/
LSD.Widget.Grid.List.Item = new Class({
  options: {
    tag: 'item',
    pseudos: ['item']
  }
});

/*
  New document will set domready callbacks,
  traverse the document element, and set the body widget.
  
  Mutations will be transferred to body widget, so whenever
  an element with 'grid' class is found, it gets converted into 
  grid widget. 
*/
new LSD.Document({
  mutations: {
    '.grid': 'grid'
  }
});