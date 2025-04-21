
import { addClasses, addEvent, appendChildren, createButton, createElementContainer, createHeadingText, createImg, createSVG, createSVGButton, createScrollArea, detachChildren, getURLParam, getUsernameCookie, navigate, parseRequestURL, redirect, setUsernameCookie, toPhoneFormat } from "../helpers/basicElements.js";
import { routes } from "../helpers/router.js";
import { config } from "../config.js";
import { DisplayBox } from "./components/displayBox/DisplayBox.js";
import { NavigationBar } from "./containers/navigationBar/NavigationBar.js";
import { verifySession } from "./databaseCallers/awsDataCalls.js";
import { InstanceManagement } from "./views/instanceManagement/InstanceManagement.js";
import { StatusView } from "./views/statusView/StatusView.js";
import { LogIn } from "./views/logIn/LogIn.js"


window.onload = async () => { appendChildren(document.getElementById('root'), [new Index().view]); }
document.title = config.title;

export class Index {
    constructor() {
        window.onhashchange = () => { this.setNavState() };
        const root = document.getElementById('root');
        this.displayBox = new DisplayBox(root);
        this.setNavObj();
        this.setAppProps();
        this.container = addClasses(createScrollArea(), 'index_container');
        this.view = addClasses(createElementContainer(), 'index_view');
        this.setView();
    }
    setAppProps() {
        const root = document.getElementById('root');
        //if any problems arise with the appProps, add {}, before the swirly brackets
        this.appProps = Object.assign({
            setUser: setUsernameCookie.bind(this),
            username: () => getUsernameCookie(),
            displayBox: this.displayBox.display,
            setNavState: this.setNavState.bind(this),
            showMsg: () => { console.log('display showMessage'); }
        });
    }
    async setView() {
        appendChildren(detachChildren(this.view), [
            appendChildren(addClasses(createElementContainer(), 'index_navBarContainer'), [
                createImg(`${config.logo}`),
                //     this.navBar = addClasses(new NavigationBar(this.appProps).view, 'index_navBar'),
            ]),

            this.container,
        ]);
        this.setNavState(this.navState, this.setParams());
    }
    /**
     * helps to set the navigation object and move from pages
     */
    setNavObj() {
        this.navigation = {
            [routes.HOME_VIEW]: () => new LogIn(this.appProps).view,
            [routes.STATUS]:()=> new StatusView(this.appProps).view,
            [routes.INSTANCES]: () => new InstanceManagement(this.appProps).view
        }
    }
    /**
     * helps to direct the user to another page
     * @param {*} hash 
     * @param {*} params (default = false) 
     */
    async setNavState(hash = '', params = false) {
    if (hash) {
        navigate(hash, params);
    }
    this.navState = parseRequestURL().split('?')[0];
    const verify = await verifySession(this.appProps.username());

    if (!verify.success && this.navState !== routes.HOME_VIEW ) {
        this.navState = routes.STATUS;
    } else if (this.navState === '' || this.navState === '#/' || this.navState === '/') {
        this.navState = routes.INSTANCES;
    } else if (this.navState !== routes.INSTANCES && !this.navigation[this.navState]) {
        this.navState = routes.HOME_VIEW; // fallback to HOME_VIEW if route is invalid
    } else if (!verify.success && this.navState === routes.HOME_VIEW ) {
        this.navState = routes.HOME_VIEW;
    }

    navigate(this.navState); // Single navigation call

    const navView = this.navigation[this.navState] ? this.navigation[this.navState]() : false;
    if (navView) {
        appendChildren(detachChildren(this.container), navView);
    }
}
    /**
     * helps to get the params to the url
     */
    setParams() {
        const URLParams = getURLParam();
        return URLParams.success ? URLParams.urlParam : false;
    }

}
