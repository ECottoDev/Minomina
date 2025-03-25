import { addClasses, appendChildren, createElementContainer, createHeadingText, createPillBox, createSVG } from "../../../../helpers/basicElements.js";


export class StatusTiles {
    constructor(parentProps, instance, refresh = () => { }) {
        this.refresh = refresh;
        this.parentProps = parentProps;
        this.instance = instance;
        this.view = addClasses(createPillBox(true), 'instanceTiles_view');
        this.state = this.handleState();
        this.setView();
    }
    async setView() {    
        appendChildren(this.view, [
            appendChildren(addClasses(createElementContainer(), 'instanceTiles_leftContainer'), [
                 this.instance.InstanceName !== '' && this.instance.InstanceName !== '<empty>' && this.instance.InstanceName !== null ? createHeadingText(this.instance.InstanceName) : createHeadingText(this.instance.InstanceId)
            ]),
            appendChildren(addClasses(createElementContainer(), 'statusTiles_middleContainer'), [
                this.instance.Status == 'running' ? addClasses(createSVG('frontend/assets/icons/greenCheckmark.svg'), 'instanceTiles_checkmark') : (this.instance.Status == 'stopping'|| this.instance.Status == "pending" ? addClasses(createSVG('frontend/assets/icons/pending.svg'), 'instanceTiles_pendingMark'): addClasses(createSVG('frontend/assets/icons/errorCircle2.svg'), 'instanceTiles_errorMark') )
            ])
        ]);
    }
    async handleState(){
        if (this.instance.Status == 'running')
            return addClasses(createSVG('frontend/assets/icons/greenCheckmark.svg'), 'instanceTiles_checkmark');
        else if (this.instance.Status == "Stopping" || this.instance.Status == "Pending" )
            return addClasses(createSVG('frontend/assets/icons/pending.svg'), 'instanceTiles_pendingMark');
        else
            return addClasses(createSVG('frontend/assets/icons/errorCircle2.svg'), 'instanceTiles_errorMark');
    }
}