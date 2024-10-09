import { ComponentType } from "react";
import EightNotesSvg from "./EightNotesSvg";
import FCapitalSvg from "./FCapitalSvg";
import GreekLetterOmegaSvg from "./GreekLetterOmegaSvg";
import GreekLetterPiSvg from "./GreekLetterPiSvg";
import TrebleClefSvg from "./TrebleClefSvg";

export interface PathsShape {
  name: string;
  component: ComponentType;
}

export enum PathShapeNames {
  eightNotes = "EIGHT_NOTES",
  trebleClef = "TREBLE_CLEF",
  capitalLetterF = "CAPITAL_LETTER_F",
  greekLetterPi = "GREEK_LETTER_PI",
  greekLetterOmega = "GREEK_LETTER_OMEGA",
}

export const pathsShapes: PathsShape[] = [
  {
    name: PathShapeNames.eightNotes,
    component: EightNotesSvg,
  },
  {
    name: PathShapeNames.trebleClef,
    component: TrebleClefSvg,
  },
  {
    name: PathShapeNames.capitalLetterF,
    component: FCapitalSvg,
  },
  {
    name: PathShapeNames.greekLetterPi,
    component: GreekLetterPiSvg,
  },
  {
    name: PathShapeNames.greekLetterOmega,
    component: GreekLetterOmegaSvg,
  },
];
