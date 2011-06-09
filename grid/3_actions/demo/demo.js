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
          events: {
            set: 'onSelectionChange',
            unset: 'onSelectionChange'
          },
          callbacks: {
            add: 'onSelectionChange',
            remove: 'onSelectionChange'
          }
        }
      },
      many: {
        bars: {
          selector: 'bar',
          mutation: '> header, > footer',
          source: 'grid-bar'
        }
      }
    }
  },
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
});
LSD.Widget.Grid.Bar = new Class({
  options: {
    tag: 'bar',
    chain: {
      perform: function() {
        if (this.attributes.action) {
          return {name: this.attributes.action, target: this.form.list.selectedItems};
        } else {
          return {arguments: {data: this.form.list.getData()}, priority: 10}
        }
      },
      refresh: function() {
        return {
          target: this.form,
          action: 'submit'
        }
      }
    },

    has: {
      one: {
        checkbox: {
          selector: '> input[type=checkbox]',
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
          states: {
            set: {
              'disabled': 'disabled'
            }
          },
          pseudos: ['form-associated']
        }
      }
    }
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
