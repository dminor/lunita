# Lunita

A little programming language based upon a subset of [Lua](https://lua.org/).

The subset supported is sufficient to run the following program, considered
important for interviews:

    function anagramas(c1, c2)
        if c1:len() ~= c2:len() then
            return false
        end

        local tabla1 = {}
        for i=1, c1:len() do
            tabla1[i] = c1:byte(i)
        end
        table.sort(tabla1)

        local tabla2 = {}
        for i=1, c2:len() do
            tabla2[i] = c2:byte(i)
        end
        table.sort(tabla2)

        for i=1, c1:len() do
            if tabla1[i] ~= tabla2[i] then
                return false
            end
        end

        return true
    end

## Syntax

    program    -> statement*
    statement  -> assignment | expression | ifthen | forloop | function
    assignment -> "local"? identifier "=" expression
    expression -> call | value
    call       -> (identifier ".")? identifier "(" expression? ")"
    ifthen     -> "if" condition "then" expression "end"
    condition  -> expression "~=" expression
    forloop    -> for identifier "=" expression "," expression "do" statement "end"
    function   -> "function" identifier "(" (identifier ",")* identifier? ")" statement* "end"
    value      -> number | string | identifier | "true" | "false" | "{}"
    number     -> [0-9]+
    string     -> "\"" .* "\""
    identifier -> [A-Za-z]+
