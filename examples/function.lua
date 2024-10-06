function fun()
    return 42
end

function fun2(a, b)
    print(a)
    print(b)
end

function fun3(a)
    return string.len(a)
end

print(fun())
fun2("hello", "world")
print(fun3("hello, world"))