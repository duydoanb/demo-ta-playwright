import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class MyCartPage extends BasePage {
    private readonly proceedToCheckoutButton: Locator;

    constructor(page: Page) {
        super(page);
        this.proceedToCheckoutButton = page.getByRole('link', { name: 'Proceed to checkout' });
    }

    async clickProceedToCheckout(): Promise<void> {
        for (let i = 0; i < 4; i++) {
            if (!await this.proceedToCheckoutButton.isVisible()) {
                await this.page.reload();
            } else {
                break;
            }
        }
        await this.proceedToCheckoutButton.click();
    }

}