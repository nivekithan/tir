import {
  isStringLiteralExp,
  isIdentifierLiteralExp,
  isNumberLiteralExp,
  isBooleanLiteralExp,
  isObjectLiteralExp,
  isArrayLiteralExp,
  isFunctionCallExp,
  isFunctionDatatype,
  isPlusUninaryExp,
  isMinusUninaryExp,
  isBangUniaryExp,
  isPlusBinaryExp,
  isMinusBinaryExp,
  isStarBinaryExp,
  isSlashBinaryExp,
  isVerticalBarBinaryExp,
  isCaretBinaryExp,
  isAmpersandBinaryExp,
  isStrictEqualityBinaryExp,
  isStrictNotEqualBinaryExp,
  isLessThanBinaryExp,
  isLessThanOrEqualBinaryExp,
  isGreaterThanBinaryExp,
  isGreaterThanOrEqualBinaryExp,
  isDotMemberAccessExp,
  isObjectDatatype,
  isBoxMemberAccessExp,
  isArrayDatatype,
} from "./all";
import { DataType, Expression } from "./ast";
import {
  AmpersandBinaryExp,
  ArrayDatatype,
  ArrayLiteralExp,
  BangUninaryExp,
  BooleanDataType,
  BooleanLiteralExp,
  BoxMemberAccessExp,
  BoxMemberPath,
  BreakStatement,
  CaretBinaryExp,
  CharDatatype,
  ConstVariableDeclaration,
  ContinueStatement,
  DotMemberAccessExp,
  DotMemberPath,
  DoWhileLoopDeclaration,
  ElseBlockDeclaration,
  ElseIfBlockDeclaration,
  FunctionCall,
  FunctionDatatype,
  FunctionDeclaration,
  GreaterThanBinaryExp,
  GreaterThanOrEqualBinaryExp,
  IdentifierAst,
  IdentifierDatatype,
  IdentifierExp,
  IdentifierPath,
  IfBlockDeclaration,
  ImportDeclaration,
  LessThanBinaryExp,
  LessThanOrEqualBinaryExp,
  LetVariableDeclaration,
  MinusBinaryExp,
  MinusUninaryExp,
  NotCalculatedDatatype,
  NumberDatatype,
  NumberLiteralExp,
  ObjectDatatype,
  ObjectLiteralExp,
  PlusBinaryExp,
  PlusUninaryExp,
  PointerDatatype,
  ReAssignment,
  ReAssignmentPath,
  ReturnExp,
  SlashBinaryExp,
  StarBinaryExp,
  StrictEqualityBinaryExp,
  StrictNotEqualBinaryExp,
  StringDatatype,
  StringLiteralExp,
  TypeCheckedIfBlockDeclaration,
  UnknownDatatype,
  UnknownVariable,
  VerticalBarBinaryExp,
  VoidDatatype,
  WhileLoopDeclaration,
} from "./base";

export type TirAst =
  | ImportDeclaration<TirDataType>
  | TirVariableDeclarationAst
  | IdentifierAst<TirDataType>
  | ReAssignment<TirExpression, TirDataType>
  | TirExpression
  | BreakStatement
  | ContinueStatement
  | TypeCheckedIfBlockDeclaration<TirExpression, TirAst>
  | WhileLoopDeclaration<TirExpression, TirAst>
  | FunctionDeclaration<TirAst, TirDataType>
  | ReturnExp<TirExpression>
  | { type: "EOF" };

export type TirVariableDeclarationAst =
  | ConstVariableDeclaration<TirExpression, TirDataType>
  | LetVariableDeclaration<TirExpression, TirDataType>;

export type TirExpression =
  | StringLiteralExp
  | IdentifierExp<TirDataType>
  | NumberLiteralExp
  | BooleanLiteralExp
  | ObjectLiteralExp<TirExpression, TirDataType>
  | ArrayLiteralExp<TirExpression, TirDataType>
  | TirUninaryExp
  | TirBinaryExp
  | BoxMemberAccessExp<TirExpression>
  | DotMemberAccessExp<TirExpression>
  | FunctionCall<TirExpression>;

export type TirUninaryExp =
  | PlusUninaryExp<TirExpression>
  | MinusUninaryExp<TirExpression>
  | BangUninaryExp<TirExpression>;

export type TirBinaryExp =
  | PlusBinaryExp<TirExpression>
  | MinusBinaryExp<TirExpression>
  | StarBinaryExp<TirExpression>
  | SlashBinaryExp<TirExpression>
  | VerticalBarBinaryExp<TirExpression>
  | CaretBinaryExp<TirExpression>
  | AmpersandBinaryExp<TirExpression>
  | StrictEqualityBinaryExp<TirExpression>
  | StrictNotEqualBinaryExp<TirExpression>
  | LessThanBinaryExp<TirExpression>
  | LessThanOrEqualBinaryExp<TirExpression>
  | GreaterThanBinaryExp<TirExpression>
  | GreaterThanOrEqualBinaryExp<TirExpression>;

export type TirDataType =
  | NumberDatatype
  | BooleanDataType
  | IdentifierDatatype
  | StringDatatype
  | ArrayDatatype<TirDataType>
  | ObjectDatatype<TirDataType>
  | FunctionDatatype<TirDataType>
  | VoidDatatype
  | CharDatatype
  | PointerDatatype<TirDataType>;

/**
 * Finds the datatype of Exp. It assumes the exp to be typechecked and it
 * does not verify it
 *
 * @param exp - Ast which has been typechecked
 * @return Datatype of exp
 */
export const getDatatypeOfTirExpression = (exp: TirExpression): TirDataType => {
  // if (isCharLiteralexp(exp)) return LiteralDataType.Char;
  if (isStringLiteralExp(exp))
    return { type: "StringDatatype", length: exp.value.length };
  if (isIdentifierLiteralExp(exp)) return exp.datatype;
  if (isNumberLiteralExp(exp)) return { type: "NumberDatatype" };
  if (isBooleanLiteralExp(exp)) return { type: "BooleanDataType" };
  if (isObjectLiteralExp(exp)) return exp.datatype;
  if (isArrayLiteralExp(exp)) return exp.datatype;
  if (isFunctionCallExp(exp)) {
    const leftDatatype = getDatatypeOfTirExpression(exp.left);

    if (isFunctionDatatype(leftDatatype)) {
      return leftDatatype.returnType;
    } else {
      throw Error("Expected leftDatatype to be function datatype");
    }
  }
  if (isPlusUninaryExp(exp) || isMinusUninaryExp(exp)) {
    return { type: "NumberDatatype" };
  }
  if (isBangUniaryExp(exp)) {
    return { type: "BooleanDataType" };
  }
  if (
    isPlusBinaryExp(exp) ||
    isMinusBinaryExp(exp) ||
    isStarBinaryExp(exp) ||
    isSlashBinaryExp(exp) ||
    isVerticalBarBinaryExp(exp) ||
    isCaretBinaryExp(exp) ||
    isAmpersandBinaryExp(exp)
  ) {
    return {
      type: "NumberDatatype",
    };
  }

  if (
    isStrictEqualityBinaryExp(exp) ||
    isStrictNotEqualBinaryExp(exp) ||
    isLessThanBinaryExp(exp) ||
    isLessThanOrEqualBinaryExp(exp) ||
    isGreaterThanBinaryExp(exp) ||
    isGreaterThanOrEqualBinaryExp(exp)
  ) {
    return { type: "BooleanDataType" };
  }
  if (isDotMemberAccessExp(exp)) {
    const leftDatatype = getDatatypeOfTirExpression(exp.left);

    if (isObjectDatatype(leftDatatype)) {
      const elementDatatype = leftDatatype.keys[exp.right];

      if (elementDatatype === undefined)
        throw Error("Did not expect elementDatatype to be undefined");

      return elementDatatype;
    } else {
      throw Error("Expected leftDatatype to ObjectDatatype ");
    }
  }
  if (isBoxMemberAccessExp(exp)) {
    const leftDatatype = getDatatypeOfTirExpression(exp.left);

    if (isArrayDatatype(leftDatatype)) {
      return leftDatatype.baseType;
    } else {
      throw Error("Expected leftDatatype to be Array");
    }
  }

  throw Error(`It is not supported for getting datatype for exp ${exp}`);
};



export class IdentifierAstConst {
  type : IdentifierAst<TirDataType>["type"] = "identifier";
  name : null | IdentifierAst<TirDataType>["name"] = null;
  datatype : null | IdentifierAst<TirDataType>["dataType"] = null;

  constructor() {}

  setName(name : NonNullable<IdentifierAstConst["name"]>) {
    this.name = name;
    return this;
  }

  setDatatype(datatype : NonNullable<IdentifierAstConst["datatype"]>) {
    this.datatype = datatype;
    return this;
  }

  toAst() : IdentifierAst<TirDataType> {
    if (this.name === null || this.datatype === null) {
      throw Error("Expected name and datatype to be set");
    }

    return {
      type: this.type,
      name: this.name,
      dataType: this.datatype,
    };
  }

}

export class ImportDeclarationConst {
  type : ImportDeclaration<TirDataType>["type"] = "importDeclaration";
  from : null | ImportDeclaration<TirDataType>["from"] = null;
  importedIdentifiers : null | ImportDeclaration<TirDataType>["importedIdentifiers"] = null;

  constructor() {}

  setFrom(from : NonNullable<ImportDeclarationConst["from"]>) {
    this.from = from;
    return this;
  }

  setImportedIdentifiers(...importedIdentifiers : NonNullable<ImportDeclarationConst["importedIdentifiers"]>) {
    this.importedIdentifiers = importedIdentifiers;
    return this;
  }

  toAst() : ImportDeclaration<TirDataType> {
    if (this.from === null || this.importedIdentifiers === null) {
      throw Error("Expected from and importedIdentifiers to be set");
    }

    return {
      type: this.type,
      from: this.from,
      importedIdentifiers: this.importedIdentifiers,
    };
  }
}
export class ReAssignmentConst {
  type: ReAssignment<TirExpression, TirDataType>["type"] = "ReAssignment";
  path: null | ReAssignment<TirExpression, TirDataType>["path"];
  assignmentOperator:
    | null
    | ReAssignment<TirExpression, TirDataType>["assignmentOperator"];
  exp: ReAssignment<TirExpression, TirDataType>["exp"] | null;

  constructor() {
    this.path = null;
    this.assignmentOperator = null;
    this.exp = null;
  }

  setPath(path: NonNullable<ReAssignmentConst["path"]>) {
    this.path = path;
    return this;
  }

  setAssignmentOperator(
    assignmentOperator: NonNullable<ReAssignmentConst["assignmentOperator"]>
  ) {
    this.assignmentOperator = assignmentOperator;
    return this;
  }

  setExp(exp: NonNullable<ReAssignmentConst["exp"]>) {
    this.exp = exp;
    return this;
  }

  toAst(): ReAssignment<TirExpression, TirDataType> {
    if (this.path === null)
      throw new Error("Expected Path to be set in ReAssignmentConst");

    if (this.assignmentOperator === null)
      throw new Error(
        "Expected assignmentOperator to be set in ReAssignmentConst"
      );

    if (this.exp === null)
      throw new Error("Expected exp to be set in ReAssignmentConst");

    return {
      type: this.type,
      path: this.path,
      assignmentOperator: this.assignmentOperator,
      exp: this.exp,
    };
  }
}

export class FunctionDeclarationConst {
  returnType: null | FunctionDeclaration<TirAst, TirDataType>["returnType"];
  arguments: null | FunctionDeclaration<TirAst, TirDataType>["arguments"];
  blocks: null | FunctionDeclaration<TirAst, TirDataType>["blocks"];
  export: null | FunctionDeclaration<TirAst, TirDataType>["export"];
  name: null | FunctionDeclaration<TirAst, TirDataType>["name"];
  type: FunctionDeclaration<TirAst, TirDataType>["type"] =
    "FunctionDeclaration";

  constructor({
    returnType,
    arguments: args,
    blocks,
    export: exportTo,
    name,
  }: Partial<Omit<FunctionDeclaration<TirAst, TirDataType>, "type">> = {}) {
    this.returnType = returnType ?? null;
    this.arguments = args ?? null;
    this.blocks = blocks ?? null;
    this.export = exportTo ?? false;
    this.name = name ?? null;
  }

  toAst(): FunctionDeclaration<TirAst, TirDataType> {
    if (this.returnType === null)
      throw new Error(`ReturnType is not set for FunctionDeclaration`);

    if (this.arguments === null)
      throw new Error(`Arguments is not set for FunctionDeclaration`);

    if (this.blocks === null)
      throw new Error(`Blocks is not set for FunctionDeclaration`);

    if (this.export === null)
      throw new Error(`Export is not set for FunctionDeclaration`);

    if (this.name === null)
      throw new Error(`Name is not set for FunctionDeclaration`);

    if (this.type === null)
      throw new Error(`Type is not set for FunctionDeclaration`);

    return {
      type: "FunctionDeclaration",
      returnType: this.returnType,
      arguments: this.arguments,
      blocks: this.blocks,
      export: this.export,
      name: this.name,
    };
  }

  setReturnType(
    returnType: NonNullable<FunctionDeclarationConst["returnType"]>
  ) {
    this.returnType = returnType;
    return this;
  }

  setBlocks(...blocks: NonNullable<FunctionDeclarationConst["blocks"]>) {
    this.blocks = blocks;
    return this;
  }

  setArguments(...args: NonNullable<FunctionDeclarationConst["arguments"]>) {
    this.arguments = args;
    return this;
  }

  setExport(export_: NonNullable<FunctionDeclarationConst["export"]>) {
    this.export = export_;
    return this;
  }

  setName(name: NonNullable<FunctionDeclarationConst["name"]>) {
    this.name = name;
    return this;
  }
}

export class ConstVariableDeclarationConst {
  exp: null | ConstVariableDeclaration<TirExpression, TirDataType>["exp"];
  export:
    | null
    | ConstVariableDeclaration<TirExpression, TirDataType>["export"] = false;
  identifierName:
    | null
    | ConstVariableDeclaration<TirExpression, TirDataType>["identifierName"];
  type: ConstVariableDeclaration<TirExpression, TirDataType>["type"] =
    "constVariableDeclaration";

  constructor({
    exp,
    export: export_,
    identifierName,
  }: Partial<
    Omit<
      ConstVariableDeclaration<TirExpression, TirDataType>,
      "type" | "datatype"
    >
  > = {}) {
    this.exp = exp ?? null;
    this.export = export_ ?? false;
    this.identifierName = identifierName ?? null;
  }

  setExp(exp: NonNullable<ConstVariableDeclarationConst["exp"]>) {
    this.exp = exp;
    return this;
  }

  setExport(export_: NonNullable<ConstVariableDeclarationConst["export"]>) {
    this.export = export_;
    return this;
  }

  setIdentifierName(
    identifierName: NonNullable<ConstVariableDeclarationConst["identifierName"]>
  ) {
    this.identifierName = identifierName;
    return this;
  }

  toAst(): ConstVariableDeclaration<TirExpression, TirDataType> {
    if (this.exp === null)
      throw new Error("Exp is not set for ConstVariableDeclaration");

    if (this.export === null)
      throw new Error("Export is not set for ConstVariableDeclaration");

    if (this.identifierName === null)
      throw new Error("IdentifierName is not set for ConstVariableDeclaration");

    const expDatatype = getDatatypeOfTirExpression(this.exp);

    return {
      type: this.type,
      datatype: expDatatype,
      exp: this.exp,
      export: this.export,
      identifierName: this.identifierName,
    };
  }
}

export class LetVariableDeclarationConst {
  exp: null | LetVariableDeclaration<TirExpression, TirDataType>["exp"];
  export: LetVariableDeclaration<TirExpression, TirDataType>["export"] = false;
  identifierName:
    | null
    | LetVariableDeclaration<TirExpression, TirDataType>["identifierName"];
  type: LetVariableDeclaration<TirExpression, TirDataType>["type"] =
    "letVariableDeclaration";

  constructor({
    exp,
    export: export_,
    identifierName,
  }: Partial<
    Omit<
      LetVariableDeclaration<TirExpression, TirDataType>,
      "type" | "datatype"
    >
  > = {}) {
    this.exp = exp ?? null;
    this.export = export_ ?? false;
    this.identifierName = identifierName ?? null;
  }

  setExp(exp: NonNullable<LetVariableDeclarationConst["exp"]>) {
    this.exp = exp;
    return this;
  }

  setExport(export_: NonNullable<LetVariableDeclarationConst["export"]>) {
    this.export = export_;
    return this;
  }

  setIdentifierName(
    identifierName: NonNullable<LetVariableDeclarationConst["identifierName"]>
  ) {
    this.identifierName = identifierName;
    return this;
  }

  toAst(): LetVariableDeclaration<TirExpression, TirDataType> {
    if (this.exp === null)
      throw new Error("Exp is not set for LetVariableDeclarationConst");

    if (this.identifierName === null)
      throw new Error(
        "IdentifierName is not set for LetVariableDeclarationConst"
      );

    const expDatatype = getDatatypeOfTirExpression(this.exp);

    return {
      type: this.type,
      datatype: expDatatype,
      exp: this.exp,
      export: this.export,
      identifierName: this.identifierName,
    };
  }
}

export class TypeCheckedIFBlockConst {
  type: TypeCheckedIfBlockDeclaration<TirExpression, TirAst>["type"] =
    "typeCheckedIfBlockDeclaration";

  ifBlockDeclaration:
    | null
    | TypeCheckedIfBlockDeclaration<TirExpression, TirAst>["ifBlock"] = null;
  elseIfBlocks: TypeCheckedIfBlockDeclaration<
    TirExpression,
    TirAst
  >["elseIfBlocks"] = [];
  elseBlock:
    | TypeCheckedIfBlockDeclaration<TirExpression, TirAst>["elseBlock"]
    | null = null;

  constructor() {}

  setIfBlockDeclaration(
    ifBlockDeclaration: NonNullable<
      TypeCheckedIFBlockConst["ifBlockDeclaration"]
    >
  ) {
    this.ifBlockDeclaration = ifBlockDeclaration;
    return this;
  }

  addElseIfBlock(
    ifElseBlock: ElseIfBlockDeclaration<TirExpression, TirAst>
  ) {
    this.elseIfBlocks.push(ifElseBlock);
    return this;
  }

  setElseBlock(elseBlock: NonNullable<TypeCheckedIFBlockConst["elseBlock"]>) {
    this.elseBlock = elseBlock;
    return this;
  }

  toAst(): TypeCheckedIfBlockDeclaration<TirExpression, TirAst> {
    if (this.ifBlockDeclaration === null)
      throw new Error(
        "IfBlockDeclaration is not set for TypeCheckedIFBlockConst"
      );

    return {
      type: this.type,
      ifBlock: this.ifBlockDeclaration,
      elseIfBlocks: this.elseIfBlocks,
      elseBlock: this.elseBlock ?? undefined,
    };
  }
}

export class IfBlockDeclarationConst {
  type: IfBlockDeclaration<TirExpression, TirAst>["type"] =
    "IfBlockDeclaration";
  condition: IfBlockDeclaration<TirExpression, TirAst>["condition"] | null =
    null;
  block: IfBlockDeclaration<TirExpression, TirAst>["blocks"] | null = null;

  constructor() {}

  setCondition(condition: NonNullable<IfBlockDeclarationConst["condition"]>) {
    this.condition = condition;
    return this;
  }

  setBlocks(...blocks: NonNullable<IfBlockDeclarationConst["block"]>) {
    this.block = blocks;
    return this;
  }

  toAst(): IfBlockDeclaration<TirExpression, TirAst> {
    if (!this.condition)
      throw new Error("Condition is not set for IfBlockDeclarationConst");

    if (!this.block)
      throw new Error("Block is not set for IfBlockDeclarationConst");

    return {
      type: this.type,
      condition: this.condition,
      blocks: this.block,
    };
  }
}

export class ElseIfBlockDeclarationConst {
  type: ElseIfBlockDeclaration<TirExpression, TirAst>["type"] =
    "ElseIfBlockDeclaration";
  condition: ElseIfBlockDeclaration<TirExpression, TirAst>["condition"] | null =
    null;

  blocks: ElseIfBlockDeclaration<TirExpression, TirAst>["blocks"] | null = null;

  constructor() {}

  setCondition(
    condition: NonNullable<ElseIfBlockDeclarationConst["condition"]>
  ) {
    this.condition = condition;
    return this;
  }

  setBlocks(...blocks: NonNullable<ElseIfBlockDeclarationConst["blocks"]>) {
    this.blocks = blocks;
    return this;
  }

  toAst() {
    if (!this.condition)
      throw new Error("Condition is not set for ElseIfBlockDeclarationConst");

    if (!this.blocks)
      throw new Error("Blocks is not set for ElseIfBlockDeclarationConst");

    return {
      type: this.type,
      condition: this.condition,
      blocks: this.blocks,
    };
  }
}

export class ElseBlockDeclarationConst {
  type: ElseBlockDeclaration<TirAst>["type"] = "ElseBlockDeclaration";

  blocks: ElseBlockDeclaration<TirAst>["blocks"] | null = null;

  constructor() {}

  setBlocks(...blocks: NonNullable<ElseBlockDeclarationConst["blocks"]>) {
    this.blocks = blocks;
    return this;
  }

  toAst() {
    if (!this.blocks)
      throw new Error("Blocks is not set for ElseBlockDeclarationConst");

    return {
      type: this.type,
      blocks: this.blocks,
    };
  }
}


export class WhileLoopDeclarationConst {
  type : WhileLoopDeclaration<TirExpression, TirAst>["type"] = "WhileLoopDeclaration";
  condition : WhileLoopDeclaration<TirExpression, TirAst>["condition"] | null = null;
  blocks : WhileLoopDeclaration<TirExpression, TirAst>["blocks"] | null = null;

  constructor() {}

  setCondition(condition : NonNullable<WhileLoopDeclarationConst["condition"]>) {
    this.condition = condition;
    return this;
  }

  setBlocks(...blocks : NonNullable<WhileLoopDeclarationConst["blocks"]>) {
    this.blocks = blocks;
    return this;
  }

  toAst() : WhileLoopDeclaration<TirExpression, TirAst> {
    if (!this.condition)
      throw new Error("Condition is not set for WhileLoopDeclarationConst");

    if (!this.blocks)
      throw new Error("Blocks is not set for WhileLoopDeclarationConst");

    return {
      type: this.type,
      condition: this.condition,
      blocks: this.blocks,
    };
  }
}
export class ReturnExpConst {
  type: ReturnExp<TirExpression>["type"] = "ReturnExpression";
  exp: null | ReturnExp<TirExpression>["exp"];

  constructor({ exp }: Partial<Omit<ReturnExp<TirExpression>, "type">> = {}) {
    this.exp = exp ?? null;
  }

  setExp(exp: NonNullable<ReturnExpConst["exp"]>) {
    this.exp = exp;
    return this;
  }

  toAst(): ReturnExp<TirExpression> {
    return {
      type: this.type,
      exp: this.exp,
    };
  }
}

export class FunctionCallExpConst {
  type: FunctionCall<TirExpression>["type"] = "FunctionCall";
  left: null | FunctionCall<TirExpression>["left"];
  arguments: FunctionCall<TirExpression>["arguments"] = [];

  constructor({
    left,
    arguments: args,
  }: Partial<Omit<FunctionCall<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.arguments = args ?? [];
  }

  setLeft(left: NonNullable<FunctionCallExpConst["left"]>) {
    this.left = left;
    return this;
  }

  setArguments(...args: NonNullable<FunctionCallExpConst["arguments"]>) {
    this.arguments = args;
    return this;
  }

  toExp(): FunctionCall<TirExpression> {
    if (!this.arguments)
      throw new Error(`Arguments are not set for FunctionCallExpConst`);

    if (!this.left) throw new Error(`Left is not set for FunctionCallExpConst`);

    return {
      type: this.type,
      arguments: this.arguments,
      left: this.left,
    };
  }
}

export class IdentifierPathConst {
  type: IdentifierPath["type"] = "IdentifierPath";
  name: null | IdentifierPath["name"];

  constructor({ name }: Partial<Omit<IdentifierPath, "type">> = {}) {
    this.name = name ?? null;
  }

  setName(name: NonNullable<IdentifierPathConst["name"]>) {
    this.name = name;
    return this;
  }

  toPath(): IdentifierPath {
    if (this.name === null)
      throw new Error("name is not set for IdentifierPathConst");

    return {
      type: this.type,
      name: this.name,
    };
  }
}

export class DotMemberPathConst {
  type: DotMemberPath<TirExpression, TirDataType>["type"] = "DotMemberPath";

  leftPath: null | DotMemberPath<TirExpression, TirDataType>["leftPath"];
  leftDataType:
    | null
    | DotMemberPath<TirExpression, TirDataType>["leftDataType"];
  rightPath: null | DotMemberPath<TirExpression, TirDataType>["rightPath"];

  constructor({
    leftDataType,
    leftPath,
    rightPath,
  }: Partial<Omit<DotMemberPath<TirExpression, TirDataType>, "type">> = {}) {
    this.leftDataType = leftDataType ?? null;
    this.leftPath = leftPath ?? null;
    this.rightPath = rightPath ?? null;
  }

  setLeftPath(leftPath: NonNullable<DotMemberPathConst["leftPath"]>) {
    this.leftPath = leftPath;
    return this;
  }

  setLeftDataType(
    leftDataType: NonNullable<DotMemberPathConst["leftDataType"]>
  ) {
    this.leftDataType = leftDataType;
    return this;
  }

  setRightPath(rightPath: NonNullable<DotMemberPathConst["rightPath"]>) {
    this.rightPath = rightPath;
    return this;
  }

  toPath() {
    if (this.leftPath === null)
      throw new Error("leftPath is not set for DotMemberPathConst");

    if (this.leftDataType === null)
      throw new Error("leftDataType is not set for DotMemberPathConst");

    if (this.rightPath === null)
      throw new Error("rightPath is not set for DotMemberPathConst");

    return {
      type: this.type,
      leftPath: this.leftPath,
      leftDataType: this.leftDataType,
      rightPath: this.rightPath,
    };
  }
}

export class BoxMemberPathConst {
  type: BoxMemberPath<TirExpression, TirDataType>["type"] = "BoxMemberPath";
  leftPath: null | BoxMemberPath<TirExpression, TirDataType>["leftPath"];
  leftBaseType:
    | null
    | BoxMemberPath<TirExpression, TirDataType>["leftBaseType"];
  accessExp: null | BoxMemberPath<TirExpression, TirDataType>["accessExp"];

  constructor({
    leftBaseType,
    accessExp,
    leftPath,
  }: Partial<Omit<BoxMemberPath<TirExpression, TirDataType>, "type">> = {}) {
    this.leftBaseType = leftBaseType ?? null;
    this.leftPath = leftPath ?? null;
    this.accessExp = accessExp ?? null;
  }

  setLeftPath(leftPath: NonNullable<BoxMemberPathConst["leftPath"]>) {
    this.leftPath = leftPath;
    return this;
  }

  setLeftBaseType(
    leftBaseType: NonNullable<BoxMemberPathConst["leftBaseType"]>
  ) {
    this.leftBaseType = leftBaseType;
    return this;
  }

  setAccessExp(accessExp: NonNullable<BoxMemberPathConst["accessExp"]>) {
    this.accessExp = accessExp;
    return this;
  }

  toPath() {
    if (this.leftPath === null)
      throw new Error("leftPath is not set for BoxMemberPathConst");

    if (this.leftBaseType === null)
      throw new Error("leftBaseType is not set for BoxMemberPathConst");

    if (this.accessExp === null)
      throw new Error("accessExp is not set for BoxMemberPathConst");

    return {
      type: this.type,
      leftPath: this.leftPath,
      leftBaseType: this.leftBaseType,
      accessExp: this.accessExp,
    };
  }
}

export class BreakStatementConst {
  type: BreakStatement["type"] = "breakStatement";

  constructor() {}

  toAst(): BreakStatement {
    return {
      type: this.type,
    };
  }
}

export class ContinueStatementConst {
  type: ContinueStatement["type"] = "continueStatement";

  constructor() {}

  toAst(): ContinueStatement {
    return {
      type: this.type,
    };
  }
}


export class StringLiteralExpConst  {
  type :  StringLiteralExp["type"] = "string";
  value : StringLiteralExp["value"] | null = null;

  constructor() {}

  setValue(value : NonNullable<StringLiteralExpConst["value"]>) {
    this.value = value;
    return this;
  }

  toExp() : StringLiteralExp {
    if (this.value === null)
      throw new Error("value is not set for StringLiteralExpConst");

    return {
      type: this.type,
      value: this.value,
    };
  }

}


export class NumberLiteralExpConst {
  value: null | NumberLiteralExp["value"];
  type: NumberLiteralExp["type"] = "number";

  constructor({ value }: Partial<Omit<NumberLiteralExp, "type">> = {}) {
    this.value = value ?? null;
  }

  setValue(value: NonNullable<NumberLiteralExpConst["value"]>) {
    this.value = value;
    return this;
  }

  toExp(): NumberLiteralExp {
    if (this.value === null)
      throw new Error("Value is not set for NumberLiteralExpConst");

    return {
      type: this.type,
      value: this.value,
    };
  }
}

export class BooleanLiteralExpConst {
  value: null | BooleanLiteralExp["value"];
  type: BooleanLiteralExp["type"] = "boolean";

  constructor({ value }: Partial<Omit<BooleanLiteralExp, "type">> = {}) {
    this.value = value ?? null;
  }

  setValue(value: NonNullable<BooleanLiteralExpConst["value"]>) {
    this.value = value;
    return this;
  }

  toExp(): BooleanLiteralExp {
    if (this.value === null)
      throw new Error("Value is not set for BooleanLiteralExpConst");

    return {
      type: this.type,
      value: this.value,
    };
  }
}

export class PlusUninaryExpConst {
  argument: null | PlusUninaryExp<TirExpression>["argument"];
  type: PlusUninaryExp<TirExpression>["type"] = "PlusUniaryExp";

  constructor({
    argument,
  }: Partial<Omit<PlusUninaryExp<TirExpression>, "type">> = {}) {
    this.argument = argument ?? null;
  }

  setArgument(exp: NonNullable<PlusUninaryExpConst["argument"]>) {
    this.argument = exp;
    return this;
  }

  toExp(): PlusUninaryExp<TirExpression> {
    if (this.argument === null)
      throw new Error("Exp is not set for PlusUniaryExpConst");

    return {
      type: this.type,
      argument: this.argument,
    };
  }
}

export class MinusUninaryExpConst {
  argument: null | MinusUninaryExp<TirExpression>["argument"];
  type: MinusUninaryExp<TirExpression>["type"] = "MinusUniaryExp";

  constructor({
    argument,
  }: Partial<Omit<MinusUninaryExp<TirExpression>, "type">> = {}) {
    this.argument = argument ?? null;
  }

  setArgument(exp: NonNullable<MinusUninaryExpConst["argument"]>) {
    this.argument = exp;
    return this;
  }

  toExp(): MinusUninaryExp<TirExpression> {
    if (this.argument === null)
      throw new Error("Exp is not set for MinusUniaryExpConst");

    return {
      type: this.type,
      argument: this.argument,
    };
  }
}

export class BangUninaryExpConst {
  argument: null | BangUninaryExp<TirExpression>["argument"];
  type: BangUninaryExp<TirExpression>["type"] = "BangUniaryExp";

  constructor({
    argument,
  }: Partial<Omit<BangUninaryExp<TirExpression>, "type">> = {}) {
    this.argument = argument ?? null;
  }

  setArgument(exp: NonNullable<BangUninaryExpConst["argument"]>) {
    this.argument = exp;
    return this;
  }

  toExp(): BangUninaryExp<TirExpression> {
    if (this.argument === null)
      throw new Error("Exp is not set for BangUniaryExpConst");

    return {
      type: this.type,
      argument: this.argument,
    };
  }
}

export class PlusBinaryExpConst {
  type: PlusBinaryExp<TirExpression>["type"] = "PlusBinaryExp";
  left: null | PlusBinaryExp<TirExpression>["left"];
  right: null | PlusBinaryExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<PlusBinaryExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(exp: NonNullable<PlusBinaryExpConst["left"]>) {
    this.left = exp;
    return this;
  }

  setRight(exp: NonNullable<PlusBinaryExpConst["right"]>) {
    this.right = exp;
    return this;
  }

  toExp(): PlusBinaryExp<TirExpression> {
    if (!this.left)
      throw new Error(`Expected left to be set in PlusBinaryExpConst`);

    if (!this.right)
      throw new Error(`Expected right to be set in PlusBinaryExpConst`);

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class MinusBinaryExpConst {
  type: MinusBinaryExp<TirExpression>["type"] = "MinusBinaryExp";
  left: null | MinusBinaryExp<TirExpression>["left"];
  right: null | MinusBinaryExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<MinusBinaryExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(exp: NonNullable<MinusBinaryExpConst["left"]>) {
    this.left = exp;
    return this;
  }

  setRight(exp: NonNullable<MinusBinaryExpConst["right"]>) {
    this.right = exp;
    return this;
  }

  toExp(): MinusBinaryExp<TirExpression> {
    if (!this.left)
      throw new Error(`Expected left to be set in MinusBinaryExpConst`);

    if (!this.right)
      throw new Error(`Expected right to be set in MinusBinaryExpConst`);

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class StarBinaryExpConst {
  type: StarBinaryExp<TirExpression>["type"] = "StarBinaryExp";
  left: null | StarBinaryExp<TirExpression>["left"];
  right: null | StarBinaryExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<StarBinaryExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(exp: NonNullable<StarBinaryExpConst["left"]>) {
    this.left = exp;
    return this;
  }

  setRight(exp: NonNullable<StarBinaryExpConst["right"]>) {
    this.right = exp;
    return this;
  }

  toExp(): StarBinaryExp<TirExpression> {
    if (!this.left)
      throw new Error(`Expected left to be set in StarBinaryExpConst`);

    if (!this.right)
      throw new Error(`Expected right to be set in StarBinaryExpConst`);

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class SlashBinaryExpConst {
  type: SlashBinaryExp<TirExpression>["type"] = "SlashBinaryExp";
  left: null | SlashBinaryExp<TirExpression>["left"];
  right: null | SlashBinaryExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<SlashBinaryExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(exp: NonNullable<SlashBinaryExpConst["left"]>) {
    this.left = exp;
    return this;
  }

  setRight(exp: NonNullable<SlashBinaryExpConst["right"]>) {
    this.right = exp;
    return this;
  }

  toExp(): SlashBinaryExp<TirExpression> {
    if (!this.left)
      throw new Error(`Expected left to be set in SlashBinaryExpConst`);

    if (!this.right)
      throw new Error(`Expected right to be set in SlashBinaryExpConst`);

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class StrictEqualityBinaryExpConst {
  type: StrictEqualityBinaryExp<TirExpression>["type"] =
    "StrictEqualityBinaryExp";
  left: null | StrictEqualityBinaryExp<TirExpression>["left"];
  right: null | StrictEqualityBinaryExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<StrictEqualityBinaryExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(exp: NonNullable<StrictEqualityBinaryExpConst["left"]>) {
    this.left = exp;
    return this;
  }

  setRight(exp: NonNullable<StrictEqualityBinaryExpConst["right"]>) {
    this.right = exp;
    return this;
  }

  toExp(): StrictEqualityBinaryExp<TirExpression> {
    if (!this.left)
      throw new Error(
        `Expected left to be set in StrictEqualityBinaryExpConst`
      );

    if (!this.right)
      throw new Error(
        `Expected right to be set in StrictEqualityBinaryExpConst`
      );

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class StrictNotEqualBinaryExpConst {
  type: StrictNotEqualBinaryExp<TirExpression>["type"] =
    "StrictNotEqualBinaryExp";
  left: null | StrictNotEqualBinaryExp<TirExpression>["left"];
  right: null | StrictNotEqualBinaryExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<StrictNotEqualBinaryExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(exp: NonNullable<StrictNotEqualBinaryExpConst["left"]>) {
    this.left = exp;
    return this;
  }

  setRight(exp: NonNullable<StrictNotEqualBinaryExpConst["right"]>) {
    this.right = exp;
    return this;
  }

  toExp(): StrictNotEqualBinaryExp<TirExpression> {
    if (!this.left)
      throw new Error(
        `Expected left to be set in StrictNotEqualBinaryExpConst`
      );

    if (!this.right)
      throw new Error(
        `Expected right to be set in StrictNotEqualBinaryExpConst`
      );

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class GreaterThanBinaryExpConst {
  type: GreaterThanBinaryExp<TirExpression>["type"] = "GreaterThanBinaryExp";
  left: null | GreaterThanBinaryExp<TirExpression>["left"];
  right: null | GreaterThanBinaryExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<GreaterThanBinaryExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(exp: NonNullable<GreaterThanBinaryExpConst["left"]>) {
    this.left = exp;
    return this;
  }

  setRight(exp: NonNullable<GreaterThanBinaryExpConst["right"]>) {
    this.right = exp;
    return this;
  }

  toExp(): GreaterThanBinaryExp<TirExpression> {
    if (!this.left)
      throw new Error(`Expected left to be set in GreaterThanBinaryExpConst`);

    if (!this.right)
      throw new Error(`Expected right to be set in GreaterThanBinaryExpConst`);

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class GreaterThanOrEqualBinaryExpConst {
  type: GreaterThanOrEqualBinaryExp<TirExpression>["type"] =
    "GreaterThanOrEqualBinaryExp";
  left: null | GreaterThanOrEqualBinaryExp<TirExpression>["left"];
  right: null | GreaterThanOrEqualBinaryExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<GreaterThanOrEqualBinaryExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(exp: NonNullable<GreaterThanOrEqualBinaryExpConst["left"]>) {
    this.left = exp;
    return this;
  }

  setRight(exp: NonNullable<GreaterThanOrEqualBinaryExpConst["right"]>) {
    this.right = exp;
    return this;
  }

  toExp(): GreaterThanOrEqualBinaryExp<TirExpression> {
    if (!this.left)
      throw new Error(
        `Expected left to be set in GreaterThanOrEqualBinaryExpConst`
      );

    if (!this.right)
      throw new Error(
        `Expected right to be set in GreaterThanOrEqualBinaryExpConst`
      );

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class LessThanBinaryExpConst {
  type: LessThanBinaryExp<TirExpression>["type"] = "LessThanBinaryExp";
  left: null | LessThanBinaryExp<TirExpression>["left"];
  right: null | LessThanBinaryExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<LessThanBinaryExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(exp: NonNullable<LessThanBinaryExpConst["left"]>) {
    this.left = exp;
    return this;
  }

  setRight(exp: NonNullable<LessThanBinaryExpConst["right"]>) {
    this.right = exp;
    return this;
  }

  toExp(): LessThanBinaryExp<TirExpression> {
    if (!this.left)
      throw new Error(`Expected left to be set in LessThanBinaryExpConst`);

    if (!this.right)
      throw new Error(`Expected right to be set in LessThanBinaryExpConst`);

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class LessThanOrEqualBinaryExpConst {
  type: LessThanOrEqualBinaryExp<TirExpression>["type"] =
    "LessThanOrEqualBinaryExp";
  left: null | LessThanOrEqualBinaryExp<TirExpression>["left"];
  right: null | LessThanOrEqualBinaryExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<LessThanOrEqualBinaryExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(exp: NonNullable<LessThanOrEqualBinaryExpConst["left"]>) {
    this.left = exp;
    return this;
  }

  setRight(exp: NonNullable<LessThanOrEqualBinaryExpConst["right"]>) {
    this.right = exp;
    return this;
  }

  toExp(): LessThanOrEqualBinaryExp<TirExpression> {
    if (!this.left)
      throw new Error(
        `Expected left to be set in LessThanOrEqualBinaryExpConst`
      );

    if (!this.right)
      throw new Error(
        `Expected right to be set in LessThanOrEqualBinaryExpConst`
      );

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class IdentifierExpConst {
  type: IdentifierExp<TirDataType>["type"] = "identifier";
  name: null | IdentifierExp<TirDataType>["name"];
  datatype: null | IdentifierExp<TirDataType>["datatype"];

  constructor({
    name,
    datatype,
  }: Partial<Omit<IdentifierExp<TirDataType>, "type">> = {}) {
    this.name = name ?? null;
    this.datatype = datatype ?? null;
  }

  setName(name: NonNullable<IdentifierExpConst["name"]>) {
    this.name = name;
    return this;
  }

  setDataType(datatype: NonNullable<IdentifierExpConst["datatype"]>) {
    this.datatype = datatype;
    return this;
  }

  toExp(): IdentifierExp<TirDataType> {
    if (!this.name)
      throw new Error(`Expected name to be set in IdentifierExpConst`);
    if (!this.datatype)
      throw new Error(`Expected datatype to be set in identifierExpConst `);

    return {
      type: this.type,
      name: this.name,
      datatype: this.datatype,
    };
  }
}

export class ArrayLiteralExpConst {
  type: ArrayLiteralExp<TirExpression, TirDataType>["type"] = "array";
  exps: null | ArrayLiteralExp<TirExpression, TirDataType>["exps"];

  constructor({
    exps,
  }: Partial<
    Omit<ArrayLiteralExp<TirExpression, TirDataType>, "type" | "datatype">
  > = {}) {
    this.exps = exps ?? null;
  }

  setExps(exps: NonNullable<ArrayLiteralExpConst["exps"]>) {
    this.exps = exps;
    return this;
  }

  toExp(): ArrayLiteralExp<TirExpression, TirDataType> {
    if (this.exps === null)
      throw new Error(`Expected exps to be set in ArrayLiteralExpConst`);

    const firstElementDatatype = getDatatypeOfTirExpression(this.exps[0]);

    const lengthOfElements = this.exps.length;

    const arrayDatatype = new ArrayDatatypeConst()
      .setBaseType(firstElementDatatype)
      .setNumberOfElements(lengthOfElements);

    return {
      type: this.type,
      exps: this.exps,
      datatype: arrayDatatype.toDatatype(),
    };
  }
}

export class BoxMemberAccessExpConst {
  type: BoxMemberAccessExp<TirExpression>["type"] = "BoxMemberAccess";
  left: null | BoxMemberAccessExp<TirExpression>["left"];
  right: null | BoxMemberAccessExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<BoxMemberAccessExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(left: NonNullable<BoxMemberAccessExpConst["left"]>) {
    this.left = left;
    return this;
  }

  setRight(right: NonNullable<BoxMemberAccessExpConst["right"]>) {
    this.right = right;
    return this;
  }

  toExp(): BoxMemberAccessExp<TirExpression> {
    if (!this.left)
      throw new Error(`Expected left to be set in BoxMemberAccessExpConst`);
    if (!this.right)
      throw new Error(`Expected right to be set in BoxMemberAccessExpConst`);

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class ObjectLitearlExpConst {
  type: ObjectLiteralExp<TirExpression, TirAst>["type"] = "object";
  keys: ObjectLiteralExp<TirExpression, TirAst>["keys"] = [];

  constructor({
    keys,
  }: Partial<
    Omit<ObjectLiteralExp<TirExpression, TirAst>, "type" | "datatype">
  > = {}) {
    this.keys = keys ?? [];
  }

  addKeys(eleName: string, ele: TirExpression) {
    this.keys.push([eleName, ele]);
    return this;
  }

  toExp(): ObjectLiteralExp<TirExpression, TirDataType> {
    const keys = this.keys;

    if (keys.length === 0) {
      throw new Error(`Expected keys to be set in ObjectLiteralExpConst`);
    }

    const objectDatatype = new ObjectDatatypeConst();

    for (const [eleName, eleExpression] of this.keys) {
      objectDatatype.addkeys(
        eleName,
        getDatatypeOfTirExpression(eleExpression)
      );
    }

    return {
      type: this.type,
      keys: this.keys,
      datatype: objectDatatype.toDatatype(),
    };
  }
}

export class DotMemberAccessExpConst {
  type: DotMemberAccessExp<TirExpression>["type"] = "DotMemberAccess";
  left: null | DotMemberAccessExp<TirExpression>["left"];
  right: null | DotMemberAccessExp<TirExpression>["right"];

  constructor({
    left,
    right,
  }: Partial<Omit<DotMemberAccessExp<TirExpression>, "type">> = {}) {
    this.left = left ?? null;
    this.right = right ?? null;
  }

  setLeft(left: NonNullable<DotMemberAccessExpConst["left"]>) {
    this.left = left;
    return this;
  }

  setRight(right: NonNullable<DotMemberAccessExpConst["right"]>) {
    this.right = right;
    return this;
  }

  toExp(): DotMemberAccessExp<TirExpression> {
    if (!this.left)
      throw new Error(`Expected left to be set in DotMemberAccessExpConst`);

    if (!this.right)
      throw new Error(`Expected right to be set in DotMemberAccessExpConst`);

    return {
      type: this.type,
      left: this.left,
      right: this.right,
    };
  }
}

export class VoidDataTypeConst {
  type: VoidDatatype["type"] = "VoidDatatype";

  constructor() {}

  toDatatype(): VoidDatatype {
    return { type: this.type };
  }
}

export class BooleanDataTypeConst {
  type: BooleanDataType["type"] = "BooleanDataType";

  constructor() {}

  toDatatype(): BooleanDataType {
    return { type: this.type };
  }
}

export class NumberDatatypeConst {
  type: NumberDatatype["type"] = "NumberDatatype";

  constructor() {}

  toDatatype(): NumberDatatype {
    return { type: this.type };
  }
}

export class UnknownDatatypeConst {
  type: UnknownDatatype["type"] = "UnknownDatatype";

  constructor() {}

  toDatatype(): UnknownDatatype {
    return { type: this.type };
  }
}

export class NotCalculatedDatatypeConst {
  type: NotCalculatedDatatype["type"] = "NotCalculatedDatatype";

  constructor() {}

  toDatatype(): NotCalculatedDatatype {
    return { type: this.type };
  }
}

export class StringDatatypeConst {
  type: StringDatatype["type"] = "StringDatatype";
  length: null | StringDatatype["length"];

  constructor({ length }: Partial<Omit<StringDatatype, "type">> = {}) {
    this.length = length ?? null;
  }
  

  setLength(length: NonNullable<StringDatatypeConst["length"]>) {
    this.length = length;
    return this;
  }

  toDatatype(): StringDatatype {
    if (!this.length)
      throw new Error(`Expected length to be set in StringDatatypeConst`);

    return { type: this.type, length: this.length };
  }
}

export class UnknownVariableConst {
  type: UnknownVariable["type"] = "UnknownVariable";
  varName: UnknownVariable["varName"];

  constructor({ varName }: Partial<Omit<UnknownVariable, "type">> = {}) {
    this.varName = varName ?? "";
  }

  toExp(): UnknownVariable {
    return {
      type: this.type,
      varName: this.varName,
    };
  }
}

export class IdentifierDatatypeConst {
  type: IdentifierDatatype["type"] = "IdentifierDatatype";
  name: IdentifierDatatype["name"];

  constructor({ name }: Partial<Omit<IdentifierDatatype, "type">> = {}) {
    this.name = name ?? "";
  }

  toDatatype(): IdentifierDatatype {
    return { type: this.type, name: this.name };
  }
}

export class ArrayDatatypeConst {
  type: ArrayDatatype<TirDataType>["type"] = "ArrayDataType";
  baseType: null | ArrayDatatype<TirDataType>["baseType"];
  numberOfElements: null | ArrayDatatype<TirDataType>["numberOfElements"];

  constructor({
    baseType,
    numberOfElements,
  }: Partial<Omit<ArrayDatatype<TirDataType>, "type">> = {}) {
    this.baseType = baseType ?? null;
    this.numberOfElements = numberOfElements ?? null;
  }

  setBaseType(baseType: NonNullable<ArrayDatatypeConst["baseType"]>) {
    this.baseType = baseType;
    return this;
  }

  setNumberOfElements(
    numberOfElements: NonNullable<ArrayDatatypeConst["numberOfElements"]>
  ) {
    this.numberOfElements = numberOfElements;
    return this;
  }

  toDatatype(): ArrayDatatype<TirDataType> {
    if (this.baseType === null)
      throw new Error("Expected baseType to be set in ArrayDatatypeConst");

    if (this.numberOfElements === null)
      throw new Error(
        "Expected numberOfElements to be set in ArrayDatatypeConst"
      );

    return {
      type: this.type,
      baseType: this.baseType,
      numberOfElements: this.numberOfElements,
    };
  }
}

export class ObjectDatatypeConst {
  type: ObjectDatatype<TirDataType>["type"] = "ObjectDataType";
  keys: ObjectDatatype<TirDataType>["keys"] = {};

  constructor({
    keys,
  }: Partial<Omit<ObjectDatatype<TirDataType>, "type">> = {}) {
    this.keys = keys ?? {};
  }

  addkeys(eleName: string, ele: TirDataType) {
    this.keys[eleName] = ele;
    return this;
  }

  toDatatype(): ObjectDatatype<TirDataType> {
    return {
      type: this.type,
      keys: this.keys,
    };
  }
}

export class FunctionDatatypeConst {
  type: FunctionDatatype<TirDataType>["type"] = "FunctionDataType";
  returnType: null | FunctionDatatype<TirDataType>["returnType"];
  arguments: FunctionDatatype<TirDataType>["arguments"] = {};

  constructor({
    returnType,
    arguments: args,
  }: Partial<Omit<FunctionDatatype<TirDataType>, "type">> = {}) {
    this.returnType = returnType ?? null;
    this.arguments = args ?? {};
  }

  addArgument(argName: string, arg: TirDataType) {
    this.arguments[argName] = arg;
    return this;
  }

  setReturnType(returnType: NonNullable<FunctionDatatypeConst["returnType"]>) {
    this.returnType = returnType;
    return this;
  }

  toDatatype(): FunctionDatatype<TirDataType> {
    if (this.returnType === null)
      throw new Error("Expected returnType to be set in FunctionDatatypeConst");

    return {
      type: this.type,
      returnType: this.returnType,
      arguments: this.arguments,
    };
  }
}

export class PointerDatatypeConst {
  type: PointerDatatype<TirDataType>["type"] = "PointerDataType";
  pointsTo: null | PointerDatatype<TirDataType>["pointsTo"];

  constructor({
    pointsTo,
  }: Partial<Omit<PointerDatatype<TirDataType>, "type">> = {}) {
    this.pointsTo = pointsTo ?? null;
  }

  setBaseType(baseType: NonNullable<PointerDatatypeConst["pointsTo"]>) {
    this.pointsTo = baseType;
    return this;
  }

  toDatatype(): PointerDatatype<TirDataType> {
    if (this.pointsTo === null)
      throw new Error("Expected baseType to be set in PointerDatatypeConst");

    return {
      type: this.type,
      pointsTo: this.pointsTo,
    };
  }
}
