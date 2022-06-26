; ModuleID = 'main'
source_filename = "main"

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

BB.4:                                             ; preds = %BB.3, %BB.1
  %2 = load double, double* %a, align 8
  %3 = fcmp oeq double %2, 6.000000e+00
  br i1 %3, label %BB.5, label %BB.6

BB.5:                                             ; preds = %BB.4
  br label %BB.2
  
BB.6:                                             ; preds = %BB.5, %BB.4
  %4 = load double, double* %a, align 8
  %5 = fsub double %4, 1.000000e+00
  store double %5, double* %a, align 8
  br label %BB.0
}