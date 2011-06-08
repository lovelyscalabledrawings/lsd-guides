IAS.Widget.Selectlist = new Class({
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
IAS.Widget.Selectlist.Option = new Class({
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
          mutate: '> ul',
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
          mutate: '> li',
          source: 'grid-list-item'
        }
      }
    }
  }
});
LSD.Widget.Grid.List.Item = new Class({
  options: {
    tag: 'item',
    pseudos: ['item'],
    has: {
      one: {
        checkbox: {
          selector: 'input[type=checkbox]'
        }
        states: {
          get: {
            'checked': 'selected'
          }
        }
      }
    }
  }
});
new LSD.Document({
  mutations: {
    '.grid': 'grid',
    'ul[name]': 'selectlist'
  }
});
