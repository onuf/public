/**
 * Routines for building UI
 * @module ui
 **/
import { VirtualView } from './src/view';
import { Accordion, Dialog, InputBase, Menu, TabControl, TreeViewNode, Widget, RangeSlider } from './src/widgets';
import { toDart, toJs } from './src/wrappers';
import { Functions } from './src/functions';
import $ from 'cash-dom';
import { __obs } from './src/events';
// @ts-ignore
import { _isDartium, _options } from './src/utils.js';
import * as rxjs from 'rxjs';
import { GridCellRenderer } from './src/grid';
let api = window;
/**
 * Creates an instance of the element for the specified tag, and optionally assigns it a CSS class.
 * @param {string} tagName The name of an element.
 * @param {string | null} className
 * @returns {HTMLElement}
 */
export function element(tagName, className = null) {
  let x = document.createElement(tagName);
  if (className !== null)
    _class(x, className);
  return x;
}
/** Appends multiple elements to root, and returns root.
 *  An element could be either {@link HTMLElement} or {@link Viewer}.
 *
 * @param {HTMLElement} root
 * @param {(HTMLElement | Viewer)[]} elements
 * @returns {HTMLElement} */
export function appendAll(root, elements) {
  let fragment = document.createDocumentFragment();
  for (let e of elements)
    fragment.appendChild(render(e));
  root.appendChild(fragment);
  return root;
}
export function empty(e) {
  while (e.firstChild)
    e.removeChild(e.firstChild);
  return e;
}
export function _innerText(x, s) {
  x.innerText = s;
  return x;
}
export function _class(x, s) {
  x.classList.add(s);
  return x;
}
export function _color(x, s) {
  x.style.color = s;
  return x;
}
export function _backColor(x, s) {
  x.style.backgroundColor = s;
  return x;
}
/**
 * @param {number} height
 * @param {number} width
 * @returns {HTMLCanvasElement}
 * */
export function canvas(width = null, height = null) {
  let result = element('CANVAS');
  if (height != null && width != null) {
    $(result).height(height);
    $(result).width(width);
    $(result).prop('height', `${height}`);
    $(result).prop('width', `${width}`);
  }
  return result;
}
/** @returns {HTMLHeadingElement} */
export function h1(s) {
  return _innerText(element('h1'), s);
}
/** @returns {HTMLHeadingElement} */
export function h2(s) {
  let x = element('h2');
  x.innerText = s;
  return x;
}
/** @returns {HTMLHeadingElement} */
export function h3(s) {
  let x = element('h3');
  x.innerText = s;
  return x;
}
/** @returns {Accordion} */
export function accordion(key = null) {
  return Accordion.create(key);
}
/**
 * @param {Object} pages - list of page factories
 * @param {boolean} vertical
 * @returns {TabControl} */
export function tabControl(pages = null, vertical = false) {
  let tabs = TabControl.create(vertical);
  if (pages != null) {
    for (let key of Object.keys(pages)) {
      let value = pages[key];
      tabs.addPane(key, value instanceof Function ? value : () => render(value));
    }
  }
  return tabs;
}
/** Returns DivElement with the specified inner text
 * @param {string} text
 * @param {string | ElementOptions | null} options
 * @returns {HTMLDivElement} */
export function divText(text, options = null) {
  let e = element('div');
  e.innerText = text;
  _options(e, options);
  return e;
}
/** Returns a font-awesome icon with the specified name, handler, and tooltip.
 * Sample: {@link https://public.datagrok.ai/js/samples/ui/icons}
 * @param {string} name - icon name (omit the "fa-" prefix)
 * @param {Function} handler
 * @param {String} tooltipMsg
 * @returns {HTMLElement} */
export function iconFA(name, handler, tooltipMsg = null) {
  let i = element('i');
  i.classList.add('grok-icon');
  i.classList.add('fal');
  i.classList.add(`fa-${name}`);
  i.addEventListener('click', handler);
  if (tooltipMsg !== null)
    tooltip.bind(i, tooltipMsg);
  return i;
}
export function extract(x) {
  if (x == null)
    return null;
  if (x instanceof Widget)
    return x.root;
  if (typeof x.root !== 'undefined')
    return x.root;
  if (typeof x.wrap === 'function') {
    if (x.length === 1)
      return x[0];
    else
      return span(x.get());
  } // jquery (cash) object
  return x;
}
/** Renders object to html element.
 * @param {object} x
 * @returns {HTMLElement} */
export function render(x) {
  x = extract(x);
  // @ts-ignore
  if (api.grok_UI_Render == null)
    return x;
  return api.grok_UI_Render(x);
}
/** Renders a table cell to html element, taking into account grid's formatting and color-coding.
 * @param {Cell} tableCell
 * @returns {HTMLElement} */
// export function renderCell(tableCell) {
//
// }
/** Renders a table cell to html element,
 * Takes into account grid's formatting and color-coding.
 * @param {Row} table
 * @param {string[]} columnNames
 * @returns {HTMLElement} */
// export function renderForm(table, columnNames = null) {
//   return null;
// }
/** Renders object to html card.
 * @param {object} x
 * @returns {HTMLElement}. */
export function renderCard(x) {
  return api.grok_UI_RenderCard(x);
}
/** Renders span
 * @param {object[]} x
 * @returns {HTMLElement}. */
export function span(x) {
  return api.grok_UI_Span(x);
}
export function renderInline(x) {
  let handler = ObjectHandler.forEntity(x);
  return handler == null ? render(x) : handler.renderMarkup(x);
}
/** Renders inline text, calling [renderMarkup] for each non-HTMLElement
 * @param {object[]} objects
 * @returns {HTMLElement}. */
export function inlineText(objects) {
  return span(objects.map((item) => renderInline(item)));
}
/**
 * @param {object[]} children
 * @param {string | ElementOptions} options
 * @returns {HTMLDivElement}
 * */
export function div(children = [], options = null) {
  if (!Array.isArray(children))
    children = [children];
  let d = document.createElement('div');
  if (children != null) {
    $(d).append(children.map(render));
  }
  _options(d, options);
  $(d).addClass('ui-div');
  return d;
}
/** Div flex-box container that positions child elements vertically.
 * @param {object[]} items
 * @param {string | ElementOptions} options
 * @returns {HTMLDivElement} */
export function divV(items, options = null) {
  return _options(api.grok_UI_DivV(items == null ? null : items.map(render), null), options);
}
/** Div flex-box container that positions child elements horizontally.
 * @param {object[]} items
 * @param {string | ElementOptions} options
 * @returns {HTMLDivElement} */
export function divH(items, options = null) {
  return _options(api.grok_UI_DivH(items == null ? null : items.map(render), null), options);
}
/** Renders content as a card. */
export function card(content) {
  return div([content], 'd4-item-card');
}
export function loader() {
  return api.grok_UI_Loader();
}
export function setUpdateIndicator(element, updating = true) {
  return api.grok_UI_SetUpdateIndicator(element, updating);
}
/**
 * Creates a button with the specified text, click handler, and tooltip
 * @param {string | Element | Array<string | Element>} content
 * @param {Function} handler
 * @param {string} tooltip
 * @returns {HTMLButtonElement}
 * */
export function button(content, handler, tooltip = null) {
  return api.grok_UI_Button(content, handler, tooltip);
}
export function bigButton(text, handler, tooltip = null) {
  return api.grok_UI_BigButton(text, handler, tooltip);
}
/**
 * Creates a combo popup with the specified icons and items
 * @param {string | HTMLElement} caption
 * @param {Array<string>} items
 * @param {Function} handler (item) => {...}
 * @param {Function} renderer (item) => {...}
 * @returns {HTMLElement}
 * */
export function comboPopup(caption, items, handler, renderer = null) {
  return api.grok_UI_ComboPopup(caption, items, handler, renderer !== null ? (item) => renderer(toJs(item)) : null);
}
/**
 * Creates a combo popup with the specified icons and items
 * @param {string | HTMLElement} caption
 * @param {Map<string>} items
 * @returns {HTMLElement}
 * */
export function comboPopupItems(caption, items) {
  return api.grok_UI_ComboPopup(caption, Object.keys(items), (key) => items[key]());
}
/** Creates a visual table based on [map]. */
export function tableFromMap(map) {
  return api.grok_UI_TableFromMap(map);
}
/** Creates a visual table based on [items] and [renderer]. */
export function table(items, renderer, columnNames = null) {
  return api.grok_HtmlTable(items, renderer !== null ? (object, ind) => renderer(toJs(object), ind) : null, columnNames).root;
}
/** Waits for Future<Element> function to complete and collect its result.*/
export function wait(getElement) {
  return toJs(api.grok_UI_Wait(getElement));
}
/** Creates a visual element representing list of [items]. */
export function list(items) {
  return api.grok_UI_List(Array.from(items).map(toDart));
}
/** Creates a [Dialog].
 * @returns {Dialog} */
export function dialog(title = '') {
  return Dialog.create(title);
}
/** Binds [item] with the [element]. It enables selecting it as a current object, drag-and-drop,
 * tooltip, and popup menu.
 * @param item
 * @param {Element} element
 * @returns {Element}. */
export function bind(item, element) {
  return api.grok_UI_Bind(item, element);
}
/** Shows popup with the [element] near the [anchor].
 * tooltip, and popup menu.
 * @param {Element} element
 * @param {Element} anchor
 * @param {boolean} vertical
 * @returns {Element}. */
export function showPopup(element, anchor, vertical = false) {
  return api.grok_UI_ShowPopup(element, anchor, vertical);
}
export function rangeSlider(minRange, maxRange, min, max) {
  let rs = RangeSlider.create();
  rs.setValues(minRange, maxRange, min, max);
  return rs;
}
/**
 * Creates a virtual list widget
 * @param {number} length - number of elements
 * @param {Function} renderer
 * @param {boolean} verticalScroll - vertical or horizontal scrolling
 * @param {number} maxColumns - maximum number of items on the non-scrolling axis
 * @returns {VirtualView}
 */
export function virtualView(length, renderer, verticalScroll = true, maxColumns = 1000) {
  let view = VirtualView.create(verticalScroll, maxColumns);
  view.setData(length, renderer);
  return view;
}
export function popupMenu(items) {
  function populate(menu, item) {
    for (let key of Object.keys(item)) {
      let value = item[key];
      if (value instanceof Function)
        menu.item(key, value);
      else
        populate(menu.group(key), value);
    }
  }
  let menu = Menu.popup();
  populate(menu, items);
  menu.show();
}
export function inputs(inputs, options) {
  return form(inputs, options);
}
/** Creates new nodes tree
 * @returns {TreeViewNode} */
export function tree() {
  return TreeViewNode.tree();
}
export function intInput(name, value, onValueChanged = null) {
  return new InputBase(api.grok_IntInput(name, value), onValueChanged);
}
export function choiceInput(name, selected, items, onValueChanged = null) {
  return new InputBase(api.grok_ChoiceInput(name, selected, items), onValueChanged);
}
export function multiChoiceInput(name, value, items, onValueChanged = null) {
  return new InputBase(api.grok_MultiChoiceInput(name, value, items), onValueChanged);
}
export function stringInput(name, value, onValueChanged = null) {
  return new InputBase(api.grok_StringInput(name, value), onValueChanged);
}
export function floatInput(name, value, onValueChanged = null) {
  return new InputBase(api.grok_FloatInput(name, value), onValueChanged);
}
export function dateInput(name, value, onValueChanged = null) {
  return new InputBase(api.grok_DateInput(name, value.d), onValueChanged);
}
export function boolInput(name, value, onValueChanged = null) {
  return new InputBase(api.grok_BoolInput(name, value), onValueChanged);
}
export function moleculeInput(name, value, onValueChanged = null) {
  return new InputBase(api.grok_MoleculeInput(name, value), onValueChanged);
}
export function columnInput(name, table, value, onValueChanged = null) {
  return new InputBase(api.grok_ColumnInput(name, table.d, value.d), onValueChanged);
}
export function columnsInput(name, table, onValueChanged = null) {
  return new InputBase(api.grok_ColumnsInput(name, table.d), onValueChanged);
}
export function textInput(name, value, onValueChanged = null) {
  return new InputBase(api.grok_TextInput(name, value), onValueChanged);
}
/**
 * @param {HTMLElement} element
 * @returns {rxjs.Observable} */
export function onSizeChanged(element) {
  if (_isDartium()) {
    // Polyfill for Dartium which does not have a native ResizeObserver
    return new rxjs.Observable(function (observer) {
      let width = element.clientWidth;
      let height = element.clientHeight;
      let interval = setInterval(() => {
        let newWidth = element.clientWidth;
        let newHeight = element.clientHeight;
        if (newWidth !== width || newHeight !== height) {
          width = newWidth;
          height = newHeight;
          observer.next(element);
        }
      }, 100);
      return () => clearInterval(interval);
    });
  }
  return rxjs.Observable.create(function (observer) {
    const resizeObserver = new ResizeObserver(observerEntries => {
      // trigger a new item on the stream when resizes happen
      for (const entry of observerEntries) {
        observer.next(entry);
      }
    });
    // start listening for resize events
    resizeObserver.observe(element);
    // cancel resize observer on cancellation
    return () => resizeObserver.disconnect();
  });
}
/** UI Tools **/
export class tools {
  static handleResize(element, onChanged) {
    let width = element.clientWidth;
    let height = element.clientHeight;
    let interval = setInterval(() => {
      let newWidth = element.clientWidth;
      let newHeight = element.clientHeight;
      if (newWidth !== width || newHeight !== height) {
        width = newWidth;
        height = newHeight;
        onChanged(width, height);
      }
    }, 100);
    return () => clearInterval(interval);
  }
}
/** Represents a tooltip. */
export class Tooltip {
  /** Hides the tooltip. */
  hide() {
    api.grok_Tooltip_Hide();
  }
  /** Associated the specified visual element with the corresponding item. */
  bind(element, tooltip) {
    api.grok_Tooltip_SetOn(element, tooltip);
    return element;
  }
  /** Shows the tooltip at the specified position
     * @param {HTMLElement | string} content
     * @param {number} x
     * @param {number} y */
  show(content, x, y) {
    api.grok_Tooltip_Show(content, x, y);
  }
  showRowGroup(dataFrame, indexPredicate, x, y) {
    api.grok_Tooltip_ShowRowGroup(dataFrame.d, indexPredicate, x, y);
  }
  /** Returns a tooltip element.
     * @returns {HTMLElement} */
  get root() {
    return api.grok_Tooltip_Get_Root();
  }
  /** @returns {boolean} isVisible */
  get isVisible() {
    return api.grok_Tooltip_Is_Visible();
  }
  /** @returns {Observable} */
  get onTooltipRequest() {
    return __obs('d4-tooltip-request');
  }
  /** @returns {Observable} */
  get onTooltipShown() {
    return __obs('d4-tooltip-shown');
  }
  /** @returns {Observable} */
  get onTooltipClosed() {
    return __obs('d4-tooltip-closed');
  }
}
export let tooltip = new Tooltip();
export class ObjectHandlerResolutionArgs {
  constructor(object, context) {
    this.object = object;
    this.context = context;
    this.handler = null;
  }
}
let _objectHandlerSubject = new rxjs.Subject();
/**
 * Override the corresponding methods, and {@link register} an instance to
 * let Datagrok know how to handle objects of the specified type.
 *
 * {@link isApplicable} is used to associate an object with the handler.
 * When handling an object x, the platform uses the first registered handler that
 * claims that it is applicable to that object.
 *
 * TODO: search, destructuring to properties
 *
 * Samples: {@link https://public.datagrok.ai/js/samples/ui/meta/meta}
 * */
export class ObjectHandler {
  /** Type of the object that this meta handles. */
  get type() {
    throw 'Not defined.';
  }
  /**
     * Override this method to check whether this meta class should handle the specified object.
     * @param x - specified object.
     * @returns {boolean}
     * */
  isApplicable(x) {
    throw 'Not defined.';
  }
  /** String representation of the [item], by default item.toString().
     * @param x - item
     * @returns {string} */
  getCaption(x) {
    return `${x}`;
  }
  /** @returns {CanvasRenderer} */
  getCanvasRenderer() {
    return null;
  }
  /** @returns {GridCellRenderer} */
  getGridCellRenderer() {
    return null;
  }
  /** Renders icon for the item.
     * @param x - item
     * @returns {Element} */
  renderIcon(x, context = null) {
    return divText(this.getCaption(x));
  }
  /** Renders markup for the item.
     * @param x - item
     * @returns {Element} */
  renderMarkup(x, context = null) {
    return divText(this.getCaption(x));
  }
  /** Renders tooltip for the item.
     * @param x - item
     * @returns {Element} */
  renderTooltip(x, context = null) {
    return divText(this.getCaption(x));
  }
  /** Renders card div for the item.
     * @param x - item
     * @returns {Element} */
  renderCard(x, context = null) {
    return divText(this.getCaption(x));
  }
  /** Renders properties list for the item.
     * @param x - item
     * @returns {Element} */
  renderProperties(x, context = null) {
    return divText(this.getCaption(x));
  }
  /** Renders view for the item.
     * @param x - item
     * @returns {Element} */
  renderView(x, context = null) {
    return this.renderProperties(x);
  }
  /** Gets called once upon the registration of meta export class. */
  init() { }
  /** Registers entity handler.
     * @param {ObjectHandler} meta */
  static register(meta) {
    api.grok_Meta_Register(meta);
    let cellRenderer = meta.getGridCellRenderer();
    if (cellRenderer != null)
      GridCellRenderer.register(cellRenderer);
  }
  /** @returns {ObjectHandler[]} */
  static list() {
    return toJs(api.grok_Meta_List());
  }
  static onResolve(observer) {
    return _objectHandlerSubject.subscribe(observer);
  }
  /**
     * @param {Object} object
     * @param {Object} context
     * @returns {ObjectHandler}
     * */
  static forEntity(object, context = null) {
    let args = new ObjectHandlerResolutionArgs(object, context);
    _objectHandlerSubject.next(args);
    if (args.handler !== null)
      return args.handler;
    return toJs(api.grok_Meta_ForEntity(toDart(object)));
  }
  /**
     * Registers a function that takes applicable objects as the only argument.
     * It will be suggested to run in the context menu for that object, and
     * also in the "Actions" pane on the property panel.
     *
     * Samples: {@link https://public.datagrok.ai/js/samples/ui/docking/docking}
     *
     * @param {string} name - function name
     * @param run - a function that takes exactly one parameter
     * */
  registerParamFunc(name, run) {
    // @ts-ignore
    new Functions().registerParamFunc(name, this.type, run, this.isApplicable);
  }
}
export class EntityMetaDartProxy extends ObjectHandler {
  constructor(d) {
    super();
    this.d = d;
  }
  get type() { return api.grok_Meta_Get_Type(this.d); }
  isApplicable(x) { return api.grok_Meta_IsApplicable(this.d, toDart(x)); }
  getCaption(x) { return api.grok_Meta_Get_Name(this.d, x); }
  renderIcon(x, context = null) { return api.grok_Meta_RenderIcon(x); }
  renderMarkup(x, context = null) { return api.grok_Meta_RenderMarkup(x); }
  renderTooltip(x, context = null) { return api.grok_Meta_RenderTooltip(x); }
  renderCard(x, context = null) { return api.grok_Meta_RenderCard(x); }
  renderProperties(x, context = null) { return api.grok_Meta_RenderProperties(x); }
  renderView(x, context = null) { return api.grok_Meta_RenderProperties(x); }
}
export function box(item, options = null) {
  if (item instanceof Widget) {
    item = item.root;
  }
  if (item instanceof InputBase) {
    console.log('inputbase');
    item = item.root;
  }
  if (item != null && $(item).hasClass('ui-box')) {
    return item;
  }
  let c = document.createElement('div');
  _options(c, options);
  $(c).append(item).addClass('ui-box');
  return c;
}
export function boxFixed(item, options = null) {
  let c = box(item, options);
  $(c).addClass('ui-box-fixed');
  return c;
}
/** Div flex-box container that positions child elements vertically.
 *  @param {object[]} items */
export function splitV(items, options = null) {
  let b = box(null, options);
  $(b).addClass('ui-split-v').append(items.map(item => box(item)));
  return b;
}
/** Div flex-box container that positions child elements horizontally.
 *  @param {object[]} items */
export function splitH(items, options = null) {
  let b = box(null, options);
  $(b).addClass('ui-split-h').append(items.map(item => box(item)));
  return b;
}
export function block(items, options = null) {
  let c = div(items, options);
  $(c).addClass('ui-block');
  return c;
}
export function block75(items, options = null) {
  return $(block(items, options)).addClass('ui-block-75')[0];
}
export function block25(items, options = null) {
  return $(block(items, options)).addClass('ui-block-25')[0];
}
export function block50(items, options = null) {
  return $(block(items, options)).addClass('ui-block-50')[0];
}
export function p(text, options = null) {
  let c = document.createElement('p');
  c.textContent = text;
  $(c).addClass('ui-p');
  _options(c, options);
  return c;
}
export function panel(items, options) {
  return $(div(items, options)).addClass('ui-panel')[0];
}
export function label(text, options = null) {
  let c = document.createElement('label');
  c.textContent = text;
  $(c).addClass('ui-label');
  _options(c, options);
  return c;
}
export function form(children = [], options = null) {
  let d = document.createElement('div');
  if (children != null) {
    $(d).append(children.map(render));
  }
  _options(d, options);
  $(d).addClass('ui-form');
  return d;
}
export function narrowForm(children = [], options = null) {
  let d = form(children, options);
  $(d).addClass('ui-form-condensed');
  return d;
}
export function buttonsInput(children = []) {
  if (!Array.isArray(children))
    children = [children];
  let d = document.createElement('div');
  let l = document.createElement('label');
  let e = document.createElement('div');
  $(e).addClass('ui-input-editor');
  if (children != null)
    $(e).append(children.map(render));
  l.textContent = ' ';
  $(l).addClass('ui-label ui-input-label');
  $(d).addClass('ui-input-root ui-input-buttons').append(l).append(e);
  return d;
}
