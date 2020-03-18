import * as Utilities from "../utilities";

// Custom Vue types for props

export const CSSLength = (val: string) => Utilities.isCSSLength(val);
export const CSSRotation = (val: string) => Utilities.isCSSRotation(val);
export const Direction = (val: string) => Utilities.isDirection(val);
export const CSSGridLength = (val: string) => Utilities.isCSSLength(val) 
                                    || Utilities.isCSSFrUnit(val);

// minmax or fit-content functions
export const CSSGridFunc = (val: string) => {
    const rMinMax = /^minmax\(([\d|\w|%|-]+),\s?([\d|\w|%|-]+)\)$/gm;
    const rFitContent = /^fit-content\(([\d|\w|%|-]+)\)/gm;

    const minMaxMatch = rMinMax.exec(val);
    const fitContentMatch = rFitContent.exec(val);

    return (minMaxMatch || fitContentMatch);
}

export const PositiveNumber = (val: number) => val > 0;
export const ZeroNumber = (val: number) => val === 0;
export const NegativeNumber = (val: number) => val < 0;