import exp from "constants";
import { convertToTokens } from "../lexer/lexer";
import { convertToAst } from "../parser/parser";
import { typeCheckAst } from "../typesChecker/typeChecker";
import { convertToLLVMModule } from "./codegen";

test("Testing const variable declaration", () => {
  const input = `
  function main() {
    const a = 1;
    const b = true;
    const c = +1;
    const d = -1;
    const e = 1 + 1;
    const f = 1 - 2;
    const g = 1 * 2;
    const h = 2 / 2;
    const i = 1 === 1;
    const j = true === false;
    const k = 1 !== 1;
    const l = true !== false;
    const m = 1 > 1;
    const n = 1 >= 1;
    const o = 1 < 1;
    const p = 1 <= 1;
    const q = a;
    const r = b;
    const s = !r;
    const t = [1, 2];
    const u = t[1];
    const v = {a : 1, b : 2};
    const w = v.a;
    return;
  } `;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca double, align 8
  store double 1.000000e+00, double* %a, align 8
  %b = alloca i1, align 1
  store i1 true, i1* %b, align 1
  %c = alloca double, align 8
  store double 1.000000e+00, double* %c, align 8
  %d = alloca double, align 8
  store double -1.000000e+00, double* %d, align 8
  %e = alloca double, align 8
  store double 2.000000e+00, double* %e, align 8
  %f = alloca double, align 8
  store double -1.000000e+00, double* %f, align 8
  %g = alloca double, align 8
  store double 2.000000e+00, double* %g, align 8
  %h = alloca double, align 8
  store double 1.000000e+00, double* %h, align 8
  %i = alloca i1, align 1
  store i1 true, i1* %i, align 1
  %j = alloca i1, align 1
  store i1 false, i1* %j, align 1
  %k = alloca i1, align 1
  store i1 false, i1* %k, align 1
  %l = alloca i1, align 1
  store i1 true, i1* %l, align 1
  %m = alloca i1, align 1
  store i1 false, i1* %m, align 1
  %n = alloca i1, align 1
  store i1 true, i1* %n, align 1
  %o = alloca i1, align 1
  store i1 false, i1* %o, align 1
  %p = alloca i1, align 1
  store i1 true, i1* %p, align 1
  %q = alloca double, align 8
  %0 = load double, double* %a, align 8
  store double %0, double* %q, align 8
  %r = alloca i1, align 1
  %1 = load i1, i1* %b, align 1
  store i1 %1, i1* %r, align 1
  %s = alloca i1, align 1
  %2 = load i1, i1* %r, align 1
  %3 = xor i1 %2, true
  store i1 %3, i1* %s, align 1
  %t = alloca [2 x double]*, align 8
  %4 = alloca [2 x double], align 8
  %5 = getelementptr [2 x double], [2 x double]* %4, i64 0, i32 0
  store double 1.000000e+00, double* %5, align 8
  %6 = getelementptr [2 x double], [2 x double]* %4, i64 0, i32 1
  store double 2.000000e+00, double* %6, align 8
  store [2 x double]* %4, [2 x double]** %t, align 8
  %u = alloca double, align 8
  %7 = load [2 x double]*, [2 x double]** %t, align 8
  %8 = getelementptr [2 x double], [2 x double]* %7, i64 0, i32 1
  %9 = load double, double* %8, align 8
  store double %9, double* %u, align 8
  %v = alloca { double, double }*, align 8
  %10 = alloca { double, double }, align 8
  %11 = getelementptr { double, double }, { double, double }* %10, i64 0, i32 0
  store double 1.000000e+00, double* %11, align 8
  %12 = getelementptr { double, double }, { double, double }* %10, i64 0, i32 1
  store double 2.000000e+00, double* %12, align 8
  store { double, double }* %10, { double, double }** %v, align 8
  %w = alloca double, align 8
  %13 = load { double, double }*, { double, double }** %v, align 8
  %14 = getelementptr { double, double }, { double, double }* %13, i64 0, i32 0
  %15 = load double, double* %14, align 8
  store double %15, double* %w, align 8
  ret void
}
"
`);
});

test("Testing function declaration", () => {
  const input = `
  function main() {
    return;
  }
  function a() {
    const b = 1;
    const c = b;
    const d = c + 2;

    return d;
  }`;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  ret void
}

define double @a() {
entry:
  %b = alloca double, align 8
  store double 1.000000e+00, double* %b, align 8
  %c = alloca double, align 8
  %0 = load double, double* %b, align 8
  store double %0, double* %c, align 8
  %d = alloca double, align 8
  %1 = load double, double* %c, align 8
  %2 = fadd double %1, 2.000000e+00
  store double %2, double* %d, align 8
  %3 = load double, double* %d, align 8
  ret double %3
}
"
`);
});

test("Calling a function", () => {
  const input = `
 

  function a() {
    return 1;
  }

  function main() {
    const d = a();
    return;
  }
`;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define double @a() {
entry:
  ret double 1.000000e+00
}

define void @main() {
entry:
  %d = alloca double, align 8
  %0 = call double @a()
  store double %0, double* %d, align 8
  ret void
}
"
`);
});

test("Calling a function with argument", () => {
  const input = `
  function a(b : number, c : number) {
    return b + c;
  };
  
  function main() {
    const d = a(1, 2);
    return;
  }
  `;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define double @a(double %0, double %1) {
entry:
  %b = alloca double, align 8
  store double %0, double* %b, align 8
  %c = alloca double, align 8
  store double %1, double* %c, align 8
  %2 = load double, double* %b, align 8
  %3 = load double, double* %c, align 8
  %4 = fadd double %2, %3
  ret double %4
}

define void @main() {
entry:
  %d = alloca double, align 8
  %0 = call double @a(double 1.000000e+00, double 2.000000e+00)
  store double %0, double* %d, align 8
  ret void
}
"
`);
});

test("Testing letVariable declaration", () => {
  const input = `
  function main() {
    let a =1;
    return;
  }`;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca double, align 8
  store double 1.000000e+00, double* %a, align 8
  ret void
}
"
`);
});

test("Test identifier reassignment", () => {
  const input = `
  function main() {
    let a = true;
    a = false;

    let b = 1
    b = 2;
    
    let c = 1;
    c += 1;
  
    let d = 2;
    d -= 1;
  
    let e = 2;
    e *= 1;
  
    let f = 2;
    f /= 1;

    return;
}
`;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca i1, align 1
  store i1 true, i1* %a, align 1
  store i1 false, i1* %a, align 1
  %b = alloca double, align 8
  store double 1.000000e+00, double* %b, align 8
  store double 2.000000e+00, double* %b, align 8
  %c = alloca double, align 8
  store double 1.000000e+00, double* %c, align 8
  %0 = load double, double* %c, align 8
  %1 = fadd double %0, 1.000000e+00
  store double %1, double* %c, align 8
  %d = alloca double, align 8
  store double 2.000000e+00, double* %d, align 8
  %2 = load double, double* %d, align 8
  %3 = fsub double %2, 1.000000e+00
  store double %3, double* %d, align 8
  %e = alloca double, align 8
  store double 2.000000e+00, double* %e, align 8
  %4 = load double, double* %e, align 8
  %5 = fmul double %4, 1.000000e+00
  store double %5, double* %e, align 8
  %f = alloca double, align 8
  store double 2.000000e+00, double* %f, align 8
  %6 = load double, double* %f, align 8
  %7 = fdiv double %6, 1.000000e+00
  store double %7, double* %f, align 8
  ret void
}
"
`);
});

test("Test object reassignment", () => {
  const input = `
  function main() {

    const a = {b : 1};
    a.b = 2;
    return;
  }
  `;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca { double }*, align 8
  %0 = alloca { double }, align 8
  %1 = getelementptr { double }, { double }* %0, i64 0, i32 0
  store double 1.000000e+00, double* %1, align 8
  store { double }* %0, { double }** %a, align 8
  %2 = load { double }*, { double }** %a, align 8
  %3 = getelementptr { double }, { double }* %2, i64 0, i32 0
  store double 2.000000e+00, double* %3, align 8
  ret void
}
"
`);
});

test("Test Array Reassignment", () => {
  const input = `
  function main() {

    const a = [1, 2];
    a[1] = 2;
    return;
  }`;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca [2 x double]*, align 8
  %0 = alloca [2 x double], align 8
  %1 = getelementptr [2 x double], [2 x double]* %0, i64 0, i32 0
  store double 1.000000e+00, double* %1, align 8
  %2 = getelementptr [2 x double], [2 x double]* %0, i64 0, i32 1
  store double 2.000000e+00, double* %2, align 8
  store [2 x double]* %0, [2 x double]** %a, align 8
  %3 = load [2 x double]*, [2 x double]** %a, align 8
  %4 = getelementptr [2 x double], [2 x double]* %3, i64 0, i32 1
  store double 2.000000e+00, double* %4, align 8
  ret void
}
"
`);
});

test("If block Declaration with only if block", () => {
  const input = `
  function main() {

    const a = true;
    
    if (!a) {
      const b = 1;
    }
    
    const c = 2;
    return;
  }
  `;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca i1, align 1
  store i1 true, i1* %a, align 1
  %0 = load i1, i1* %a, align 1
  %1 = xor i1 %0, true
  br i1 %1, label %BB.0, label %BB.1

BB.0:                                             ; preds = %entry
  %\\"b:0\\" = alloca double, align 8
  store double 1.000000e+00, double* %\\"b:0\\", align 8
  br label %BB.1

BB.1:                                             ; preds = %BB.0, %entry
  %c = alloca double, align 8
  store double 2.000000e+00, double* %c, align 8
  ret void
}
"
`);
});

test("If block declaration with if and else block", () => {
  const input = `
  function main() {
    const a = true;
    
    
    if (!a) {
      const b = 1;
    }  else {
      const c = 2;
    }
    
    const d = 1;
    return;
  }
  `;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca i1, align 1
  store i1 true, i1* %a, align 1
  %0 = load i1, i1* %a, align 1
  %1 = xor i1 %0, true
  br i1 %1, label %BB.0, label %BB.1

BB.0:                                             ; preds = %entry
  %\\"b:0\\" = alloca double, align 8
  store double 1.000000e+00, double* %\\"b:0\\", align 8
  br label %BB.2

BB.1:                                             ; preds = %entry
  %\\"c:1\\" = alloca double, align 8
  store double 2.000000e+00, double* %\\"c:1\\", align 8
  br label %BB.2

BB.2:                                             ; preds = %BB.1, %BB.0
  %d = alloca double, align 8
  store double 1.000000e+00, double* %d, align 8
  ret void
}
"
`);
});

test("If block declaration with if, else if and else block", () => {
  const input = `
  function main() {

    const a = true;
    
    if (!a) {
      const b = 1;
    } else if (2 === 1) {
      const b = 2;
    } else if (a === false) {
      const c = 1;
    } else {
      const c = 2;
    }
    
    const d = 1;
    return;
  }
`;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca i1, align 1
  store i1 true, i1* %a, align 1
  %0 = load i1, i1* %a, align 1
  %1 = xor i1 %0, true
  br i1 %1, label %BB.0, label %BB.1

BB.0:                                             ; preds = %entry
  %\\"b:0\\" = alloca double, align 8
  store double 1.000000e+00, double* %\\"b:0\\", align 8
  br label %BB.6

BB.1:                                             ; preds = %entry
  br i1 false, label %BB.2, label %BB.3

BB.2:                                             ; preds = %BB.1
  %\\"b:1\\" = alloca double, align 8
  store double 2.000000e+00, double* %\\"b:1\\", align 8
  br label %BB.6

BB.3:                                             ; preds = %BB.1
  %2 = load i1, i1* %a, align 1
  %3 = icmp eq i1 %2, false
  br i1 %3, label %BB.4, label %BB.5

BB.4:                                             ; preds = %BB.3
  %\\"c:2\\" = alloca double, align 8
  store double 1.000000e+00, double* %\\"c:2\\", align 8
  br label %BB.6

BB.5:                                             ; preds = %BB.3
  %\\"c:3\\" = alloca double, align 8
  store double 2.000000e+00, double* %\\"c:3\\", align 8
  br label %BB.6

BB.6:                                             ; preds = %BB.5, %BB.4, %BB.2, %BB.0
  %d = alloca double, align 8
  store double 1.000000e+00, double* %d, align 8
  ret void
}
"
`);
});

test("If block declaration with if and else if blocks", () => {
  const input = `
  function main() {

    const a = true;
    
    if (!a) {
      const b = 1;
    } else if (2 === 1) {
      const b = 2;
    } else if (a === false) {
      const c = 1;
    } 
    
    const d = 1;
    return;
  }`;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca i1, align 1
  store i1 true, i1* %a, align 1
  %0 = load i1, i1* %a, align 1
  %1 = xor i1 %0, true
  br i1 %1, label %BB.0, label %BB.1

BB.0:                                             ; preds = %entry
  %\\"b:0\\" = alloca double, align 8
  store double 1.000000e+00, double* %\\"b:0\\", align 8
  br label %BB.5

BB.1:                                             ; preds = %entry
  br i1 false, label %BB.2, label %BB.3

BB.2:                                             ; preds = %BB.1
  %\\"b:1\\" = alloca double, align 8
  store double 2.000000e+00, double* %\\"b:1\\", align 8
  br label %BB.5

BB.3:                                             ; preds = %BB.1
  %2 = load i1, i1* %a, align 1
  %3 = icmp eq i1 %2, false
  br i1 %3, label %BB.4, label %BB.5

BB.4:                                             ; preds = %BB.3
  %\\"c:2\\" = alloca double, align 8
  store double 1.000000e+00, double* %\\"c:2\\", align 8
  br label %BB.5

BB.5:                                             ; preds = %BB.4, %BB.3, %BB.2, %BB.0
  %d = alloca double, align 8
  store double 1.000000e+00, double* %d, align 8
  ret void
}
"
`);
});

test("While loop declaration with continue and break", () => {
  const input = `
  function main() {
    
    let a = 10;

    while (true) {
      if (a  === 5) {
        continue;
      }

      if (a === 6) {
        break;
      }

      a -= 1;
    }

    return;
  }

  `;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca double, align 8
  store double 1.000000e+01, double* %a, align 8
  br label %BB.0

BB.0:                                             ; preds = %BB.6, %BB.3, %entry
  br i1 true, label %BB.1, label %BB.2

BB.1:                                             ; preds = %BB.0
  %0 = load double, double* %a, align 8
  %1 = fcmp oeq double %0, 5.000000e+00
  br i1 %1, label %BB.3, label %BB.4

BB.2:                                             ; preds = %BB.5, %BB.0
  ret void

BB.3:                                             ; preds = %BB.1
  br label %BB.0
  br label %BB.4

BB.4:                                             ; preds = %BB.3, %BB.1
  %2 = load double, double* %a, align 8
  %3 = fcmp oeq double %2, 6.000000e+00
  br i1 %3, label %BB.5, label %BB.6

BB.5:                                             ; preds = %BB.4
  br label %BB.2
  br label %BB.6

BB.6:                                             ; preds = %BB.5, %BB.4
  %4 = load double, double* %a, align 8
  %5 = fsub double %4, 1.000000e+00
  store double %5, double* %a, align 8
  br label %BB.0
}
"
`);
});

test("Normal String variable decalaration", () => {
  const input = `
  function main() {

    const a = "123";
    return;
  }`;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca [3 x i8]*, align 8
  %0 = alloca [3 x i8], align 1
  %1 = getelementptr [3 x i8], [3 x i8]* %0, i64 0, i32 0
  store i8 49, i8* %1, align 1
  %2 = getelementptr [3 x i8], [3 x i8]* %0, i64 0, i32 1
  store i8 50, i8* %2, align 1
  %3 = getelementptr [3 x i8], [3 x i8]* %0, i64 0, i32 2
  store i8 51, i8* %3, align 1
  store [3 x i8]* %0, [3 x i8]** %a, align 8
  ret void
}
"
`);
});

test("Reassigning string variable", () => {
  const input = `
  function main() {
    let a = "123";
    a = "456";
    return;
  }`;
    
  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca [3 x i8]*, align 8
  %0 = alloca [3 x i8], align 1
  %1 = getelementptr [3 x i8], [3 x i8]* %0, i64 0, i32 0
  store i8 49, i8* %1, align 1
  %2 = getelementptr [3 x i8], [3 x i8]* %0, i64 0, i32 1
  store i8 50, i8* %2, align 1
  %3 = getelementptr [3 x i8], [3 x i8]* %0, i64 0, i32 2
  store i8 51, i8* %3, align 1
  store [3 x i8]* %0, [3 x i8]** %a, align 8
  %4 = alloca [3 x i8], align 1
  %5 = getelementptr [3 x i8], [3 x i8]* %4, i64 0, i32 0
  store i8 52, i8* %5, align 1
  %6 = getelementptr [3 x i8], [3 x i8]* %4, i64 0, i32 1
  store i8 53, i8* %6, align 1
  %7 = getelementptr [3 x i8], [3 x i8]* %4, i64 0, i32 2
  store i8 54, i8* %7, align 1
  store [3 x i8]* %4, [3 x i8]** %a, align 8
  ret void
}
"
`);
});

test("Reassigning string value to another variable", () => {
  const input = `
  function main() {
    const a = "123";
    const b = a;
    return;
  }
    `;

  const output = convertToLLVMModule(
    typeCheckAst(convertToAst(convertToTokens(input)))
  );

  expect(output).toMatchInlineSnapshot(`
"; ModuleID = 'main'
source_filename = \\"main\\"

define void @main() {
entry:
  %a = alloca [3 x i8]*, align 8
  %0 = alloca [3 x i8], align 1
  %1 = getelementptr [3 x i8], [3 x i8]* %0, i64 0, i32 0
  store i8 49, i8* %1, align 1
  %2 = getelementptr [3 x i8], [3 x i8]* %0, i64 0, i32 1
  store i8 50, i8* %2, align 1
  %3 = getelementptr [3 x i8], [3 x i8]* %0, i64 0, i32 2
  store i8 51, i8* %3, align 1
  store [3 x i8]* %0, [3 x i8]** %a, align 8
  %b = alloca [3 x i8]*, align 8
  %4 = load [3 x i8]*, [3 x i8]** %a, align 8
  store [3 x i8]* %4, [3 x i8]** %b, align 8
  ret void
}
"
`);
});
