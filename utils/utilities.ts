export class DataUtils {

    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static convertToNumber(stringOrNumber: number | string): number {
        if (typeof stringOrNumber === 'string') {
            stringOrNumber = Number(stringOrNumber);
        }
        return stringOrNumber;
    }
}
