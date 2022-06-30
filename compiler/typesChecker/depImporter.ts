import { DataType } from "../types/ast";
import path, { resolve } from "path";
import { internallyExposedVariables } from "../internalFiles/exportedVaraibles";

type AlreadyKnownDatatypes = {
  [fileName: string]: Record<string, DataType | undefined> | undefined;
};

export class DepImporter {
  curFileName: string;
  alreadyKnownDatatype: AlreadyKnownDatatypes;
  compileFile:
    | ((absoluteFileName: string) => Record<string, DataType | undefined>)
    | null;

  constructor(
    curFileName: string,
    alreadyKnownDatatype: AlreadyKnownDatatypes,
    compileFile?: (
      absoluteFileName: string
    ) => Record<string, DataType | undefined>
  ) {
    this.curFileName = curFileName;
    this.alreadyKnownDatatype = alreadyKnownDatatype;
    this.compileFile = compileFile ?? null;
  }

  getDatatypeFrom(varName: string, fromFileName: string): DataType {
    let fromAbsoluteFileName = resolve(this.curFileName, "..", fromFileName);
    const currentExtension = path.extname(fromAbsoluteFileName);

    if (currentExtension !== "ts") {
      fromAbsoluteFileName = `${fromAbsoluteFileName}.ts`;
    }

    if (fromFileName === "internal") {
      // importing from internal file is special case scenario
      const datatype = internallyExposedVariables[varName];

      if (datatype === undefined) {
        throw new Error(
          `Expected variable which is importing from internal file to one of ${Object.keys(
            internallyExposedVariables
          ).join(", ")} but instead got ${varName}`
        );
      }

      return datatype;
    }

    const fileVarToDatatypes = (() => {
      const datatypes = this.alreadyKnownDatatype[fromAbsoluteFileName];
      if (datatypes === undefined) {
        if (this.compileFile === null) {
          throw new Error(
            `${fromAbsoluteFileName} File ${this.curFileName}  is importing from file ${fromFileName}. Implement compile file function generate datatatypes`
          );
        }

        const exportedDatatypes = this.compileFile(fromAbsoluteFileName);
        return exportedDatatypes;
      }

      return datatypes;
    })();

    const varDatatype = fileVarToDatatypes[varName];

    if (varDatatype === undefined) throw Error("Not yet implemented");

    return varDatatype;
  }
}
