import { ALTERNATIVE_COLORS, TOKEN_COLORS, CHAIN_COLORS } from "constants/tokenColorList";


export default function getChartColor(tokenName: string, index: number) {
    //First try to find the color of the token. If that one is not in the static list, choose a random alternative color
    const randomIndex = Math.floor(Math.random() * (5 - 0 + 1) + 0)
    const colorEntry = TOKEN_COLORS.find((el) => el.shortName == tokenName);
    if (colorEntry) {
        return colorEntry.color;
    } else {
        return ALTERNATIVE_COLORS[index];
    }
}