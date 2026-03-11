import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class HomePage extends BasePage {
    private readonly loginLink: Locator;

    constructor(page: Page) {
        super(page);
        this.loginLink = page.getByRole('link', { name: 'Log in / Sign up' });
    }

    async clickLoginLink(): Promise<void> {
        await this.loginLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    async isLoginLinkVisible(): Promise<boolean> {
        await this.page.waitForLoadState('networkidle');
        return await this.loginLink.isVisible() && await this.loginLink.isEnabled();
    }

}
