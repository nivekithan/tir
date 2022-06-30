import { fsync, readFileSync, unlinkSync, writeFileSync } from "fs";
import path, { resolve } from "path";
import { convertToLLVMModule, CodeGen } from "./codegen/codegen";
import { convertToTokens } from "./lexer/lexer";
import { convertToAst } from "./parser/parser";
import { DataType } from "./types/ast";
import { TirAst } from "./types/tir";
import { Closure } from "./typesChecker/closure";
import { DepImporter } from "./typesChecker/depImporter";
import { typeCheckAst, TypeCheckerFactory } from "./typesChecker/typeChecker";
import {
  InitializeAllAsmPrinters,
  InitializeNativeTarget,
  Linker,
  LLVMContext,
  Module as LLVMModule,
  parseIRFile,
  Target,
  WriteBitcodeToFile,
} from "llvm-bindings";
import { execSync } from "child_process";

export const foo = () => {
  // Make typescirpt happy
};

const FileCache: Map<
  string,
  {
    tir: TirAst[];
    exportedVariables: Record<string, DataType | undefined>;
    module: LLVMModule;
  }
> = new Map();

const context = new LLVMContext();

const getExportedVariablesFromFile = (
  absoluteFileName: string
): Record<string, DataType | undefined> => {
  addToCache(absoluteFileName);

  return FileCache.get(absoluteFileName)!.exportedVariables;
};

const addToCache = (absoluteFileName: string) => {
  if (FileCache.has(absoluteFileName)) {
    return;
  }

  const fileContent = readFileSync(absoluteFileName, { encoding: "utf-8" });
  const asts = convertToAst(convertToTokens(fileContent));

  const typeCheckerClosure = new Closure(null, { isInsideLoop: false });
  const typeCheckerDepImporter = new DepImporter(
    absoluteFileName,
    {},
    (absoluteFileName) => {
      const exportedVariables = getExportedVariablesFromFile(absoluteFileName);
      return exportedVariables;
    }
  );

  const typeChecker = new TypeCheckerFactory(
    asts,
    typeCheckerClosure,
    typeCheckerDepImporter
  );

  const tirAst = typeChecker.typeCheck();

  const topLevelDeclaredVariables = typeChecker.closure.database;

  const exportedVariables: Record<string, DataType> = {};

  Object.keys(topLevelDeclaredVariables).forEach((key) => {
    const storedVariable = topLevelDeclaredVariables[key]!;
    const isExported = storedVariable.isExported;

    if (!isExported) {
      return;
    }

    exportedVariables[key] = storedVariable.dataType;
  });

  const codeGenerate = new CodeGen(tirAst, absoluteFileName, context);

  codeGenerate.consume();

  const module = codeGenerate.llvmModule;

  FileCache.set(absoluteFileName, { tir: tirAst, exportedVariables, module });
};

const getEntryFileAbsolutePath = () => {
  const entryFileName = process.argv[2];

  if (entryFileName === undefined)
    throw new Error(`Expected filename to be passed as argument`);

  const cwd = process.cwd();

  return path.resolve(cwd, entryFileName);
};

const compiledBitCodePath = () => {
  const path = resolve(process.cwd(), "build", "compiled.bc");
  return path;
};

const internalBitCodePath = () => {
  const path = resolve(
    "/",
    "home",
    "nivekithan",
    "llvm-internal",
    "internal.ll"
  );
  return path;
};

const finalBitCodePath = () => {
  const path = resolve(process.cwd(), "build", "out.bc");
  return path;
};

const asmPath = () => {
  const path = resolve(process.cwd(), "build", "out.s");
  return path;
};

const exePath = () => {
  const path = resolve(process.cwd(), "build", "out");
  return path;
};

const getLLCPath = () => {
  return `/lib/llvm-13/bin/llc`;
};

const getLLVMLinkPath = () => {
  return "/lib/llvm-13/bin/llvm-link";
};

const linkWithInternalFile = (
  compiledFile: string,
  generatedFilePath: string
) => {
  execSync(
    `${getLLVMLinkPath()} ${compiledFile} ${internalBitCodePath()} -o ${generatedFilePath}`
  );
};

const convertBitCodeToAsm = (bitCodePath: string, generatedAsmPath: string) => {
  execSync(`${getLLCPath()} ${bitCodePath} -o ${generatedAsmPath}`);
};

const convertAsmToExe = (asmPath: string, generatedExePath: string) => {
  
    console.log(asmPath, generatedExePath);
  
  execSync(`gcc ${asmPath} -o ${generatedExePath}`);
};

const cleanTempFiles = (...files: string[]) => {
  files.forEach((fileName) => {
    unlinkSync(fileName);
  });
};

const main = () => {
  const mainFilePath = getEntryFileAbsolutePath();

  addToCache(mainFilePath);

  const mainFileModule = FileCache.get(mainFilePath)!.module;

  for (const [fileName, { module }] of FileCache) {
    if (fileName === mainFilePath) {
      continue;
    }

    Linker.linkModules(mainFileModule, module);
  }

  // Converts llvm module to asm

  const linkedModule = mainFileModule;

  WriteBitcodeToFile(linkedModule, compiledBitCodePath());
  linkWithInternalFile(compiledBitCodePath(), finalBitCodePath());
  convertBitCodeToAsm(finalBitCodePath(), asmPath());
  convertAsmToExe(asmPath(), exePath());
  cleanTempFiles(compiledBitCodePath(), finalBitCodePath(), asmPath());
};

main();
