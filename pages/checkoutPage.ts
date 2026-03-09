import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { BillingInfo } from '../data-objects/billingInfo,';

export class CheckoutPage extends BasePage {
    private readonly placeOrderButton: Locator;
    private readonly termsCheckbox: Locator;
    private readonly firstNameTextbox: Locator;
    private readonly lastNameTextbox: Locator;
    private readonly companyTextbox: Locator;
    private readonly address1Textbox: Locator;
    private readonly address2Textbox: Locator;
    private readonly cityTextbox: Locator;
    private readonly postcodeTextbox: Locator;
    private readonly phoneNumberTextbox: Locator;
    private readonly emailTextbox: Locator;

    constructor(page: Page) {
        super(page);
        this.placeOrderButton = page.getByRole('button', { name: 'Place order' });
        this.termsCheckbox = page.locator('#terms');
        this.firstNameTextbox = page.locator('#billing_first_name');
        this.lastNameTextbox = page.locator('#billing_last_name');
        this.companyTextbox = page.locator('#billing_company');
        this.address1Textbox = page.locator('#billing_address_1');
        this.address2Textbox = page.locator('#billing_address_2');
        this.cityTextbox = page.locator('#billing_city');
        this.postcodeTextbox = page.locator('#billing_postcode');
        this.phoneNumberTextbox = page.locator('#billing_phone');
        this.emailTextbox = page.locator('#billing_email');
    }

    async fillBillingDetailsAndPlaceOrder(billingInfo: BillingInfo): Promise<void> {
        await this.firstNameTextbox.fill(billingInfo.firstName);
        await this.lastNameTextbox.fill(billingInfo.lastName);
        await this.companyTextbox.fill(billingInfo.companyName);
        await this.address1Textbox.fill(billingInfo.address1);
        await this.address2Textbox.fill(billingInfo.address2);
        await this.cityTextbox.fill(billingInfo.city);
        await this.postcodeTextbox.fill(billingInfo.postCode);
        await this.phoneNumberTextbox.fill(billingInfo.phoneNumber);
        await this.emailTextbox.fill(billingInfo.email);

        if (await this.termsCheckbox.isVisible()) {
            await this.termsCheckbox.check();
        }
        
        await this.page.getByRole('radio', { name: billingInfo.paymentMethod.getFullName() }).check();
        await this.placeOrderButton.click();
    }
}