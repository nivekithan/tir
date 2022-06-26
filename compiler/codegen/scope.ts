import { BasicBlock, IRBuilder, LLVMContext } from "llvm-bindings";
import Module from "module";
import { TLLVMFunction } from "./function";

type ScopeArgs = {
  fn: TLLVMFunction;
  breakBB: BasicBlock | null;
  continueBB: BasicBlock | null;
};

export class Scope {
  fn: TLLVMFunction;
  breakBB: BasicBlock | null;
  continueBB: BasicBlock | null;

  constructor({ breakBB, continueBB, fn }: ScopeArgs) {
    this.fn = fn;
    this.breakBB = breakBB;
    this.continueBB = continueBB;
  }

  getCurrentFn() {
    return this.fn;
  }
}
