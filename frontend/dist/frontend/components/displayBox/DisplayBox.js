import { addClasses, addEvent, appendChildren, createElementContainer, getStringDialogBoxView, toTitleCase } from "../../../helpers/basicElements.js";

export class DisplayBox {
    constructor(parent) {
        this.display = this.display.bind(this);
        this.clearBoxView = this.clearBoxView.bind(this);
        this.view = parent;
    }
    /**
     * 
     * @param {*} node 
     * @param {{allowClose: boolean; animateFrom: string; commitCallback: Function; additionalRemoveCallback: Function; cancelText: string; confirmText: string}} object 
     * @returns 
     */
    display(node, { allowClose = true, animateFrom = 'Top', commitCallback = false, additionalRemoveCallback = false, cancelText = 'Cancelar', confirmText = 'Confirmar' } = {}) {
        (typeof node === 'string') && (node = getStringDialogBoxView(node, { commitCallback, removeBox: () => { removeBox() }, cancelText, confirmText }));
        animateFrom = toTitleCase(animateFrom);
        const background = addEvent(addClasses(createElementContainer(), 'displayBox__floatingPanelBackground'), event => {
            allowClose && (event.target.classList.contains('displayBox__floatingPanelBackground') || event.target.classList.contains('displayBox__floatingPanel')) && removeBox();
        });
        const floatingPanel = addClasses(createElementContainer(), 'displayBox__floatingPanel');
        setTimeout(() => {
            addClasses(background, 'displayBox__view-translucentBlack');
        }, 10);
        appendChildren(this.view, [
            appendChildren(background, [
                appendChildren(addClasses(floatingPanel, `displayBox__floatingPanel-collapsed${animateFrom}`), [
                    node
                ])
            ])
        ]);
        setTimeout(() => {
            floatingPanel.classList.add(`displayBox__floatingPanel-expanded${animateFrom}`);
        }, 50);
        const removeBox = () => {
            background.classList.remove('displayBox__view-translucentBlack');
            floatingPanel.classList.remove(`displayBox__floatingPanel-expanded${animateFrom}`);
            setTimeout(() => {
                background.remove();
            }, 550);
            additionalRemoveCallback && additionalRemoveCallback();
        }
        (typeof node !== 'string') && setTimeout(() => {
            this.view.tabIndex = 0;
            this.view.focus();
        }, 0);
        return () => { removeBox(); };
    }
    clearBoxView() {
        try {
            Array.from(document.getElementsByClassName('displayBox__floatingPanelBackground')).forEach(panel => {
                panel.remove();
            });
        } catch (error) { console.error(error); }
    }
}