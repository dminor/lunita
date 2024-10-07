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
    call       -> (identifier ".")? identifier "(" expression? ")"
    ifthen     -> "if" expression "then" statement "end"
    binaryop   -> expression "~=" expression
    index      -> identifier "[" expression "]"
    forloop    -> for assignment "," expression "do" statement* "end"
    function   -> "function" identifier "(" (identifier ",")* identifier? ")" statement* "end"
    return     -> "return" expression
    value      -> number | string | identifier | "true" | "false" | "{}"
    number     -> [0-9]+
    string     -> "\"" .* "\""
    identifier -> [A-Za-z]+

## Left as an exercise for the reader

Here's a list of some of the things present in Lua that are not implemented in Lunita, left as
an exercise for the reader:

- <b>Other mathematical / logical operators:</b> Lunita only supports the `~=` operator, the others
  can be implemented using a similar approach, with care to ensure that the appropriate precedence
  rules are supported.
- <b>Numerical for loop:</b> The current implementation calls the `limit` value on every iteration,
  it should only be called once. Also the `step` is not currently supported. Modify the parser
  to support the `step` parameter, and fix the code generation to not evaluate the control
  expressions more than once.
- <b>Generic for loop:</b> Add an iterator implementation, and allow a generic for statement
  that works with them.
- <b>Error handling:</b> Modify the tokenizer to collect information about where in the input
  file a token occurred, and use this information to improve error handling.
- <b>Getting / setting table values:</b> Currently this is faked in the `call` syntax to allow
  things like `string.len` but this will not work for nested calls like `a.b.c`. It's also not
  currently possible to set a value in a table. Modify the parser to properly handle nested
  table access calls, as well as assigning to table values.
- <b>Table constructors: </b> There's a syntax for [table constructors](https://www.lua.org/manual/5.4/manual.html#3.4.9)
  that could be added to the parser once it's possible to set table values.
- <b>Colon syntax:</b> Lua supports using a colon syntax like `s1:len()` that implicitly passes
  the current object as the first argument to the function. Implementing this requires changing
  the tokenizer and parser, as well as making sure that appropriate functions are installed on
  newly created string instances.
- <b>Metatables:</b> [Metatables](https://www.lua.org/manual/5.4/manual.html#2.4) are a way of
  modifying the behaviour of tables, to allow for things like operator overloading.

## Colophon

The Lunita logo was made by a souless ai.
