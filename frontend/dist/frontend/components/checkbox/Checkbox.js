/**
* Checkbox.js
*
* @author Edwin Cotto <edtowers1037@gmail.com>
* @copyright Edwin Cotto, All rights reserved.
*
* @version 2024-February-04 initial version
*/

import { addClasses, addEvent, appendChildren, createElementContainer, createInputBar, createLabel, uuIdv4 } from "../../../helpers/basicElements.js";

export class Checkbox {
    /**
     * Create a checkbox with label
     * @param {string} label 
     * @param {callback} callback callback(isClicked)
     * @param {boolean} checked 
     * @param {string} size smaller, small, medium (default), large, larger
     * @param {boolean} disabled
     */
    constructor(label = '', { callback = () => { }, checked = false, size = 'medium', disabled = false }) {
        this.view = appendChildren(addClasses(createElementContainer(), 'checkbox__view', `checkbox__view-${size}`), [
            this.checkbox = addEvent(addClasses(createInputBar({ type: 'checkbox' }), `checkbox__checkbox-${size}`), () => callback(this.isChecked()), 'change'),
            this.label = addClasses(createLabel(label), 'checkbox__label')
        ]);
        Object.assign(this.checkbox, { disabled, checked }).id = this.label.htmlFor = uuIdv4();
    }
    isChecked() {
        return this.checkbox.checked;
    }
    setChecked(checked) {
        this.checkbox.checked = checked;
    }
}