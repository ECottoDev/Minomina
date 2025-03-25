/**
* basicElements.js
* @author Edwin Cotto
* @copyright Edwin Cotto All Rights Reserved.
*
* @version 2024-January-28 
*/

import { MONTHS, SHORT_MONTHS, SHORT_WEEKDAYS, WEEKDAYS } from "./constants.js";

/**
 * Renders a node from an HTML string
 * @param {string} htmlString
 * @returns {Element}
 */
export function elementFromHTMLString(htmlString) {
    const node = document.createElement('div');
    node.innerHTML = htmlString;
    return node.firstChild;
}
/**
 * Renders a node from tag
 * @param {string} tag 
 * @returns {Element}
 */
export function nodeElement(tag = 'span') {
    return document.createElement(tag);
}

/**
 * Appends an array of children to a node
 * @param {Element} element 
 * @param {Element[]} children 
 * @returns html element with appended nodes
 */
export function appendChildren(element, children = []) {
    (Array.isArray(children) ? children.flat() : [children]).forEach(child => child && element.appendChild(child));
    return element;
}

export function prependChildren(element, children = []) {
    (Array.isArray(children) ? children.flat().slice().reverse() : [children]).forEach(child => child && element.prependChild(child));
    return element;
}

/**
 * Adds classes to an html element
 * @param {element} element 
 * @param  {...string} classNames 
 * @returns html element with new class
 */
export function addClasses(element, ...classNames) {
    classNames.forEach(className => className && element.classList.add(className));
    return element;
}
/**
 * Removes classes from an html element
 * @param {element} element 
 * @param  {...string} classNames 
 * @returns html element without specified classes
 */
export function removeClasses(element, ...classNames) {
    classNames.forEach(className => className && element.classList.remove(className));
    return element;
}

/**
 * Adds event listener with an array of events
 * @param {element} element 
 * @param {function} listenerAction 
 * @param  {...string} eventTypes Defaults to click
 * @returns html element with an event listener
 */
export function addEvent(element, listenerAction, ...eventTypes) {
    if (!Array.from(eventTypes).length && listenerAction) {
        element.addEventListener('click', listenerAction);
    } else {
        eventTypes.forEach(eventType => { listenerAction && element.addEventListener(eventType, listenerAction); });
    }
    return element;
}
/**
 * Removes all node children
 * @param {Element} element 
 * @returns {Element}
 */
export function detachChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    return element;
}
/**
 * Sets attributes on a DOM element.
 *
 * @param {HTMLElement} node - The DOM element on which to set attributes.
 * @param {Object} attributes - An object containing attribute-value pairs.
 *  The attribute names should follow JavaScript notation, not HTML notation.
 * @returns {HTMLElement} The modified DOM element with the updated attributes.
 */
export function addAttributes(node, attributes) {
    for (const key in attributes) {
        node[key] = attributes[key];    // Set the attribute on the DOM element
    }
    return node;
}

/**
 * Delays the firing of an event listener by a specified time frame. Especially useful for keyup or keydown event listeners.
 * @param {requestCallback} callback
 * @param {Number} ms //Milliseconds
 * @returns {function}
 */
export function delayedListener(callback = () => { }, ms = 500) {
    let timer = 0;
    return function () {
        const context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}

/**
 * Delays the execution of a function by a specified time frame.
 * @param {Function} func - The function to be delayed.
 * @param {Number} ms - Milliseconds to delay.
 * @returns {Function} - A function that, when called, delays the execution of `func`.
 */
export function delayedExecution(func = () => { }, ms = 500) {
    let timer = 0;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, ms || 0);
    };
}


/**
 * Sorts an array of objects based on a property
 * @param {String} property The property by which to sort the array
 * @returns Sorted array
 */
export function sortArrayOfObj(property) {
    let sortOrder = 1;
    if (property[0] === '-') {
        sortOrder = -1;
        property = property.substring(1);
    }
    return (a, b) => (a[property] instanceof String ? (a, b) => a[property].localeCompare(b[property], 'es') : ((a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0)) * sortOrder;
}

/**
 * Compares 2 strings
 * @param {String} string1 
 * @param {String} string2 
 * @returns Boolean
 */
export function isStringEqual(string1, string2) {
    return removeStringAccents(string1.toLowerCase().trim()).includes(removeStringAccents(string2.toLowerCase().trim()));
}
export function removeStringAccents(str) {
    const letterDictionary = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', '(': '', ')': '' };
    return str.toLowerCase().split('').map(letter => Object.keys(letterDictionary).includes(letter) ? letterDictionary[letter] : letter).join('');;
}

export function handleNullString(string) {
    return string || 'N/A';
}
export function toCurrencyFormat(amount) {
    return amount ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount) : '$0.00';
}
export function toPhoneFormat(str) {
    return str.replace(/(\d{3})\-?(\d{3})\-?(\d{4})/, '$1-$2-$3');
}
/**
 * Formats date
 * @param {Date} date
 * @param {string} format full, short, shortDash or shortSlash
 * @param {Boolean} withTime (default: false)
 * @param {string} errorReturn 
 * @returns 
 */
export function toDateFormat(date, format = 'full', withTime = false, errorReturn = '') {
    if (!date) { return errorReturn; }
    try {
        date.getDate();
    } catch (error) {
        try {
            date = new Date(date);
        } catch (error) {
            return errorReturn;
        }
    }
    const dateObj = getDateObj(date);
    return {
        short: `${dateObj.day} de ${dateObj.shortMonth} de ${dateObj.year}` + (withTime ? ` ${dateObj.hour}:${dateObj.minutes}${dateObj.meridiem}` : ''),
        full: `${dateObj.day} de ${dateObj.month} de ${dateObj.year}` + (withTime ? ` a ${dateObj.hour > 1 ? 'las' : 'la'} ${dateObj.hour}:${dateObj.minutes}${dateObj.meridiem}` : ''),
        shortSlash: `${dateObj.day}/${dateObj.shortMonth}/${dateObj.year}` + (withTime ? ` | ${dateObj.hour}:${dateObj.minutes}${dateObj.meridiem}` : ''),
        shortDash: `${dateObj.day}-${dateObj.shortMonth}-${dateObj.year}` + (withTime ? ` ${dateObj.hour}:${dateObj.minutes}${dateObj.meridiem}` : '')
    }[format];
}
/**
 * Gets a date object
 * @param {object} date 
 * @returns date object
 */
export function getDateObj(date = new Date()) {
    const
        dayOfWeek = WEEKDAYS[date.getDay()],
        shortDayOfWeek = SHORT_WEEKDAYS[date.getDay()],
        day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate(),
        dayOfMonth = '01',
        month = MONTHS[date.getMonth()],
        monthNumber = (date.getMonth() > 9) ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1),
        shortMonth = SHORT_MONTHS[date.getMonth()],
        year = date.getFullYear(),
        hour = getTwoDigitNumber((date.getHours() > 12 ? date.getHours() - 12 : date.getHours())),
        minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
        seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds(),
        meridiem = date.getHours() >= 12 ? 'PM' : 'AM',
        time = `${hour}:${minutes} ${meridiem}`;
    return { hour: hour == '00' ? '12' : hour, time, minutes, seconds, meridiem, dayOfWeek, shortDayOfWeek, day, dayOfMonth, month, shortMonth, monthNumber, year };
}
export function getTwoDigitNumber(num) {
    return ('0' + num).slice(-2);
}
/**
 * Creates a div node
 * @param {...string} borders an array of chosen borders, acceptable values: 'top', 'right', 'bottom', 'left', 'all'
 * @return {Element|container}
 */
export function createElementContainer(selectedBorders = []) {
    !Array.isArray(selectedBorders) && (selectedBorders = [selectedBorders]);
    return addClasses(nodeElement('span'), ...['elementContainer', ...selectedBorders.map(border => 'elementContainer-' + border + 'Border')]);
}
/**
 * Creates an element container with default tile style
 * @param {boolean} hover (default: true)
 * @param {...string} borders an array of chosen borders, acceptable values: 'top', 'right', 'bottom', 'left', 'all'
 * @returns {Element}
 */
export function createTileContainer({ hover = true, borders = ['all'] } = {}) {
    !Array.isArray(borders) && (borders = [borders]);
    return addClasses(createElementContainer(borders), 'tileContainer', hover && 'tileContainer-hover');
}
/**
 * Creates a tile with border color
 * @param {string} color 
 * @param {string} title 
 * @returns colored tiles
 */
export function createColorBorderedTile(color = '', title = '') {
    const tile = addClasses(createElementContainer(), 'customColorBorderTile');
    color ? tile.style.borderColor = color : undefined;
    title ? tile.title = title : undefined;
    return tile;
}
/**
 * Creates a div node with scroll behavior
 * @param {...string} borders an array of chosen borders, acceptable values: 'top', 'right', 'bottom', 'left', 'all'
 * @returns {Element}
 */
export function createScrollArea(borders = []) {
    !Array.isArray(borders) && (borders = [borders]);
    return addClasses(createElementContainer(borders), 'scrollArea');
}
/**
 * Creates a heading(h1) node
 * @param {string} str 
 * @param {bool} bold
 * @return {Element} 
 */
export function createHeadingText(str, { bold = false, title = false } = {}) {
    return addClasses(elementFromHTMLString(`<h1 title="${title ? title : str}">${str ? str : ''}</h1>`), 'header', bold && 'header-bold');
}
/**
 * Creates a heading that looks like a link
 * @param {string} string 
 * @returns 
 */
export function createLinkStyledHeading(string) {
    return addClasses(getHeading(string), 'linkStyledHeader');
}
/**
 * Creates a paragraph node
 * @param {string} str 
 * @param {bool} bold 
 * @return {Element} 
 */
export function createParagraph(str, { bold = false, contentEditable = false } = {}) {
    return addClasses(addAttributes(elementFromHTMLString(`<p>${str}</p>`), { contentEditable }), 'paragraph', bold && 'paragraph-bold');
}
/**
 * Creates an SVG.
 * It will only show the contents inside the svg tag with id "Layer_1" within the SVG file.
 * The "fill" CSS property modifies the color of the fill inside the css classes of the shapes of the file. 
 * Adding the fill colors within each shape tag will make the colors fixed, thus not editable via CSS.
 * This means you can pick and choose which shapes in a particular svg tag will have variable colors by editing a the SVG file.
 * @param {string} href 
 * @param {string} color String: theme_color, dark_grey (default), white, etc.
 * @returns {Element}
 */
export function createSVG(href) {
    return addClasses(elementFromHTMLString(`<svg><use xlink:href="${href}#Layer_1"></use></svg>`), 'svg');

}
export function getIframe() {
    return nodeElement('iframe');
}
/**
 * Creates an image node
 * @param {string} src string image path
 * @param {string} title 
 * @returns 
 */
export function createImg(src, title = '') {
    return addAttributes(nodeElement('img'), { ...title ? { title, alt: title } : {}, src });
}
/**
 * Creates a button node
 * @param {string} textContent string
 * @param {string} theme light
 * @param {string} title string
 * @returns Button element
 */
export function createButton(textContent, { theme = '', title = false } = {}) {
    return addClasses(addAttributes(nodeElement('button'), { title: title || textContent, textContent }), 'button', theme ? `button-${theme}` : '');
}
/**
 * Creates a button node with a IMG child
 * @param {String} imgFile String: image path
 * @param {String} title String
 * @param {boolean} hover (default: true)
 * @returns Button element with image
 */
export function createImgButton(imgFile, { title = false, hover = true } = {}) {
    return appendChildren(addClasses(elementFromHTMLString(`<button ${title ? `title="${title}"` : ''}></button>`), 'imgButton', hover && 'imgButton-hover'), [
        addClasses(createImg(imgFile))
    ]);
}
/**
 * Creates a button node with SVG child
 * @param {String} imgFile String: image path
 * @param {String} title String (false by default)
 * @param {boolean} expandOnHover (default: true)
 * @returns Button element with image
 */
export function createSVGButton(imgFile, { title = false, expandOnHover = true } = {}) {
    return appendChildren(addClasses(elementFromHTMLString(`<button ${title ? `title="${title}"` : ''}></button>`), 'svgButton'), [
        addClasses(createSVG(imgFile), 'svgButtonIcon', expandOnHover && 'svg-expand')
    ]);
}
/**
 * Creates a button that toggles between images on each click
 * @param {Array} imgFiles Array of 2 image path strings
 * @param {Array} titles Array of 2 title strings
 * @returns Button element with cycling images
 */
export function createToggleImgButton(imgFile, { title = '' } = {}) {
    return addClasses(elementFromHTMLString(`<button ${title ? `title="${title}"` : ''} style='background-image: url(${imgFile})';></button>`), 'toggleImgButton');
}
/**
 * Creates a button that toggles between svgs on each click
 * @param {Array} imgFiles Array of 2 image path strings
 * @param {Array} title Array of 2 title strings
 * @returns Button element with cycling images
 */
export function createToggleSVGButton(imgFile, { title = '' } = {}) {
    return addAttributes(addClasses(createSVG(imgFile), 'toggleImgButton'), { title });
}
/**
* Creates an input bar for text or numbers
* @param {string} inputType (default text), search, password, tel, checkbox, radio, date, time
* @param {bool | string} placeholder false / empty by default 
* @returns {Element} Input bar
*/
export function createInputBar({ type = 'text', placeholder = false, value = '', disabled = false, maxLength = 250, id = false, autocomplete }) {
    return addAttributes(addClasses(addAttributes(elementFromHTMLString(`<input class="input" type="${type}">`)), type, (type === 'search'), disabled && 'disabled', type === 'time' && 'input-time'), {
        type,
        value,
        disabled,
        autocomplete,
        ...placeholder ? { placeholder } : {},
        ...type !== 'radio' ? { maxLength } : {},
        ...id ? { id } : {},
    });
}
/**
 * Create a text area
 * @param {string} value 
 * @param {string} placeHolder 
 * @param {Boolean} disableResize 
 * @returns textarea element
 */
export function createTextArea(value, { placeHolder = '', disableResize = true } = {}) {
    return addClasses(elementFromHTMLString(`<textarea placeholder=${placeHolder}>${value}</textarea>`), 'textArea', disableResize && 'textArea-disableResize');
}
/**
 * Gets anchor tag
 * @param {string} href 
 * @param {string} text 
 * @param {string} download 
 * @param {string} target _self (default) same browsing context, _blank: new browsing context, _parent: parent browsing context/frame, _top: topmost browsing context
 * @returns {Element} anchor element
 */
export function createLink(href, text, { download = '', target = '_self' } = {}) {
    return addClasses(elementFromHTMLString(`<a ${href ? 'href="' + href + '"' : ''} ${download ? 'download="' + download + '"' : ''} target="${target}">${text}</a>`), 'anchor');
}
/**
 * Creates a dropdown select. Options must be added
 * @param {{description: string, id: number, disabled: boolean}[]} options The options will display inside the dropdown select
 * @param {string | number} selectedOption
 * @returns {Element} Dropdown options menu
 */
export function createDropdown(options = [], selectedOption = 0) {
    return appendChildren(addClasses(nodeElement('select'), 'dropdownStyle'),
        options.map((option, index) => getSelectOption(Object.assign({ description: option.description, id: option.id ?? index }, { selected: option.description === selectedOption || option.id === selectedOption })))
    );
}
/**
 * Creates a dropdown option.
 * @param {string} description The text content of the option
 * @param {string} id The id of the option
 * @param {string} selected Whether option is selected or not
 * @param {string} disabled Whether option is disabled or not
 */
export function createDropdownOption({ description, id, selected = false, disabled = false } = {}) {
    return addAttributes(nodeElement('option'), { innerText: description, id, selected, disabled });
}
/**
 * Creates a form node
 * @param {Function} onsubmit Callback to call when a submit child button is clicked
 * @return {Element|container}
 */
export function createFormContainer(onsubmit = false) {
    return addAttributes(addClasses(nodeElement('form'), 'formContainer'), onsubmit ? { onsubmit: (event) => { event.preventDefault(); onsubmit(); } } : {});
}
/** todo: add gif
 * Returns transition gif
 * @returns {element} transition gif
 */
export function getTransitionGif() {
    return addClasses(createImg('frontend/assets/gifs/transitionCubeFaceFlips.gif'), 'loadingGif');
}
/**
 * @returns {element} transition gif with a container with position relative
 */
export function createTransitionContainer() {
    return appendChildren(addClasses(createElementContainer(), 'transitionContainer'), getTransitionGif())
}
/**
 * Create a pillbox
 * @param {boolean} hover (default: true)
 * @returns {Element | PillBox}
 */
export function createPillBox(hover = false) {
    return addClasses(nodeElement('span'), 'pillBox', (hover && 'pillBox-hover'));
}
/**
 * Creates a label 
 * @param {string} label 
 * @param {string} title
 * @returns {Element}
 */
export function createLabel(label, { title = false } = {}) {
    return elementFromHTMLString(`<label class="label" title="${title ? title : label}"}>${label}</label>`);
}
/**
 * Creates a List element
 * @param {String} text 
 * @param {Boolean} isEditable 
 * @returns 
 */
export function createListItem(text, { editable = false } = {}) {
    return elementFromHTMLString(`<li contentEditable="${editable}" class="list">${text}</li>`);
}
/**
 * Creates an unordered list
 * @param {Array} listElements Array of elements that will compose the list
 * @param {Boolean} editable boolean to indicate whether the list will be editable
 * @returns 
 */
export function createUnorderedList(listElements = [], { editable = false }) {
    return appendChildren(elementFromHTMLString(`<ul contentEditable="${editable}" class="unorderedList"></ul>`), listElements);
}
export function createOrderedList(listElements = [], { editable = false }) {
    return appendChildren(elementFromHTMLString(`<ol contentEditable="${editable}" class="orderedList"></ol>`), listElements);
}
/**
 * Creates a break line
 * @returns Node
 */
export function getBreakLine() {
    return nodeElement('BR');
}

/**
 * Creates the paragraph to be used when displaying a 'container is empty' type of message
 * @param {string} string 
 * @returns 
*/
export function getEmptyMessage(string = '') {
    return addClasses(createParagraph(string), 'emptyContainerMessage')
}
/**
 * Creates a Text Node
 * @param {string} text 
 * @returns {Element}
 */
export function getTextNode(text = '') {
    return document.createTextNode(text || '');
}

/**
 * Recursive function that deep clones a given object
 * @param {Object} obj Object to clone
 * @returns {Object} A new object that is a deep clone of the original
 */
export function cloneObj(obj) {
    // returns the given argument if it is not an object, useful for the recursive nature of the function
    if (obj === null || typeof obj !== 'object') return obj;
    // lets individual properties have arrays or objects as values when recursing
    let clone = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            // handles the Date object separately, as it is a special type of object
            if (obj[key] instanceof Date) {
                clone[key] = new Date(obj[key]);
            } else {
                clone[key] = cloneObj(obj[key]);
            }
        }
    }
    return clone;
}

/**
 * Creates a scrollable area with fading overlay on reaching the top or bottom.
 * @param {String} shadePosition 
 * @returns {Element} The scrollable area element.
 */
export function createFadingScrollArea(fadePosition = 'double') {
    const handleScroll = () => {
        const isAtTop = fadingScrollArea.scrollTop === 0;
        const isAtBottom = Math.ceil(fadingScrollArea.scrollTop) >= fadingScrollArea.scrollHeight - fadingScrollArea.clientHeight;
        ({
            top: () => fadingScrollArea.classList.toggle('fadingScrollArea-top', !isAtTop),
            bottom: () => fadingScrollArea.classList.toggle('fadingScrollArea-bottom', !isAtBottom),
            double: () => [['double', !isAtTop && !isAtBottom], ['top', !isAtTop && isAtBottom], ['bottom', isAtTop && !isAtBottom]].forEach(behavior => fadingScrollArea.classList.toggle(`fadingScrollArea-${behavior[0]}`, behavior[1]))
        }[fadePosition])();
    };
    const fadingScrollArea = addEvent(getScrollArea(), handleScroll, 'scroll');
    setTimeout(() => {
        const observer = new ResizeObserver(delayListener(handleScroll, 50));
        observer.observe(fadingScrollArea);
    }, 500);
    return fadingScrollArea;
}

/**
 * 
 * @returns unique string value
 */
export function uuIdv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
///// Navigation /////
/**
 * 
 * @returns parse url
 */
export function parseRequestURL() {
    //return location.hash.toLowerCase() || '/';// if using only lowercase hash
    return location.hash || '/';
}
/**
 * 
 * @param {String} hash 
 * @param {Object} params 
 * @param {Object} urlParam 
 * 
 */
export function navigate(hash, params = false) {
    const digestedMessage = digestMessage(params);
    if (params) {
        hash = `${hash}?${digestedMessage}`;
    }
    window.history.pushState({ urlPath: hash, origin: hash, digestedMessage }, '', hash);
}
/**
 * redirect to new html
 * @param {String} url 
 */
export function redirect(url) {
    createLink(url, '').click();
}
/**
 * Retrieves and decodes URL parameters from the hash portion of the current location.
 * @function
 * @returns {Object|boolean} An object containing the decoded URL parameters, or false if no parameters are found or an error occurs.
 * @throws {Error} If an error occurs during decoding.
 * @example
 * // Assuming the URL hash is '#?param1=value1&param2=value2'
 * const result = getURLParam();
 * result: {
 *           success: true,
 *           urlParam: { param1: 'value1', param2: 'value2' }
 *          }
 */
export function getURLParam() {
    try {
        if (!location.hash.includes('?')) return false;
        let params = location.hash.split('?')[1];
        if (!params) return false;
        return {
            success: true,
            urlParam: JSON.parse(new TextDecoder().decode(new Uint8Array(decodeStringToBase16(params).split(','))))
        };
    } catch (error) {
        return {
            success: false
        }
    }
}
export function decodeStringToBase16(string) {
    return string.split(/(\w\w)/g).filter(p => !!p).map(character => String.fromCharCode(parseInt(character, 16))).join("")
}
///// End Navigation /////

///// String Text Formatting /////
/**
 * Capitalizes the first letter of every word, with some exceptions
 * @param {string} str 
 * @param {boolean} capAfterParenthesis default: true
 * @param {boolean} isName default: false
 * @returns {string}
 */
export function toTitleCase(str, capAfterParenthesis = true, isName = false) {
    if (!str) { return ''; }
    const exceptionsToCap = ['De', 'La', 'El', 'Y', 'Vs', 'A', 'En', 'Entre', 'Hacia', 'Hasta', 'Para', 'Por', 'Según', 'Segun', 'Al', 'O', 'T/c/c', 'Con'].map(exception => exception.toUpperCase().trim());
    return str.trim().split(' ').map(word => {
        word = word.trim();
        word = !isName && exceptionsToCap.includes(word.toUpperCase()) ? word.toLowerCase() : (word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()).replace(/'[a-z]{2}/, (match) => match[0] + match[1].toUpperCase() + match[2]);
        capAfterParenthesis && word.charAt(0) === '(' && word.charAt(1) && (word = word.charAt(0) + word.charAt(1).toUpperCase() + (word.substring(2) ? word.substring(2) : ''));
        return word;
    }).join(' ');
}
/**
 * @param {Object} message 
 * @returns message encoded in base 16
 */
export function digestMessage(message) {
    const data = new TextEncoder().encode(JSON.stringify(message));
    return encodeStringToBase16(data.toString());
}
export function encodeStringToBase16(string) {
    return string.split('').map(character => character.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}
///// End String Text Formatting /////

/**
 * Creates a dialog box from string
 * @param {string} str text for dialog
 * @param {function} commitCallback 
 * @param {function} removeDialog 
 * @param {string} cancelText 
 * @param {string} confirmText 
 * @returns {element} dialog box
 */
export function getStringDialogBoxView(str = '', { commitCallback = false, removeDialog = () => { }, cancelText = 'Cancelar', confirmText = 'Confirmar' } = {}) {
    const confirmButton = addEvent(addClasses(createButton(confirmText), 'stringDialogBox__submitButton'), () => { removeDialog(); commitCallback(); });
    return appendChildren(addClasses(createPillBox(), 'stringDialogBox__view'), [
        addClasses(createParagraph(str, 'large'), 'stringDialogBox__heading'),
        commitCallback && appendChildren(addClasses(createElementContainer(), 'stringDialogBox__buttonContainer'), [
            addEvent(addClasses(createButton(cancelText, undefined, 'light'), 'stringDialogBox__cancelButton'), () => { removeDialog(); }),
            confirmButton
        ])
    ]);
}
export function createCheckbox({ checked = false, disabled = false, id = false, label = false, name = false, value = false } = {}) {
    return addAttributes(addClasses(elementFromHTMLString(`<input type="checkbox" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} ${id ? `id="${id}"` : ''} ${name ? `name="${name}"` : ''} ${value ? `value="${value}"` : ''}>${label}`), 'checkbox'), { id, name, value });

}
export function searchArray(array, value, ...props) {
    const results = [],
        valueArray = value.trim().split(' ');
    array.forEach(arrayItem => {
        let hits = 0;
        const hitsArray = [];
        props.forEach(prop => {
            valueArray.forEach(valueArrayItem => {
                if (arrayItem[prop]) {
                    if (typeof arrayItem[prop].getMonth === 'function') {
                        if (isStringEqual(toDateFormat(arrayItem[prop]), valueArrayItem)) {
                            if (hitsArray.includes(valueArrayItem)) {
                                hits++;
                            } else {
                                hits += 2;
                                hitsArray.push(valueArrayItem);
                            }
                        }
                    } else {
                        arrayItem[prop].toString().split(' ').forEach(val => {
                            if (isStringEqual(val, valueArrayItem)) {
                                if (hitsArray.includes(valueArrayItem)) {
                                    hits++;
                                } else {
                                    hits += 2;
                                    hitsArray.push(valueArrayItem);
                                }
                            }
                        });
                    }
                }
            });
        });
        if (hits > 0) {
            const index = results.findIndex(result => JSON.stringify(result.result) == JSON.stringify(arrayItem));
            if (index < 0) {
                results.push({ result: arrayItem, hits });
            } else {
                results[index].hits += hits;
            }
        }
    });
    return results.sort(sortArrayOfObj('-hits')).map(item => item.result);
}

export function setUsernameCookie(username) {
    const d = new Date();
    d.setTime(d.getTime() + (1 * 60 * 60 * 1000)); // 1 hour in milliseconds
    const expires = "expires=" + d.toUTCString();
    document.cookie = "username=" + username + ";" + expires + ";path=/";
}
export function getUsernameCookie() {
    const name = "username=";
    const decodedCookie = decodeURIComponent(document.cookie); // Decodes the cookie string
    const cookieArray = decodedCookie.split(';'); // Split the cookies
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length); // Return the value of the username cookie
        }
    }
    return ""; // Return empty string if the username cookie is not found
}
export function deleteUsernameCookie() {
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
export function updateUsernameCookieExpiration(user) {
    const date = new Date();
    date.setTime(date.getTime() + (1 * 60 * 60 * 1000)); // Add one hour in milliseconds
    const expires = "expires=" + date.toUTCString();
    document.cookie = `username= ${user}; ` + expires + "; path=/";
}

export function delayExecution(callback, delay) {
    setTimeout(callback, delay);
}
