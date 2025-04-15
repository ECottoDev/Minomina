import { addClasses, addEvent, createButton, appendChildren, createElementContainer, createParagraph, createHeadingText, createImg, delayedExecution, delayedListener, detachChildren, sortArrayOfObj, getDateObj } from "../../../helpers/basicElements.js";
import { StatusTiles } from "../../components/tiles/statusTiles/StatusTiles.js";
import { getInstances, verifySession, startInstances } from "../../databaseCallers/awsDataCalls.js";

function getTwoDigitNumber(num) {
        return ('0' + num).slice(-2);
    }

export class StatusView {
    constructor(parentProps) {
        this.parentProps = parentProps;
        this.view = addClasses(createElementContainer(), 'statusView_view');
        this.handleRefresh = delayedExecution(this.handleRefresh.bind(this), 180000);
        this.setView();
    }

    async setView() {
        this.dateTime = `${getDateObj().day} ${getDateObj().month} ${getDateObj().year} ${getDateObj().time}`
        appendChildren(this.view, [
            appendChildren(addClasses(createElementContainer(), 'statusView_columnTitles'), [
                 addEvent(addClasses(createButton('Log In'), 'statusView_logInButton'), async ()=>{ this.parentProps.setNavState('#/home')}),
                 addEvent(addClasses(createButton('Refresh'), 'statusView_refreshButton'), 
                        async ()=>{  //await getInstances(); 
                                    // await startInstances('i-045002314b3b04bb5')
                                   detachChildren(this.view);
                                    await this.setView();
                        }),
                addClasses(createParagraph(`Last Updated: ${this.dateTime}`), 'instanceManagement_lastTimeUpdate'),
                addClasses(createHeadingText(`Instance Name: `), 'statusView_instanceNameText'),
                addClasses(createHeadingText(`State: `), 'statusView_stateText')
            ]),
            this.loading = createImg('frontend/assets/icons/loading.svg'),
            addClasses(this.loading, 'statusView_loading'),
        ]);
        await this.fetch();
        this.handleRefresh();
    }
    async fetch() {
        this.instances = await getInstances();
        this.instances.sort(sortArrayOfObj('InstanceName'));

        try {
            this.promises = await this.instances.map(entry =>
                entry.Status !== 'terminated' ? new StatusTiles(this.parentProps, entry, delayedListener(() => { detachChildren(this.view); this.setView(); }, 1000)).view :null
            );
            this.loading.remove();
        } finally {
            appendChildren(this.view, this.promises);
        }
    }
    async handleRefresh() {
        const verify = await verifySession(this.parentProps.username());
        if (!verify.success){
            this.parentProps.setNavState('#/status');
        }
        else{
        detachChildren(this.view);
        await this.setView();
        delayedExecution(async () => { await this.handleRefresh(); }, 180000)();
        }
    }
}
