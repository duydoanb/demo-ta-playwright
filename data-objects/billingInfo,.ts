import { PaymentMethod } from "./dataEnums";

export class BillingInfo {
    private readonly _firstName: string;
    private readonly _lastName: string;
    private readonly _companyName: string;
    private readonly _address1: string;
    private readonly _address2: string;
    private readonly _city: string;
    private readonly _postCode: string;
    private readonly _phoneNumber: string;
    private readonly _email: string;
    private readonly _paymentMethod: PaymentMethod;

    constructor(data: Record<string, string | any>) {
        this._firstName = data.firstName;
        this._lastName = data.lastName;
        this._companyName = data.companyName;
        this._address1 = data.address1;
        this._address2 = data.address2;
        this._city = data.city;
        this._postCode = data.postCode;
        this._phoneNumber = data.phoneNumber;
        this._email = data.email;
        this._paymentMethod = PaymentMethod.fromName(data.paymentMethod);
    }

    get firstName(): string { return this._firstName; }

    get lastName(): string { return this._lastName; }

    get companyName(): string { return this._companyName; }

    get address1(): string { return this._address1 }

    get address2(): string { return this._address2 }

    get city(): string { return this._city }

    get postCode(): string { return this._postCode }

    get phoneNumber(): string { return this._phoneNumber }

    get email(): string { return this._email }

    get paymentMethod(): PaymentMethod { return this._paymentMethod }

}