import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { MenuTab } from '../data-objects/dataEnums';

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

    async login(username: string = process.env.VALID_USERNAME!, password: string = process.env.VALID_PASSWORD!,
        goToHomePage: boolean = true): Promise<void> {
        await this.usernameTextbox.fill(username);
        await this.passwordTextBox.fill(password);
        await this.loginButton.click();

        if (goToHomePage) {
            await this.clickMenuTab(MenuTab.HOME);
        }
    }

}