import { addClasses, addEvent, appendChildren, createButton, createElementContainer, createHeadingText,getDateObj, createPillBox, createImg, createTextArea, delayedExecution, delayedListener, detachChildren, sortArrayOfObj, createInputBar, createParagraph } from "../../../helpers/basicElements.js";
import { InstanceTiles } from "../../components/tiles/instanceTiles/InstanceTiles.js";
import { getInstances, logout, rebootInstances, verifySession, subscription } from "../../databaseCallers/awsDataCalls.js";

export class InstanceManagement {
    constructor(parentProps) {
        this.parentProps = parentProps;
        this.view = addClasses(createElementContainer(), 'instanceManagement_view');
        this.handleRefresh = delayedExecution(this.handleRefresh.bind(this), 180000);
        this.setView();
    }
    async setView() { 
        this.dateTime = `${getDateObj().day} ${getDateObj().month} ${getDateObj().year} ${getDateObj().time}`
        appendChildren(this.view, [
            appendChildren(addClasses(createElementContainer(), 'instanceManagement_columnTitles'), [
                addEvent(addClasses(createButton('Logout'), 'instanceManagement_logoutButton'), 
                        async ()=>{  await logout(this.parentProps.username()); 
                                    const verify = await verifySession(this.parentProps.username()); 
                                    if (!verify.success) this.parentProps.setNavState('#/status');
                        }),
                addEvent(addClasses(createButton('Refresh'), 'instanceManagement_refreshButton'), 
                        async ()=>{
                                   detachChildren(this.view);
                                    await this.setView();
                        }),
                addClasses(createParagraph(`Last Updated: ${this.dateTime}`), 'instanceManagement_lastTimeUpdate'),
                // appendChildren(addClasses (createElementContainer(), 'instanceManagement_subContainer'),[
                    // addClasses(createParagraph('Subscribe to notifications: '), 'instanceManagement_subText'),
                    // this.email = createInputBar({ placeholder: 'Enter Email'}),
                    // addEvent(addClasses(createButton('Subscribe'), 'instanceManagement_subButton'), 
                    //     async ()=>{ 
                    //               this.email.value ? await this.validEmail(this.email.value) ? await subscription(this.email.value) : this.close = this.parentProps.displayBox(appendChildren(createPillBox(), [
                    //                     createHeadingText('Provided email is not valid. Please enter a valid email.'),
                    //                     addEvent(createButton('close'), () => this.close())
                    //                     ])) : this.close = this.parentProps.displayBox(appendChildren(createPillBox(), [
                    //                     createHeadingText('Please enter an email address.'),
                    //                     addEvent(createButton('close'), () => this.close())
                    //                     ]))
                    //     }),
                    // ]),
                addClasses(createHeadingText(`Instance Name: `), 'instanceManagement_instanceNameText'),
                addClasses(createHeadingText(`State: `), 'instanceManagement_stateText'),
            ]),
            this.loading = createImg('frontend/assets/icons/loading.svg'),
            addClasses(this.loading, 'instanceManagement_loading'),
        ]);
        await this.fetch()
        this.handleRefresh();
    }
    async fetch() {
        this.instances = await getInstances();
        this.instances.sort(sortArrayOfObj('InstanceName'));

        try {
            this.promises = await this.instances.map(entry =>
                entry.Status !== 'terminated' ? new InstanceTiles(this.parentProps, entry, delayedListener(() => { detachChildren(this.view); this.setView(); }, 1000)).view : null
                );

            this.loading.remove();
        } finally {
            appendChildren(this.view, this.promises);
        }
    }
    async handleRefresh() {
        const verify = await verifySession(this.parentProps.username());
        if (!verify.success){
            this.parentProps.setNavState('#/home');
        }
        else{
        detachChildren(this.view);
        await this.setView();
        delayedExecution(async () => { await this.handleRefresh(); }, 180000)();
        }
    }
    async validEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

}
