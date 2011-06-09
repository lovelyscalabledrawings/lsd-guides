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
  item allowed in a group (when list is a radiogroup) 
*/
          events: {
            set: 'onSelectionChange',
            unset: 'onSelectionChange'
          },
/*
  Callbacks are events, that called when a related widget is found or lost.
*/
          callbacks: {
            add: 'onSelectionChange',
            remove: function() {
              this.empty();
              this.onSelectionChange()
            }
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
LSD.Widget.Grid.Bar = new Class({
  options: {
    tag: 'bar'
  },
  
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