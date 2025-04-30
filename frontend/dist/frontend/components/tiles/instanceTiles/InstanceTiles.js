import { addClasses, addEvent, appendChildren, createButton, createElementContainer, createHeadingText, createPillBox, createSVG, delayedExecution } from "../../../../helpers/basicElements.js";
import { rebootInstances, startInstances, stopInstances, verifySession} from "../../../databaseCallers/awsDataCalls.js";

export class InstanceTiles {
    constructor(parentProps, instance, refresh = () => { }) {
        this.refresh = refresh;
        this.parentProps = parentProps; 
        this.instance = instance;
        this.view = addClasses(createPillBox(true), 'instanceTiles_view')
        this.state = this.handleState();
        this.setView()
    }
    async setView() {    
        appendChildren(this.view, [
            appendChildren(addClasses(createElementContainer(), 'instanceTiles_leftContainer'), [
                this.instance.InstanceName !== '' && this.instance.InstanceName !== '<empty>' && this.instance.InstanceName !== null ? createHeadingText(this.instance.InstanceName) : createHeadingText(this.instance.InstanceId),
            ]),
        
            appendChildren(addClasses(createElementContainer(), 'instanceTiles_middleContainer'), [
                this.instance.Status == 'running' ? addClasses(createSVG('frontend/assets/icons/greenCheckmark.svg'), 'instanceTiles_checkmark') : (this.instance.Status == 'stopping'|| this.instance.Status == "pending" ? addClasses(createSVG('frontend/assets/icons/pending.svg'), 'instanceTiles_checkmark'): addClasses(createSVG('frontend/assets/icons/errorCircle2.svg'), 'instanceTiles_errorMark') )
               
            ]),
            appendChildren(addClasses(createElementContainer(), 'instanceTiles_buttons'), [
                this.instance.Status == 'running' ? addEvent(addClasses(createButton('Start'), 'instanceTiles_rebootButton-disabled'), async () => {
                    const verify = await verifySession(this.parentProps.username());
                    if (!verify.success){
                        this.parentProps.setNavState('#/home');
                    }
                    else this.handleStart();
                    
                    
                }) : addEvent(addClasses(createButton('Start'), 'instanceTiles_rebootButton'), async () => {
                    const verify = await verifySession(this.parentProps.username());
                    if (!verify.success){
                        this.parentProps.setNavState('#/home');
                    }
                    else this.handleStart()
                    
                }),
                this.instance.Status == 'running' ? addEvent(addClasses(createButton('Stop'), 'instanceTiles_rebootButton'), async () => {
                    const verify = await verifySession(this.parentProps.username());
                    if (!verify.success){
                        this.parentProps.setNavState('#/home');
                        
                    }
                    else this.handleStop() 
                    
                }) : addEvent(addClasses(createButton('Stop'), 'instanceTiles_rebootButton-disabled'), async () => { 
                        const verify = await verifySession(this.parentProps.username());
                    if (!verify.success){
                        this.parentProps.setNavState('#/home');
                    }
                    else this.handleStop() 
                        
                    }),
                this.instance.Status == 'running' ? addEvent(addClasses(createButton('Reboot'), 'instanceTiles_rebootButton'), async () => { 
                    const verify = await verifySession(this.parentProps.username());
                    if (!verify.success){
                        this.parentProps.setNavState('#/home');
                    }
                    else this.handleReboot() 
                    
                }) : addEvent(addClasses(createButton('Reboot'), 'instanceTiles_rebootButton-disabled'), async () => { 
                        const verify = await verifySession(this.parentProps.username());
                    if (!verify.success){
                        this.parentProps.setNavState('#/home');
                    }
                    else this.handleReboot() 
                        
                    })

            ])
        ])
    }
    async handleState(){
        if (this.instance.Status == 'running')
            return addClasses(createSVG('frontend/assets/icons/greenCheckmark.svg'), 'instanceTiles_checkmark')
        else if (this.instance.Status == "Stopping" || this.instance.Status == "Pending" )
            return addClasses(createSVG('frontend/assets/icons/greenCheckmark.svg'), 'instanceTiles_pendingmark')
        else
            return addClasses(createSVG('frontend/assets/icons/errorCircle2.svg'), 'instanceTiles_errorMark')
    }
    async handleStart(){
        await startInstances(this.instance);
        delayedExecution(async () => { this.refresh() }, 500)()
    }
    async handleStop(){
         await stopInstances(this.instance);
        delayedExecution(async () => { this.refresh() }, 500)()
    }
    async handleReboot() {
        await rebootInstances(this.instance);
        delayedExecution(async () => { this.refresh() }, 500)()
    }
}