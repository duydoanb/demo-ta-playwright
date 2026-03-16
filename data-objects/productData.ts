type priceString = `$${string}`;

export class ProductData {
    private readonly _title: string;
    private readonly _priceString: priceString;
    private _quantity: number;

    constructor(data: Record<string, string | number>) {
        this._title = String(data.title);
        this._priceString = String(data.priceString) as priceString;
        this._quantity = Number(data.quantity);
    }

    get title(): string { return this._title; }

    get priceAsString(): string { return this._priceString; }

    get rawPrice(): number { return Number(this._priceString.replace(/[^\d.]/g, '')); }

    get quantity(): number { return this._quantity; }

    get totalCost(): number { return this._quantity * this.rawPrice; }

    get totalCostAsString(): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.totalCost);
    }

    set quantity(newQty: number) { this._quantity = newQty; }

}