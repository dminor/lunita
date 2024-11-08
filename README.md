![lunita logo](lunita-logo-small.png)

# Lunita

A little programming language based upon a subset of [Lua](https://lua.org/).

The subset supported is sufficient to run the following program, considered
important for interviews:

    function anagramas(c1, c2)
        if string.len(c1) ~= string.len(c2) then
            return false
        end

        local tabla1 = {}
        for i=1, string.len(c1) do
            tabla1[i] = string.byte(c1, i)
        end
        table.sort(tabla1)

        local tabla2 = {}
        for i=1, string.len(c2) do
            tabla2[i] = string.byte(c2, i)
        end
        table.sort(tabla2)

        for i=1, string.len(c1) do
            if tabla1[i] ~= tabla2[i] then
                return false
            end
        end

        return true
    end

## Syntax

    program    -> statement*
    statement  -> assignment | expression | ifthen | forloop | function | return
    assignment -> "local"? identifier "=" expression
    expression -> call | value | binaryop | index
    call       -> (identifier ".")? identifier "(" (expression ",")* expression? ")"
    ifthen     -> "if" expression "then" statement "end"
    binaryop   -> expression "~=" expression
    index      -> identifier "[" expression "]"
    forloop    -> "for" assignment "," expression "do" statement* "end"
    function   -> "function" identifier "(" (identifier ",")* identifier? ")" statement* "end"
    return     -> "return" expression
    value      -> number | string | identifier | "true" | "false" | "{}"
    number     -> [0-9]+
    string     -> "\"" .* "\""
    identifier -> [A-Za-z]+

## Other

Here are the slides for my talk [Cómo crear un intérprete en 25 minutos o menos](https://docs.google.com/presentation/d/1jElmyqj0FuYjLqNFe52otF8UMK5iL7z65o0jiJ-wz1o/edit) at BoyaConf, 2024.

## Colophon

The lunita logo was made by a souless ai.
