import { expect } from '@playwright/test';
import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { BillingInfo } from '../data-objects/billingInfo';

export class OrderStatusPage extends BasePage {
    private readonly thankYouText: Locator;
    private readonly overViewPanelOrderNumberText: Locator;
    private readonly overViewPanelEmailText: Locator;
    private readonly overViewPanelTotalText: Locator;
    private readonly overViewPanelPaymentMethodText: Locator;

    constructor(page: Page) {
        super(page);
        this.thankYouText = page.locator("xpath=//p[text()='Thank you. Your order has been received.']");
        this.overViewPanelOrderNumberText = page.locator("xpath=//li[contains(@class,'woocommerce-order-overview') and contains(@class,' order')]/strong");
        this.overViewPanelEmailText = page.locator("xpath=//li[contains(@class,'woocommerce-order-overview') and contains(@class,'email')]/strong");
        this.overViewPanelTotalText = page.locator("xpath=//li[contains(@class,'woocommerce-order-overview') and contains(@class,'total')]/strong");
        this.overViewPanelPaymentMethodText = page.locator("xpath=//li[contains(@class,'woocommerce-order-overview') and contains(@class,'payment-method')]/strong");
    }

    async verifyOrderIsConfirmed(billingInfo: BillingInfo, totalOrderPrice: string): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await expect(this.page).toHaveURL(/.*checkout\/order-received/i, {timeout: 15000});
        const match = await this.page.url().match(/order-received\/(\d+)/);
        const actualOrderNumber = match ? match[1] : null;
        await expect(await this.overViewPanelOrderNumberText.textContent()).toStrictEqual(actualOrderNumber);
        await expect(this.thankYouText).toBeVisible();
        await expect(this.overViewPanelEmailText).toHaveText(billingInfo.email);
        await expect(this.overViewPanelTotalText).toHaveText(totalOrderPrice);
        await expect(this.overViewPanelPaymentMethodText).toHaveText(billingInfo.paymentMethod.getFullName());
    }
}
