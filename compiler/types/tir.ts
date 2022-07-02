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
import {
  AmpersandBinaryExp,
  ArrayDatatype,
  ArrayLiteralExp,
  BangUninaryExp,
  BooleanDataType,
  BooleanLiteralExp,
  BoxMemberAccessExp,
  BreakStatement,
  CaretBinaryExp,
  CharDatatype,
  ConstVariableDeclaration,
  ContinueStatement,
  DotMemberAccessExp,
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
  | StrictEqualityBinaryExp<TirExpression, TirDataType>
  | StrictNotEqualBinaryExp<TirExpression, TirDataType>
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
