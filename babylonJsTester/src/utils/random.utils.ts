import { v4 } from "uuid";

export function randomId() {
	return v4();
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split("");
export function softRandomId(length = 4) {
	let str = "";
	for (let i = 0; i < length; i++) {
		str += chars[Math.floor(Math.random() * chars.length)];
	}
	return str;
}
