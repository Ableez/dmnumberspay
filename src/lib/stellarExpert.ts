import { env } from "#/env";

const RESOLUTION = 7;
const SIZE = 448;
const base32Alphabet: Record<string, number> = {};

//map base32 alphabet
// Map base32 alphabet
const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
for (let i = 0; i < base32Chars.length; i++) {
  base32Alphabet[base32Chars.charAt(i)] = i;
}

function decodeBase32(input: string) {
  const buf: number[] = [];
  let shift = 8;
  let carry = 0;

  input
    .toUpperCase()
    .split("")
    .forEach((char) => {
      const symbol = (base32Alphabet[char] ?? 0) & 0xff;
      shift -= 5;
      if (shift > 0) {
        carry |= symbol << shift;
      } else if (shift < 0) {
        buf.push(carry | (symbol >> -shift));
        shift += 8;
        carry = (symbol << shift) & 0xff;
      } else {
        buf.push(carry | symbol);
        shift = 8;
        carry = 0;
      }
    });

  if (shift !== 8 && carry !== 0) {
    buf.push(carry);
    shift = 8;
    carry = 0;
  }

  return buf;
}

/**
 * Draw Stellar address identicon on the given canvas
 * @param {String} address - StrKey-encoded account address
 * @param {Number} [size] - Identicon painting area size, in pixels (by default 448)
 * @return {String}
 */
export function drawIdenticon(address: string, size: number = SIZE): string {
  //take 16 meaningful bytes from the raw pub key
  const decoded = decodeBase32(address).slice(2, 16);
  const width = RESOLUTION;
  const height = RESOLUTION;
  const columns = Math.ceil(width / 2);
  const cellSize = size / width;
  const addressBytes = decoded.slice(1);
  const fillStyle = `hsl(${((360 * (decoded[0] ?? 0)) / 256) | 0},58%,52%)`;
  const dots: string[] = [];
  const rsize = ` width="${cellSize}" height="${cellSize}"`;
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < columns; column++) {
      const position = column + row * columns;
      const bitSet =
        ((addressBytes[(position / 8) | 0] ?? 0) &
          (1 << (7 - (position % 8)))) !==
        0;
      if (bitSet) {
        dots.push(
          `<rect x="${cellSize * column}" y="${cellSize * row}"${rsize}/>`,
        );
        dots.push(
          `<rect x="${cellSize * (width - column - 1)}" y="${cellSize * row}"${rsize}/>`,
        );
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="${fillStyle}">${dots.join("")}</svg>`;
}

export function seContractLink(address: string): string {
  return `https://stellar.expert/explorer/${env.NEXT_PUBLIC_STELLAR_NETWORK}/contract/${address}`;
}

export function seLedgerLink(ledger: number): string {
  return `https://stellar.expert/explorer/${env.NEXT_PUBLIC_STELLAR_NETWORK}/ledger/${ledger}`;
}

export function seTransactionLink(transactionHash: string): string {
  return `https://stellar.expert/explorer/${env.NEXT_PUBLIC_STELLAR_NETWORK}/tx/${transactionHash}`;
}

export function seAccountLink(account: string): string {
  return `https://stellar.expert/explorer/${env.NEXT_PUBLIC_STELLAR_NETWORK}/account/${account}`;
}
