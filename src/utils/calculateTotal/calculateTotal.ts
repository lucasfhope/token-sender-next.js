export function calculateTotal(amounts: string): bigint {
    const numberArray = amounts
        .split(/[\n,]+/)
        .map((num) => num.trim())
        .filter((num) => num !== '')
        .map((num) => parseInt(num))
        .filter((num) => !isNaN(num))
        .filter((num) => num > 0);
    return BigInt(numberArray
        .reduce((total, num) => total + num, 0)
    );
}