import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { MenuTab } from '../data-objects/dataEnums';
import { Constants } from '../utils/constants';
import { Credential } from '../data-objects/credential';

export class LoginPage extends BasePage {
    private readonly usernameTextbox: Locator;
    private readonly passwordTextBox: Locator;
    private readonly loginButton: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameTextbox = page.getByRole('textbox', { name: 'Username or email address *' });
        this.passwordTextBox = page.getByRole('textbox', { name: 'Password *' });
        this.loginButton = page.getByRole('button', { name: 'Log in' });
    }

    async login(credential: Credential = Constants.VALID_CREDENTIAL_1, goToHomePage: boolean = true): Promise<void> {
        await this.usernameTextbox.fill(credential.username);
        await this.passwordTextBox.fill(credential.password);
        await this.loginButton.click();

        if (goToHomePage) {
            await this.clickMenuTab(MenuTab.HOME);
            await this.page.waitForLoadState('networkidle');
        }
    }

}
