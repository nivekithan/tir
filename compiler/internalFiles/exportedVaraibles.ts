import { DataType } from "../types/ast";

export const internallyExposedVariables: Record<string, DataType | undefined> = {
  syscallExit: {
    type: "FunctionDataType",
    arguments: { status: { type: "NumberDatatype" } },
    returnType: { type: "BooleanDataType" },
  },
} as const;
