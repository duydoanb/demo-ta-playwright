import { Page, Locator, expect } from '@playwright/test';
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
    // Alerts
    private readonly missingFirstNameAlert: Locator;
    private readonly missingLastNameAlert: Locator;
    private readonly missingAddress1Alert: Locator;
    private readonly missingCityAlert: Locator;
    private readonly missingPhoneNumberAlert: Locator;
    private readonly missingPostalCodeAlert: Locator;
    private readonly missingEmailAlert: Locator;

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
        // Alerts
        this.missingFirstNameAlert = page.locator("xpath=//ul[@role='alert']/li[@data-id='billing_first_name']");
        this.missingLastNameAlert = page.locator("xpath=//ul[@role='alert']/li[@data-id='billing_last_name']");
        this.missingAddress1Alert = page.locator("xpath=//ul[@role='alert']/li[@data-id='billing_address_1']");
        this.missingCityAlert = page.locator("xpath=//ul[@role='alert']/li[@data-id='billing_city']");
        this.missingPhoneNumberAlert = page.locator("xpath=//ul[@role='alert']/li[@data-id='billing_phone']");
        this.missingPostalCodeAlert = page.locator("xpath=//ul[@role='alert']/li[@data-id='billing_postcode']");
        this.missingEmailAlert = page.locator("xpath=//ul[@role='alert']/li[@data-id='billing_email']");
    }

    private async selectCountryAndStateIfAny(billingInfo: BillingInfo): Promise<void> {
        await this.countryDropdown.selectOption({ index: 1 });
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

    async fillFirstName(value: string): Promise<void> { await this.firstNameTextbox.fill(value); }

    async fillLastName(value: string): Promise<void> { await this.lastNameTextbox.fill(value); }

    async fillCompanyName(value: string): Promise<void> { await this.companyTextbox.fill(value); }

    async fillAddress1(value: string): Promise<void> { await this.address1Textbox.fill(value); }

    async fillAddress2(value: string): Promise<void> { await this.address2Textbox.fill(value); }

    async fillCityOrTown(value: string): Promise<void> { await this.cityTextbox.fill(value); }

    async fillPostalCode(value: string): Promise<void> { await this.postcodeTextbox.fill(value); }

    async fillPhoneNumber(value: string): Promise<void> { await this.phoneNumberTextbox.fill(value); }

    async fillEmailAddress(value: string): Promise<void> { await this.emailTextbox.fill(value); }

    async clickPlaceOrderBtn(): Promise<void> { await this.placeOrderButton.click(); }

    async fillBillingDetailsAndPlaceOrder(billingInfo: BillingInfo): Promise<void> {
        await this.fillFirstName(billingInfo.firstName);
        await this.fillLastName(billingInfo.lastName);
        await this.fillCompanyName(billingInfo.companyName);
        await this.selectCountryAndStateIfAny(billingInfo);
        await this.fillAddress1(billingInfo.address1);
        await this.fillAddress2(billingInfo.address2);
        await this.fillCityOrTown(billingInfo.city);
        await this.fillPostalCode(billingInfo.postalCode);
        await this.fillPhoneNumber(billingInfo.phoneNumber);
        await this.fillEmailAddress(billingInfo.email);

        if (await this.termsCheckbox.isVisible()) {
            await this.termsCheckbox.check();
        }

        await this.page.getByRole('radio', { name: billingInfo.paymentMethod.getFullName() }).check();
        console.log("[INFO] fillBillingDetailsAndPlaceOrder(): Filled all billing info data to the form!");
        await this.clickPlaceOrderBtn();
    }

    async verifyAlertsForMissingFieldsAreDisplayed(billingDataFillingStatus: Record<string, Record<string, boolean>>): Promise<void> {
        (!billingDataFillingStatus['firstName']['isFilled']) ? await expect(this.missingFirstNameAlert).toBeVisible() : await expect(this.missingFirstNameAlert).toBeHidden();
        (!billingDataFillingStatus['lastName']['isFilled']) ? await expect(this.missingLastNameAlert).toBeVisible() : await expect(this.missingLastNameAlert).toBeHidden();
        (!billingDataFillingStatus['address1']['isFilled']) ? await expect(this.missingAddress1Alert).toBeVisible() : await expect(this.missingAddress1Alert).toBeHidden();
        (!billingDataFillingStatus['city']['isFilled']) ? await expect(this.missingCityAlert).toBeVisible() : await expect(this.missingCityAlert).toBeHidden();
        (!billingDataFillingStatus['phone']['isFilled']) ? await expect(this.missingPhoneNumberAlert).toBeVisible() : await expect(this.missingPhoneNumberAlert).toBeHidden();
        (!billingDataFillingStatus['postalCode']['isFilled']) ? await expect(this.missingPostalCodeAlert).toBeVisible() : await expect(this.missingPostalCodeAlert).toBeHidden();
        (!billingDataFillingStatus['email']['isFilled']) ? await expect(this.missingEmailAlert).toBeVisible() : await expect(this.missingEmailAlert).toBeHidden();
    }

}
