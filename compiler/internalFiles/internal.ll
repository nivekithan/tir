


define void @syscallExit(double %0) {
entry:
    %1 = fptosi double %0 to i32
    %2 = call i64 asm sideeffect "syscall", "={rax},{rax},{rdi},~{rcx},~{r11},~{memory}"(i64 60, i32 %1)
    unreachable
}