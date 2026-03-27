import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { MenuTab } from '../data-objects/dataEnums';
import { Constants } from '../utils/constants';
import { Credential } from '../data-objects/credential';

export class LoginPage extends BasePage {
    private readonly usernameTextbox: Locator;
    private readonly passwordTextbox: Locator;
    private readonly loginButton: Locator;
    private readonly errorMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.usernameTextbox = page.locator('#username');
        this.passwordTextbox = page.locator('#password');
        this.loginButton = page.getByRole('button', { name: 'Log in' });
        this.errorMessage = page.locator('.woocommerce-error');
    }

    async login(credential: Credential = Constants.VALID_CREDENTIAL_1, goToHomePage: boolean = true): Promise<void> {
        await this.usernameTextbox.fill(credential.username);
        await this.passwordTextbox.fill(credential.password);
        await this.loginButton.click();
        if (goToHomePage) {
            await this.clickMenuTab(MenuTab.HOME);
        }
        await this.page.waitForLoadState('networkidle');
    }

    async verifyLoginFormIsVisible(): Promise<void> {
        await expect(this.usernameTextbox).toBeVisible();
        await expect(this.passwordTextbox).toBeVisible();
        await expect(this.loginButton).toBeVisible();
    }

    async verifyErrorMessageContains(expectedText: string): Promise<void> {
        await expect(this.errorMessage).toBeVisible();
        await expect(this.errorMessage).toContainText(expectedText);
    }

    async verifyPasswordIsMasked(): Promise<void> {
        await expect(this.passwordTextbox).toHaveAttribute('type', 'password');
    }

    async verifyErrorMessageHidden(): Promise<void> {
        await expect(this.errorMessage).toBeHidden();
    }

}
