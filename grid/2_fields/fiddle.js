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
          source: 'grid-list'
        }
      }
    }
  }
});
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



var grid = LSD.document.getElement('grid');

console.group('Information');
console.log('Output all field names of all widgets in grid')
console.log('Object.keys(grid.names)', Object.keys(grid.names));
console.log('Output all fields')
console.log('grid.elements', grid.elements);
console.log('Output all submittable fields (checked checkboxes and inputs that have name)')
console.log('grid.submittableElements', grid.submittableElements);
console.log('grid.submittableElements', grid.submittableElements.map(function(widget) { return widget.source}));
console.log('Output selected items, select one, and output selected items again');
console.log('grid.list.selectedItems', grid.list.selectedItems);
console.log('grid.list.getData()', grid.list.getData());
console.log('grid.list.items[0].select()', grid.list.items[0].select());
console.log('grid.list.selectedItems', grid.list.selectedItems);
console.log('grid.list.getData()', grid.list.getData());
console.groupEnd('Information');
