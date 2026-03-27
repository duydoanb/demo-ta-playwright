export class PaymentMethod {
    static readonly BANK_TRANSFER = new PaymentMethod('Direct bank transfer');
    static readonly CHECK = new PaymentMethod('Check payments');
    static readonly COD = new PaymentMethod('Cash on delivery');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): PaymentMethod {
        return Object.values(this).find(
            (method) => method instanceof PaymentMethod && method.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }
}

export class ProductSortMode {
    static readonly DEFAULT = new ProductSortMode('Default sorting');
    static readonly BY_POPULARITY = new ProductSortMode('Sort by popularity');
    static readonly BY_AVG_RATING = new ProductSortMode('Sort by average rating');
    static readonly BY_LATEST = new ProductSortMode('Sort by latest');
    static readonly BY_PRICE_LOW_TO_HIGH = new ProductSortMode('Sort by price: low to high');
    static readonly BY_PRICE_HIGH_TO_LOW = new ProductSortMode('Sort by price: high to low');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): ProductSortMode {
        return Object.values(this).find(
            (method) => method instanceof ProductSortMode && method.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }
}

export class MenuTab {
    static readonly HOME = new MenuTab('Home');
    static readonly ABOUT_US = new MenuTab('About Us');
    static readonly SHOP = new MenuTab('Shop');
    static readonly OFFERS = new MenuTab('Offers');
    static readonly BLOG = new MenuTab('Blog');
    static readonly CONTACT_US = new MenuTab('Contact Us');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): MenuTab {
        return Object.values(this).find(
            (tabName) => tabName instanceof MenuTab && tabName.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }
}

export class ProductViewMode {
    static readonly GRID = new ProductViewMode('grid');
    static readonly LIST = new ProductViewMode('list');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): ProductViewMode {
        return Object.values(this).find(
            (mode) => mode instanceof ProductViewMode && mode.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }
}

export class ProductDepartment {
    static readonly CAR_ELECTRONICS = new ProductDepartment('Car Electronics');
    static readonly WATCHES = new ProductDepartment('w');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): ProductDepartment {
        return Object.values(this).find(
            (department) => department instanceof ProductDepartment && department.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }
}

export class ProductShowLimit {
    static readonly 1_2 = new ProductShowLimit('12');
    static readonly 2_4 = new ProductShowLimit('24');
    static readonly 3_6 = new ProductShowLimit('36');
    static readonly All = new ProductShowLimit('All');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): ProductShowLimit {
        return Object.values(this).find(
            (limit) => limit instanceof ProductShowLimit && limit.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }

    toString(): string { return this.getFullName(); }
}

export class BillingInfoEnum {
    static readonly VN_ADDRESS_1 = new BillingInfoEnum('Nguyen', 'Van A', 'AGEST Inc', 'Vietnam', '987 LE DUAN', 'Apt 22', 'Da Nang', '550000', '0982321456', 'A.nguyenVan@example.com', PaymentMethod.BANK_TRANSFER.getFullName(), null, null);
    static readonly US_ADDRESS_1 = new BillingInfoEnum('John', 'Doe', 'Logigear Corp', 'US', '600 Harrison St', 'Apt 11', 'San Antonio', '94105', '0124654234', 'johnNotJane.doe@example.com', PaymentMethod.CHECK.getFullName(), 'Texas', 'TX');

    private constructor(
        private readonly _firstName: string,
        private readonly _lastName: string,
        private readonly _companyName: string,
        private readonly _country: string,
        private readonly _address1: string,
        private readonly _address2: string,
        private readonly _city: string,
        private readonly _postCode: string,
        private readonly _phoneNumber: string,
        private readonly _email: string,
        private readonly _paymentMethod: string,
        // can be null, not all country has states
        private readonly _stateName?: string | null,
        private readonly _stateCode?: string | null,

    ) { }

    get firstName(): string { return this._firstName; }

    get lastName(): string { return this._lastName; }

    get companyName(): string { return this._companyName; }

    get country(): string { return this._country; }

    get address1(): string { return this._address1; }

    get address2(): string { return this._address2; }

    get city(): string { return this._city; }

    get state(): string | null { return this._stateName ?? null; }

    get stateCode(): string | null { return this._stateCode ?? null; }

    get postalCode(): string { return this._postCode; }

    get phoneNumber(): string { return this._phoneNumber; }

    get email(): string { return this._email; }

    get paymentMethod(): string { return this._paymentMethod; }

    async convertToRecordObject(): Promise<Record<string, string | any>> {
        const rec: Record<string, string | any> = {};
        rec['firstName'] = this.firstName;
        rec['lastName'] = this.lastName;
        rec['companyName'] = this.companyName;
        rec['country'] = this.country;
        rec['state'] = this.state;
        rec['stateCode'] = this.stateCode;
        rec['postCode'] = this.postalCode;
        rec['city'] = this.city;
        rec['address1'] = this.address1;
        rec['address2'] = this.address2;
        rec['phoneNumber'] = this.phoneNumber;
        rec['email'] = this.email;
        rec['paymentMethod'] = this.paymentMethod;
        return rec;
    }

}

export class CredentialUsageStatus {
    static readonly LOCKED = new CredentialUsageStatus('LOCKED');
    static readonly FREE = new CredentialUsageStatus('FREE');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): CredentialUsageStatus {
        return Object.values(this).find(
            (status) => status instanceof CredentialUsageStatus && status.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }

    toString(): string { return this.getFullName(); }
}

export class ScrollDirection {
    static readonly UP = new ScrollDirection('UP');
    static readonly DOWN = new ScrollDirection('DOWN');
    static readonly LEFT = new ScrollDirection('LEFT');
    static readonly RIGHT = new ScrollDirection('RIGHT');

    private constructor(
        private readonly fullName: string,
    ) { }

    static fromName(name: string): ScrollDirection {
        return Object.values(this).find(
            (direction) => direction instanceof ScrollDirection && direction.fullName.toUpperCase() === name.toUpperCase()
        );
    }

    getFullName(): string {
        return this.fullName;
    }
}
