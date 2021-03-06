import llvm, {
  ArrayType,
  BasicBlock,
  ConstantFP,
  Function as LLVMFunction,
  FunctionType,
  IRBuilder,
  LLVMContext,
  Module,
  PointerType,
  StructType,
  Value,
} from "llvm-bindings";
import { TLLVMFunction } from "./function";
import {
  FunctionDeclaration,
  ImportDeclaration,
  ReAssignmentPath,
} from "../types/base";
import { getDatatypeOfTirExpression } from "../types/tir";
import {
  isArrayDatatype,
  isArrayLiteralExp,
  isBangUniaryExp,
  isBooleanDatatype,
  isBooleanLiteralExp,
  isBoxMemberAccessExp,
  isDotMemberAccessExp,
  isFunctionCallExp,
  isFunctionDatatype,
  isGreaterThanBinaryExp,
  isGreaterThanOrEqualBinaryExp,
  isIdentifierLiteralExp,
  isLessThanBinaryExp,
  isLessThanOrEqualBinaryExp,
  isMinusBinaryExp,
  isMinusUninaryExp,
  isNumberDatatype,
  isNumberLiteralExp,
  isObjectDatatype,
  isObjectLiteralExp,
  isPlusBinaryExp,
  isPlusUninaryExp,
  isSlashBinaryExp,
  isStarBinaryExp,
  isStrictEqualityBinaryExp,
  isStrictNotEqualBinaryExp,
  isStringDatatype,
  isStringLiteralExp,
  isVoidDatatype,
} from "../types/all";
import { TirAst, TirExpression, TirDataType } from "../types/tir";
import { Scope } from "./scope";

export const convertToLLVMModule = (asts: TirAst[]): string => {
  const ModuleCodeGen = new CodeGen(asts, "main");
  ModuleCodeGen.consume();
  return ModuleCodeGen.dumpModule();
};

export class CodeGen {
  asts: TirAst[];
  curPos: number | null;

  moduleName: string;

  llvmContext: LLVMContext;
  llvmModule: Module;
  llvmIrBuilder: IRBuilder;

  globalVarDatabases: { [varName: string]: LLVMFunction | undefined };

  constructor(
    typeCheckedAst: TirAst[],
    moduleName: string,
    context?: LLVMContext
  ) {
    this.asts = typeCheckedAst;
    this.curPos = 0;

    this.moduleName = moduleName;

    this.llvmContext = context ?? new LLVMContext();
    this.llvmModule = new Module(moduleName, this.llvmContext);
    this.llvmIrBuilder = new IRBuilder(this.llvmContext);

    this.globalVarDatabases = {};

    // const voidType = this.llvmIrBuilder.getVoidTy();
    // const mainFnType = FunctionType.get(voidType, [], false);
    // const mainFn = LLVMFunction.Create(
    //   mainFnType,
    //   LLVMFunction.LinkageTypes.ExternalLinkage,
    //   "main",
    //   this.llvmModule
    // );
    // const TMainFn = new TLLVMFunction(mainFn);
    // scope.getCurrentFn() = TMainFn;
    // const entryBasicBlock = BasicBlock.Create(
    //   this.llvmContext,
    //   "entry",
    //   mainFn
    // );
    // this.llvmIrBuilder.SetInsertPoint(entryBasicBlock);
  }

  consume() {
    while (this.getCurAst() !== null) {
      const curAst = this.getCurAst()!;

      if (curAst.type === "FunctionDeclaration") {
        this.consumeFunctionDeclaration(curAst);
      } else if (curAst.type === "importDeclaration") {
        this.consumeImportDeclaration(curAst);
      } else {
        throw new Error(
          `At top level only function declaration or import declaration are supported`
        );
      }

      this.next();
    }
  }

  consumeImportDeclaration(curAst: ImportDeclaration<TirDataType>) {
    const importedIdentifiers = curAst.importedIdentifiers;

    for (const importedIdentifier of importedIdentifiers) {
      const importingDatatype = importedIdentifier.dataType;

      if (!isFunctionDatatype(importingDatatype)) {
        throw new Error(`For now its only supported to import functions`);
      }

      const returnType = this.getLLVMType(importingDatatype.returnType);
      const args = Object.keys(importingDatatype.arguments).map((value) => {
        const argType = this.getLLVMType(importingDatatype.arguments[value]!);
        return argType;
      });

      const functionLLVMType = FunctionType.get(returnType, args, false);

      const functionValue = LLVMFunction.Create(
        functionLLVMType,
        LLVMFunction.LinkageTypes.ExternalLinkage,
        importedIdentifier.name,
        this.llvmModule
      );

      this.addGlobalVar(importedIdentifier.name, functionValue);
    }
  }

  consumeAst(scope: Scope, curAst: TirAst | null) {
    if (curAst === null) throw Error("Does not expect curAst to be null");
    if (curAst.type === "constVariableDeclaration") {
      this.consumeVariableDeclaration(scope, curAst);
    } else if (curAst.type === "letVariableDeclaration") {
      this.consumeVariableDeclaration(scope, curAst);
    } else if (curAst.type === "FunctionDeclaration") {
      this.consumeFunctionDeclaration(curAst);
    } else if (curAst.type === "ReturnExpression") {
      this.consumeReturnExp(scope, curAst);
    } else if (curAst.type === "ReAssignment") {
      this.consumeReassignment(scope, curAst);
    } else if (curAst.type === "typeCheckedIfBlockDeclaration") {
      this.consumeTypeCheckedIfBlockDeclaration(scope, curAst);
    } else if (curAst.type === "WhileLoopDeclaration") {
      this.consumeWhileLoopDeclaration(scope, curAst);
    } else if (curAst.type === "continueStatement") {
      this.consumeContinueStatement(scope, curAst);
    } else if (curAst.type === "breakStatement") {
      this.consumeBreakStatement(scope, curAst);
    } else {
      throw Error(`It is still not supported for compiling ast ${curAst.type}`);
    }
  }
  /**
   * Expected curAst to be of type KeywordTokens.Continue
   */
  consumeContinueStatement(scope: Scope, curAst: TirAst | null) {
    if (curAst === null || curAst.type !== "continueStatement") {
      throw new Error(
        `Expected curAst to be of type KeywordTokens.Continue but instead got ${curAst?.type}`
      );
    }

    if (scope.continueBB === null) {
      throw Error(`Expected scope.continueBB to be not null`);
    }

    this.llvmIrBuilder.CreateBr(scope.continueBB);
    scope.scopeTerminated();
  }
  /**
   * Expected curAst to be of type KeywordTokens.Break
   */
  consumeBreakStatement(scope: Scope, curAst: TirAst | null) {
    if (curAst === null || curAst.type !== "breakStatement") {
      throw new Error(
        `Expected curAst to be of type KeywordTokens.Break but instead got ${curAst?.type}`
      );
    }

    if (scope.breakBB === null) {
      throw Error(`Expected scope.breakBB to be not null`);
    }

    this.llvmIrBuilder.CreateBr(scope.breakBB);
    scope.scopeTerminated();
  }

  /**
   * Expects the curAst to be of WhileLoopDeclaration
   */

  consumeWhileLoopDeclaration(scope: Scope, curAst: TirAst | null) {
    if (curAst === null || curAst.type !== "WhileLoopDeclaration") {
      throw new Error(
        `Expected curAst to of type WhileLoopDeclaration but instead got ${curAst?.type}`
      );
    }

    const whileLoopDecBB = BasicBlock.Create(
      this.llvmContext,
      scope.getCurrentFn().getBasicBlockTempName(),
      scope.getCurrentFn().getLLVMFunction()
    );

    const outsideBlockBB = BasicBlock.Create(
      this.llvmContext,
      scope.getCurrentFn().getBasicBlockTempName(),
      scope.getCurrentFn().getLLVMFunction()
    );

    this.llvmIrBuilder.CreateBr(whileLoopDecBB);

    this.llvmIrBuilder.SetInsertPoint(whileLoopDecBB);

    scope.getCurrentFn().parsingChildContext();

    const newScope = new Scope({
      breakBB: outsideBlockBB,
      continueBB: whileLoopDecBB,
      fn: scope.getCurrentFn(),
    });

    for (const insideWhileLoopAst of curAst.blocks) {
      this.consumeAst(newScope, insideWhileLoopAst);
    }
    if (!newScope.isScopeTerminated()) {
      this.llvmIrBuilder.CreateBr(whileLoopDecBB);
    }

    scope.getCurrentFn().finishedParsingChildContext();

    this.llvmIrBuilder.SetInsertPoint(outsideBlockBB);
  }

  /**
   * Expects the curAst to be of TypeCheckedIfBlockDeclaration
   */

  consumeTypeCheckedIfBlockDeclaration(scope: Scope, curAst: TirAst | null) {
    if (curAst === null || curAst.type !== "typeCheckedIfBlockDeclaration") {
      throw Error(
        `Expected curAst to be of type typeCheckedIfBlockDeclaration but instead got ${curAst?.type}`
      );
    }

    const ifBlockCondExp = this.getExpValue(scope, curAst.ifBlock.condition);

    const ifBlockBB = BasicBlock.Create(
      this.llvmContext,
      scope.getCurrentFn().getBasicBlockTempName(),
      scope.getCurrentFn().getLLVMFunction()
    );

    const elseIfBlocksBBs = curAst.elseIfBlocks.map((value) => {
      const elseIfBlockCondChecker = BasicBlock.Create(
        this.llvmContext,
        scope.getCurrentFn().getBasicBlockTempName(),
        scope.getCurrentFn().getLLVMFunction()
      );

      const elseIfBlockDeclaration = BasicBlock.Create(
        this.llvmContext,
        scope.getCurrentFn().getBasicBlockTempName(),
        scope.getCurrentFn().getLLVMFunction()
      );

      return {
        condCheckerBB: elseIfBlockCondChecker,
        decBB: elseIfBlockDeclaration,
      };
    });

    const elseBlockBB = curAst.elseBlock
      ? BasicBlock.Create(
          this.llvmContext,
          scope.getCurrentFn().getBasicBlockTempName(),
          scope.getCurrentFn().getLLVMFunction()
        )
      : undefined;

    const outsideBlock = BasicBlock.Create(
      this.llvmContext,
      scope.getCurrentFn().getBasicBlockTempName(),
      scope.getCurrentFn().getLLVMFunction()
    );

    const BBToGoAferIfBlockFailed = () => {
      const isElseIfBlockPresent = elseIfBlocksBBs.length !== 0;
      const isElseBlockPresent = elseBlockBB !== undefined;

      if (isElseIfBlockPresent) {
        return elseIfBlocksBBs[0].condCheckerBB;
      }

      if (isElseBlockPresent) {
        return elseBlockBB;
      }

      return outsideBlock;
    };

    this.llvmIrBuilder.CreateCondBr(
      ifBlockCondExp,
      ifBlockBB,
      BBToGoAferIfBlockFailed()
    );

    this.llvmIrBuilder.SetInsertPoint(ifBlockBB);

    scope.getCurrentFn().parsingChildContext();

    const ifBlockScope = new Scope({
      ...scope,
    });

    for (const ifBlockAst of curAst.ifBlock.blocks) {
      this.consumeAst(ifBlockScope, ifBlockAst);
    }

    if (!ifBlockScope.isScopeTerminated()) {
      this.llvmIrBuilder.CreateBr(outsideBlock);
    }

    scope.getCurrentFn().finishedParsingChildContext();

    elseIfBlocksBBs.forEach(({ condCheckerBB, decBB }, i) => {
      const elseIfBlockAst = curAst.elseIfBlocks[i];

      this.llvmIrBuilder.SetInsertPoint(condCheckerBB);

      const elseIfBlockCondition = this.getExpValue(
        scope,
        elseIfBlockAst.condition
      );

      const nextBBToGoIfCondFailed = () => {
        const isThereAnotherElseIfBlock = elseIfBlocksBBs[i + 1] !== undefined;
        const isThereElseBlock = elseBlockBB !== undefined;

        if (isThereAnotherElseIfBlock) {
          return elseIfBlocksBBs[i + 1].condCheckerBB;
        }

        if (isThereElseBlock) {
          return elseBlockBB;
        }

        return outsideBlock;
      };

      this.llvmIrBuilder.CreateCondBr(
        elseIfBlockCondition,
        decBB,
        nextBBToGoIfCondFailed()
      );

      this.llvmIrBuilder.SetInsertPoint(decBB);

      scope.getCurrentFn().parsingChildContext();

      const elseIfBlockScope = new Scope({
        ...scope,
      });

      for (const astInsideElseIfBlock of elseIfBlockAst.blocks) {
        this.consumeAst(elseIfBlockScope, astInsideElseIfBlock);
      }
      if (!elseIfBlockScope.isScopeTerminated()) {
        this.llvmIrBuilder.CreateBr(outsideBlock);
      }

      scope.getCurrentFn().finishedParsingChildContext();
    });

    if (elseBlockBB) {
      this.llvmIrBuilder.SetInsertPoint(elseBlockBB);

      scope.getCurrentFn().parsingChildContext();

      const elseBlockScope = new Scope({
        ...scope,
      });

      for (const elseBlockAst of curAst.elseBlock!.blocks) {
        this.consumeAst(elseBlockScope, elseBlockAst);
      }
      if (!elseBlockScope.isScopeTerminated()) {
        this.llvmIrBuilder.CreateBr(outsideBlock);
      }
      scope.getCurrentFn().finishedParsingChildContext();
    }

    this.llvmIrBuilder.SetInsertPoint(outsideBlock);

    // this.llvmIrBuilder.CreateStore(i);
  }

  /**
   * Expects the curAst to be of Reassignment
   *
   */

  consumeReassignment(scope: Scope, curAst: TirAst | null) {
    if (curAst === null || curAst.type !== "ReAssignment")
      throw Error(
        `Expected curAst to be of type ConsumeReaassignment but instead got ${curAst?.type}`
      );

    const leftPath = curAst.path;
    const varPointer = this.getReassignmentPointer(scope, leftPath);

    const expValue = this.getExpValue(scope, curAst.exp);

    if (curAst.assignmentOperator === "assign") {
      this.llvmIrBuilder.CreateStore(expValue, varPointer);
    } else if (curAst.assignmentOperator === "plusAssign") {
      const loadVar = this.llvmIrBuilder.CreateLoad(
        this.llvmIrBuilder.getDoubleTy(),
        varPointer
      );
      const addValue = this.llvmIrBuilder.CreateFAdd(loadVar, expValue);
      this.llvmIrBuilder.CreateStore(addValue, varPointer);
    } else if (curAst.assignmentOperator === "minusAssign") {
      const loadVar = this.llvmIrBuilder.CreateLoad(
        this.llvmIrBuilder.getDoubleTy(),
        varPointer
      );
      const minusValue = this.llvmIrBuilder.CreateFSub(loadVar, expValue);
      this.llvmIrBuilder.CreateStore(minusValue, varPointer);
    } else if (curAst.assignmentOperator === "starAssign") {
      const loadVar = this.llvmIrBuilder.CreateLoad(
        this.llvmIrBuilder.getDoubleTy(),
        varPointer
      );
      const starValue = this.llvmIrBuilder.CreateFMul(loadVar, expValue);
      this.llvmIrBuilder.CreateStore(starValue, varPointer);
    } else if (curAst.assignmentOperator == "slashAssign") {
      const loadVar = this.llvmIrBuilder.CreateLoad(
        this.llvmIrBuilder.getDoubleTy(),
        varPointer
      );
      const slashValue = this.llvmIrBuilder.CreateFDiv(loadVar, expValue);
      this.llvmIrBuilder.CreateStore(slashValue, varPointer);
    }
  }

  /**
   * Expects the curAst to be constVariableDeclaration
   */

  consumeVariableDeclaration(scope: Scope, curAst: TirAst | null) {
    if (
      curAst === null ||
      (curAst.type !== "constVariableDeclaration" &&
        curAst.type !== "letVariableDeclaration")
    )
      throw Error(`Unreachable`);

    const varType = this.getLLVMType(curAst.datatype);
    const resolvedIdentifierName = this.resolveIdentifierName(
      scope,
      curAst.identifierName
    );

    const allocatedVar = this.llvmIrBuilder.CreateAlloca(
      varType,
      null,
      resolvedIdentifierName
    );

    const value = this.getExpValue(scope, curAst.exp);

    this.llvmIrBuilder.CreateStore(value, allocatedVar);

    scope.getCurrentFn().insertVarName(resolvedIdentifierName, allocatedVar);
  }

  /**
   * Expects the curAst to be functionDeclaration
   */

  consumeFunctionDeclaration(curAst: FunctionDeclaration<TirAst, TirDataType>) {
    const returnLLVMType = this.getLLVMType(curAst.returnType);
    const fnArguments = curAst.arguments.map(([argName, argType]) => {
      return this.getLLVMType(argType);
    });

    const fnType = FunctionType.get(returnLLVMType, fnArguments, false);
    const fnValue = LLVMFunction.Create(
      fnType,
      LLVMFunction.LinkageTypes.ExternalLinkage,
      curAst.name,
      this.llvmModule
    );

    this.addGlobalVar(curAst.name, fnValue);

    const TFnValue = new TLLVMFunction(fnValue);

    const entryBB = BasicBlock.Create(this.llvmContext, "entry", fnValue);

    this.llvmIrBuilder.SetInsertPoint(entryBB);

    curAst.arguments.forEach(([argName], i) => {
      const arg = fnValue.getArg(i);
      const argType = arg.getType();

      const allocaArg = this.llvmIrBuilder.CreateAlloca(argType, null, argName);
      this.llvmIrBuilder.CreateStore(arg, allocaArg);

      TFnValue.insertVarName(argName, allocaArg);
    });

    const scopeForFnDeclaration = new Scope({
      breakBB: null,
      continueBB: null,
      fn: TFnValue,
    });

    curAst.blocks.forEach((ast) => {
      this.consumeAst(scopeForFnDeclaration, ast);
    });

    if (!scopeForFnDeclaration.isScopeTerminated()) {
      this.llvmIrBuilder.CreateRetVoid();
    }
  }
  /**
   * Expects the curAst to be of ReturnExpression
   */
  consumeReturnExp(scope: Scope, curAst: TirAst | null) {
    if (curAst === null || curAst.type !== "ReturnExpression")
      throw new Error("Expected curAst to be of type ReturnExpression");

    const returnExp = curAst.exp;

    if (returnExp === null) {
      this.llvmIrBuilder.CreateRetVoid();
    } else {
      this.llvmIrBuilder.CreateRet(this.getExpValue(scope, returnExp));
    }

    scope.scopeTerminated();
  }

  getReassignmentPointer(
    scope: Scope,
    assignmentPath: ReAssignmentPath<TirExpression, TirDataType>
  ): Value {
    if (assignmentPath.type === "IdentifierPath") {
      const varInfo = scope.getCurrentFn().getVarInfo(assignmentPath.name);

      if (varInfo === null)
        throw Error(`There is no variable with name ${assignmentPath.name}`);

      return varInfo;
    } else if (assignmentPath.type === "DotMemberPath") {
      const leftInfo = this.getReassignmentPointer(
        scope,
        assignmentPath.leftPath
      );
      const leftDatatype = assignmentPath.leftDataType;

      if (!isObjectDatatype(leftDatatype))
        throw Error(
          "Expected typechecker to make sure that leftDatatype is object"
        );

      const index = Object.keys(leftDatatype.keys).indexOf(
        assignmentPath.rightPath
      );

      const deReferenceLeft = this.llvmIrBuilder.CreateLoad(
        leftInfo.getType().getPointerElementType(),
        leftInfo
      );

      const ObjectElementPointer = this.llvmIrBuilder.CreateGEP(
        deReferenceLeft.getType().getPointerElementType(),
        deReferenceLeft,
        [this.llvmIrBuilder.getInt64(0), this.llvmIrBuilder.getInt32(index)]
      );

      return ObjectElementPointer;
    } else if (assignmentPath.type === "BoxMemberPath") {
      const leftPointer = this.getReassignmentPointer(
        scope,
        assignmentPath.leftPath
      );

      const floatIndexValue = this.getExpValue(scope, assignmentPath.accessExp);
      const convertedToInt = this.llvmIrBuilder.CreateFPToSI(
        floatIndexValue,
        this.llvmIrBuilder.getInt32Ty()
      );

      const deferenceLeft = this.llvmIrBuilder.CreateLoad(
        leftPointer.getType().getPointerElementType(),
        leftPointer
      );

      const arrayElementPointer = this.llvmIrBuilder.CreateGEP(
        deferenceLeft.getType().getPointerElementType(),
        deferenceLeft,
        [this.llvmIrBuilder.getInt64(0), convertedToInt]
      );

      return arrayElementPointer;
    }

    throw Error("Not yet Implemented");
  }

  getExpValue(scope: Scope, exp: TirExpression): Value {
    if (isNumberLiteralExp(exp)) {
      return ConstantFP.get(this.llvmIrBuilder.getDoubleTy(), exp.value);
    } else if (isBooleanLiteralExp(exp)) {
      return this.llvmIrBuilder.getInt1(exp.value);
    } else if (isIdentifierLiteralExp(exp)) {
      const allocatedVarName = scope.getCurrentFn().getVarInfo(exp.name);

      if (allocatedVarName === null) {
        const value = this.getGlobalVar(exp.name);

        if (value === null)
          throw new Error(`There is no variable with name ${exp.name}`);

        return value;
      }

      const llvmType = this.getLLVMType(exp.datatype);

      return this.llvmIrBuilder.CreateLoad(llvmType, allocatedVarName);
    } else if (isFunctionCallExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);

      const fnArgs = exp.arguments.map((exp) => {
        return this.getExpValue(scope, exp);
      });
      return this.llvmIrBuilder.CreateCall(leftValue as LLVMFunction, fnArgs);
    } else if (isStringLiteralExp(exp)) {
      const noOfElements = exp.value.length;
      const baseType = this.llvmIrBuilder.getInt8Ty();
      const arrayType = ArrayType.get(baseType, noOfElements);
      const allocatedValue = this.llvmIrBuilder.CreateAlloca(arrayType);

      Array.from(exp.value).forEach((char, i) => {
        const insideElementPointer = this.llvmIrBuilder.CreateGEP(
          arrayType,
          allocatedValue,
          [this.llvmIrBuilder.getInt64(0), this.llvmIrBuilder.getInt32(i)]
        );

        this.llvmIrBuilder.CreateStore(
          this.llvmIrBuilder.getInt8(char.charCodeAt(0)),
          insideElementPointer
        );
      });

      return allocatedValue;
    } else if (isArrayLiteralExp(exp)) {
      const arrayDatatype = exp.datatype;

      if (!isArrayDatatype(arrayDatatype))
        throw Error(
          "Expected typechecker to make sure that only ArrayDatatype is allowed in array"
        );

      const noOfElements = arrayDatatype.numberOfElements;

      if (noOfElements === undefined) {
        throw Error(
          "Expected typechecker to make sure that numberOfElements is number"
        );
      }

      const baseType = this.getLLVMType(arrayDatatype.baseType);
      const arrayType = ArrayType.get(baseType, noOfElements);
      const allocatedValue = this.llvmIrBuilder.CreateAlloca(arrayType);

      exp.exps.forEach((exp, i) => {
        const insideElementPointer = this.llvmIrBuilder.CreateGEP(
          arrayType,
          allocatedValue,
          [this.llvmIrBuilder.getInt64(0), this.llvmIrBuilder.getInt32(i)]
        );

        this.llvmIrBuilder.CreateStore(
          this.getExpValue(scope, exp),
          insideElementPointer
        );
      });

      return allocatedValue;
    } else if (isObjectLiteralExp(exp)) {
      const objectDatatype = exp.datatype;

      if (!isObjectDatatype(objectDatatype)) {
        throw Error(
          "Expected typechecker to make sure that datatype to be always objectDatatype"
        );
      }

      const elementType = Object.values(objectDatatype.keys).map((value) => {
        if (value === undefined)
          throw Error("Did not expect undefined as value in keys");

        return this.getLLVMType(value);
      });

      const structType = StructType.get(this.llvmContext, elementType);
      const allocatedValue = this.llvmIrBuilder.CreateAlloca(structType);

      exp.keys.forEach(([_, exp], i) => {
        if (exp === undefined)
          throw Error("Did not expect undefined as values in keys");

        const insideElementPointer = this.llvmIrBuilder.CreateGEP(
          structType,
          allocatedValue,
          [this.llvmIrBuilder.getInt64(0), this.llvmIrBuilder.getInt32(i)]
        );

        this.llvmIrBuilder.CreateStore(
          this.getExpValue(scope, exp),
          insideElementPointer
        );
      });

      return allocatedValue;
    } else if (isBangUniaryExp(exp)) {
      const argValue = this.getExpValue(scope, exp.argument);
      return this.llvmIrBuilder.CreateXor(
        argValue,
        this.llvmIrBuilder.getInt1(true)
      );
    } else if (isPlusUninaryExp(exp)) {
      return this.getExpValue(scope, exp.argument);
    } else if (isPlusBinaryExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);
      const rightValue = this.getExpValue(scope, exp.right);

      return this.llvmIrBuilder.CreateFAdd(leftValue, rightValue);
    } else if (isMinusUninaryExp(exp)) {
      const argValue = this.getExpValue(scope, exp.argument);
      return this.llvmIrBuilder.CreateFNeg(argValue);
    } else if (isMinusBinaryExp(exp)) {
      const leftvalue = this.getExpValue(scope, exp.left);
      const rightValue = this.getExpValue(scope, exp.right);

      return this.llvmIrBuilder.CreateFSub(leftvalue, rightValue);
    } else if (isStarBinaryExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);
      const rightValue = this.getExpValue(scope, exp.right);

      return this.llvmIrBuilder.CreateFMul(leftValue, rightValue);
    } else if (isSlashBinaryExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);
      const rightValue = this.getExpValue(scope, exp.right);

      return this.llvmIrBuilder.CreateFDiv(leftValue, rightValue);
    } else if (isStrictEqualityBinaryExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);
      const rightValue = this.getExpValue(scope, exp.right);

      const comparingDatatype = getDatatypeOfTirExpression(exp.left);

      if (comparingDatatype === undefined) {
        throw Error(
          "Expected typeCheckAst to make sure Datatype not be undefined"
        );
      }

      if (isNumberDatatype(comparingDatatype)) {
        return this.llvmIrBuilder.CreateFCmpOEQ(leftValue, rightValue);
      } else if (isBooleanDatatype(comparingDatatype)) {
        return this.llvmIrBuilder.CreateICmpEQ(leftValue, rightValue);
      }
    } else if (isStrictNotEqualBinaryExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);
      const rightValue = this.getExpValue(scope, exp.right);

      const comparingDatatype = getDatatypeOfTirExpression(exp.left);

      if (comparingDatatype === undefined) {
        throw Error(
          "Expected typecheckAst to make sure Datatype not be undefined"
        );
      }

      if (isNumberDatatype(comparingDatatype)) {
        return this.llvmIrBuilder.CreateFCmpONE(leftValue, rightValue);
      } else if (isBooleanDatatype(comparingDatatype)) {
        return this.llvmIrBuilder.CreateICmpNE(leftValue, rightValue);
      }
    } else if (isGreaterThanBinaryExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);
      const rightValue = this.getExpValue(scope, exp.right);

      return this.llvmIrBuilder.CreateFCmpOGT(leftValue, rightValue);
    } else if (isGreaterThanOrEqualBinaryExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);
      const rightValue = this.getExpValue(scope, exp.right);

      return this.llvmIrBuilder.CreateFCmpOGE(leftValue, rightValue);
    } else if (isLessThanBinaryExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);
      const rightValue = this.getExpValue(scope, exp.right);

      return this.llvmIrBuilder.CreateFCmpOLT(leftValue, rightValue);
    } else if (isLessThanOrEqualBinaryExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);
      const rightValue = this.getExpValue(scope, exp.right);

      return this.llvmIrBuilder.CreateFCmpOLE(leftValue, rightValue);
    } else if (isBoxMemberAccessExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);
      const rightValue = this.getExpValue(scope, exp.right);

      const convertedToIntValue = this.llvmIrBuilder.CreateFPToSI(
        rightValue,
        this.llvmIrBuilder.getInt32Ty()
      );

      const pointerToElement = this.llvmIrBuilder.CreateGEP(
        leftValue.getType().getPointerElementType(),
        leftValue,
        [this.llvmIrBuilder.getInt64(0), convertedToIntValue]
      );

      return this.llvmIrBuilder.CreateLoad(
        pointerToElement.getType().getPointerElementType(),
        pointerToElement
      );
    } else if (isDotMemberAccessExp(exp)) {
      const leftValue = this.getExpValue(scope, exp.left);

      const leftDatatype = getDatatypeOfTirExpression(exp.left);

      if (!isObjectDatatype(leftDatatype)) {
        throw Error(
          "Expected typechecker to make sure that leftDatatype is ObjectDatatype"
        );
      }

      const elementIndex = Object.keys(leftDatatype.keys).findIndex(
        (value) => value === exp.right
      );

      const pointerToElement = this.llvmIrBuilder.CreateGEP(
        leftValue.getType().getPointerElementType(),
        leftValue,
        [
          this.llvmIrBuilder.getInt64(0),
          this.llvmIrBuilder.getInt32(elementIndex),
        ]
      );

      return this.llvmIrBuilder.CreateLoad(
        pointerToElement.getType().getPointerElementType(),
        pointerToElement
      );
    }

    throw Error(
      `It is not yet supported to generate code for expression.type === ${exp.type}`
    );
  }

  getLLVMType(dataType: TirDataType): llvm.Type {
    if (isNumberDatatype(dataType)) {
      return this.llvmIrBuilder.getDoubleTy();
    } else if (isBooleanDatatype(dataType)) {
      return this.llvmIrBuilder.getInt1Ty();
    } else if (isVoidDatatype(dataType)) {
      return this.llvmIrBuilder.getVoidTy();
    } else if (isFunctionDatatype(dataType)) {
      const returnType = this.getLLVMType(dataType.returnType);
      const args = Object.values(dataType.arguments).map((dataType) => {
        if (dataType === undefined) throw Error("Unreachable");

        return this.getLLVMType(dataType);
      });

      if (args.length === 0) {
        return PointerType.get(FunctionType.get(returnType, false), 0);
      } else {
        return PointerType.get(FunctionType.get(returnType, args, false), 0);
      }
    } else if (isStringDatatype(dataType)) {
      const baseElement = this.llvmIrBuilder.getInt8Ty();
      const numberOfElements = dataType.length;

      return PointerType.get(ArrayType.get(baseElement, numberOfElements), 0);
    } else if (isArrayDatatype(dataType)) {
      const baseElement = this.getLLVMType(dataType.baseType);
      const numberOfElements = dataType.numberOfElements;

      if (numberOfElements === undefined)
        throw Error(
          "Expected typecheck to make sure that numberOfElements can never be undefined"
        );

      return PointerType.get(ArrayType.get(baseElement, numberOfElements), 0);
    } else if (isObjectDatatype(dataType)) {
      const elementType = Object.values(dataType.keys).map(
        (elementDatatype) => {
          if (elementDatatype === undefined)
            throw Error("Did not expect undefined in keys");

          return this.getLLVMType(elementDatatype);
        }
      );

      return PointerType.get(StructType.get(this.llvmContext, elementType), 0);
    }

    throw Error(
      `Its not yet supported to generate LLVMType for datatype ${dataType.type}`
    );
  }

  addGlobalVar(varName: string, value: LLVMFunction) {
    const globalValue = this.globalVarDatabases[varName];

    if (globalValue === undefined) {
      this.globalVarDatabases[varName] = value;
    } else {
      throw new Error(
        `There is already a variable defined with var name ${varName}`
      );
    }
  }

  getGlobalVar(varName: string): LLVMFunction | null {
    const globalValue = this.globalVarDatabases[varName];

    if (globalValue === undefined) {
      return null;
    } else {
      return globalValue;
    }
  }

  // Adds the function context with the identifierName
  resolveIdentifierName(scope: Scope, varName: string) {
    const resolvedName = `${varName}${scope.getCurrentFn().context}`;
    return resolvedName;
  }

  dumpModule() {
    llvm.verifyModule(this.llvmModule);
    return this.llvmModule.print();
  }

  next() {
    if (this.curPos === null || this.curPos >= this.asts.length - 1) {
      this.curPos = null;
    } else {
      this.curPos++;
    }
  }

  getCurAst(): TirAst | null {
    if (this.curPos === null) {
      return null;
    } else {
      const ast = this.asts[this.curPos];

      if (ast === undefined) {
        throw Error("Expected this.curPos to be always in bound of this.asts");
      }

      return ast;
    }
  }
}
