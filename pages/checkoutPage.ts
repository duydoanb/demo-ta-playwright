import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { BillingInfo } from '../data-objects/billingInfo';

export class CheckoutPage extends BasePage {
    private readonly placeOrderButton: Locator;
    private readonly termsCheckbox: Locator;
    private readonly firstNameTextbox: Locator;
    private readonly lastNameTextbox: Locator;
    private readonly companyTextbox: Locator;
    private readonly countryDropdown: Locator;
    private readonly address1Textbox: Locator;
    private readonly address2Textbox: Locator;
    private readonly cityTextbox: Locator;
    private readonly stateDropdown: Locator;
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
        this.countryDropdown = page.locator('#billing_country');
        this.address1Textbox = page.locator('#billing_address_1');
        this.address2Textbox = page.locator('#billing_address_2');
        this.cityTextbox = page.locator('#billing_city');
        this.stateDropdown = page.locator('#billing_state');
        this.postcodeTextbox = page.locator('#billing_postcode');
        this.phoneNumberTextbox = page.locator('#billing_phone');
        this.emailTextbox = page.locator('#billing_email');
    }

    private async selectCountryAndStateIfAny(billingInfo: BillingInfo): Promise<void> {
        if (billingInfo.isCountryCodeUsed) {
            await this.countryDropdown.selectOption({ value: billingInfo.country });
        } else {
            await this.countryDropdown.selectOption({ label: billingInfo.country });
        }

        if (billingInfo.state) {
            if (billingInfo.isStateCodeUsed) {
                await this.stateDropdown.selectOption({ value: billingInfo.state });
            } else {
                await this.stateDropdown.selectOption({ label: billingInfo.state });
            }
        }
    }

    async fillBillingDetailsAndPlaceOrder(billingInfo: BillingInfo): Promise<void> {
        await this.firstNameTextbox.fill(billingInfo.firstName);
        await this.lastNameTextbox.fill(billingInfo.lastName);
        await this.companyTextbox.fill(billingInfo.companyName);
        await this.countryDropdown.selectOption({ index: 1 });
        await this.selectCountryAndStateIfAny(billingInfo);
        await this.address1Textbox.fill(billingInfo.address1);
        await this.address2Textbox.fill(billingInfo.address2);
        await this.cityTextbox.fill(billingInfo.city);
        await this.postcodeTextbox.fill(billingInfo.postalCode);
        await this.phoneNumberTextbox.fill(billingInfo.phoneNumber);
        await this.emailTextbox.fill(billingInfo.email);

        if (await this.termsCheckbox.isVisible()) {
            await this.termsCheckbox.check();
        }

        await this.page.getByRole('radio', { name: billingInfo.paymentMethod.getFullName() }).check();
        await this.placeOrderButton.click();
    }
}
