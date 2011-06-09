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
    pseudos: ['list'],
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
    pseudos: ['item']
  }
});
new LSD.Document({
  mutations: {
    '.grid': 'grid'
  }
});
console.group('Information');
console.log('Items found in document:')
console.log('document.getItems()', document.getItems());
console.log('Number of items in list')
console.log('LSD.document.getElements("grid list item").length', LSD.document.getElements("grid list item").length);
console.log('LSD.document.getElement("grid").list.items.length', LSD.document.getElement("grid").list.items.length);
console.log('Widget tag names in document')
console.log('LSD.document.getElements("*").map(function(w) { return w.tagName })', LSD.document.getElements("*").map(function(w) { return w.tagName }))
console.groupEnd('Information');
