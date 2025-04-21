import { addClasses, addEvent, appendChildren, createButton, createElementContainer, createHeadingText, createImg, createInputBar, createPillBox, delayedListener, delayExecution, deleteUsernameCookie, getUsernameCookie, setUsernameCookie } from "../../../helpers/basicElements.js";
import { routes } from "../../../helpers/router.js";
import { login } from "../../databaseCallers/awsDataCalls.js";

export class LogIn {
    constructor(parentProps) {
        this.parentProps = parentProps;
        this.view = addClasses(createElementContainer(), 'loginView_view');
        this.fetch();
    }
    async fetch() {
        this.setView();
    }
    setView() {
        appendChildren(this.view, [
            addClasses(createHeadingText('Cloudium login', { bold: true }), 'loginView_heading'),
            this.user = createInputBar({ placeholder: 'User' }),
            this.password = addEvent(createInputBar({ type: 'password', placeholder: 'Password' }), () => { if (event.key === 'Enter') this.verifyUser() }, 'keydown' ),
            addEvent(addClasses(createButton('LOGIN'), 'loginView_addButton', 'loginView_button'), () => { this.verifyUser() }),
            addEvent(addClasses(createButton('Back'), 'loginView_backButton', 'loginView_button'), () => {this.parentProps.setNavState(routes.STATUS) }),
        ])
    }
    async verifyUser() {
        await login(this.user.value, this.password.value, 
            ()=>{
                appendChildren(this.view, [
                    this.loading = createImg('frontend/assets/icons/loading.svg'),
                    addClasses(this.loading, 'instanceManagement_loading'),
                ])
                delayExecution(() => {
                        this.parentProps.setUser(this.user.value);
                        delayedListener(this.parentProps.setNavState(routes.INSTANCES));
                        // this.loading.remove()
                    }, 3000)
            },
            // () => {
            //     const close = this.parentProps.displayBox(appendChildren(createPillBox(), [
            //         createHeadingText('Login Successfull'),
            //         createButton('close'),
            //         delayExecution(() => {
            //             this.parentProps.setUser(this.user.value);
            //             close();
            //             delayedListener(this.parentProps.setNavState(routes.INSTANCES));
            //         }, 3000)])
            //     )
            // },
            () => {
                const close = this.parentProps.displayBox(appendChildren(createPillBox(), [
                    createHeadingText('Login failed. Please check user and password and try again.'),
                    addEvent(createButton('close'), () => close())
                ]))
            }
        )
    }
}
